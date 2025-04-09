import React, { forwardRef } from 'react';
import styled from 'styled-components';

const CursorWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  background-color: var(--primary);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
  transform: translate(-50%, -50%);
  transition: transform 0.1s ease-out;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    background-color: rgba(179, 139, 252, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s, opacity 0.3s;
  }
`;

const CustomCursor = forwardRef((props, ref) => {
  return <CursorWrapper ref={ref} className="custom-cursor" />;
});

export default CustomCursor; 