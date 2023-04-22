import styled from "styled-components";
import Background from "../Scene/Background";
import ChatApp from "./ChatApp";
import Button, { ButtonRow, FlashButton } from "../../ui/Button";
import { useGameState } from "../../State";
import { ChatSceneConfig } from "../../scenes";

const ChatAppContainer = styled.div`
  position: absolute;
  bottom: 20px;
  width: 100%;
  overflow: hidden;
  height: 418px;
  display: flex;
  flex-direction: column-reverse;
`;

const ActionsContainer = styled(ButtonRow)`
  position: absolute;
  bottom: 0px;
  width: 100%;
`;

const actions = [
  { do: () => console.log("do something"), label: "Accept the case ⟶" },
];

function ChatScene() {
  const { scene: ascene, setState, state } = useGameState();
  const scene = ascene as ChatSceneConfig;
  return (
    <Background src={scene.config.bg} key={state.scene}>
      <ChatAppContainer>
        <ChatApp />
      </ChatAppContainer>
      <ActionsContainer>
        {scene.config.actions.map((action) => {
          const ButtComponent = action.flash ? FlashButton : Button;
          return (
            <ButtComponent key={action.id} onClick={() => setState(action.do)}>
              {action.label}
            </ButtComponent>
          );
        })}
      </ActionsContainer>
    </Background>
  );
}

export default ChatScene;
