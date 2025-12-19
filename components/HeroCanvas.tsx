import React, { useEffect } from 'react';

const HeroCanvas: React.FC = () => {
  useEffect(() => {
    const scriptId = 'unicorn-studio-script';
    
    const initUnicorn = () => {
      // @ts-ignore
      if (window.UnicornStudio) {
        // @ts-ignore
        window.UnicornStudio.init().then(() => {
            console.log("Unicorn Studio Initialized");
        }).catch((err: any) => {
            console.error("Error initializing Unicorn Studio", err);
        });
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
      script.onload = initUnicorn;
      document.head.appendChild(script);
    } else {
      // Small timeout to ensure DOM is ready if script was already loaded
      setTimeout(initUnicorn, 100);
    }
  }, []);

  return (
    <div className="aura-background-component fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none bg-slate-950">
      <div 
        data-us-project="yWZ2Tbe094Fsjgy9NRnD" 
        className="absolute w-full h-full left-0 top-0"
        style={{ opacity: 1 }}
      ></div>
    </div>
  );
};

export default HeroCanvas;