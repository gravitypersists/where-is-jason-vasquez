import styled from "styled-components";

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

export default Button;
