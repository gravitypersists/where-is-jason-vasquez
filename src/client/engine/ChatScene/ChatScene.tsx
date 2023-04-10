import styled from "styled-components";
import Background from "../Scene/Background";
import ChatApp from "./ChatApp";
import Button, { ButtonRow } from "../../ui/Button";

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

function App() {
  return (
    <Background>
      <ChatAppContainer>
        <ChatApp />
      </ChatAppContainer>
      <ActionsContainer>
        {actions.map((action) => (
          <Button onClick={action.do}>{action.label}</Button>
        ))}
      </ActionsContainer>
    </Background>
  );
}

export default App;
