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

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Background Container
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
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -20%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
    animation: ${float} 15s infinite linear;
  }

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

// Enhanced Glass Form
export const GlassForm = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  border-radius: 24px;
  padding: 2rem 3rem;
  width: 700px;
  max-width: 400px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  animation: ${fadeIn} 1s ease-out;
  color: white;
  position: relative;
  z-index: 2;
  transition: all 0.4s ease;
  transition: all 0.4s ease;
  margin: 0 650px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 600px) {
    padding: 1.5rem;
    max-width: 90%;
    border-radius: 16px;
    margin: 0.5rem;
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
  }

  @media (max-width: 400px) {
    padding: 1rem;
    border-radius: 12px;
  }
`;

// Header Elements
export const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;

  @media (max-width: 600px) {
    margin-bottom: 1.5rem;
  }
`;

export const LogoWrapper = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(26, 123, 211, 0.4) 0%, rgba(0, 210, 255, 0.3) 100%);
    box-shadow: 0 0 20px rgba(26, 123, 211, 0.3);
    animation: ${float} 6s ease-in-out infinite;
  }

  svg {
    font-size: 2rem;
    color: white;
    position: relative;
    z-index: 1;
  }

  @media (max-width: 600px) {
    width: 60px;
    height: 60px;

    svg {
      font-size: 1.5rem;
    }
  }
`;

export const FormTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(to right, #ffffff, #d6e6ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);

  @media (max-width: 600px) {
    font-size: 1.8rem;
  }
`;

export const FormSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.5;
  max-width: 300px;
  margin: 0 auto;

  @media (max-width: 600px) {
    font-size: 0.9rem;
    max-width: 90%;
  }
`;

// Form Elements
export const FormGroup = styled.form`
  display: flex;
  flex-direction: column;
`;

export const InputField = styled.div`
  position: relative;
  margin-bottom: 1.5rem;

  @media (max-width: 600px) {
    margin-bottom: 1.2rem;
  }
`;

export const Input = styled.input`
  width: 80%;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 
      0 0 0 3px rgba(255, 255, 255, 0.1),
      0 4px 16px rgba(26, 123, 211, 0.2);
    transform: translateY(-2px);
  }

  @media (max-width: 600px) {
    padding: 0.8rem 0.8rem 0.8rem 2.5rem;
    font-size: 0.95rem;
  }
`;

export const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  transition: all 0.3s ease;

  ${Input}:focus ~ & {
    color: white;
    transform: translateY(-50%) scale(1.1);
  }

  @media (max-width: 600px) {
    left: 0.8rem;
    font-size: 1rem;
  }
`;

export const SubmitButton = styled.button`
  background: linear-gradient(
    to right,
    rgba(26, 123, 211, 0.8),
    rgba(0, 210, 255, 0.8)
  );
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.8rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 
    0 4px 15px rgba(26, 123, 211, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
  backdrop-filter: blur(5px);

  &:hover {
    background: linear-gradient(
      to right,
      rgba(26, 123, 211, 1),
      rgba(0, 210, 255, 1)
    );
    transform: translateY(-3px);
    box-shadow: 
      0 8px 25px rgba(26, 123, 211, 0.4),
      inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%, -50%);
    transform-origin: 50% 50%;
  }

  &:focus:not(:active)::after {
    animation: ripple 1s ease-out;
  }

  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 1;
    }
    20% {
      transform: scale(25, 25);
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: scale(40, 40);
    }
  }

  @media (max-width: 600px) {
    padding: 0.8rem;
    font-size: 0.95rem;
  }
`;

export const FormFooter = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  position: relative;

  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
    margin-bottom: 1rem;
  }

  @media (max-width: 600px) {
    margin-top: 1rem;
    font-size: 0.9rem;
  }
`;

export const FormLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;
  margin: 0 0.5rem;

  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -2px;
    left: 0;
    background-color: white;
    transition: width 0.3s ease;
  }

  &:hover {
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
    
    &::after {
      width: 100%;
    }
  }

  @media (max-width: 600px) {
    margin: 0 0.3rem;
    font-size: 0.9rem;
  }
`;

export const ErrorMessage = styled.div`
  color: #ff9e9e;
  background: rgba(255, 158, 158, 0.15);
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1.2rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease-out;
  border: 1px solid rgba(255, 158, 158, 0.3);
  box-shadow: 0 2px 8px rgba(255, 158, 158, 0.1);

  @media (max-width: 600px) {
    font-size: 0.9rem;
    padding: 0.6rem;
    margin-bottom: 1rem;
  }
`;