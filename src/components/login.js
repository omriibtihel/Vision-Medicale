import React from 'react';
import styled from 'styled-components';
import { Container, Wrapper, Illustration, FormWrapper } from './LoginComponents';
import LoginForm from './LoginForm';

function Login() {
  return (
    <Container>
      <Wrapper>
        <Illustration />
        <FormWrapper>
          <LoginForm />
        </FormWrapper>
      </Wrapper>
    </Container>
  );
}

export default Login;