// SignupComponents.js
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

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

// Composants principaux
export const SignupContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
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
    background: url('/pattern.svg') repeat;
    opacity: 0.05;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export const SignupFormWrapper = styled.div`
  background: rgba(255, 255, 255, 0.98);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 480px;
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 16px 40px rgba(0, 0, 0, 0.2),
      inset 0 0 0 1px rgba(255, 255, 255, 0.3);
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
      rgba(255, 255, 255, 0.96) 0%,
      rgba(245, 248, 250, 0.98) 100%
    );
    z-index: -1;
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    max-width: 90%;
  }
`;

// Composants de formulaire
export const FormTitle = styled.h2`
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  background: linear-gradient(to right, #1a7bd3, #00d2ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const FormSubtitle = styled.p`
  color: #7f8c8d;
  font-size: 0.95rem;
  text-align: center;
  margin-bottom: 2rem;
  font-family: 'Montserrat', sans-serif;
`;

export const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.8rem;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 1.1rem 1.1rem 1.1rem 3.5rem;
  font-size: 0.95rem;
  font-family: 'Montserrat', sans-serif;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: rgba(245, 248, 250, 0.8);
  color: #2c3e50;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  &:focus {
    border-color: #1a7bd3;
    outline: none;
    background: white;
    box-shadow: 
      0 0 0 3px rgba(26, 123, 211, 0.1),
      0 4px 16px rgba(26, 123, 211, 0.1);
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

export const SubmitButton = styled.button`
  width: 100%;
  padding: 1.1rem;
  font-size: 1rem;
  color: white;
  background: linear-gradient(to right, #1a7bd3, #00d2ff);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-top: 1rem;
  box-shadow: 0 5px 15px rgba(26, 123, 211, 0.3);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(26, 123, 211, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const AuthFooter = styled.div`
  margin-top: 2rem;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  color: #7f8c8d;
  font-size: 0.9rem;
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
  margin-left: 0.3rem;

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