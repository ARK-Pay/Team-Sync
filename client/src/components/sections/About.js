import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTextSplit } from '../../hooks/useTextSplit';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const AboutSection = styled.section`
  padding: 120px 0;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 80px 0;
  }
`;

const AboutContainer = styled.div`
  width: 90%;
  max-width: var(--max-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  position: relative;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const AboutContent = styled.div`
  position: relative;
  z-index: 2;
`;

const SectionTitle = styled.h2`
  font-size: clamp(2.5rem, 4vw, 4rem);
  margin-bottom: 40px;
  overflow: hidden;
`;

const Description = styled.div`
  color: var(--text-secondary);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  max-width: 600px;
  line-height: 1.8;
  opacity: 0;
  transform: translateY(30px);

  p {
    margin-bottom: 20px;
  }

  strong {
    color: var(--light);
  }
`;

const Stats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 60px;
`;

const StatItem = styled.div`
  flex: 1;
  min-width: 150px;
  opacity: 0;
  transform: translateY(30px);
`;

const StatNumber = styled.div`
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 130%;
  border-radius: 16px;
  overflow: hidden;
  transform: translateY(80px);
  opacity: 0;

  @media (max-width: 992px) {
    max-width: 500px;
    margin: 0 auto;
  }
`;

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--gray);
  background-image: url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80');
  background-size: cover;
  background-position: center;
  transform: scale(1.2);
`;

const BackgroundGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(15, 15, 15, 0.6), var(--dark));
  z-index: 1;
`;

const About = () => {
  const titleRef = useTextSplit({ type: 'chars', staggerValue: 0.02 });
  const descriptionRef = useRef(null);
  const statsRef = useRef(null);
  const imageRef = useRef(null);
  const backgroundRef = useRef(null);
  
  useEffect(() => {
    // Animation for stats
    if (statsRef.current) {
      const statItems = statsRef.current.querySelectorAll('.stat-item');
      
      gsap.to(statItems, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }
    
    // Animation for description
    if (descriptionRef.current) {
      gsap.to(descriptionRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: descriptionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }
    
    // Animation for image
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: imageRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    }
    
    // Parallax effect for background image
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        y: -60,
        scale: 1,
        duration: 2,
        ease: 'none',
        scrollTrigger: {
          trigger: imageRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }, []);
  
  // Function to animate the counter
  const animateCounter = (el, start, end, duration) => {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const run = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      
      el.innerHTML = value + '+';
      
      if (progress < 1) {
        requestAnimationFrame(run);
      }
    };
    
    run();
  };
  
  useEffect(() => {
    // Animate counters when they come into view
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
      const endValue = parseInt(counter.getAttribute('data-count'), 10);
      
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 85%',
        onEnter: () => animateCounter(counter, 0, endValue, 2000)
      });
    });
  }, []);
  
  return (
    <AboutSection id="about">
      <AboutContainer>
        <AboutContent>
          <SectionTitle ref={titleRef}>
            Synchronize Your Team's Efforts
          </SectionTitle>
          
          <Description ref={descriptionRef}>
            <p>Team-Sync provides <strong>seamless collaboration tools</strong> that connect teams across locations, departments, and time zones. Our platform is designed to eliminate communication barriers and enhance productivity.</p>
            <p>With <strong>real-time updates, task management, and integrated communication</strong>, Team-Sync creates a unified workspace where teams can collaborate efficiently and achieve results faster.</p>
          </Description>
          
          <Stats ref={statsRef}>
            <StatItem className="stat-item">
              <StatNumber>
                <span className="counter" data-count="95">0+</span>
              </StatNumber>
              <StatLabel>Satisfaction Rate</StatLabel>
            </StatItem>
            
            <StatItem className="stat-item">
              <StatNumber>
                <span className="counter" data-count="10000">0+</span>
              </StatNumber>
              <StatLabel>Teams Using Our App</StatLabel>
            </StatItem>
            
            <StatItem className="stat-item">
              <StatNumber>
                <span className="counter" data-count="35">0+</span>
              </StatNumber>
              <StatLabel>Time Saved Per Week</StatLabel>
            </StatItem>
          </Stats>
        </AboutContent>
        
        <ImageContainer ref={imageRef}>
          <BackgroundImage ref={backgroundRef}></BackgroundImage>
          <BackgroundGradient></BackgroundGradient>
        </ImageContainer>
      </AboutContainer>
    </AboutSection>
  );
};

export default About; 