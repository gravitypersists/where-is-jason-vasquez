import { set } from "lodash/fp";
import { GameState } from "./State";
import filomena from "./assets/scenes/filomena.png";
import bartender from "./assets/scenes/bartender.png";

export type ChatSceneConfig = {
  app: "chat";
  config: {
    bot: string;
    bg: string;
    preload: { text: string; isOwn: boolean; ts: number }[];
    actions: { do: (state: GameState) => GameState; label: string }[];
  };
};

export type CutSceneConfig = {
  app: "cutscene";
  config: {
    component: string;
  };
};

export type SceneConfig = {
  [key: string]: ChatSceneConfig | CutSceneConfig;
};

const scenes: SceneConfig = {
  start: {
    app: "chat",
    config: {
      bot: "mother",
      bg: filomena,
      preload: [
        {
          text: "My son is missing. Please help me find him.",
          isOwn: false,
          ts: 0,
        },
      ],
      actions: [
        {
          do: (state: GameState) => set("scene", "title", state),
          label: "Accept the case ⟶",
        },
      ],
    },
  },
  title: {
    app: "cutscene",
    config: {
      component: "title",
    },
  },
  bartender: {
    app: "chat",
    config: {
      bot: "bartender",
      bg: bartender,
      preload: [
        {
          text: "Hi there. What can I get for ya.",
          isOwn: false,
          ts: 0,
        },
      ],
      actions: [],
    },
  },
};

export default scenes;
