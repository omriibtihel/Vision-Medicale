// LoginComponents.js
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom'; // Ajout de l'import manquant

// Animations
const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
`;

// Components
export const Container = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(5, 12, 41, 0.95) 0%,
    rgba(30, 60, 114, 0.95) 30%,
    rgba(42, 82, 152, 0.95) 60%,
    rgba(59, 89, 152, 0.95) 80%,
    rgba(75, 121, 161, 0.95) 100%
  );
  background-size: 300% 300%;
  animation: ${gradientFlow} 12s ease infinite;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('/image/pattern.svg') repeat;
    opacity: 0.05;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    background-size: 200% 200%;
  }
`;

export const Wrapper = styled.div`
  display: flex;
  max-width: 1000px;
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.18),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  backdrop-filter: blur(16px);
  animation: ${fadeIn} 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.25),
      inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 480px;
  }
`;

export const Illustration = styled.div`
   flex: 1 1 0;
  width: 100%;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  min-height: 600px;
  background: 
    linear-gradient(135deg, rgba(26, 123, 211, 0.15) 0%, rgba(0, 210, 255, 0.1) 100%),
    url('/image/Mobile login (1).gif') center no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.02) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: ${pulse} 8s infinite;
  }

  @media (max-width: 768px) {
    min-height: 200px;
    background-size: contain;
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

export const FormWrapper = styled.div`
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.98);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(245, 248, 250, 0.98) 100%
    );
    z-index: -1;
    border-radius: 0 24px 24px 0;

    @media (max-width: 768px) {
      border-radius: 0 0 24px 24px;
    }
  }
`;

// Additional decorative elements
export const DecorativeCircle = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    rgba(26, 123, 211, 0.15) 0%,
    rgba(26, 123, 211, 0) 70%
  );
  top: -100px;
  right: -100px;
  z-index: 1;

  @media (max-width: 768px) {
    width: 200px;
    height: 200px;
    top: -50px;
    right: -50px;
  }
`;

export const DecorativeLine = styled.div`
  position: absolute;
  height: 2px;
  width: 100px;
  background: linear-gradient(to right, transparent, rgba(26, 123, 211, 0.5), transparent);
  bottom: 30%;
  left: 0;
  transform: rotate(-45deg);
  transform-origin: left center;
  z-index: 1;
`;

export const AuthFooter = styled.div`
  margin-top: 2rem;
  text-align: center;
  width: 100%;
  position: relative;

  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
    margin-bottom: 1.5rem;
  }
`;

export const AuthLink = styled(Link)`
  color: #1a7bd3;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -2px;
    left: 0;
    background-color: #1a7bd3;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #1560a8;
    
    &::after {
      width: 100%;
    }
  }
`;

// Dans votre fichier LoginComponents.js
export const InputField = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1.8rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 1.1rem 1.1rem 1.1rem 3.5rem;
  font-size: 0.95rem;
  font-family: 'Montserrat', sans-serif;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: rgba(245, 248, 250, 0.8);
  color: #2c3e50;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:focus {
    border-color: #1a7bd3;
    outline: none;
    background: white;
    box-shadow: 
      0 0 0 3px rgba(26, 123, 211, 0.1),
      0 4px 16px rgba(26, 123, 211, 0.15);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #95a5a6;
    font-weight: 400;
  }
`;

export const InputIcon = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #1a7bd3;
  font-size: 1.1rem;
`;