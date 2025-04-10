import React, { useEffect, useRef, useState } from 'react';
import { GlobalStyles } from '../../styles/GlobalStyles';
import styled from 'styled-components';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Footer from '../../components/sections/Footer';
import CustomCursor from '../../components/animations/CustomCursor';
import Preloader from '../../components/animations/Preloader';
import SignIn from '../../components/SignIn';
import SignUp from '../../components/SignUp';
import Navbar from './components/Navbar';
import ExploreMenu from '../../components/ExploreMenu';
import ContactForm from '../../components/ContactForm';
import teamCollaborationImg from '../../assets/team-collaboration.jpg';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const AppContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const MainContent = styled.main`
  position: relative;
  background-color: #060918;
  color: #ffffff;
`;

const HeroSection = styled.section`
  height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding-top: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 65% 50%, rgba(17, 24, 39, 0.4), rgba(6, 9, 24, 0.95));
    z-index: 1;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 3rem;
  
  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeroTextContent = styled.div`
  flex: 1;
  margin-top: 2rem;
  
  @media (max-width: 992px) {
    margin-bottom: 3rem;
  }
`;

const HeroImageContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  max-width: 500px;
  margin-left: 2rem;
  
  @media (max-width: 992px) {
    margin-left: 0;
  }
`;

const HeroImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 1rem;
  object-fit: cover;
  z-index: 2;
`;

const AnimatedBorder = styled.div`
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  border: 2px solid rgba(59, 130, 246, 0.5);
  border-radius: 1.5rem;
  z-index: 1;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 2px solid rgba(79, 70, 229, 0.3);
    border-radius: 2rem;
    animation: pulse 3s infinite alternate;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    border: 2px solid rgba(6, 182, 212, 0.2);
    border-radius: 1.8rem;
    animation: pulse 3s infinite alternate-reverse;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.05);
    }
  }
`;

// Add the white ladder animation
const WhiteLadder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%
    );
    background-size: 20px 20px;
    z-index: 0;
  }
  
  &::before {
    animation: ladder 15s linear infinite;
  }
  
  &::after {
    animation: ladder 12s linear infinite reverse;
    opacity: 0.5;
  }
  
  @keyframes ladder {
    0% {
      transform: rotate(0) scale(1);
    }
    100% {
      transform: rotate(360deg) scale(1.2);
    }
  }
`;

const HeroHeading = styled.h1`
  font-size: clamp(2.5rem, 5vw, 5rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const HeroSubheading = styled.p`
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  line-height: 1.6;
  margin-bottom: 2.5rem;
  max-width: 650px;
  overflow: hidden;
`;

const HeroBackground = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 60%;
  height: 100%;
  z-index: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 20%;
    right: 10%;
    width: 40vw;
    height: 40vw;
    border-radius: 50%;
    background: linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #06b6d4 100%);
    filter: blur(80px);
    opacity: 0.15;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 10%;
    right: 25%;
    width: 25vw;
    height: 25vw;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    filter: blur(60px);
    opacity: 0.2;
  }
`;

const FeaturesSection = styled.section`
  padding: 8rem 0;
  position: relative;
  background-color: #080c20;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const FeatureCard = styled.div`
  background-color: rgba(30, 41, 59, 0.4);
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  opacity: 0;
  transform: translateY(30px);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  svg {
    width: 30px;
    height: 30px;
    color: #3b82f6;
  }
`;

const CTASection = styled.section`
  padding: 6rem 0;
  background: linear-gradient(to right, #080c20, #111827);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -10%;
    width: 70%;
    height: 200%;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
    transform: rotate(-15deg);
    z-index: 0;
  }
`;

const CTAContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  justify-content: center;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
  }
`;

const TestimonialsSection = styled.section`
  padding: 8rem 0;
  background-color: #070a1a;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    right: -5%;
    top: -10%;
    width: 30%;
    height: 50%;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 51, 234, 0.05) 100%);
    border-radius: 50%;
    filter: blur(60px);
  }
`;

const TestimonialContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const TestimonialSlider = styled.div`
  margin-top: 4rem;
  position: relative;
  overflow: hidden;
`;

const TestimonialTrack = styled.div`
  display: flex;
  position: relative;
`;

const TestimonialCard = styled.div`
  background-color: rgba(30, 41, 59, 0.4);
  border-radius: 12px;
  padding: 2rem;
  margin: 0 1rem;
  min-width: 350px;
  flex: 0 0 auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  opacity: 0;
  transform: scale(0.95);
  
  @media (max-width: 640px) {
    min-width: calc(100% - 2rem);
  }
`;

const TestimonialQuote = styled.div`
  font-size: 1.1rem;
  line-height: 1.6;
  font-style: italic;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
  position: relative;
  
  &::before {
    content: '"';
    font-size: 4rem;
    color: rgba(59, 130, 246, 0.2);
    position: absolute;
    top: -2rem;
    left: -1rem;
    font-family: serif;
  }
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  background-color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AuthorInfo = styled.div`
  h4 {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  p {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const PricingSection = styled.section`
  padding: 8rem 0;
  background-color: #080c20;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    left: -5%;
    bottom: -10%;
    width: 40%;
    height: 50%;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(14, 165, 233, 0.03) 100%);
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    filter: blur(70px);
  }
`;

const PricingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
`;

const PricingCard = styled.div`
  background-color: rgba(30, 41, 59, 0.4);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: translateY(40px);
  opacity: 0;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
  
  &.popular {
    border-color: rgba(59, 130, 246, 0.5);
    
    &::before {
      content: 'Most Popular';
      position: absolute;
      top: -1rem;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(to right, #3b82f6, #2563eb);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
    }
  }
`;

const PricingHeader = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .price {
    font-size: 3rem;
    font-weight: 800;
    color: white;
    margin-bottom: 1rem;
    
    .currency {
      font-size: 1.5rem;
      vertical-align: super;
      font-weight: 500;
      margin-right: 0.25rem;
    }
    
    .period {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 400;
    }
  }
`;

const PricingFeatures = styled.ul`
  margin-bottom: 2rem;
  
  li {
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const ParallaxTextSection = styled.section`
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: #070a1a;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, #070a1a, transparent 15%, transparent 85%, #070a1a);
    z-index: 5;
    pointer-events: none;
  }
`;

const ParallaxTextContainer = styled.div`
  white-space: nowrap;
  position: absolute;
  will-change: transform;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
`;

const ParallaxText = styled.h2`
  display: inline-block;
  color: rgba(255, 255, 255, 0.15);
  font-size: 9rem;
  font-weight: 800;
  text-transform: uppercase;
  padding-right: 4rem;
`;

// Button Component
const StyledButton = styled.button`
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &.primary {
    background: linear-gradient(to right, #3b82f6, #2563eb);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
    }
  }
  
  &.secondary {
    background-color: transparent;
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: white;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
  }
  
  @media (max-width: 640px) {
    width: 100%;
    max-width: 300px;
  }
`;

// Simple Button component to avoid hot-reloading issues
const Button = ({ children, className, onClick }) => {
  return (
    <StyledButton className={className} onClick={onClick}>
      {children}
    </StyledButton>
  );
};

function Home() {
  const appRef = useRef(null);
  const mainRef = useRef(null);
  const cursorRef = useRef(null);
  const preloaderRef = useRef(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const parallaxTextRef = useRef(null);
  const pricingCardsRef = useRef(null);
  const testimonialTrackRef = useRef(null);
  
  const handleSignIn = () => {
    setSignInOpen(true);
  };
  
  const splitTextIntoSpans = (text) => {
    return text.split(' ').map((word, index) => (
      <span key={index} className="word" style={{ display: 'inline-block', overflow: 'hidden' }}>
        <span style={{ display: 'inline-block' }}>{word}</span>&nbsp;
      </span>
    ));
  };

  const testimonials = [
    {
      id: 1,
      text: "Team Sync has transformed how our team works together. The real-time collaboration features have cut our project delivery time by 40%.",
      name: "Sarah Johnson",
      position: "Product Manager at TechCorp",
      initial: "SJ"
    },
    {
      id: 2,
      text: "The integration capabilities are outstanding. We've connected all our existing tools, and now everything flows seamlessly through one platform.",
      name: "Michael Chen",
      position: "CTO at StartupLabs",
      initial: "MC"
    },
    {
      id: 3,
      text: "The automation features have saved us countless hours on repetitive tasks. Our team can now focus on what truly matters - innovation.",
      name: "Emily Rodriguez",
      position: "Team Lead at CreativeHub",
      initial: "ER"
    },
    {
      id: 4,
      text: "Security was our main concern when choosing a collaboration tool. Team Sync exceeded our expectations with enterprise-grade security features.",
      name: "David Park",
      position: "Security Officer at DataSafe",
      initial: "DP"
    }
  ];

  useEffect(() => {
    // Initialize GSAP animations
    const ctx = gsap.context(() => {
      // Preloader Animation
      const preloader = preloaderRef.current;
      if (preloader) {
        const tl = gsap.timeline();
        
        tl.to(preloader.querySelector('.loader-wrapper'), {
          duration: 2,
          width: '100%',
          ease: 'power3.inOut'
        })
        .to(preloader.querySelectorAll('.loader-content span'), {
          y: 0,
          stagger: 0.2,
          duration: 1,
          ease: 'power3.out',
          opacity: 1
        }, '-=1.5')
        .to(preloader, {
          y: '-100%',
          duration: 1.5,
          ease: 'power4.inOut',
          delay: 0.5
        })
        .from('.hero-title .word', {
          y: 100,
          opacity: 0,
          stagger: 0.1,
          duration: 1,
          ease: 'power3.out'
        }, '-=1')
        .from('.hero-subtitle', {
          y: 20,
          opacity: 0,
          duration: 1,
          ease: 'power3.out'
        }, '-=0.7')
        .from('.hero-buttons button', {
          y: 20,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out'
        }, '-=0.7');
      }

      // Features section animation
      gsap.to('.feature-card', {
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 70%',
        },
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      });
      
      // Testimonials animation
      const testimonialCards = document.querySelectorAll('.testimonial-card');
      gsap.to(testimonialCards, {
        scrollTrigger: {
          trigger: '.testimonials-section',
          start: 'top 70%',
        },
        opacity: 1,
        scale: 1,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power3.out'
      });
      
      // Testimonial slider animation
      const testimonialTrack = testimonialTrackRef.current;
      if (testimonialTrack && testimonialCards.length > 0) {
        const cardWidth = testimonialCards[0].offsetWidth + 32; // Width + margin
        
        // Create slider animation
        const sliderTl = gsap.timeline({
          repeat: -1,
          repeatDelay: 1
        });
        
        // Animate to each testimonial
        for (let i = 0; i < testimonialCards.length; i++) {
          sliderTl.to(testimonialTrack, {
            x: -cardWidth * i,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => setCurrentTestimonial(i)
          });
          
          // Pause at each testimonial
          sliderTl.to({}, { duration: 4 });
        }
      }
      
      // Pricing section animation
      const pricingCards = document.querySelectorAll('.pricing-card');
      gsap.to(pricingCards, {
        scrollTrigger: {
          trigger: '.pricing-section',
          start: 'top 70%',
        },
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
      });

      // CTA section animation
      gsap.from('.cta-content', {
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 70%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });

      // Parallax text animation
      const parallaxText = parallaxTextRef.current;
      if (parallaxText) {
        gsap.to(parallaxText, {
          x: '-50%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.parallax-text-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      }

      // Parallax effects
      gsap.to('.hero-background', {
        y: '20%',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      // Set up custom cursor
      const cursor = cursorRef.current;
      if (cursor) {
        document.addEventListener('mousemove', (e) => {
          gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.5,
            ease: 'power2.out'
          });
        });

        // Add hover effect to all interactive elements
        const interactiveElements = document.querySelectorAll('button, a, .interactive');
        
        interactiveElements.forEach(el => {
          el.addEventListener('mouseenter', () => {
            gsap.to(cursor, {
              scale: 1.5,
              opacity: 0.8,
              backgroundColor: 'rgba(59, 130, 246, 0.3)',
              duration: 0.3,
              ease: 'power2.out'
            });
          });
          
          el.addEventListener('mouseleave', () => {
            gsap.to(cursor, {
              scale: 1,
              opacity: 1,
              backgroundColor: 'rgba(255, 255, 255, 1)',
              duration: 0.3,
              ease: 'power2.out'
            });
          });
        });
      }
    }, appRef);

    return () => ctx.revert(); // Cleanup animations on unmount
  }, []);

  return (
    <AppContainer ref={appRef}>
      <GlobalStyles />
      <CustomCursor ref={cursorRef} />
      <Preloader ref={preloaderRef} />
      
      {/* Updated header layout with just the ExploreMenu button */}
      <div className="header-container" style={{ 
        position: 'fixed', 
        width: '100%', 
        zIndex: 1000, 
        padding: '2rem 4rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ 
          fontFamily: "'Akira', sans-serif", 
          fontSize: '1.5rem', 
          color: '#fff',
          visibility: 'hidden' /* Making the logo invisible while keeping the space */
        }}>
          Team Sync
        </div>
        <div style={{ 
          position: 'absolute', 
          right: 'calc(4rem + 50px)' /* Adding 30px right margin */
        }}>
          <ExploreMenu onSignIn={handleSignIn} />
        </div>
      </div>
      
      <MainContent ref={mainRef}>
        {/* Hero Section with added image */}
        <HeroSection className="hero-section">
          <HeroBackground className="hero-background" />
          <HeroContent>
            <HeroTextContent>
              <HeroHeading className="hero-title">
                {splitTextIntoSpans('Elevate Your Team Collaboration')}
              </HeroHeading>
              <HeroSubheading className="hero-subtitle">
                Connect, collaborate, and create with an intuitive platform designed for modern teams to work efficiently from anywhere.
              </HeroSubheading>
              <ButtonGroup className="hero-buttons">
                <Button className="primary interactive" onClick={handleSignIn}>
                  Get Started
                </Button>
                <Button className="secondary interactive">
                  Watch Demo
                </Button>
              </ButtonGroup>
            </HeroTextContent>
            
            <HeroImageContainer className="hero-image-container">
              <HeroImage 
                src={teamCollaborationImg} 
                alt="Team collaboration" 
                className="hero-image"
              />
              <AnimatedBorder className="animated-border">
                <WhiteLadder className="white-ladder" />
              </AnimatedBorder>
            </HeroImageContainer>
          </HeroContent>
        </HeroSection>
        
        {/* Features Section */}
        <FeaturesSection className="features-section" id="features">
          <FeaturesGrid>
            <FeatureCard className="feature-card">
              <FeatureIcon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 12.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7.447 5.105a1 1 0 0 0 1.494-1.32c-.468-.53-1.74-.53-2.206 0a1 1 0 0 0 .712 1.7 1 1 0 0 0 0-2 1 1 0 0 0 0 2zM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
                </svg>
              </FeatureIcon>
              <h3 className="text-xl font-semibold mb-3">Real-time Collaboration</h3>
              <p className="text-gray-300">Work together in real-time on documents, projects, and tasks with no delay or conflicts.</p>
            </FeatureCard>
            
            <FeatureCard className="feature-card">
              <FeatureIcon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7.565 7.423l2.989-1.923.496.721-2.851 1.923.506 1.099L16.01 6.322l.823 1.099-2.851 1.923.55.813L17.52 8.234l.55.907L15.186 11l.542.802 2.989-2.008.55.901-4.214 2.914a2.782 2.782 0 0 1-1.942.519c-.74-.048-1.43-.433-1.942-1.078l-3.652-4.627Z" />
                </svg>
              </FeatureIcon>
              <h3 className="text-xl font-semibold mb-3">Seamless Integration</h3>
              <p className="text-gray-300">Integrate with your favorite tools and services to create a unified workflow experience.</p>
            </FeatureCard>
            
            <FeatureCard className="feature-card">
              <FeatureIcon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                  <path d="M13 7h-2v6h6v-2h-4z" />
                </svg>
              </FeatureIcon>
              <h3 className="text-xl font-semibold mb-3">Smart Automation</h3>
              <p className="text-gray-300">Automate repetitive tasks and workflows to save time and reduce human error.</p>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>
        
        {/* Testimonials Section */}
        <TestimonialsSection className="testimonials-section">
          <TestimonialContainer>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">What Our Users Say</h2>
            <p className="text-xl text-center text-gray-300 max-w-3xl mx-auto">
              Trusted by thousands of teams worldwide to enhance their collaboration and productivity.
            </p>
            
            <TestimonialSlider>
              <TestimonialTrack ref={testimonialTrackRef}>
                {testimonials.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} className="testimonial-card">
                    <TestimonialQuote>
                      {testimonial.text}
                    </TestimonialQuote>
                    <TestimonialAuthor>
                      <AuthorAvatar>
                        {testimonial.initial}
                      </AuthorAvatar>
                      <AuthorInfo>
                        <h4>{testimonial.name}</h4>
                        <p>{testimonial.position}</p>
                      </AuthorInfo>
                    </TestimonialAuthor>
                  </TestimonialCard>
                ))}
              </TestimonialTrack>
            </TestimonialSlider>
            
            <div className="flex justify-center mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    index === currentTestimonial
                      ? 'bg-blue-500'
                      : 'bg-gray-600'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </TestimonialContainer>
        </TestimonialsSection>
        
        {/* Pricing Section */}
        <PricingSection className="pricing-section" id="pricing">
          <PricingContainer>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your team's needs. All plans include a 14-day free trial.
            </p>
            
            <PricingGrid ref={pricingCardsRef}>
              <PricingCard className="pricing-card">
                <PricingHeader>
                  <h3>Starter</h3>
                  <div className="price">
                    <span className="currency">$</span>
                    9
                    <span className="period">/month per user</span>
                  </div>
                  <p className="text-gray-400">For small teams getting started</p>
                </PricingHeader>
                
                <PricingFeatures>
                  <li>Up to 10 team members</li>
                  <li>Basic collaboration tools</li>
                  <li>5GB storage per user</li>
                  <li>Standard security</li>
                  <li>Email support</li>
                </PricingFeatures>
                
                <Button className="primary interactive w-full">
                  Start Free Trial
                </Button>
              </PricingCard>
              
              <PricingCard className="pricing-card popular">
                <PricingHeader>
                  <h3>Professional</h3>
                  <div className="price">
                    <span className="currency">$</span>
                    19
                    <span className="period">/month per user</span>
                  </div>
                  <p className="text-gray-400">For growing teams that need more</p>
                </PricingHeader>
                
                <PricingFeatures>
                  <li>Unlimited team members</li>
                  <li>Advanced collaboration tools</li>
                  <li>50GB storage per user</li>
                  <li>Enhanced security</li>
                  <li>Priority support</li>
                  <li>Advanced integrations</li>
                </PricingFeatures>
                
                <Button className="primary interactive w-full">
                  Start Free Trial
                </Button>
              </PricingCard>
              
              <PricingCard className="pricing-card">
                <PricingHeader>
                  <h3>Enterprise</h3>
                  <div className="price">
                    <span className="currency">$</span>
                    39
                    <span className="period">/month per user</span>
                  </div>
                  <p className="text-gray-400">For large teams and organizations</p>
                </PricingHeader>
                
                <PricingFeatures>
                  <li>Unlimited team members</li>
                  <li>Enterprise collaboration suite</li>
                  <li>Unlimited storage</li>
                  <li>Advanced security & compliance</li>
                  <li>24/7 dedicated support</li>
                  <li>Custom integrations</li>
                  <li>Admin controls & analytics</li>
                </PricingFeatures>
                
                <Button className="primary interactive w-full">
                  Contact Sales
                </Button>
              </PricingCard>
            </PricingGrid>
          </PricingContainer>
        </PricingSection>
        
        {/* Contact Form Section */}
        <ContactForm />
        
        {/* CTA Section */}
        <CTASection className="cta-section">
          <CTAContent className="cta-content">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your team's workflow?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-6">Join thousands of teams already using our platform to work smarter, not harder.</p>
            <ButtonGroup>
              <Button className="primary interactive" onClick={handleSignIn}>
                Start Free Trial
              </Button>
              <Button className="secondary interactive">
                Schedule Demo
              </Button>
            </ButtonGroup>
          </CTAContent>
        </CTASection>
        
        {/* Parallax Text Section */}
        <ParallaxTextSection className="parallax-text-section">
          <ParallaxTextContainer ref={parallaxTextRef}>
            <ParallaxText>COLLABORATE • INNOVATE • SUCCEED • TRANSFORM • GROW • SCALE • CONNECT •</ParallaxText>
            <ParallaxText>COLLABORATE • INNOVATE • SUCCEED • TRANSFORM • GROW • SCALE • CONNECT •</ParallaxText>
          </ParallaxTextContainer>
        </ParallaxTextSection>
        
        <Footer />
      </MainContent>
      
      {signInOpen && <SignIn setSignInOpen={setSignInOpen} setSignUpOpen={setSignUpOpen} />}
      {signUpOpen && <SignUp setSignInOpen={setSignInOpen} setSignUpOpen={setSignUpOpen} />}
    </AppContainer>
  );
}

export default Home;
