import { useEffect, useRef, useState } from "react";

// STEP-BASED: Define the scroll distance required to trigger one "dot" of feedback.
// You can easily change this value to adjust the feel.
const SCROLL_THRESHOLD = 50; // pixels

export function ScrollAudio() {
  const [isEnabled, setIsEnabled] = useState(false);
  // STEP-BASED: This ref will now track the scroll position of the last feedback event.
  const lastFeedbackY = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // --- Audio Context Management ---
    const createAudioContext = (): boolean => {
      if (audioContextRef.current) return true;
      try {
        const AudioContext =
          window.AudioContext ||
          (window as any).webkitAudioContext;
        if (!AudioContext) return false;
        audioContextRef.current = new AudioContext({
          sampleRate: 44100,
          latencyHint: "interactive",
        });
        return true;
      } catch (error) {
        console.error("Could not create AudioContext:", error);
        return false;
      }
    };

    // --- Sound for a single "Dot" ---
    // STEP-BASED: The "intensity" parameter is removed for consistent sound.
    const playDotSound = (): void => {
      if (
        !audioContextRef.current ||
        audioContextRef.current.state !== "running"
      ) {
        return;
      }
      try {
        const ctx = audioContextRef.current;
        const duration = 0.05;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // A clean, consistent "tick" sound.
        oscillator.frequency.setValueAtTime(
          800,
          ctx.currentTime,
        );
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0.08,
          ctx.currentTime + 0.002,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + duration,
        );

        const startTime = ctx.currentTime;
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      } catch (soundError) {
        console.error("Error playing sound:", soundError);
      }
    };

    // --- Haptic for a single "Dot" ---
    // STEP-BASED: The "intensity" parameter is removed for consistent vibration.
    const playDotHaptic = (): void => {
      if (!("vibrate" in navigator)) return;
      try {
        // A single, crisp 25ms vibration.
        navigator.vibrate(25);
      } catch (hapticError) {
        console.error("Haptic feedback error:", hapticError);
      }
    };

    // --- STEP-BASED Scroll Handler ---
    const handleScroll = (): void => {
      if (!isEnabled) return;

      const currentScrollY = window.scrollY;

      // Check if the user has scrolled past the defined threshold since the last feedback.
      if (
        Math.abs(currentScrollY - lastFeedbackY.current) >=
        SCROLL_THRESHOLD
      ) {
        playDotSound();
        playDotHaptic();

        // IMPORTANT: Update the last feedback position to the current position.
        lastFeedbackY.current = currentScrollY;
      }
    };

    // --- Setup and Cleanup ---
    const enableFeature = async () => {
      if (!createAudioContext()) return;
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }
      if (audioContextRef.current?.state === "running") {
        setIsEnabled(true);
        // Initialize the last feedback position to the starting scroll position.
        lastFeedbackY.current = window.scrollY;
      }
    };

    const handleFirstInteraction = () => {
      enableFeature();
    };

    const events: (keyof DocumentEventMap)[] = [
      "click",
      "touchstart",
      "keydown",
    ];
    events.forEach((event) => {
      document.addEventListener(event, handleFirstInteraction, {
        once: true,
      });
    });

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      events.forEach((event) => {
        document.removeEventListener(
          event,
          handleFirstInteraction,
        );
      });
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close().catch(console.error);
      }
    };
  }, [isEnabled]);

  return null;
}