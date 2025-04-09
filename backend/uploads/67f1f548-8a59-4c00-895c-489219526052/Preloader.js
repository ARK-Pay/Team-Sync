import React, { forwardRef } from 'react';
import styled from 'styled-components';

const PreloaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: var(--dark);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 3px;
  background: var(--primary);
  z-index: 1001;
`;

const LoaderContent = styled.div`
  position: relative;
  overflow: hidden;

  span {
    display: inline-block;
    transform: translateY(100%);
    opacity: 0;
    font-size: clamp(2rem, 6vw, 6rem);
    font-weight: 700;
    letter-spacing: -2px;
    color: var(--light);

    &:nth-child(2) {
      margin-left: 20px;
      background: linear-gradient(to right, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
`;

const Preloader = forwardRef((props, ref) => {
  return (
    <PreloaderContainer ref={ref}>
      <LoaderWrapper className="loader-wrapper" />
      <LoaderContent className="loader-content">
        <span>Team</span>
        <span>Sync</span>
      </LoaderContent>
    </PreloaderContainer>
  );
});

export default Preloader; 