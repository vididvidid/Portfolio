import { useEffect, useRef } from 'react';

export function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let flowStreams: FlowStream[] = [];

    class FlowStream {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      width: number;
      height: number;
      angle: number;
      speed: number;
      opacity: number;
      hue: number;
      waveOffset: number;
      flowDirection: number;
      length: number;
      // CHANGE: Add private properties for canvas and ctx
      private canvas: HTMLCanvasElement;
      private ctx: CanvasRenderingContext2D;

      // CHANGE: Accept canvas and ctx in the constructor
      constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        // CHANGE: Store canvas and ctx as class properties
        this.canvas = canvas;
        this.ctx = ctx;

        // Create streams that flow across the screen
        this.baseX = Math.random() * this.canvas.width;
        this.baseY = Math.random() * this.canvas.height;
        this.x = this.baseX;
        this.y = this.baseY;

        // Stream dimensions - made more visible
        this.width = Math.random() * 200 + 150; // Wider streams
        this.length = Math.random() * 400 + 300; // Longer streams
        this.height = Math.random() * 8 + 5; // Thicker streams

        // Movement properties
        this.angle = Math.random() * Math.PI * 2; // Random direction
        this.speed = Math.random() * 0.8 + 0.3; // Slightly faster, more noticeable
        this.flowDirection = Math.random() * 0.03 + 0.015; // More noticeable drift

        // Visual properties - increased visibility
        this.opacity = Math.random() * 0.15 + 0.08; // Much more visible
        this.hue = Math.random() * 25 + 30; // Warm cream/beige tones
        this.waveOffset = Math.random() * Math.PI * 2; // Wave phase offset
      }

      update() {
        // Flowing movement like water currents - enhanced amplitude
        this.x = this.baseX + Math.sin(time * this.speed + this.waveOffset) * 50;
        this.y = this.baseY + Math.cos(time * this.speed * 0.7 + this.waveOffset) * 35;

        // Drift in the flow direction
        this.baseX += Math.cos(this.angle) * this.flowDirection;
        this.baseY += Math.sin(this.angle) * this.flowDirection;

        // Slowly change direction (like water finding new paths)
        this.angle += Math.sin(time * 0.015) * 0.002;

        // Wrap around screen edges seamlessly
        if (this.baseX > this.canvas.width + this.length) {
          this.baseX = -this.length;
          this.baseY = Math.random() * this.canvas.height;
        }
        if (this.baseX < -this.length) {
          this.baseX = this.canvas.width + this.length;
          this.baseY = Math.random() * this.canvas.height;
        }
        if (this.baseY > this.canvas.height + this.length) {
          this.baseY = -this.length;
          this.baseX = Math.random() * this.canvas.width;
        }
        if (this.baseY < -this.length) {
          this.baseY = this.canvas.height + this.length;
          this.baseX = Math.random() * this.canvas.width;
        }
      }

      draw() {
        this.ctx.save();

        // Translate and rotate for the flow direction
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.angle);

        // Create flowing gradient along the stream
        const gradient = this.ctx.createLinearGradient(-this.length / 2, 0, this.length / 2, 0);

        // Enhanced visibility with better contrast
        gradient.addColorStop(0, `hsla(${this.hue}, 20%, 85%, 0)`);
        gradient.addColorStop(0.2, `hsla(${this.hue}, 25%, 80%, ${this.opacity * 0.4})`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 30%, 75%, ${this.opacity})`);
        gradient.addColorStop(0.8, `hsla(${this.hue}, 25%, 80%, ${this.opacity * 0.4})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 20%, 85%, 0)`);

        this.ctx.fillStyle = gradient;

        // Draw flowing stream shape
        this.ctx.beginPath();

        // Create organic, flowing shape with enhanced wave motion
        const segments = 25;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const x = (t - 0.5) * this.length;

          // Enhanced wave-like edges for natural flow
          const wave1 = Math.sin(t * Math.PI * 4 + time * this.speed) * this.height * 0.5;
          // CHANGE: Removed unused `y2` variable from this loop
          const y1 = -(this.height / 2) + wave1;

          if (i === 0) {
            this.ctx.moveTo(x, y1);
          } else {
            this.ctx.lineTo(x, y1);
          }
        }

        // Complete the shape
        for (let i = segments; i >= 0; i--) {
          const t = i / segments;
          const x = (t - 0.5) * this.length;

          // CHANGE: Removed unused `wave1` variable from this loop
          const wave2 = Math.cos(t * Math.PI * 3 + time * this.speed * 0.8) * this.height * 0.3;

          const y2 = (this.height / 2) + wave2;
          this.ctx.lineTo(x, y2);
        }

        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
      }
    }

    // Enhanced background flowing gradients
    const drawBackgroundFlow = () => {
      // Create more noticeable flowing background gradients
      const bgGradient1 = ctx.createLinearGradient(
        Math.sin(time * 0.025) * canvas.width * 0.4,
        0,
        canvas.width + Math.cos(time * 0.02) * canvas.width * 0.3,
        canvas.height
      );

      const bgGradient2 = ctx.createLinearGradient(
        0,
        Math.sin(time * 0.022) * canvas.height * 0.4,
        canvas.width,
        canvas.height + Math.cos(time * 0.028) * canvas.height * 0.3
      );

      const hue1 = 45 + Math.sin(time * 0.01) * 15;
      const hue2 = 35 + Math.cos(time * 0.015) * 20;

      // Enhanced flowing layers with better visibility
      bgGradient1.addColorStop(0, `hsla(${hue1}, 15%, 92%, 0.03)`);
      bgGradient1.addColorStop(0.3, `hsla(${hue1 + 12}, 18%, 88%, 0.02)`);
      bgGradient1.addColorStop(0.7, `hsla(${hue1 + 8}, 16%, 90%, 0.025)`);
      bgGradient1.addColorStop(1, `hsla(${hue1}, 15%, 92%, 0.03)`);

      bgGradient2.addColorStop(0, `hsla(${hue2}, 12%, 94%, 0.02)`);
      bgGradient2.addColorStop(0.5, `hsla(${hue2 + 18}, 22%, 86%, 0.035)`);
      bgGradient2.addColorStop(1, `hsla(${hue2}, 12%, 94%, 0.02)`);

      // Apply flowing background layers
      ctx.fillStyle = bgGradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = bgGradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStreams = () => {
      flowStreams = [];

      // Enhanced stream count for better visibility
      const screenArea = canvas.width * canvas.height;
      const baseCount = Math.min(12, Math.max(6, Math.floor(screenArea / 120000)));

      // More streams on all devices for better effect
      const streamCount = window.innerWidth < 768 ? Math.max(5, Math.floor(baseCount * 0.8)) : baseCount;

      for (let i = 0; i < streamCount; i++) {
        // CHANGE: Pass canvas and ctx when creating a new stream
        flowStreams.push(new FlowStream(canvas, ctx));
      }
    };

    const animate = () => {
      time += 0.02; // Slightly faster time progression for more movement

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw flowing background gradients
      drawBackgroundFlow();

      // Update and draw flowing streams
      flowStreams.forEach(stream => {
        stream.update();
        stream.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    initStreams();
    animate();

    // Handle resize
    const handleResize = () => {
      resizeCanvas();
      initStreams();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        opacity: 0.8, // Increased opacity for better visibility
        zIndex: 1
      }}
    />
  );
}