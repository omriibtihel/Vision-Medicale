import React from "react";
import styled from "styled-components";
import SignupForm from "./SignupForm";
import { SignupContainer, SignupFormWrapper } from "./SignupComponents";

function Signup() {
  return (
    <SignupContainer>
      <SignupFormWrapper style={{ maxWidth: "1500px", width: "65%" }}>
        <SignupForm />
      </SignupFormWrapper>
    </SignupContainer>
  );
}

export default Signup;
