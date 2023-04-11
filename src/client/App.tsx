import { useState } from "react";
import { GameStateProvider, useGameState } from "./State";
import styled from "styled-components";
import ChatScene from "./engine/ChatScene/ChatScene";
import CutScene from "./engine/CutScene";
import scenes from "./scenes";

const GameContainer = styled.div`
  margin: 0 auto;
  width: 100%;
`;

function SceneSelection() {
  const { scene } = useGameState();
  if (!scene) return <div>Unknown scene</div>;
  switch (scene.app) {
    case "chat":
      return <ChatScene />;
    case "cutscene":
      return <CutScene />;
    default:
      return <div>Unknown scene</div>;
  }
}

function App() {
  return (
    <GameStateProvider>
      <GameContainer>
        <SceneSelection />
      </GameContainer>
    </GameStateProvider>
  );
}

export default App;
