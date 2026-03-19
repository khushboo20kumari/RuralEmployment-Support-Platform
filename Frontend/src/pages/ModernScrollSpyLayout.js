import React, { useRef, useState, useEffect, useCallback } from 'react';

const SECTIONS = [
  { id: 'section1', label: 'Introduction' },
  { id: 'section2', label: 'Features' },
  { id: 'section3', label: 'Usage' },
  { id: 'section4', label: 'Examples' },
  { id: 'section5', label: 'Contact' },
];

const ModernScrollSpyLayout = () => {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const contentRef = useRef(null);
  const sectionRefs = useRef(SECTIONS.map(() => React.createRef()));

  // Scroll Spy with Intersection Observer
  useEffect(() => {
    const observerOptions = {
      root: contentRef.current,
      rootMargin: '0px 0px -60% 0px', // triggers when section top is 40% from top
      threshold: 0.1,
    };
    const observer = new window.IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting);
      if (visible.length > 0) {
        // Pick the first visible section (topmost)
        setActiveId(visible[0].target.id);
      }
    }, observerOptions);
    sectionRefs.current.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  // Smooth scroll to section
  const handleSidebarClick = useCallback((id, idx) => {
    const node = sectionRefs.current[idx].current;
    if (node && contentRef.current) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'Inter, Arial, sans-serif',
      background: '#f7f8fa',
    }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          minWidth: 180,
          background: '#fff',
          borderRight: '1px solid #eee',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          padding: '32px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          boxShadow: '2px 0 8px 0 rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 22, padding: '0 24px 24px 24px', letterSpacing: 0.5 }}>Contents</div>
        <nav style={{ flex: 1 }}>
          {SECTIONS.map((section, idx) => (
            <button
              key={section.id}
              onClick={() => handleSidebarClick(section.id, idx)}
              style={{
                background: activeId === section.id ? '#e6f0ff' : 'transparent',
                color: activeId === section.id ? '#0056d6' : '#222',
                border: 'none',
                outline: 'none',
                width: '100%',
                textAlign: 'left',
                padding: '12px 24px',
                fontWeight: activeId === section.id ? 600 : 400,
                fontSize: 16,
                cursor: 'pointer',
                borderLeft: activeId === section.id ? '4px solid #0056d6' : '4px solid transparent',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main
        ref={contentRef}
        style={{
          marginLeft: 240,
          flex: 1,
          height: '100vh',
          overflowY: 'auto',
          padding: '40px 32px',
          boxSizing: 'border-box',
          scrollBehavior: 'smooth',
        }}
      >
        {SECTIONS.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            ref={sectionRefs.current[idx]}
            style={{
              marginBottom: 64,
              padding: '48px 32px',
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
              minHeight: 320,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{section.label}</h2>
            <p style={{ fontSize: 18, color: '#444', lineHeight: 1.7 }}>
              This is the <b>{section.label}</b> section. Add your content here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisi consectetur nisi, euismod euismod nisi nisi euismod.
            </p>
          </section>
        ))}
      </main>
      {/* Responsive: hide sidebar on small screens */}
      <style>{`
        @media (max-width: 700px) {
          aside {
            display: none !important;
          }
          main {
            margin-left: 0 !important;
            padding: 16px 4vw !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernScrollSpyLayout;
