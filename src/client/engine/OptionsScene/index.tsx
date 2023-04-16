import styled from "styled-components";
import { chunk } from "lodash";
import { useGameState } from "../../State";
import Button, { ButtonRow } from "../../ui/Button";
import Background from "../Scene/Background";
import { OptionsSceneConfig } from "../../scenes";
import pi from "../../assets/scenes/pi.png";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  margin: 0 auto;
`;
export default function OptionsScene() {
  const { scene, setScene } = useGameState();
  const chunks = chunk((scene as OptionsSceneConfig).config.options, 1);
  return (
    <Background
      src={(scene as OptionsSceneConfig).config.bg}
      fadeIn={0.2}
      opacity={0.1}
    >
      <Container>
        <h1>Options</h1>
        <div>
          {chunks.map((chonk, i) => (
            <div key={i}>
              {chonk.map((option) => (
                <Button
                  onClick={() => setScene(option.goto)}
                  key={option.label}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </Background>
  );
}
