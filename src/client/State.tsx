import { useState, createContext, useContext } from "react";
import { set } from "lodash/fp";
import scenes from "./scenes";

export type GameState = {
  scene: keyof typeof scenes;
};

const defaultState: GameState = {
  scene: "start",
  //   scene: "world",
};

type GameContext = {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
};

const GameStateContext = createContext<GameContext>({
  state: defaultState,
  setState: (state) => {},
});

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(defaultState);
  return (
    <GameStateContext.Provider value={{ state, setState }}>
      {children}
    </GameStateContext.Provider>
  );
}

export const useGameState = () => {
  const { state, setState } = useContext(GameStateContext);
  const scene = scenes[state.scene];
  const setScene = (scene: keyof typeof scenes) =>
    setState(set("scene", scene));
  return { state, scene, setState, setScene };
};
