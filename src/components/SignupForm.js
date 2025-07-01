import React, { useState } from 'react';
import { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaExclamationCircle, FaUserPlus, FaPhone, FaBriefcaseMedical, FaHospital, FaCamera } from 'react-icons/fa';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styles
const FormContainer = styled.div`
  padding: 0rem;
  width: 80;
  max-width: 1200px;
  margin: 2rem auto;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const LogoIcon = styled.div`
  background: linear-gradient(135deg, #3B3BFD, #6366F1);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  font-size: 2rem;
  box-shadow: 0 8px 24px rgba(59, 59, 253, 0.3);
`;

const Title = styled.h1`
  font-size: 2.2rem;
  background: linear-gradient(to right, #3B3BFD, #6366F1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1rem;
  margin-bottom: 0;
  font-family: 'Montserrat', sans-serif;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const PageContainer = styled.div`
  display: flex;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  background: white;
  font-family: 'Montserrat', sans-serif;
  width: 90%
  margin:0 auto;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const Panel = styled.div`
  flex: 1;
  padding: 3rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const LeftPanel = styled(Panel)`
  background: white;
  max-width: 50%;
  
  @media (max-width: 1024px) {
    max-width: 100%;
  }
`;

const RightPanel = styled(Panel)`
  background: linear-gradient(135deg, #3B3BFD, #6366F1);
  color: white;
  max-width: 50%;

  @media (max-width: 1024px) {
    max-width: 100%;
  }
`;

const ColumnTitle = styled.h3`
  margin-bottom: 1.8rem;
  font-size: 1.4rem;
  color: ${props => props.theme === 'dark' ? 'white' : '#2c3e50'};
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 50px;
    height: 3px;
    background: ${props => props.theme === 'dark' ? 'white' : '#3B3BFD'};
    border-radius: 3px;
  }
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.8rem;
`;

const Input = styled.input`
  width: 80%;
  padding: 1.1rem 1.1rem 1.1rem 3.5rem;
  font-size: 0.95rem;
  font-family: 'Montserrat', sans-serif;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: rgba(245, 248, 250, 0.8);
  color: #2c3e50;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:focus {
    border-color: #3B3BFD;
    outline: none;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 59, 253, 0.1);
    transform: translateY(-2px);
  }

  &::placeholder {
    color: #95a5a6;
  }
`;

const DarkInput = styled(Input)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    background: rgba(255, 255, 255, 0.2);
    border-color: white;
  }
`;

const Icon = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme === 'dark' ? 'white' : '#3B3BFD'};
  font-size: 1.1rem;
`;

const PasswordRequirements = styled.div`
  padding: 1rem;
  margin: 0.5rem 0 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  color: #666;
  font-size: 0.85rem;
  font-family: 'Montserrat', sans-serif;
  border-left: 4px solid #3B3BFD;
`;

const FileInputWrapper = styled.div`
  margin-bottom: 2rem;
`;

const UploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  background: ${props => props.theme === 'dark' ? 'rgba(255,255,255,0.2)' : '#f0f4f8'};
  color: ${props => props.theme === 'dark' ? 'white' : '#3B3BFD'};
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  border: 1px dashed ${props => props.theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(59, 59, 253, 0.3)'};

  &:hover {
    background: ${props => props.theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#e6f0ff'};
  }

  svg {
    margin-right: 0.8rem;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ImagePreview = styled.div`
  margin-top: 1.5rem;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.src ? `url(${props.src}) center/cover` : '#f0f4f8'};
  border: 3px solid #3B3BFD;
  position: relative;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  margin: 2rem auto 0;
  padding: 1.1rem 2.5rem;
  font-size: 1rem;
  color: white;
  background: linear-gradient(to right, #3B3BFD, #6366F1);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 5px 20px rgba(59, 59, 253, 0.3);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(59, 59, 253, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  padding: 0.8rem 1rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  border-left: 4px solid #ff6b6b;

  svg {
    margin-right: 0.5rem;
  }
`;

const StyledLink = styled(Link)`
  color: #3B3BFD;
  text-decoration: none;
  margin: 1.5rem auto 0;
  display: block;
  text-align: center;
  font-size: 0.95rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -2px;
    left: 0;
    background-color: #3B3BFD;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #6366F1;
    
    &::after {
      width: 100%;
    }
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.95rem;
  color: ${props => props.theme === 'dark' ? 'white' : '#666'};
  font-family: 'Montserrat', sans-serif;
  margin-top: 1rem;

  input {
    margin-right: 0.8rem;
    width: 18px;
    height: 18px;
    accent-color: #3B3BFD;
    cursor: pointer;
  }
`;

function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    specialty: '',
    hospital: '',
    rememberMe: false
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }
      if (profileImage) data.append('profileImage', profileImage);

      await axios.post('http://localhost:5000/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating account');
    }
  };

  return (
    <FormContainer>
      <Header>
        <LogoIcon>
          <FaUserPlus size={24} />
        </LogoIcon>
        <Title>Create Account</Title>
        <Subtitle>Join our medical platform today</Subtitle>
      </Header>
      
      <Form onSubmit={handleSubmit}>
        <PageContainer>
          <LeftPanel>
            <ColumnTitle>General Information</ColumnTitle>
            
            <InputGroup>
              <Icon><FaUser /></Icon>
              <Input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
              />
            </InputGroup>

            <InputGroup>
              <Icon><FaEnvelope /></Icon>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </InputGroup>

            <InputGroup>
              <Icon><FaLock /></Icon>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                minLength="8"
              />
            </InputGroup>

            <PasswordRequirements>
              Password must contain:
              <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1rem' }}>
                <li>At least 8 characters</li>
                <li>1 uppercase letter</li>
                <li>1 number</li>
              </ul>
            </PasswordRequirements>

            <InputGroup>
              <Icon><FaLock /></Icon>
              <Input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
              />
            </InputGroup>

            <InputGroup>
              <Icon><FaBriefcaseMedical /></Icon>
              <Input
                name="specialty"
                placeholder="Specialty"
                value={formData.specialty}
                onChange={handleChange}
              />
            </InputGroup>
          </LeftPanel>

          <RightPanel>
            <ColumnTitle theme="dark">Contact Details</ColumnTitle>

            <InputGroup>
              <Icon theme="dark"><FaPhone /></Icon>
              <DarkInput
                name="phoneNumber"
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                theme="dark"
              />
            </InputGroup>

            <InputGroup>
              <Icon theme="dark"><FaHospital /></Icon>
              <DarkInput
                name="hospital"
                placeholder="Affiliated Hospital"
                value={formData.hospital}
                onChange={handleChange}
                theme="dark"
              />
            </InputGroup>

            <FileInputWrapper>
              <UploadLabel htmlFor="profileImage" theme="dark">
                <FaCamera /> Upload Profile Picture
              </UploadLabel>
              <FileInput
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setProfileImage(file);
                  setPreviewUrl(URL.createObjectURL(file));
                }}
              />
              {previewUrl && <ImagePreview src={previewUrl} />}
            </FileInputWrapper>

            <CheckboxContainer theme="dark">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Remember me
            </CheckboxContainer>
          </RightPanel>
        </PageContainer>

        {error && (
          <ErrorMessage>
            <FaExclamationCircle /> {error}
          </ErrorMessage>
        )}

        <Button type="submit">Create Account</Button>
        <StyledLink to="/login">Already have an account? Sign In</StyledLink>
      </Form>
    </FormContainer>
  );
}

export default SignupForm;