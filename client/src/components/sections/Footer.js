import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterSection = styled.footer`
  background-color: #080808;
  padding: 80px 0 40px 0;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const FooterContainer = styled.div`
  width: 90%;
  max-width: var(--max-width);
  margin: 0 auto;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 60px;
  margin-bottom: 60px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const FooterColumn = styled.div``;

const FooterLogo = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--light);
  
  span {
    background: linear-gradient(to right, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const FooterDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 20px;
  max-width: 300px;
`;

const FooterTitle = styled.h4`
  font-size: 1.1rem;
  color: var(--light);
  margin-bottom: 20px;
  font-weight: 600;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: 12px;
  
  a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--primary);
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  
  a {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 1.2rem;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--primary);
      color: var(--dark);
      transform: translateY(-5px);
    }
  }
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
`;

const Copyright = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const FooterNav = styled.div`
  display: flex;
  gap: 20px;
  
  a {
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--primary);
    }
  }
`;

const Footer = () => {
  return (
    <FooterSection>
      <FooterContainer>
        <FooterContent>
          <FooterColumn>
            <FooterLogo>
              Team<span>Sync</span>
            </FooterLogo>
            <FooterDescription>
              Streamlining team collaboration and productivity with innovative solutions for modern workforces.
            </FooterDescription>
            <SocialLinks>
              <a href="#" target="_blank" rel="noopener noreferrer">🐦</a>
              <a href="#" target="_blank" rel="noopener noreferrer">📱</a>
              <a href="#" target="_blank" rel="noopener noreferrer">💼</a>
              <a href="#" target="_blank" rel="noopener noreferrer">📸</a>
            </SocialLinks>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>Company</FooterTitle>
            <FooterLinks>
              <FooterLink><Link to="/about">About Us</Link></FooterLink>
              <FooterLink><Link to="/careers">Careers</Link></FooterLink>
              <FooterLink><Link to="/blog">Blog</Link></FooterLink>
              <FooterLink><Link to="/pricing">Pricing</Link></FooterLink>
            </FooterLinks>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>Resources</FooterTitle>
            <FooterLinks>
              <FooterLink><Link to="/docs">Documentation</Link></FooterLink>
              <FooterLink><Link to="/support">Support Center</Link></FooterLink>
              <FooterLink><Link to="/tutorials">Tutorials</Link></FooterLink>
              <FooterLink><Link to="/webinars">Webinars</Link></FooterLink>
            </FooterLinks>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>Legal</FooterTitle>
            <FooterLinks>
              <FooterLink><Link to="/privacy">Privacy Policy</Link></FooterLink>
              <FooterLink><Link to="/terms">Terms of Service</Link></FooterLink>
              <FooterLink><Link to="/cookies">Cookie Policy</Link></FooterLink>
              <FooterLink><Link to="/security">Security</Link></FooterLink>
            </FooterLinks>
          </FooterColumn>
        </FooterContent>
        
        <FooterBottom>
          <Copyright>
            &copy; {new Date().getFullYear()} TeamSync. All rights reserved.
          </Copyright>
          
          <FooterNav>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/sitemap">Sitemap</Link>
          </FooterNav>
        </FooterBottom>
      </FooterContainer>
    </FooterSection>
  );
};

export default Footer; 