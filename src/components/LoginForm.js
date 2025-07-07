import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaExclamationCircle, FaArrowRight, FaUserShield } from 'react-icons/fa';
import {
  Container,
  GlassForm,
  FormHeader,
  LogoWrapper,
  FormTitle,
  FormSubtitle,
  FormGroup,
  InputField,
  Input,
  InputIcon,
  SubmitButton,
  FormFooter,
  FormLink,
  ErrorMessage
} from './LoginComponents';

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
    <Container>
      <GlassForm>
        <FormHeader>
          <LogoWrapper>
            <FaUserShield />
          </LogoWrapper>
          <FormTitle>Welcome Back</FormTitle>
          <FormSubtitle>Sign in to access your dashboard</FormSubtitle>
        </FormHeader>

        <FormGroup onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage>
              <FaExclamationCircle style={{ marginRight: '10px' }} />
              {error}
            </ErrorMessage>
          )}

          <InputField>
            <InputIcon><FaEnvelope /></InputIcon>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputField>

          <InputField>
            <InputIcon><FaLock /></InputIcon>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputField>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
            {!isLoading && <FaArrowRight style={{ marginLeft: '10px' }} />}
          </SubmitButton>

          <FormFooter>
            <FormLink to="/signup">Create account</FormLink>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>•</span>
            <FormLink to="/reset-password">Forgot password?</FormLink>
          </FormFooter>
        </FormGroup>
      </GlassForm>
    </Container>
  );
}

export default LoginForm;