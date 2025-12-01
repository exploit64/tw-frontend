import React, { useRef, useEffect } from 'react';
import './PepeEasterEgg.css';

const PepeEasterEgg = () => {
  const pepeRef = useRef(null);
  const canRunRef = useRef(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const triggers = document.querySelectorAll('.pep');

    const handleMouseEnter = () => {
      if (!canRunRef.current) return;
      if (Math.random() > 0.03) return;
      canRunRef.current = false;
      const pepe = pepeRef.current;

      if (!hasLoadedRef.current) {
        pepe.style.backgroundImage = `url(/pepe2.gif)`;
        hasLoadedRef.current = true;
      }

      pepe.style.animation = 'none';
      setTimeout(() => {
        pepe.style.animation = 'pepeRun 7s forwards';
      }, 10);

      setTimeout(() => {
        canRunRef.current = true;
      }, 30000);
    };

    triggers.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
    });

    return () => {
      triggers.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
      });
    };
  }, []);

  return (
    <div ref={pepeRef} className="pepe-runner" />
  );
};

export default PepeEasterEgg;
