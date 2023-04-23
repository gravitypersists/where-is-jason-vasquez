import { useState } from "react";
import styled from "styled-components";
import { chunk } from "lodash";
import { useGameState } from "../../State";
import Button, { ButtonRow } from "../../ui/Button";
import Background from "../Scene/Background";
import { OptionsSceneConfig } from "../../scenes";
import TypingText from "./TypingText";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  margin: 0 auto;
  width: 100%;
`;

const TextBlock = styled(TypingText)`
  padding: 20px;
  background: #58295536;
  font-size: 14px;
  color: #c7c4df;
`;

export default function OptionsScene() {
  const { scene: ascene, setState, state } = useGameState();
  const scene = ascene as OptionsSceneConfig;
  const [preText, setPreText] = useState(
    scene.config.pre ? scene.config.pre(state) : ""
  );
  const options = scene.config.actions;
  const chunks = chunk(options, 1);
  const handleActionClick = (
    option: OptionsSceneConfig["config"]["actions"][0]
  ) => {
    if (option.do) {
      setState(option.do);
    }
    if (option.pre) {
      setPreText(option.pre(state));
    }
  };
  return (
    <Background
      src={scene.config.bg}
      fadeIn={0.2}
      opacity={0.1}
      key={state.scene}
    >
      <Container>
        {scene.config.pre && <TextBlock key={preText} text={preText} />}
        <div>
          {chunks.map((chonk, i) => (
            <div key={i}>
              {chonk.map((option) => (
                <Button
                  onClick={() => handleActionClick(option)}
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
