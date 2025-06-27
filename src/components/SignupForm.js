import React, { useState } from 'react';
import { useEffect } from 'react';

import styled from 'styled-components';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaExclamationCircle, FaUserPlus, FaPhone, FaBirthdayCake ,FaBriefcaseMedical, FaSchool, FaTimes, FaClock} from 'react-icons/fa';

const FormContainer = styled.div`
  padding: 2.5rem;
  width: 100%;
  margin-top: 1.5rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 1.5rem; // Réduction sur mobile si nécessaire

  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
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

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.2rem;
`;

const Input = styled.input`
  padding: 0.9rem 1rem 0.9rem 3rem;
  font-size: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 80%;
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
  margin: 1rem auto;
  padding: 0.7rem 1.2rem;
  font-size: 0.9rem;
  color: white;
  background-color: #1a7bd3;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  letter-spacing: 0.5px;
  width: auto;
  display: block;
  max-width: 200px;

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

const PasswordRequirements = styled.div`
  text-align: left;
  font-size: 0.75rem;
  padding: 0.75rem;
  margin: 0.25rem 0 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  color: #666;
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

const ColumnTitle = styled.h3`
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #1a7bd3;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
`;

const Select = styled.select`
  padding: 0.9rem 1rem 0.9rem 3rem;
  font-size: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 100%;
  font-family: 'Poppins', sans-serif;
  background-color: white;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='14' height='10' viewBox='0 0 14 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l6 6 6-6' stroke='%231a7bd3' stroke-width='2' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 12px;
  cursor: pointer;

  &:focus {
    border-color: #1a7bd3;
    box-shadow: 0 0 0 3px rgba(26, 123, 211, 0.1);
    outline: none;
  }
`;

const FileInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const UploadLabel = styled.label`
  display: inline-block;
  background-color: #1a7bd3;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1560a8;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ImagePreview = styled.img`
  margin-top: 1rem;
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #1a7bd3;
`;

const PageContainer = styled.div`
  display: flex;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
  margin: 0rem auto;
  font-family: 'Poppins', sans-serif;
  width: 100%;
  max-width: 1000px;
  justify-content: center;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;


const LeftPanel = styled.div`
  background: white;
  flex: 1;
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;
`;

const RightPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #3B3BFD, #6366F1);
  color: white;
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;

  h3, label {
    color: white;
  }

  input, select {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
  }
`;








function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [hospital, setHospital] = useState('');




  const navigate = useNavigate();





  

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phoneNumber', phoneNumber);
    formData.append('rememberMe', rememberMe);
    formData.append('specialty', specialty);
    formData.append('hospital', hospital);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    const response = await axios.post('http://localhost:5000/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Signed up successfully');
    navigate('/login');
  } catch (error) {
    setError(error.response?.data?.message || 'Error creating account');
  }
};


  return (
    <FormContainer>
      <Header>
        <LogoIcon>
          <FaUserPlus size={20} /> {/* Icône légèrement réduite */}
        </LogoIcon>
        <Title style={{ fontSize: '1.7rem' }}>Create Account</Title> {/* Taille réduite */}
        <Subtitle style={{ fontSize: '0.85rem' }}>Join our medical platform today</Subtitle>
      </Header>
      
      <Form onSubmit={handleSubmit}>
  <PageContainer>
    {/* Colonne gauche */}
    <LeftPanel>
      <ColumnTitle>Informations Générales</ColumnTitle>
      <InputGroup>
        <Icon><FaUser /></Icon>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          required
        />
      </InputGroup>

      <InputGroup>
        <Icon><FaEnvelope /></Icon>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
      </InputGroup>

      <InputGroup>
        <Icon><FaLock /></Icon>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength="8"
        />
      </InputGroup>

      <PasswordRequirements>
        Password must contain:
        <ul style={{ margin: '0.3rem 0 0 1rem', paddingLeft: '1rem' }}>
          <li>At least 8 characters,1 uppercase letter,1 number</li>
        </ul>
      </PasswordRequirements>

      <InputGroup>
        <Icon><FaLock /></Icon>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />
      </InputGroup>

      

      <InputGroup>
              <Icon><FaBriefcaseMedical /></Icon>

        <Input
          placeholder="Spécialité"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        />
      </InputGroup>

    </LeftPanel>

    {/* Colonne droite */}
    <RightPanel>
          <ColumnTitle>Contact</ColumnTitle>

            <InputGroup>
        <Icon><FaPhone/></Icon>
      <Input
          type="tel"
          name="phone"
          placeholder="(+216) 12 345 678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        </InputGroup>


          

      <InputGroup>
        <Input
          placeholder="Hôpital d’affiliation"
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
        />
      </InputGroup>

      <FileInputWrapper>
  <UploadLabel htmlFor="profileImage">Upload Profile Picture</UploadLabel>
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
  {previewUrl && <ImagePreview src={previewUrl} alt="Profile Preview" />}
</FileInputWrapper>
<label>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={e => setRememberMe(e.target.checked)}
        />
        Se souvenir de moi
      </label>

    </RightPanel>
  </PageContainer>

  {error && (
    <ErrorMessage>
      <FaExclamationCircle style={{ marginRight: '5px' }} />
      {error}
    </ErrorMessage>
  )}

  
  <Button type="submit">Créer un compte</Button>
  <StyledLink to="/login">Déjà inscrit ? Se connecter</StyledLink>
</Form>
    </FormContainer>
  );
}

export default SignupForm;