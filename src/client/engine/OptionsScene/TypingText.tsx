import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { take } from "lodash";

interface TypingTextProps {
  text: string;
  typingSpeed?: number;
  className?: string;
}

const Container = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box;
`;

const StyledTypingText = styled.div`
  display: inline-block;
  overflow: hidden;
  position: absolute;
`;

// show hidden text to avoid layout shifts
const HiddenText = styled.div`
  visibility: hidden;
`;

const getRandomTypingSpeed = (baseSpeed: number, variance: number) => {
  const randomVariance = Math.floor(Math.random() * variance) - variance / 2;
  return baseSpeed + randomVariance;
};

// cache to avoid re-typing text per session
const cache: { [key: string]: boolean } = {};

const TypingText = ({
  text,
  typingSpeed = 25,
  className = "",
}: TypingTextProps) => {
  const [visibleText, setVisibleText] = useState("");
  console.log("render", text);

  useEffect(() => {
    console.log("effect");
    const typeNextChar = () => {
      if (cache[text]) {
        setVisibleText(text);
        console.log("cache hit");
        return;
      }
      if (visibleText.length < text.length) {
        setVisibleText(take(text, visibleText.length + 1).join(""));
      } else {
        cache[text] = true;
      }
    };

    setTimeout(typeNextChar, getRandomTypingSpeed(typingSpeed, 100));

    return () => {};
  }, [visibleText, text, typingSpeed]);

  return (
    <Container className={className}>
      <StyledTypingText>{visibleText}</StyledTypingText>
      <HiddenText>{text}</HiddenText>
    </Container>
  );
};

export default TypingText;
