import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import gsap from 'gsap';

// Load audio file
const menuChangeSound = '/changemenu.mp3';

// Styled Components
const ExploreButton = styled.button`
  position: relative;
  font-family: 'Akira', sans-serif;
  font-size: 1rem;
  color: #fff;
  background: none;
  padding: 0;
  border: none;
  cursor: pointer;
  z-index: 1000;

  span {
    display: block;
    position: relative;
    padding: 1rem 2rem;
    mix-blend-mode: difference;
  }

  .button__bg {
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    background: #ffffff;
    border-radius: 2rem;
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.1, 0, 0.3, 1);

    &::before,
    &::after {
      content: "";
      position: absolute;
      background: #000;
    }

    &::before {
      width: 110%;
      height: 0;
      padding-bottom: 110%;
      top: 50%;
      left: 50%;
      border-radius: 50%;
      transform: translate3d(-50%, -50%, 0) scale3d(0, 0, 1);
    }

    &::after {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.3s;
    }

    &.close {
      background: #ffffff;
    }
  }

  &:hover {
    .button__bg {
      transform: scale3d(1.2, 1.2, 1);

      &::before {
        transition: transform 0.4s cubic-bezier(0.1, 0, 0.3, 1);
        transform: translate3d(-50%, -50%, 0) scale3d(1, 1, 1);
      }

      &::after {
        opacity: 1;
        transition-duration: 0.01s;
        transition-delay: 0.3s;
      }
    }
  }
`;

const MenuContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 200;
  visibility: hidden;
`;

const MenuBg = styled.div`
  width: 0;
  height: 0;
  background-color: #fff;
  position: absolute;
  right: 0;
  margin: 3em 5em;
  border-radius: 50%;
  z-index: 999;
  opacity: 0;
`;

const CircleMenu = styled.div`
  position: absolute;
  top: 50%;
  left: -120vh;
  transform: translate(0, -50%);
  width: 200vh;
  height: 200vh;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid #e5e5e5 2px;
`;

const MenuStripe = styled.div`
  width: 100%;
  height: 110px;
  top: 50%;
  transform: translate(0, -50%);
  position: absolute;
  left: 50%;
  transform-origin: 0% 50%;
  display: flex;
  cursor: pointer;

  &.st1 {
    transform: translate(0, -50%) rotate(-20deg);
  }

  &.st2 {
    transform: translate(0, -50%) rotate(-10deg);
  }

  &.st3 {
    transform: translate(0, -50%) rotate(0deg);
  }

  &.st4 {
    transform: translate(0, -50%) rotate(10deg);
  }

  &.st5 {
    transform: translate(0, -50%) rotate(20deg);
  }
`;

const StripeFirst = styled.div`
  width: 50%;
  height: 100%;
  position: relative;
`;

const StripeSecond = styled.div`
  width: 25%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: start;
  flex-direction: column;
  padding-left: 30px;
  color: #bababa;
  
  &.active {
    color: #0a0a0a;
    opacity: 1;
    font-weight: 500;
  }

  h4 {
    font-size: 1.8rem;
    margin-bottom: 5px;
    font-weight: 400;
  }

  h6 {
    font-size: 0.9rem;
    font-weight: 400;
    color: inherit;
  }

  &:hover h4,
  &:hover h6 {
    color: #0a0a0a;
  }
`;

const SmallCircle = styled.div`
  width: 0.5vw;
  height: 0.5vw;
  background-color: #7777;
  border-radius: 50%;
  position: absolute;
  right: -0.3vw;
  top: 50%;
  transform: translate(0, -50%);
`;

const NavHeader = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #000;
  font-family: 'Akira', sans-serif;
  padding: 1em 4em;
  width: 100%;
  height: 6em;
  position: absolute;
`;

// Main Component
const ExploreMenu = ({ onSignIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(2); // Start with middle item
  const menuRef = useRef(null);
  const circleRef = useRef(null);
  const menuBgRef = useRef(null);
  const audioRef = useRef(null);

  const menuItems = [
    { id: 1, name: 'Home', description: 'Back to main page', path: '/' },
    { id: 2, name: 'Features', description: 'Discover our tools', path: '#features' },
    { id: 3, name: 'Contact', description: 'Get in touch with us', path: '#contact' },
    { id: 4, name: 'Pricing', description: 'Choose your plan', path: '#pricing' },
    { id: 5, name: 'Sign In', description: 'Access your account', action: onSignIn }
  ];

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(menuChangeSound);
    
    // Setup wheel event for menu rotation
    const handleWheel = (event) => {
      if (!isOpen) return;
      
      const deltaY = event.deltaY;
      const maxIndex = menuItems.length - 1;
      
      if (deltaY > 0 && currentIndex < maxIndex) {
        // Scrolling down
        gsap.to(circleRef.current, {
          rotate: `-=10`,
          duration: 0.4,
          ease: "expo.inOut",
        });
        
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        
      } else if (deltaY < 0 && currentIndex > 0) {
        // Scrolling up
        gsap.to(circleRef.current, {
          rotate: `+=10`,
          duration: 0.4,
          ease: "expo.inOut",
        });
        
        setCurrentIndex(prev => Math.max(prev - 1, 0));
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    };
    
    window.addEventListener('wheel', handleWheel);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, currentIndex, menuItems.length]);
  
  const toggleMenu = () => {
    if (!isOpen) {
      // First make the background visible
      gsap.to(menuBgRef.current, {
        opacity: 1,
        duration: 0.1,
        onComplete: () => {
          // Then expand it
          gsap.to(menuBgRef.current, {
            width: "100%",
            height: "100%",
            margin: "0",
            borderRadius: "0",
            onComplete: () => {
              if (menuRef.current) {
                menuRef.current.style.visibility = "visible";
              }
            }
          });
        }
      });
      
      gsap.from(circleRef.current, {
        rotate: "90",
        duration: 1,
      });
      
    } else {
      // Close menu
      gsap.to(menuBgRef.current, {
        width: "0",
        height: "0",
        margin: "3em 5em",
        borderRadius: "40em",
        onComplete: () => {
          // Hide it completely when done
          gsap.to(menuBgRef.current, {
            opacity: 0,
            duration: 0.1
          });
        }
      });
      
      if (menuRef.current) {
        menuRef.current.style.visibility = "hidden";
      }
    }
    
    setIsOpen(!isOpen);
  };
  
  const handleItemClick = (item) => {
    // Close menu
    toggleMenu();
    
    // Handle navigation or action
    if (item.action) {
      item.action();
    } else if (item.path.startsWith('#')) {
      // Scroll to section
      const element = document.querySelector(item.path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to other page
      window.location.href = item.path;
    }
  };

  return (
    <>
      <MenuBg ref={menuBgRef} />
      <div className="explore-container">
        <ExploreButton onClick={toggleMenu}>
          <div className={`button__bg ${isOpen ? 'close' : ''}`}></div>
          <span>{isOpen ? 'Close' : 'Explore'}</span>
        </ExploreButton>
      </div>
      
      <MenuContainer ref={menuRef}>
        <NavHeader>
          <div className="logo">Team Sync</div>
          <div className="explore">
            <ExploreButton onClick={toggleMenu}>
              <div className="button__bg close"></div>
              <span>Close</span>
            </ExploreButton>
          </div>
        </NavHeader>
        
        <CircleMenu ref={circleRef}>
          {menuItems.map((item, index) => (
            <MenuStripe 
              key={item.id} 
              className={`st${index + 1}`}
              onClick={() => handleItemClick(item)}
            >
              <StripeFirst>
                <SmallCircle />
              </StripeFirst>
              <StripeSecond className={currentIndex === index ? 'active' : ''}>
                <h4>{item.name}</h4>
                <h6>{item.description}</h6>
              </StripeSecond>
            </MenuStripe>
          ))}
        </CircleMenu>
      </MenuContainer>
    </>
  );
};

export default ExploreMenu; 