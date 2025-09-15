import { useState, useEffect, useCallback } from 'react';
import { Twitter, Linkedin, Github, ExternalLink, Settings, LogOut, Star, GitPullRequest } from 'lucide-react';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { portfolioData as defaultPortfolioData } from './data/portfolio';
import { ScrollAudio } from './components/ScrollAudio';

export default function App() {
  const [content, setContent] = useState(defaultPortfolioData);
  const [showAllCertifications, setShowAllCertifications] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const linkedInProfile = "https://www.linkedin.com/in/yash-kumar-kasaudhan/";

  const loadPortfolioData = async () => {
    setIsLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/portfolio`;
      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        setContent(defaultPortfolioData);
      }
    } catch (error) {
      console.error('Failed to load portfolio data from API:', error);
      setContent(defaultPortfolioData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('admin_token')) {
      setIsAdmin(true);
    }
    loadPortfolioData();
  }, []);

  const handleAdminLogout = useCallback((isAutoLogout = false) => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
    setShowAdminPanel(false);
    if (isAutoLogout) {
      alert('You have been logged out due to 5 minutes of inactivity.');
    }
  }, []);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => handleAdminLogout(true), 5 * 60 * 1000);
    };

    if (isAdmin) {
      const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();

      return () => {
        clearTimeout(inactivityTimer);
        events.forEach(event => window.removeEventListener(event, resetTimer));
      };
    }
  }, [isAdmin, handleAdminLogout]);

  useEffect(() => {
    const fadeTexts = document.querySelectorAll('.fade-text');
    function updateTextOpacity() {
      const viewportHeight = window.innerHeight;
      const topFadeEnd = 5 * 16;
      const bottomFadeStart = viewportHeight - (20 * 16);

      fadeTexts.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        let opacity = 1;
        if (elementCenter < topFadeEnd) {
          opacity = Math.max(0.3, 1 - (topFadeEnd - elementCenter) / topFadeEnd);
        } else if (elementCenter > bottomFadeStart) {
          opacity = Math.max(0.3, 1 - (elementCenter - bottomFadeStart) / (20 * 16));
        }
        (el as HTMLElement).style.opacity = opacity.toString();
        (el as HTMLElement).style.color = `rgba(45, 45, 45, ${opacity ** 1.5})`;
      });
    }

    const handleScroll = () => updateTextOpacity();
    const handleResize = () => updateTextOpacity();
    const handleLoad = () => updateTextOpacity();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    window.addEventListener('load', handleLoad);
    updateTextOpacity();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  const handleAdminLogin = (success: boolean) => {
    setIsAdmin(success);
    setShowAdminLogin(false);
    if (success) setShowAdminPanel(true);
  };

  const handleContentUpdate = (updatedContent: any) => {
    setContent(updatedContent);
  };

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'github': return Github;
      case 'linkedin': return Linkedin;
      case 'twitter': return Twitter;
      default: return Github;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (showAdminLogin) {
    return <AdminLogin onLogin={handleAdminLogin} onClose={() => setShowAdminLogin(false)} />;
  }

  if (showAdminPanel && isAdmin) {
    return (
      <AdminPanel
        content={content}
        onContentUpdate={handleContentUpdate}
        onClose={() => setShowAdminPanel(false)}
        onLogout={() => handleAdminLogout(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <BackgroundAnimation />
      <ScrollAudio />
      <div className="fixed top-6 right-6 z-50">
        {!isAdmin ? (
          <button onClick={() => setShowAdminLogin(true)} className="p-3 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors duration-300 backdrop-blur-sm" title="Admin Login">
            <Settings className="w-5 h-5 text-primary" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setShowAdminPanel(true)} className="p-3 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors duration-300 backdrop-blur-sm" title="Edit Portfolio">
              <Settings className="w-5 h-5 text-primary" />
            </button>
            <button onClick={() => handleAdminLogout(false)} className="p-3 bg-destructive/10 hover:bg-destructive/20 rounded-full transition-colors duration-300 backdrop-blur-sm" title="Logout">
              <LogOut className="w-5 h-5 text-destructive" />
            </button>
          </div>
        )}
      </div>

      <main className="relative" style={{ zIndex: 10 }}>
        <div className="hidden sm:block fixed top-20 right-20 w-2 h-2 bg-primary rounded-full floating-dot opacity-30"></div>
        <div className="hidden md:block fixed top-60 right-40 w-1 h-1 bg-primary rounded-full floating-dot opacity-20" style={{ animationDelay: '2s' }}></div>
        <div className="hidden sm:block fixed bottom-40 left-20 w-1.5 h-1.5 bg-primary rounded-full floating-dot opacity-25" style={{ animationDelay: '4s' }}></div>

        <section className="content-container space-y-20 sm:space-y-24 md:space-y-32">
          {/* Hero Section */}
          {content.hero && (
            <div className="space-y-12">
              <h1 className="fade-text display-font text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl gradient-text leading-none break-words">
                {content.hero.name}
              </h1>
              <div className="fade-text text-xl sm:text-2xl md:text-3xl leading-tight font-light rich-content" dangerouslySetInnerHTML={{ __html: content.hero.tagline }} />
              <div className="fade-text text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed">{content.hero.subtitle}</div>
              {content.hero.bio && <div className="fade-text text-base sm:text-lg text-muted-foreground leading-relaxed italic">{content.hero.bio}</div>}
              <div className="fade-text flex gap-6 sm:gap-8 text-xl sm:text-2xl">
                {content.hero.socials?.map((social: any) => {
                  const IconComponent = getSocialIcon(social.icon);
                  return <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name} className="hover:text-primary/60 transition-colors duration-300 hover-lift"><IconComponent className="w-6 h-6 sm:w-8 sm:h-8" /></a>;
                })}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {content.experience?.length > 0 && (
            <div className="space-y-16">
              <div className="fade-text">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 tracking-tight">Experience</h2>
                <div className="w-16 sm:w-24 h-0.5 bg-primary/30"></div>
              </div>
              <div className="relative ml-8 space-y-16">
                <div className="absolute left-0 top-0 w-px h-full timeline-line"></div>
                {content.experience.map((exp: any, index: number) => (
                  <div key={exp.id || index} className="fade-text relative hover-lift">
                    <div className="absolute -left-2 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg"></div>
                    <div className="ml-8 space-y-4">
                      {exp.period && <time className="mono-font text-sm text-muted-foreground tracking-wide">{exp.period}</time>}
                      <h3 className="text-xl sm:text-2xl md:text-3xl">{exp.title}</h3>
                      <p className="text-lg text-muted-foreground">{exp.organization}</p>
                      <div className="space-y-2">
                        {exp.highlights?.map((highlight: string, idx: number) => (
                          <div key={idx} className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed rich-content">
                            <span dangerouslySetInnerHTML={{ __html: `• ${highlight}` }} />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {exp.tags?.map((tag: string, idx: number) => (
                          <span key={idx} className="mono-font text-xs px-2 py-1 bg-primary/10 text-primary rounded">{tag}</span>
                        ))}
                      </div>
                      {exp.links && typeof exp.links === 'object' && (
                        <div className="flex gap-4 flex-wrap pt-2">
                          {Object.entries(exp.links).map(([key, value]) => (
                            <a 
                              key={key}
                              href={value as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline decoration-1 underline-offset-4 hover:decoration-2 transition-all duration-300 flex items-center gap-1 text-sm sm:text-base"
                            >
                              {key.charAt(0).toUpperCase() + key.slice(1)} <ExternalLink className="w-4 h-4" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

           {/* Achievements Section */}
           {content.achievements?.length > 0 && (
            <div className="space-y-16">
              <div className="fade-text">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 tracking-tight">Achievements</h2>
                <div className="w-16 sm:w-24 h-0.5 bg-primary/30"></div>
              </div>
              <div className="relative ml-8 space-y-16">
                <div className="absolute left-0 top-0 w-px h-full timeline-line"></div>
                {content.achievements.map((achievement: any, index: number) => (
                  <div key={achievement.id || index} className="fade-text relative hover-lift">
                    <div className="absolute -left-2 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg"></div>
                    <div className="ml-8 space-y-4">
                      {achievement.date && <time className="mono-font text-sm text-muted-foreground tracking-wide">{achievement.date}</time>}
                      <h3 className="text-xl sm:text-2xl md:text-3xl">{achievement.title}</h3>
                      <p className="text-lg text-muted-foreground">{achievement.organization}</p>
                      <div className="space-y-2">
                        {achievement.highlight && <div className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed rich-content" dangerouslySetInnerHTML={{ __html: achievement.highlight }} />}
                        {achievement.impact && <div className="text-base text-muted-foreground"><em>{achievement.impact}</em></div>}
                      </div>
                      {achievement.links && typeof achievement.links === 'object' && (
                        <div className="flex gap-4 flex-wrap pt-2">
                          {Object.entries(achievement.links).map(([key, value]) => (
                            <a 
                              key={key}
                              href={value as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline decoration-1 underline-offset-4 hover:decoration-2 transition-all duration-300 flex items-center gap-1 text-sm sm:text-base"
                            >
                              {key.charAt(0).toUpperCase() + key.slice(1)} <ExternalLink className="w-4 h-4" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {content.projects?.length > 0 && (
             <div className="space-y-16">
               <div className="fade-text">
                 <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 tracking-tight">Projects</h2>
                 <div className="w-16 sm:w-24 h-0.5 bg-primary/30"></div>
               </div>
               <div className="relative ml-8 space-y-16">
                 <div className="absolute left-0 top-0 w-px h-full timeline-line"></div>
                 {content.projects.map((project: any, index: number) => (
                   <div key={project.id || index} className="fade-text relative hover-lift">
                     <div className="absolute -left-2 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg"></div>
                     <div className="ml-8 space-y-4">
                       {project.period && <time className="mono-font text-sm text-muted-foreground tracking-wide">{project.period}</time>}
                       <h3 className="text-xl sm:text-2xl md:text-3xl">{project.title}</h3>
                       <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">{project.description}</p>
                       <div className="space-y-2">
                         {project.highlights?.map((highlight: string, idx: number) => (
                           <div key={idx} className="text-base sm:text-lg text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: `• ${highlight}` }} />
                         ))}
                       </div>
                       <div className="flex flex-wrap gap-2">
                         {project.techStack?.map((tech: string, idx: number) => (
                           <span key={idx} className="mono-font text-xs px-2 py-1 bg-primary/10 text-primary rounded">{tech}</span>
                         ))}
                       </div>
                       <div className="flex gap-4 flex-wrap">
                         {project.links?.github && <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-1 underline-offset-4 hover:decoration-2 transition-all duration-300">GitHub</a>}
                         {project.links?.live && <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-1 underline-offset-4 hover:decoration-2 transition-all duration-300 flex items-center gap-1">Live Demo <ExternalLink className="w-4 h-4" /></a>}
                         {project.links?.demo && <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-1 underline-offset-4 hover:decoration-2 transition-all duration-300 flex items-center gap-1">Demo <ExternalLink className="w-4 h-4" /></a>}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

          {/* Open Source Section */}
          {content.openSource?.length > 0 && (
             <div className="space-y-16">
              <div className="fade-text">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 tracking-tight">Open Source</h2>
                <div className="w-16 sm:w-24 h-0.5 bg-primary/30"></div>
              </div>
              <div className="relative ml-8 space-y-16">
                <div className="absolute left-0 top-0 w-px h-full timeline-line"></div>
                {content.openSource.map((project: any, index: number) => (
                  <div key={project.id || index} className="fade-text relative hover-lift">
                    <div className="absolute -left-2 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg"></div>
                    <div className="ml-8 space-y-4">
                      {project.period && <time className="mono-font text-sm text-muted-foreground tracking-wide">{project.period}</time>}
                      <h3 className="text-xl sm:text-2xl md:text-3xl">{project.project}</h3>
                      <p className="text-lg text-muted-foreground">{project.organization}</p>
                      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{project.description}</p>
                      <div className="space-y-2">
                        {project.contributions?.map((contribution: string, idx: number) => <div key={idx} className="text-base text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: `• ${contribution}` }} />)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                        {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-1 underline-offset-4 hover:decoration-2 transition-all duration-300 inline-flex items-center gap-1">View Project <ExternalLink className="w-4 h-4" /></a>}
                        {project.stars != null && <div className="flex items-center gap-1 text-muted-foreground"><Star className="w-4 h-4 text-yellow-500" /><span>{project.stars}</span></div>}
                        {project.pullRequests != null && <div className="flex items-center gap-1 text-muted-foreground"><GitPullRequest className="w-4 h-4 text-blue-500" /><span>{project.pullRequests}</span></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {content.certifications?.length > 0 && (
            <div className="space-y-16">
              <div className="fade-text">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 tracking-tight">Certifications</h2>
                <div className="w-16 sm:w-24 h-0.5 bg-primary/30"></div>
              </div>
              <div className="fade-text space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.certifications.slice(0, showAllCertifications ? content.certifications.length : 6).map((cert: any, index: number) => (
                    <div key={cert.id || index} className="hover-lift p-6 border border-border/30 rounded-lg flex flex-col">
                      <div className="flex-grow">
                        {cert.date && <time className="mono-font text-xs text-muted-foreground tracking-wide">{cert.date}</time>}
                        <h3 className="text-lg mt-2 mb-3">{cert.title}</h3>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      </div>
                      <div className="mt-4">
                        {cert.links && typeof cert.links === 'object' && (
                          <div className="flex gap-4 flex-wrap">
                            {Object.entries(cert.links).map(([key, value]) => (
                              <a 
                                key={key}
                                href={value as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline decoration-1 underline-offset-4 hover:decoration-2 transition-all duration-300 flex items-center gap-1 text-sm"
                              >
                                {key.charAt(0).toUpperCase() + key.slice(1)} <ExternalLink className="w-4 h-4" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {content.certifications.length > 6 && (
                  <div className="text-center">
                    {!showAllCertifications ? (
                      <button onClick={() => setShowAllCertifications(true)} className="text-primary underline decoration-1 underline-offset-4 hover:decoration-2 transition-all duration-300">Show More Certifications</button>
                    ) : (
                      <a href={linkedInProfile} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-1 underline-offset-4 hover:decoration-2 transition-all duration-300 flex items-center gap-1 justify-center">More on LinkedIn <ExternalLink className="w-4 h-4" /></a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="fade-text text-center space-y-8 pt-24">
            <div className="w-px h-16 bg-gradient-to-b from-primary/30 to-transparent mx-auto"></div>
            <p className="mono-font text-sm text-muted-foreground tracking-wide">
              Crafted with intention
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}