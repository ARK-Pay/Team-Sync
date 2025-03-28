import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

const MenuToggle = styled.div`
  position: fixed;
  top: 40px;
  right: 40px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(30, 30, 30, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: none;
  z-index: 100;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
  }
`;

const HamburgerIcon = styled.div`
  width: 24px;
  height: 16px;
  position: relative;
  
  span {
    display: block;
    position: absolute;
    height: 2px;
    width: 100%;
    background: var(--light);
    border-radius: 2px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: transform 0.25s ease-in-out, opacity 0.25s ease-in-out;
    
    &:nth-child(1) {
      top: 0px;
      transform-origin: left center;
    }
    
    &:nth-child(2) {
      top: 7px;
      transform-origin: left center;
    }
    
    &:nth-child(3) {
      top: 14px;
      transform-origin: left center;
    }
  }
  
  &.open {
    span:nth-child(1) {
      transform: rotate(45deg);
      top: -2px;
      left: 4px;
      background: var(--primary);
    }
    
    span:nth-child(2) {
      width: 0%;
      opacity: 0;
    }
    
    span:nth-child(3) {
      transform: rotate(-45deg);
      top: 15px;
      left: 4px;
      background: var(--primary);
    }
  }
`;

const MenuContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 450px;
  height: 100vh;
  background-color: rgba(15, 15, 15, 0.95);
  z-index: 99;
  padding: 120px 60px;
  transform: translateX(100%);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 100px 40px;
  }
`;

const NavItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const NavItem = styled.div`
  overflow: hidden;
  
  a {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 600;
    color: var(--light);
    text-decoration: none;
    display: block;
    padding: 10px 0;
    transition: color 0.3s ease, transform 0.3s ease;
    transform: translateY(100%);
    
    &:hover {
      color: var(--primary);
      transform: translateY(0) translateX(20px);
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 60px;
  opacity: 0;
  
  a {
    font-size: 1.5rem;
    color: var(--text-secondary);
    transition: color 0.3s ease, transform 0.3s ease;
    
    &:hover {
      color: var(--primary);
      transform: translateY(-5px);
    }
  }
`;

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navItemsRef = useRef(null);
  const socialLinksRef = useRef(null);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  useEffect(() => {
    if (isOpen) {
      // Animate menu opening
      gsap.to(menuRef.current, {
        x: 0,
        duration: 0.5,
        ease: 'power3.out'
      });
      
      // Animate nav items
      const navItems = navItemsRef.current.querySelectorAll('a');
      gsap.to(navItems, {
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
      });
      
      // Animate social links
      gsap.to(socialLinksRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
        delay: 0.5
      });
      
      // Disable body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Animate menu closing
      gsap.to(menuRef.current, {
        x: '100%',
        duration: 0.5,
        ease: 'power3.in'
      });
      
      // Reset nav items
      const navItems = navItemsRef.current.querySelectorAll('a');
      gsap.to(navItems, {
        y: '100%',
        duration: 0.3,
        ease: 'power3.in'
      });
      
      // Hide social links
      gsap.to(socialLinksRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in'
      });
      
      // Re-enable body scroll
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);
  
  return (
    <>
      <MenuToggle onClick={toggleMenu}>
        <HamburgerIcon className={isOpen ? 'open' : ''}>
          <span></span>
          <span></span>
          <span></span>
        </HamburgerIcon>
      </MenuToggle>
      
      <MenuContainer ref={menuRef}>
        <NavItems ref={navItemsRef}>
          <NavItem>
            <Link to="/">Home</Link>
          </NavItem>
          <NavItem>
            <Link to="#about">About</Link>
          </NavItem>
          <NavItem>
            <Link to="#services">Services</Link>
          </NavItem>
          <NavItem>
            <Link to="#contact">Contact</Link>
          </NavItem>
          <NavItem>
            <Link to="/login">Login</Link>
          </NavItem>
        </NavItems>
        
        <SocialLinks ref={socialLinksRef}>
          <a href="#" target="_blank" rel="noopener noreferrer">
            🐦
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            📱
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            💼
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            📸
          </a>
        </SocialLinks>
      </MenuContainer>
    </>
  );
};

export default SideMenu; 