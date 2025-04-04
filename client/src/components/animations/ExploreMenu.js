import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import '../../styles/Explore.css';

const ExploreMenu = () => {
  const [state, setState] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audio, setAudio] = useState(null);
  
  // Load the audio on component mount
  useEffect(() => {
    const newAudio = new Audio('/changemenu.mp3');
    newAudio.addEventListener('canplaythrough', () => setAudioLoaded(true));
    setAudio(newAudio);
    
    return () => {
      if (newAudio) {
        newAudio.pause();
        newAudio.removeEventListener('canplaythrough', () => setAudioLoaded(true));
      }
    };
  }, []);

  // Initialize the circle positioning after component mount
  useEffect(() => {
    if (state) {
      // Position the small circle in the center
      gsap.set(".nav-panel #circle", {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)"
      });
      
      // Set the initial positions of menu items
      positionMenuItems();
    }
  }, [state]);

  // Position the menu items in an evenly spaced circle
  const positionMenuItems = () => {
    const stripes = document.querySelectorAll('.stripe');
    for (let i = 0; i < stripes.length; i++) {
      const angle = -60 + (i * 30); // Distribute from -60 to 60 degrees
      gsap.set(stripes[i], {
        rotation: angle,
        transformOrigin: "center center"
      });
      
      // Rotate the text to keep it readable
      const secElement = stripes[i].querySelector('.sec');
      if (secElement) {
        gsap.set(secElement, {
          rotation: -angle, // Counter-rotate the text
          transformOrigin: "left center"
        });
      }
    }
  };

  // Handle wheel events for menu navigation
  useEffect(() => {
    let idx = 2; // Start with middle item
    let val = 0;
    const tmax = -20;
    const tmin = 20;

    const handleWheel = (event) => {
      if (!state) return;
      
      const deltaY = event.deltaY;
      const circle = document.querySelector('.nav-panel #circle');
      
      if (deltaY > 0 && val > tmax) {
        gsap.to(circle, {
          rotate: `-=10`,
          duration: '0.4',
          ease: "expo.inOut",
        });
        
        if (audioLoaded && state) {
          audio.play();
        }
        
        val -= 10;
        idx = (idx + 1) % 5;
        focusText(idx);
      } else if (deltaY < 0 && val < tmin) {
        gsap.to(circle, {
          rotate: `+=10`,
          duration: '0.4',
          ease: "expo.inOut",
        });
        
        if (audioLoaded && state) {
          audio.play();
        }
        
        val += 10;
        idx = (idx - 1 + 5) % 5;
        focusText(idx);
      }
    };

    document.addEventListener('wheel', handleWheel);
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [state, audioLoaded, audio]);

  // Focus text function to highlight active menu item
  const focusText = (idx) => {
    const circleChildren = document.querySelectorAll('.nav-panel #circle .stripe');
    const prevSec = document.querySelector('.nav-panel .sec.active');
    
    if (prevSec) {
      prevSec.classList.remove("active");
    }
    
    if (circleChildren[idx]) {
      const sec = circleChildren[idx].querySelector('.sec');
      if (sec) {
        setTimeout(() => {
          sec.classList.add("active");
        }, 300);
      }
    }
  };

  // Toggle the explore menu
  const toggleExplore = () => {
    if (!state) {
      gsap.to(".menu-bg", {
        width: "100%",
        height: "100%",
        right: "0",
        top: "0",
        margin: "0",
        borderRadius: "0",
      });

      gsap.from(".nav-panel #circle", {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        onComplete: positionMenuItems
      });

      setTimeout(() => {
        document.querySelector('.nav-panel').style.visibility = "visible";
      }, 500);
    } else {
      closeExplore();
    }
    
    setState(!state);
  };

  // Close the explore menu
  const closeExplore = () => {
    gsap.to(".menu-bg", {
      width: "20px",
      height: "20px",
      right: "40px",
      top: "20px",
      margin: "0",
      borderRadius: "40em",
    });

    document.querySelector('.nav-panel').style.visibility = "hidden";
    
    if (state) {
      setState(false);
    }
  };

  return (
    <>
      <div className="menu-bg"></div>
      
      <div className="explore">
        <button className="button button--bestia" onClick={toggleExplore}>
          <div className="button__bg"></div>
          <span>{state ? "Close" : "Explore"}</span>
        </button>
      </div>
      
      <div className="nav-panel">
        <div className="close-button" onClick={closeExplore}>CLOSE</div>
        <div id="circle">
          <div className="stripe st1">
            <div className="first">
              <div className="smcircle"></div>
            </div>
            <div className="sec">
              <h4>Procafe</h4>
              <h6>healthy food cafe</h6>
            </div>
          </div>
          <div className="stripe st2">
            <div className="first">
              <div className="smcircle"></div>
            </div>
            <div className="sec">
              <h4>iGYM</h4>
              <h6>Invite only gym</h6>
            </div>
          </div>
          <div className="stripe st3">
            <div className="first">
              <div className="smcircle"></div>
            </div>
            <div className="sec">
              <h4>SAVERA REALTY</h4>
              <h6>real estate empire</h6>
            </div>
          </div>
          <div className="stripe st4">
            <div className="first">
              <div className="smcircle"></div>
            </div>
            <div className="sec">
              <h4>IDFC</h4>
              <h6>The Bank Harsh hates most</h6>
            </div>
          </div>
          <div className="stripe st5">
            <div className="first">
              <div className="smcircle"></div>
            </div>
            <div className="sec">
              <h4>Mitsubishi</h4>
              <h6>AC monopoly</h6>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExploreMenu; 