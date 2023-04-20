import styled from "styled-components";
import { chunk } from "lodash";
import { useGameState } from "../../State";
import Button, { ButtonRow } from "../../ui/Button";
import Background from "../Scene/Background";
import { OptionsSceneConfig } from "../../scenes";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  margin: 0 auto;
`;
export default function OptionsScene() {
  const { scene, setState } = useGameState();
  const options = (scene as OptionsSceneConfig).config.actions;
  const chunks = chunk(options, 1);
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
                <Button onClick={() => setState(option.do)} key={option.label}>
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
