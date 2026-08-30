import React, { useEffect, useRef, useState } from 'react';

export const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, []);

  const getTransformClass = () => {
    if (isVisible) {
      return 'opacity-100 translate-y-0 translate-x-0 scale-100 blur-none';
    }
    switch (direction) {
      case 'up':
        return 'opacity-0 translate-y-10 scale-95 blur-xs';
      case 'down':
        return 'opacity-0 -translate-y-10 scale-95 blur-xs';
      case 'left':
        return 'opacity-0 translate-x-10 scale-95 blur-xs';
      case 'right':
        return 'opacity-0 -translate-x-10 scale-95 blur-xs';
      case 'zoom':
        return 'opacity-0 scale-90 blur-xs';
      default:
        return 'opacity-0 translate-y-10 scale-95 blur-xs';
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${getTransformClass()} ${className}`}
    >
      {children}
    </div>
  );
};
