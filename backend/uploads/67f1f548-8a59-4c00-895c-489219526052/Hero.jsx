import React from 'react';
import styled from 'styled-components';

const HeroContainer = styled.section`
  position: relative;
  padding: 6rem 0;
  overflow: hidden;
  background-color: #111111;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  z-index: 10;
  
  h1 {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    max-width: 90%;
  }
  
  p {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    justify-content: center;
    padding-bottom: 3rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &.primary {
    background-color: #3b82f6;
    color: white;
    
    &:hover {
      background-color: #2563eb;
    }
  }
  
  &.secondary {
    border: 2px solid white;
    color: white;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  
  @media (max-width: 640px) {
    width: 100%;
  }
`;

function Hero({ setSignInOpen }) {
  const handleSignIn = () => {
    setSignInOpen(true);
  };

  return (
    <HeroContainer>
      <ContentContainer className="fade-in">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Team Collaboration Reimagined
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Connect, collaborate, and create with your team in a seamless digital workspace.
        </p>
        
        <ButtonContainer>
          <Button 
            className="primary interactive"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
          <Button className="secondary interactive">
            Learn More
          </Button>
        </ButtonContainer>
      </ContentContainer>
    </HeroContainer>
  );
}

export default Hero; 