import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';

const ButtonWrapper = styled.div`
  position: relative;
  display: inline-block;
  cursor: none;
`;

const StyledButton = styled.button`
  background-color: var(--primary);
  color: var(--dark);
  font-weight: 600;
  padding: 16px 32px;
  border-radius: 4px;
  border: none;
  cursor: none;
  overflow: hidden;
  position: relative;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: var(--secondary);
  }
  
  span {
    position: relative;
    z-index: 1;
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, var(--primary), var(--secondary));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover:before {
    opacity: 1;
  }
`;

const MagneticButton = ({ children, strength = 0.2, className, ...props }) => {
  const buttonRef = useRef(null);
  const wrapperRef = useRef(null);
  
  useEffect(() => {
    const button = buttonRef.current;
    const wrapper = wrapperRef.current;
    
    if (!button || !wrapper) return;
    
    const rect = wrapper.getBoundingClientRect();
    const buttonWidth = rect.width;
    const buttonHeight = rect.height;
    
    const strengthX = buttonWidth * strength;
    const strengthY = buttonHeight * strength;
    
    const handleMouseMove = (e) => {
      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.left + buttonWidth / 2;
      const centerY = rect.top + buttonHeight / 2;
      
      const distanceX = (e.clientX - centerX) / (buttonWidth / 2);
      const distanceY = (e.clientY - centerY) / (buttonHeight / 2);
      
      gsap.to(button, {
        x: distanceX * strengthX,
        y: distanceY * strengthY,
        duration: 0.6,
        ease: "power2.out"
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)"
      });
    };
    
    const handleMouseEnter = () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)"
      });
    };
    
    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    wrapper.addEventListener('mouseenter', handleMouseEnter);
    
    return () => {
      if (wrapper) {
        wrapper.removeEventListener('mousemove', handleMouseMove);
        wrapper.removeEventListener('mouseleave', handleMouseLeave);
        wrapper.removeEventListener('mouseenter', handleMouseEnter);
      }
    };
  }, [strength]);
  
  return (
    <ButtonWrapper ref={wrapperRef} className={`magnetic-wrapper ${className || ''}`}>
      <StyledButton ref={buttonRef} className="magnetic-button" {...props}>
        <span>{children}</span>
      </StyledButton>
    </ButtonWrapper>
  );
};

export default MagneticButton; 