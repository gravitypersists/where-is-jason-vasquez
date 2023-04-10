import styled from "styled-components";
import ChatScene from "./engine/ChatScene/ChatScene";

const GameContainer = styled.div`
  margin: 0 auto;
  width: 100%;
`;

function App() {
  return (
    <GameContainer>
      <ChatScene />
    </GameContainer>
  );
}

export default App;
