import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import './landing.css';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideInLeft = keyframes`
  from { transform: translateX(-100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInRight = keyframes`
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const LandingContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  animation: ${fadeIn} 0.8s ease forwards;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  animation: ${pulse} 3s infinite ease-in-out;
`;

const LogoSquare = styled.div<{ color: string }>`
  background-color: ${props => props.color};
  border-radius: 2px;
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled.a`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -4px;
    left: 0;
    background-color: #0066ff;
    transition: width 0.3s;
  }
  
  &:hover {
    color: #0066ff;
    
    &:after {
      width: 100%;
    }
  }
`;

const Button = styled.button<{ primary?: boolean }>`
  background-color: ${props => props.primary ? '#0066ff' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: ${props => props.primary ? 'none' : '1px solid #ddd'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    background-color: ${props => props.primary ? '#0052cc' : '#f5f5f5'};
  }
`;

const Hero = styled.section`
  display: flex;
  align-items: center;
  padding: 4rem 2rem;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeroContent = styled.div`
  flex: 1;
  animation: ${slideInLeft} 1s ease forwards;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  background: linear-gradient(90deg, #0066ff, #5e17eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const HeroImage = styled.div`
  flex: 1;
  position: relative;
  animation: ${slideInRight} 1s ease forwards;
  
  img {
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const FloatingElement = styled.div<{ delay: string; top: string; left: string; size: string }>`
  position: absolute;
  top: ${props => props.top};
  left: ${props => props.left};
  width: ${props => props.size};
  height: ${props => props.size};
  background-color: #0066ff;
  border-radius: 50%;
  opacity: 0.2;
  animation: ${pulse} 3s infinite ease-in-out;
  animation-delay: ${props => props.delay};
`;

const ProjectsSection = styled.section`
  padding: 4rem 2rem;
  background-color: white;
  animation: ${fadeIn} 1s ease forwards;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: #0066ff;
    border-radius: 2px;
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProjectCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  animation: ${slideUp} 0.8s ease forwards;
  opacity: 0;
  animation-delay: calc(var(--index) * 0.1s);
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const ProjectImage = styled.div`
  height: 200px;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const ProjectInfo = styled.div`
  padding: 1.5rem;
`;

const ProjectTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ProjectDate = styled.p`
  font-size: 0.875rem;
  color: #888;
  margin-bottom: 1rem;
`;

const ProjectDescription = styled.p`
  font-size: 1rem;
  color: #555;
  line-height: 1.5;
`;

const FeaturesSection = styled.section`
  padding: 4rem 2rem;
  background-color: #f9f9f9;
  animation: ${fadeIn} 1s ease forwards;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  animation: ${slideUp} 0.8s ease forwards;
  opacity: 0;
  animation-delay: calc(var(--index) * 0.1s);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background-color: #e6f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  svg {
    width: 30px;
    height: 30px;
    color: #0066ff;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #333;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  color: #555;
  line-height: 1.5;
`;

const CTASection = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #0066ff 0%, #5e17eb 100%);
  color: white;
  text-align: center;
  animation: ${fadeIn} 1s ease forwards;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const CTADescription = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.9;
`;

const CTAButton = styled.button`
  background-color: white;
  color: #0066ff;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const Footer = styled.footer`
  padding: 4rem 2rem;
  background-color: #1a1a1a;
  color: white;
  animation: ${fadeIn} 1s ease forwards;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
`;

const FooterColumn = styled.div``;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
`;

const FooterDescription = styled.p`
  font-size: 0.875rem;
  color: #aaa;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const FooterTitle = styled.h3`
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: #0066ff;
    border-radius: 2px;
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
`;

const FooterLink = styled.li`
  margin-bottom: 0.75rem;
  
  a {
    color: #aaa;
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
      color: #0066ff;
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 3rem;
  color: #777;
  font-size: 0.875rem;
`;

interface Project {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const projectsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Simulate GSAP animations with JavaScript
    const animateElements = () => {
      const projectCards = document.querySelectorAll('.project-card');
      const featureCards = document.querySelectorAll('.feature-card');
      
      projectCards.forEach((card, index) => {
        (card as HTMLElement).style.setProperty('--index', index.toString());
      });
      
      featureCards.forEach((card, index) => {
        (card as HTMLElement).style.setProperty('--index', index.toString());
      });
    };
    
    animateElements();
    
    // Add scroll animation
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Animate elements when they come into view
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(element => {
        const elementTop = (element as HTMLElement).getBoundingClientRect().top + scrollY;
        if (scrollY > elementTop - viewportHeight + 100) {
          (element as HTMLElement).classList.add('visible');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const projects: Project[] = [
    {
      id: '1',
      title: 'Website Redesign',
      date: 'Last modified: 4/10/2025',
      description: 'A complete redesign of a corporate website with modern UI/UX principles.',
      image: 'https://i.imgur.com/JvVQmjS.png'
    },
    {
      id: '2',
      title: 'Mobile App UI',
      date: 'Last modified: 4/10/2025',
      description: 'User interface design for a mobile application focused on user experience.',
      image: 'https://i.imgur.com/L8Tw4Yk.png'
    },
    {
      id: '3',
      title: 'Marketing Campaign',
      date: 'Last modified: 4/10/2025',
      description: 'Visual assets for a digital marketing campaign across multiple platforms.',
      image: 'https://i.imgur.com/YQd8QRC.png'
    }
  ];
  
  const features: Feature[] = [
    {
      id: '1',
      title: 'Real-Time Collaboration',
      description: 'Work together with your team in real-time, seeing changes as they happen.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      id: '2',
      title: 'Advanced Design Tools',
      description: 'Powerful vector editing, prototyping, and design system features.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
      )
    },
    {
      id: '3',
      title: 'Developer Handoff',
      description: 'Generate code snippets and specs for seamless developer handoff.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      )
    },
    {
      id: '4',
      title: 'Design System',
      description: 'Create and maintain design systems with reusable components.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      )
    }
  ];
  
  const handleGetStarted = () => {
    navigate('/dashboard');
  };
  
  return (
    <LandingContainer>
      <Header>
        <Logo>
          <LogoIcon>
            <LogoSquare color="#0066ff" />
            <LogoSquare color="#5e17eb" />
            <LogoSquare color="#00c2ff" />
            <LogoSquare color="#0066ff" />
          </LogoIcon>
          Figma Clone
        </Logo>
        <Nav>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#projects">Projects</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <Button onClick={() => navigate('/dashboard')}>Sign In</Button>
          <Button primary onClick={handleGetStarted}>Get Started</Button>
        </Nav>
      </Header>
      
      <Hero>
        <HeroContent>
          <HeroTitle>Design, prototype, and collaborate all in one place</HeroTitle>
          <HeroSubtitle>
            Create beautiful designs, prototype interactions, and collaborate with your team seamlessly.
            Our powerful design platform helps you bring your ideas to life faster.
          </HeroSubtitle>
          <Button primary onClick={handleGetStarted}>Get Started — It's Free</Button>
        </HeroContent>
        <HeroImage>
          <img src="https://i.imgur.com/kJY7O2P.png" alt="Design Interface" />
          <FloatingElement delay="0s" top="10%" left="10%" size="50px" />
          <FloatingElement delay="0.5s" top="70%" left="80%" size="70px" />
          <FloatingElement delay="1s" top="40%" left="60%" size="40px" />
        </HeroImage>
      </Hero>
      
      <ProjectsSection id="projects" ref={projectsRef} className="animate-on-scroll">
        <SectionTitle>My Projects</SectionTitle>
        <ProjectsGrid>
          {projects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              className="project-card"
              onClick={() => navigate(`/editor/${project.id}`)}
            >
              <ProjectImage>
                <img src={project.image} alt={project.title} />
              </ProjectImage>
              <ProjectInfo>
                <ProjectTitle>{project.title}</ProjectTitle>
                <ProjectDate>{project.date}</ProjectDate>
                <ProjectDescription>{project.description}</ProjectDescription>
              </ProjectInfo>
            </ProjectCard>
          ))}
        </ProjectsGrid>
      </ProjectsSection>
      
      <FeaturesSection id="features" ref={featuresRef} className="animate-on-scroll">
        <SectionTitle>Powerful Features</SectionTitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} className="feature-card">
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>
      
      <CTASection className="animate-on-scroll">
        <CTATitle>Ready to bring your designs to life?</CTATitle>
        <CTADescription>
          Join thousands of designers and teams who use our platform to create amazing products.
        </CTADescription>
        <CTAButton onClick={handleGetStarted}>Start Designing Now</CTAButton>
      </CTASection>
      
      <Footer>
        <FooterContent>
          <FooterColumn>
            <FooterLogo>
              <LogoIcon>
                <LogoSquare color="#0066ff" />
                <LogoSquare color="#5e17eb" />
                <LogoSquare color="#00c2ff" />
                <LogoSquare color="#0066ff" />
              </LogoIcon>
              Figma Clone
            </FooterLogo>
            <FooterDescription>
              A powerful design platform for teams to create, prototype, and collaborate.
            </FooterDescription>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>Product</FooterTitle>
            <FooterLinks>
              <FooterLink><a href="#features">Features</a></FooterLink>
              <FooterLink><a href="#pricing">Pricing</a></FooterLink>
              <FooterLink><a href="#enterprise">Enterprise</a></FooterLink>
              <FooterLink><a href="#education">Education</a></FooterLink>
            </FooterLinks>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>Resources</FooterTitle>
            <FooterLinks>
              <FooterLink><a href="#blog">Blog</a></FooterLink>
              <FooterLink><a href="#tutorials">Tutorials</a></FooterLink>
              <FooterLink><a href="#support">Support</a></FooterLink>
              <FooterLink><a href="#documentation">Documentation</a></FooterLink>
            </FooterLinks>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>Company</FooterTitle>
            <FooterLinks>
              <FooterLink><a href="#about">About</a></FooterLink>
              <FooterLink><a href="#careers">Careers</a></FooterLink>
              <FooterLink><a href="#contact">Contact</a></FooterLink>
              <FooterLink><a href="#legal">Legal</a></FooterLink>
            </FooterLinks>
          </FooterColumn>
        </FooterContent>
        
        <Copyright>
          © {new Date().getFullYear()} Figma Clone. All rights reserved.
        </Copyright>
      </Footer>
    </LandingContainer>
  );
};

export default Landing;
