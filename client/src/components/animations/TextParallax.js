import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ParallaxContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 30px 0;
  z-index: 5;
  background: linear-gradient(to bottom, rgba(15, 15, 15, 0.9), rgba(15, 15, 15, 0.85), rgba(15, 15, 15, 0.9));
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TextLine = styled.div`
  position: relative;
  display: flex;
  font-size: ${props => props.size || 'clamp(4rem, 15vw, 15rem)'};
  font-weight: 900;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 2px;
  transform-origin: center;
  overflow: visible;
  padding: 0;
  margin: 20px 0;
  height: fit-content;
  line-height: 1;
  will-change: transform;
  align-items: center;
`;

const TextSpan = styled.span`
  display: inline-block;
  margin: 0 2.5vw;
  background: #7132ED;
  color: #000000;
  padding: 0 15px;
  /* Add a slight shadow to improve readability */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* Add GPU acceleration for smoother animations */
  transform: translateZ(0);
  will-change: transform;
  /* Ensure the text doesn't get cut off */
  position: relative;
  overflow: visible;
`;

const TextParallax = ({ phrases = ['Team', 'Sync', 'Collaborate', 'Innovate', 'Succeed'] }) => {
  const containerRef = useRef(null);
  const linesRef = useRef([]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const lines = linesRef.current;
    
    // Clear any existing animations first to prevent conflicts
    lines.forEach(line => {
      const existingTween = gsap.getTweensOf(line);
      if (existingTween.length) {
        existingTween.forEach(tween => tween.kill());
      }
    });
    
    // Set initial positions for proper animation
    lines.forEach((line, index) => {
      gsap.set(line, { 
        x: index % 2 === 0 ? '10%' : '-10%',
        force3D: true
      });
    });
    
    // Create individual animations for each line
    lines.forEach((line, index) => {
      const direction = index % 2 === 0 ? -20 : 20;
      
      gsap.to(line, {
        x: `${direction}%`,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true,
          // Add markers for debugging if needed (remove in production)
          // markers: true,
        }
      });
    });
    
    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      gsap.killTweensOf(lines);
    };
  }, []);
  
  // Create repeated phrases for each line
  const createRepeatedText = (text, count = 5) => {
    const repeatedText = [];
    for (let i = 0; i < count; i++) {
      repeatedText.push(
        <TextSpan key={i}>
          {text}
        </TextSpan>
      );
    }
    return repeatedText;
  };
  
  return (
    <ParallaxContainer ref={containerRef}>
      {phrases.map((phrase, index) => (
        <TextLine
          key={index}
          ref={el => (linesRef.current[index] = el)}
        >
          {createRepeatedText(phrase)}
        </TextLine>
      ))}
    </ParallaxContainer>
  );
};

export default TextParallax; 