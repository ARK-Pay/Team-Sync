import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import { useTextSplit } from '../../hooks/useTextSplit';
import MagneticButton from '../animations/MagneticButton';

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const HeroContent = styled.div`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  position: relative;
  z-index: 2;
  padding: 0 20px;
`;

const Heading = styled.h1`
  font-size: clamp(3.5rem, 7vw, 7rem);
  color: var(--light);
  line-height: 1;
  margin-bottom: 2rem;
  overflow: hidden;
`;

const SubHeading = styled.h2`
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  color: var(--text-secondary);
  margin-bottom: 3rem;
  overflow: hidden;
`;

const GradientText = styled.span`
  background: linear-gradient(to right, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 40px;
`;

const BackgroundAnimation = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const ScrollDown = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  z-index: 2;
  cursor: none;

  .arrow {
    margin-top: 8px;
    width: 16px;
    height: 28px;
    border: 2px solid var(--text-secondary);
    border-radius: 20px;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-secondary);
      animation: scroll 2s infinite;
    }
  }

  @keyframes scroll {
    0% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(12px);
    }
  }
`;

const Hero = () => {
  const headingRef = useTextSplit({ type: 'words', animateOnView: false, staggerValue: 0.08 });
  const subHeadingRef = useTextSplit({ type: 'words', animateOnView: false, staggerValue: 0.05, delay: 0.5 });
  const backgroundRef = useRef(null);
  const scrollRef = useRef(null);
  
  // Scroll down animation
  useEffect(() => {
    if (!backgroundRef.current) return;
    
    if (scrollRef.current) {
      gsap.to(scrollRef.current, {
        y: 10,
        duration: 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    }
  }, []);
  
  return (
    <HeroSection id="hero">
      <BackgroundAnimation ref={backgroundRef}>
        {/* Blob elements removed as requested */}
      </BackgroundAnimation>
      
      <HeroContent>
        <Heading ref={headingRef} className="fade-in">
          <GradientText>Team-Sync</GradientText> - Elevate Your <GradientText>Team Collaboration</GradientText>
        </Heading>
        
        <SubHeading ref={subHeadingRef} className="fade-in">
          Streamline workflows, boost productivity, and synchronize your team effortlessly.
        </SubHeading>
        
        <ButtonContainer className="fade-in">
          <MagneticButton>Get Started</MagneticButton>
          <MagneticButton>Learn More</MagneticButton>
        </ButtonContainer>
      </HeroContent>
      
      <ScrollDown ref={scrollRef} className="fade-in">
        <span>Scroll Down</span>
        <div className="arrow"></div>
      </ScrollDown>
    </HeroSection>
  );
};

export default Hero; 