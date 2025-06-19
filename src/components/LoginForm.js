import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaExclamationCircle, FaUserShield } from 'react-icons/fa';

const FormContainer = styled.div`
  padding: 2rem 1.5rem; /* Padding plus serré sur les côtés */
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoIcon = styled.div`
  background: #1a7bd3;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
  font-size: 1.8rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #1a7bd3;
  font-family: 'Poppins', sans-serif;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  padding: 0.85rem 1rem 0.85rem 3rem; /* Hauteur légèrement réduite */
  font-size: 0.95rem; /* Taille de police légèrement réduite */

  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 100%;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;

  &:focus {
    border-color: #1a7bd3;
    outline: none;
    box-shadow: 0 0 0 3px rgba(26, 123, 211, 0.1);
  }
`;

const Icon = styled.div`
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #1a7bd3;
`;

const Button = styled.button`
  margin-top: 1rem;
  padding: 0.85rem;
  font-size: 1rem;
  color: white;
  background-color: #1a7bd3;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  letter-spacing: 0.5px;

  &:hover {
    background-color: #1560a8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26, 123, 211, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
`;

const StyledLink = styled(Link)`
  color: #1a7bd3;
  text-decoration: none;
  margin-top: 1.5rem;
  display: block;
  text-align: center;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
  transition: color 0.2s ease;

  &:hover {
    color: #1560a8;
    text-decoration: underline;
  }
`;

const FooterText = styled.p`
  color: #888;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 2rem;
  font-family: 'Poppins', sans-serif;
`;

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:5000/login', {
      email,
      password,
    });

    const { access_token } = response.data;
    localStorage.setItem('token', access_token);

    // Appel temporaire pour savoir si c’est un admin
    const profileResponse = await axios.get('http://localhost:5000/profile', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = profileResponse.data;
    localStorage.setItem('userId', userData.id);

    // Rediriger selon le rôle
    if (userData.isAdmin) {
      navigate('/admin-dashboard');
    } else {
      navigate('/profile'); // ou '/main' selon l’app
    }

  } catch (err) {
    setError(err.response?.data?.message || 'Login failed');
  }

  
};



  return (
    <FormContainer>
      <Header>
        <LogoIcon>
          <FaUserShield size={20} /> {/* Icône légèrement réduite */}
        </LogoIcon>
        <Title style={{ fontSize: '1.7rem' }}>Se Connecter</Title> {/* Taille réduite */}
        <Subtitle style={{ fontSize: '0.85rem' }}>Secure access to your health records</Subtitle>
      </Header>
      
      <Form onSubmit={handleSubmit}>
        <InputContainer>
          <Icon><FaEnvelope /></Icon>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
          />
        </InputContainer>
        
        <InputContainer>
          <Icon><FaLock /></Icon>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
          />
        </InputContainer>
        
        {error && (
          <ErrorMessage>
            <FaExclamationCircle style={{ marginRight: '5px' }} />
            {error}
          </ErrorMessage>
        )}
        
        <Button type="submit">Login</Button>
        
        <StyledLink to="/signup">Don't have an account? Sign Up</StyledLink>
        
        <FooterText>
          Forgot password? <Link to="/reset-password" style={{ color: '#1a7bd3' }}>Reset here</Link>
        </FooterText>
      </Form>
    </FormContainer>
  );
}

export default LoginForm;