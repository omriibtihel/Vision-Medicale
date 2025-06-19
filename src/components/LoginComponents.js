// LoginComponents.js
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
background: linear-gradient(
  135deg,
rgb(5, 12, 41) 0%,
  #1e3c72 30%,
  #2a5298 60%,
  #3b5998 80%,
  #4b79a1 100%
);  padding: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
  }
`;

export const Wrapper = styled.div`
  display: flex;
  max-width: 900px;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const Illustration = styled.div`
  flex: 1;
  flex: 1;
  background: url('/image/Login.gif') center no-repeat;
  background-size: contain;
  background-color: #ffffff;
  min-height: 350px;


  @media (max-width: 768px) {
    min-height: 200px;
  }
`;

export const FormWrapper = styled.div`
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
