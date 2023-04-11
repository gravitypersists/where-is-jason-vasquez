import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Background from "../Scene/Background";
import neonBlues from "../../assets/scenes/pi.png";
import poster from "../../assets/scenes/poster.png";
import street from "../../assets/scenes/street.png";
import filomena from "../../assets/scenes/filomena.png";

interface Photo {
  id: number;
  src: string;
}

const photos: Photo[] = [
  { id: 0, src: filomena },
  { id: 1, src: neonBlues },
  { id: 2, src: street },
  { id: 3, src: poster },
];

const texts = [
  "A game by Michael Silveira",
  "Powered by our collective unconscious, ChatGPT",
  "Art stolen and remixed by Midjourney",
  "Where is Jason Vasquez?",
];

const Title = ({ onDone }: { onDone: () => void }) => {
  const [i, setI] = useState(0);
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(i);
      setI((prevIndex) => prevIndex + 1);
    }, 5000);

    setTimeout(() => setShowText(true), 3000 * (photos.length + 1));

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (i === photos.length) {
      setTimeout(() => onDone(), 3000);
    }
  }, [i]);

  if (i === photos.length) return null;

  return (
    <Container>
      <AnimatePresence>
        <Background src={photos[i].src} fadeIn={3}>
          <StyledText
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 2 }}
            key={i}
          >
            {texts[i]}
          </StyledText>
        </Background>
      </AnimatePresence>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const StyledImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StyledText = styled(motion.h1)`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 40px;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
`;

export default Title;
