import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTextSplit } from '../../hooks/useTextSplit';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ServicesSection = styled.section`
  padding: 120px 0;
  position: relative;
  background-color: #0a0a0a;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 80px 0;
  }
`;

const ServicesContainer = styled.div`
  width: 90%;
  max-width: var(--max-width);
  margin: 0 auto;
  position: relative;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 80px;
`;

const SectionTitle = styled.h2`
  font-size: clamp(2.5rem, 4vw, 4rem);
  margin-bottom: 20px;
  overflow: hidden;
`;

const SectionSubtitle = styled.div`
  color: var(--text-secondary);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  max-width: 600px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(30px);
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled.div`
  background-color: rgba(30, 30, 30, 0.3);
  border-radius: 16px;
  padding: 40px;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              background-color 0.3s;
  position: relative;
  opacity: 0;
  transform: translateY(50px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: none;
  overflow: hidden;
  
  &:hover {
    background-color: rgba(40, 40, 40, 0.5);
    transform: translateY(-10px);
    
    .service-icon {
      transform: translateY(-10px) scale(1.1);
      color: var(--primary);
    }
    
    .service-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  &:hover:before {
    transform: scaleX(1);
  }
`;

const ServiceIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 24px;
  color: var(--light);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              color 0.3s;
`;

const ServiceTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: var(--light);
`;

const ServiceDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ServiceArrow = styled.div`
  width: 30px;
  height: 10px;
  position: relative;
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity 0.3s, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &:before, &:after {
    content: '';
    position: absolute;
    background-color: var(--primary);
    transition: background-color 0.3s;
  }
  
  &:before {
    width: 100%;
    height: 2px;
    top: 4px;
    left: 0;
  }
  
  &:after {
    width: 10px;
    height: 2px;
    right: 0;
    top: 0;
    transform: rotate(45deg);
    transform-origin: right;
  }
  
  &:before {
    content: '';
    position: absolute;
    width: 10px;
    height: 2px;
    right: 0;
    top: 8px;
    transform: rotate(-45deg);
    transform-origin: right;
    background-color: var(--primary);
  }
`;

const BackgroundCircle = styled.div`
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--primary) 0%, rgba(92, 39, 254, 0) 70%);
  opacity: 0.1;
  z-index: 0;
  
  &.circle-1 {
    width: 600px;
    height: 600px;
    top: -300px;
    right: -300px;
  }
  
  &.circle-2 {
    width: 400px;
    height: 400px;
    bottom: -200px;
    left: -200px;
  }
`;

const services = [
  {
    icon: '📅',
    title: 'Team Calendar & Scheduling',
    description: 'Coordinate team activities with shared calendars, automated scheduling, and meeting management.'
  },
  {
    icon: '✅',
    title: 'Task & Project Management',
    description: 'Organize tasks, track progress, and manage projects with intuitive boards and timeline views.'
  },
  {
    icon: '💬',
    title: 'Collaborative Communication',
    description: 'Chat, video conferencing, and commenting tools to keep your team connected and aligned.'
  },
  {
    icon: '📊',
    title: 'Performance Analytics',
    description: 'Measure productivity, track goals, and visualize team performance with customizable dashboards.'
  },
  {
    icon: '🔄',
    title: 'Workflow Automation',
    description: 'Streamline repetitive processes with customizable workflows and automated task assignments.'
  },
  {
    icon: '🔌',
    title: 'App Integrations',
    description: 'Connect with the tools your team already uses through our extensive integration marketplace.'
  }
];

const Services = () => {
  const titleRef = useTextSplit({ type: 'chars', staggerValue: 0.02 });
  const subtitleRef = useRef(null);
  const servicesRef = useRef(null);
  const circlesRef = useRef(null);
  
  useEffect(() => {
    // Animation for subtitle
    if (subtitleRef.current) {
      gsap.to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: subtitleRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }
    
    // Animation for service cards
    if (servicesRef.current) {
      const cards = servicesRef.current.querySelectorAll('.service-card');
      
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: servicesRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none'
        }
      });
    }
    
    // Animation for background circles
    if (circlesRef.current) {
      const circles = circlesRef.current.querySelectorAll('.circle');
      
      gsap.to(circles, {
        scale: 1.2,
        rotation: 360,
        duration: 20,
        ease: 'none',
        repeat: -1,
        yoyo: true,
        stagger: 5
      });
    }
  }, []);
  
  return (
    <ServicesSection id="services">
      <div ref={circlesRef}>
        <BackgroundCircle className="circle circle-1"></BackgroundCircle>
        <BackgroundCircle className="circle circle-2"></BackgroundCircle>
      </div>
      
      <ServicesContainer>
        <SectionHeader>
          <SectionTitle ref={titleRef}>
            Our Comprehensive Services
          </SectionTitle>
          
          <SectionSubtitle ref={subtitleRef}>
            Discover the powerful tools that make Team-Sync the ultimate platform for team collaboration and productivity.
          </SectionSubtitle>
        </SectionHeader>
        
        <ServicesGrid ref={servicesRef}>
          {services.map((service, index) => (
            <ServiceCard key={index} className="service-card">
              <ServiceIcon className="service-icon">
                {service.icon}
              </ServiceIcon>
              
              <ServiceTitle>{service.title}</ServiceTitle>
              <ServiceDescription>{service.description}</ServiceDescription>
              
              <ServiceArrow className="service-arrow" />
            </ServiceCard>
          ))}
        </ServicesGrid>
      </ServicesContainer>
    </ServicesSection>
  );
};

export default Services; 