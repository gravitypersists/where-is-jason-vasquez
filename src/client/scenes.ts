import { set } from "lodash/fp";
import { GameState } from "./State";
import filomena from "./assets/scenes/filomena.png";
import bartender from "./assets/scenes/bartender.png";
import pi from "./assets/scenes/pi.png";
import payphone from "./assets/scenes/payphone.png";
import receptionist from "./assets/scenes/receptionist.png";
import policedesk from "./assets/scenes/police-desk.png";
import detective from "./assets/scenes/detective.png";

export type SceneAction = {
  id: string;
  locked?: boolean;
  do: (state: GameState) => GameState;
  label: string;
};

export type ChatSceneConfig = {
  app: "chat";
  config: {
    bot: string;
    bg: string;
    preload: { text: string; isOwn: boolean; ts: number }[];
    actions: SceneAction[];
  };
};

export type CutSceneConfig = {
  app: "cutscene";
  config: {
    component: string;
    next: string;
  };
};

export type OptionsSceneConfig = {
  app: "options";
  config: {
    bg: string;
    options: { goto: string; label: string }[];
  };
};

export type Scene = ChatSceneConfig | CutSceneConfig | OptionsSceneConfig;

export type SceneConfig = {
  [key: string]: Scene;
};

const scenes: SceneConfig = {
  world: {
    app: "options",
    config: {
      bg: pi,
      options: [
        { goto: "receptionist", label: "Check into your motel" },
        { goto: "policedesk", label: "Go to the local police station" },
        { goto: "bartender", label: "Go to the bar" },
        { goto: "payphone", label: "Go find a payphone" },
      ],
    },
  },
  payphone: {
    app: "options",
    config: {
      bg: payphone,
      options: [
        {
          goto: "phonefilomena",
          label: "Call Jason's mother, Filomena Vasquez",
        },
        {
          goto: "world",
          label: "Leave",
        },
      ],
    },
  },
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
          id: "accept",
          do: (state: GameState) => set("scene", "title", state),
          label: "Accept the case ⟶",
        },
      ],
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
      actions: [
        {
          id: "leave",
          do: set("scene", "world"),
          label: "Leave ⟶",
        },
      ],
    },
  },
  phonefilomena: {
    app: "chat",
    config: {
      bot: "mother",
      bg: payphone,
      preload: [
        {
          text: "Hello?",
          isOwn: false,
          ts: 0,
        },
      ],
      actions: [
        {
          id: "leave",
          do: set("scene", "world"),
          label: "Hang up ⟶",
        },
      ],
    },
  },
  receptionist: {
    app: "chat",
    config: {
      bot: "receptionist",
      bg: receptionist,
      preload: [
        {
          text: "Welcome to the Palms Motel. How can I help you?",
          isOwn: false,
          ts: 0,
        },
      ],
      actions: [
        {
          id: "leave",
          do: set("scene", "world"),
          label: "Leave ⟶",
        },
      ],
    },
  },
  policedesk: {
    app: "chat",
    config: {
      bot: "policedesk",
      bg: policedesk,
      preload: [
        {
          text: "Can I help you with something?",
          isOwn: false,
          ts: 0,
        },
      ],
      actions: [
        {
          id: "leave",
          do: set("scene", "world"),
          label: "Leave ⟶",
        },
        {
          id: "frank",
          locked: true,
          do: set("scene", "detective"),
          label: "Take me to Frank ⟶",
        },
      ],
    },
  },
  detective: {
    app: "chat",
    config: {
      bot: "detective",
      bg: detective,
      preload: [
        {
          text: "What do you want?",
          isOwn: false,
          ts: 0,
        },
      ],
      actions: [
        {
          id: "leave",
          do: set("scene", "world"),
          label: "Leave ⟶",
        },
      ],
    },
  },
  title: {
    app: "cutscene",
    config: {
      component: "title",
      next: "world",
    },
  },
};

export default scenes;
