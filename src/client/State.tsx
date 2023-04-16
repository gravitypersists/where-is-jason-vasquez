import { useState, createContext, useContext, useCallback } from "react";
import { set, update } from "lodash/fp";
import { uniq } from "lodash";
import useLocalStorage from "./useLocalStorage";
import scenes, { SceneAction } from "./scenes";

export type GameState = {
  scene: keyof typeof scenes;
  botStates: {
    [bot: string]: string[];
  };
  sceneUnlocks: { [scene: string]: string[] };
};

const defaultState: GameState = {
  // scene: "start",
  scene: "world",
  botStates: {
    policedesk: ["disdain"],
    mother: ["intro"],
  },
  sceneUnlocks: {},
};

const defaultStateString = JSON.stringify(defaultState);

type GameContext = {
  state: GameState;
  setState: (value: GameState | ((val: GameState) => GameState)) => void;
};

const GameStateContext = createContext<GameContext>({
  state: defaultState,
  setState: (state) => {},
});

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorage<GameState>(
    "gamestate",
    defaultState
  );
  return (
    <GameStateContext.Provider value={{ state, setState }}>
      {children}
    </GameStateContext.Provider>
  );
}

export const useGameState = () => {
  const { state, setState } = useContext(GameStateContext);
  const sceneRaw = scenes[state.scene];
  const scene = update(
    "config.actions",
    (actions: SceneAction[] = []) =>
      actions.filter((action) =>
        action.locked
          ? state.sceneUnlocks[state.scene]?.includes(action.id)
          : true
      ),
    sceneRaw
  );
  const setScene = (scene: keyof typeof scenes) =>
    setState(set("scene", scene));
  const unlockActions = (action: string[]) =>
    setState(
      update(`sceneUnlocks.${state.scene}`, (unlocks: string[] = []) =>
        uniq([...unlocks, ...action])
      )
    );

  return { state, scene, setState, setScene, unlockActions };
};
