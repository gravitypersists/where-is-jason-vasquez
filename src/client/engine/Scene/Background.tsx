import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import filomena from "../../assets/scenes/filomena.png";

const Container = styled.div`
  width: 468px;
  height: 468px;
  margin: 0 auto;
  font-family: "VT323", monospace;
  position: relative;
`;

const Img = styled(motion.img)`
  width: 468px;
  height: 468px;
  position: relative;
`;
const GlowImg = styled(motion.div)<{ src: string }>`
  width: 468px;
  height: 468px;
  background-repeat: no-repeat;
  background-image: url("${(props) => props.src}");
  filter: blur(20px) saturate(1.5) brightness(5) opacity(0.5) contrast(0.5);
  background-size: contain;
  position: absolute;
  top: 0;
`;

const Background = ({
  children,
  src,
  fadeIn = 2,
  opacity = 1,
}: {
  children: React.ReactNode;
  src: string;
  fadeIn?: number;
  opacity?: number;
}) => {
  const commonProps = {
    initial: { opacity: 0 },
    animate: { opacity },
    exit: { opacity: 0 },
    transition: { duration: fadeIn },
  };
  return (
    <Container>
      <GlowImg
        src={src}
        key={`bg-${src}`}
        {...commonProps}
        transition={{ ...commonProps.transition, delay: 0.3 }}
      />
      <Img key={src} src={src} {...commonProps} />
      {children}
    </Container>
  );
};

export default Background;
