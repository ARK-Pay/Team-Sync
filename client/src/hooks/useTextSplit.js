import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

// Custom hook for text splitting animations
export const useTextSplit = (options = {}) => {
  const textRef = useRef(null);
  const splitRef = useRef(null);
  
  const defaultOptions = {
    type: 'chars', // 'chars', 'words', 'lines'
    animateOnView: true,
    staggerValue: 0.03,
    duration: 1,
    ease: 'power4.out',
    from: { y: '100%', opacity: 0 },
    delay: 0
  };
  
  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };
  
  useEffect(() => {
    if (!textRef.current) return;
    
    // Initialize SplitType
    splitRef.current = new SplitType(textRef.current, {
      types: mergedOptions.type
    });
    
    // Get split elements
    const elements = textRef.current.querySelectorAll(`.${mergedOptions.type}`);
    
    // Reset any existing styles
    gsap.set(elements, { clearProps: 'all' });
    
    // Set initial state
    gsap.set(elements, mergedOptions.from);
    
    if (mergedOptions.animateOnView) {
      // Create ScrollTrigger for animation on view
      gsap.to(elements, {
        y: 0,
        opacity: 1,
        duration: mergedOptions.duration,
        stagger: mergedOptions.staggerValue,
        ease: mergedOptions.ease,
        delay: mergedOptions.delay,
        scrollTrigger: {
          trigger: textRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    } else {
      // Animate immediately
      gsap.to(elements, {
        y: 0,
        opacity: 1,
        duration: mergedOptions.duration,
        stagger: mergedOptions.staggerValue,
        ease: mergedOptions.ease,
        delay: mergedOptions.delay
      });
    }
    
    return () => {
      // Clean up split text when unmounting
      if (splitRef.current && splitRef.current.revert) {
        splitRef.current.revert();
      }
    };
  }, [mergedOptions]);
  
  return textRef;
};

// Custom hook for magnetic text effect
export const useMagneticText = () => {
  const magneticRef = useRef(null);
  
  useEffect(() => {
    if (!magneticRef.current) return;
    
    const element = magneticRef.current;
    const strength = 20;
    const magneticArea = 100;
    
    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + 
        Math.pow(e.clientY - centerY, 2)
      );
      
      if (distance < magneticArea) {
        const x = (e.clientX - centerX) * strength / 100;
        const y = (e.clientY - centerY) * strength / 100;
        
        gsap.to(element, {
          x: x,
          y: y,
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'elastic.out(1, 0.3)'
        });
      }
    };
    
    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    };
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  return magneticRef;
}; 