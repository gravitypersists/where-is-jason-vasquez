import { useState } from "react";
import { GameStateProvider, useGameState } from "./State";
import styled from "styled-components";
import ChatScene from "./engine/ChatScene/ChatScene";
import CutScene from "./engine/CutScene";
import OptionsScene from "./engine/OptionsScene";

const GameContainer = styled.div`
  margin: 0 auto;
  width: 100%;
`;

function SceneSelection() {
  const { scene, setScene, state } = useGameState();
  if (!scene) return <div>Unknown scene</div>;
  switch (scene.app) {
    case "chat":
      return <ChatScene key={state.scene} />;
    case "cutscene":
      return <CutScene key={state.scene} />;
    case "options":
      return <OptionsScene key={state.scene} />;
    default:
      return (
        <div>
          Unknown scene{" "}
          <button onClick={() => setScene("world")}>go home</button>
        </div>
      );
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
