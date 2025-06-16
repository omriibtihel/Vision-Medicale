// src/Login.js
import React from 'react';
import styled from 'styled-components';
import LoginForm from './LoginForm';
import { Container, LeftColumn, RightColumn, Image } from './LoginComponents';

function Login() {
  return (
    <Container>
      <LeftColumn>
        <LoginForm />
       
      </LeftColumn>
      <RightColumn>
        <Image src="/image/log.jpg" alt="Background Image" />
      </RightColumn>
    </Container>
  );
}

export default Login;
