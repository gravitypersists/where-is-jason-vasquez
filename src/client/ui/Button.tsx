import styled, { keyframes } from "styled-components";

const Button = styled.button`
  color: #fff;
  padding: 10px 20px;
  font-size: 16px;
  margin-left: 10px;
  border: none;
  border-radius: 0;
  cursor: pointer;
  outline: none;
  background-color: transparent;

  &:disabled {
    background-color: transparent;
    color: #666;
  }

  &:hover {
    background-color: #254c7b;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  60% {
    transform: scale(1.03);
  }
  90% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

export const FlashButton = styled(Button)`
  animation: ${pulse} 1.5s infinite ease-in-out;
  &:hover {
    animation: none;
  }
`;

export default Button;
