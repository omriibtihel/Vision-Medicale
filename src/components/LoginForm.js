import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaExclamationCircle, FaUserShield, FaArrowRight } from 'react-icons/fa';
import { InputField, InputIcon } from './LoginComponents'; // Importing InputField and InputIcon from LoginComponents

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(26, 123, 211, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(26, 123, 211, 0); }
  100% { box-shadow: 0 0 0 0 rgba(26, 123, 211, 0); }
`;

// Styles
const GlassContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const LogoIcon = styled.div`
  background: linear-gradient(135deg, #1a7bd3 0%, #00d2ff 100%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  font-size: 2rem;
  box-shadow: 0 8px 20px rgba(26, 123, 211, 0.3);
  animation: ${pulse} 2s infinite;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  background: linear-gradient(to right, #1a7bd3, #00d2ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 0.95rem;
  margin-bottom: 0;
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 1.8rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Input = styled.input`
  padding: 1rem 1rem 1rem 3.5rem;
  font-size: 0.95rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  width: 80%;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-family: 'Montserrat', sans-serif;
  background: rgba(245, 248, 250, 0.7);
  color: #2c3e50;

  &:focus {
    border-color: #1a7bd3;
    outline: none;
    box-shadow: 0 5px 15px rgba(26, 123, 211, 0.15);
    background: white;
    transform: translateY(-2px);
  }

  &::placeholder {
    color: #95a5a6;
  }
`;

const Icon = styled.div`
  position: absolute;
  top: 50%;
  left: 1.2rem;
  transform: translateY(-50%);
  color: #1a7bd3;
  transition: all 0.3s ease;
`;

const Button = styled.button`
  margin-top: 1.5rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
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
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  padding: 0.8rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const StyledLink = styled(Link)`
  color: #7f8c8d;
  text-decoration: none;
  margin-top: 1.8rem;
  display: block;
  text-align: center;
  font-size: 0.9rem;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  position: relative;
  font-weight: 500;

  &:hover {
    color: #1a7bd3;
    transform: translateX(5px);
  }

  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 1px;
    bottom: -2px;
    left: 0;
    background-color: #1a7bd3;
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const FooterText = styled.p`
  color: #bdc3c7;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 2.5rem;
  font-family: 'Montserrat', sans-serif;
  position: relative;

  &::before {
    content: '';
    display: block;
    width: 60px;
    height: 1px;
    background: linear-gradient(to right, transparent, #bdc3c7, transparent);
    margin: 0 auto 1.5rem;
  }
`;

const ArrowIcon = styled.span`
  margin-left: 8px;
  transition: transform 0.3s ease;
  ${Button}:hover & {
    transform: translateX(3px);
  }
`;

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      const profileResponse = await axios.get('http://localhost:5000/profile', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const userData = profileResponse.data;
      localStorage.setItem('userId', userData.id);

      if (userData.isAdmin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/profile');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassContainer>
      <Header>
        <LogoIcon>
          <FaUserShield />
        </LogoIcon>
        <Title>Welcome Back</Title>
        <Subtitle>Login to access your secure dashboard</Subtitle>
      </Header>
      
      <Form onSubmit={handleSubmit}>

          <InputField>
          <InputIcon><FaEnvelope /></InputIcon>
          <Input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </InputField>

          <InputField>
          <InputIcon><FaLock /></InputIcon>
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </InputField>
        
        {error && (
          <ErrorMessage>
            <FaExclamationCircle style={{ marginRight: '8px' }} />
            {error}
          </ErrorMessage>
        )}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
          {!isLoading && (
            <ArrowIcon>
              <FaArrowRight />
            </ArrowIcon>
          )}
        </Button>
        
        <StyledLink to="/signup">
          Don't have an account? Create one now
        </StyledLink>
        
        <FooterText>
          <Link to="/reset-password" style={{ color: '#7f8c8d', textDecoration: 'none' }}>
            Forgot your password?
          </Link>
        </FooterText>
      </Form>
    </GlassContainer>
  );
}

export default LoginForm;