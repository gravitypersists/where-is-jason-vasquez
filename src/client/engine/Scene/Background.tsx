import styled from "styled-components";
import filomena from "../../assets/scenes/filomena.png";

const Container = styled.div`
  width: 468px;
  height: 468px;
  margin: 0 auto;
  font-family: "VT323", monospace;
  position: relative;
`;

const Img = styled.img`
  width: 468px;
  height: 468px;
  position: relative;
`;
const GlowImg = styled.div<{ src: string }>`
  width: 468px;
  height: 468px;
  background-repeat: no-repeat;
  background-image: url("${(props) => props.src}");
  filter: blur(20px) saturate(1.5) brightness(5) opacity(0.5) contrast(0.5);
  background-size: contain;
  position: absolute;
  top: 0;
`;

const Background = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container>
      <GlowImg src={filomena} />
      <Img src={filomena} />
      {children}
    </Container>
  );
};

export default Background;
