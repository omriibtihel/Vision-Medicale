// src/Signup.js
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Container, LeftColumn, RightColumn, Image } from './LoginComponents'; // Utilise les exports corrects
import SignupForm from './SignupForm';


function Signup() {
  return (
    <Container>
      <LeftColumn>
      <Image src="/image/log.jpg" alt="Background Image" />
      </LeftColumn>
      <RightColumn>
        <SignupForm />
      </RightColumn>
    </Container>
  );
}

export default Signup;
