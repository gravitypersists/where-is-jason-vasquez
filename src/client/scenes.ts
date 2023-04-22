import { set, update } from "lodash/fp";
import { flow, uniq, without } from "lodash";
import { GameState } from "./State";
import filomena from "./assets/scenes/filomena.png";
import bartender from "./assets/scenes/bartender.png";
import pi from "./assets/scenes/pi.png";
import payphone from "./assets/scenes/payphone.png";
import receptionist from "./assets/scenes/receptionist.png";
import policedesk from "./assets/scenes/police-desk.png";
import detective from "./assets/scenes/detective.png";
import motelroom from "./assets/scenes/motelroom.png";
import pool from "./assets/scenes/pool.png";
import imprisoned from "./assets/scenes/imprisoned.png";
import apartments from "./assets/scenes/apartments.png";
import apartmenthall from "./assets/scenes/apartmenthall.png";

export type SceneAction = {
  id?: string;
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
    waitMode?: string;
    nobodyHome?: boolean;
    enforceMode?: string[];
    on?: {
      [key: string]: (state: GameState) => GameState;
    };
    stringMatches?: {
      match: string;
      do: (state: GameState) => GameState;
    }[];
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
    actions: SceneAction[];
  };
};

export type Scene = ChatSceneConfig | CutSceneConfig | OptionsSceneConfig;

export type SceneConfig = {
  [key: string]: Scene;
};

const clearItems = (path: string, items: string[]) =>
  update(path, (x: string[] = []) => without(x, ...items));
const addItems = (path: string, items: string[]) =>
  update(path, (x: string[] = []) => uniq([...x, ...items]));

const scenes: SceneConfig = {
  world: {
    app: "options",
    config: {
      bg: pi,
      actions: [
        {
          id: "checkin",
          do: set("scene", "receptionist"),
          label: "Check into your motel",
        },
        {
          id: "checkedin",
          locked: true,
          do: set("scene", "motelroom"),
          label: "Go to your motel room",
        },
        {
          do: set("scene", "policedesk"),
          label: "Go to the local police station",
        },
        { do: set("scene", "bartender"), label: "Go to the bar" },
        {
          do: set("scene", "apartmentgate"),
          label: "Go to Jason's apartment",
        },
        { do: set("scene", "payphone"), label: "Go find a payphone" },
      ],
    },
  },
  payphone: {
    app: "options",
    config: {
      bg: payphone,
      actions: [
        {
          do: set("scene", "phonefilomena"),
          label: "Call Jason's mother, Filomena Vasquez",
        },
        {
          locked: true,
          do: set("scene", "landlord"),
          label: "Call Jason's landlord, Harold Hester",
        },
        {
          do: set("scene", "world"),
          label: "Leave",
        },
      ],
    },
  },
  motelroom: {
    app: "options",
    config: {
      bg: motelroom,
      actions: [
        {
          do: set("scene", "receptionist"),
          label: "Go to the reception desk",
        },
        {
          do: set("scene", "pool"),
          label: "Go to the pool",
        },
        {
          do: set("scene", "world"),
          label: "Leave",
        },
      ],
    },
  },
  pool: {
    app: "options",
    config: {
      bg: pool,
      actions: [
        {
          do: set("scene", "motelroom"),
          label: "Leave",
        },
      ],
    },
  },
  apartmentgate: {
    app: "options",
    config: {
      bg: apartments,
      actions: [
        {
          id: "keycode",
          locked: true,
          do: set("scene", "apartmenthall"),
          label: "Enter 1234 into the keypad",
        },
        {
          do: set("scene", "nobodyhome"),
          label: "Ring apartment 1A",
        },
        {
          do: set("scene", "nobodyhome"),
          label: "Ring apartment 1B",
        },
        {
          do: set("scene", "nobodyhome"),
          label: "Ring apartment 2A",
        },
        {
          do: set("scene", "neighbor1"),
          label: "Ring apartment 2B",
        },
        {
          do: set("scene", "nobodyhome"),
          label: "Ring apartment 3A",
        },
        {
          do: set("scene", "nobodyhome"),
          label: "Ring apartment 3B",
        },
        {
          do: set("scene", "world"),
          label: "Leave",
        },
      ],
    },
  },
  apartmenthall: {
    app: "options",
    config: {
      bg: apartmenthall,
      actions: [
        {
          do: set("scene", "nobodyhome"),
          label: "Knock on door for apartment 1A",
        },
        {
          do: set("scene", "nobodyhome"),
          label: "Knock on door for apartment 1B",
        },
        {
          do: set("scene", "nobodyhome"),
          label: "Knock on door for apartment 2A",
        },
        {
          do: set("scene", "neighbor1hall"),
          label: "Knock on door for apartment 2B",
        },
        {
          do: set("scene", "nobodyhome"),
          label: "Knock on door for apartment 3A",
        },
        {
          do: set("scene", "nobodyhome"),
          label: "Knock on door for apartment 3B",
        },
        {
          locked: true,
          id: "key3b",
          do: set("scene", "jasonsapartment"),
          label: "Enter 3B",
        },
        {
          do: set("scene", "world"),
          label: "Leave",
        },
      ],
    },
  },
  nobodyhome: {
    app: "chat",
    config: {
      bot: "none",
      bg: apartments,
      waitMode: "Knocking...",
      nobodyHome: true,
      preload: [],
      actions: [],
      on: {
        end: set("scene", "apartmentgate"),
      },
    },
  },
  nobodyhomehall: {
    app: "chat",
    config: {
      bot: "none",
      bg: apartments,
      waitMode: "Ringing...",
      nobodyHome: true,
      preload: [],
      actions: [],
      on: {
        end: set("scene", "apartmenthall"),
      },
    },
  },
  neighbor1: {
    app: "chat",
    config: {
      bot: "neighbor1",
      bg: apartments,
      waitMode: "Ringing...",
      enforceMode: ["buzz"],
      preload: [
        {
          text: "Hello",
          isOwn: false,
          ts: 0,
        },
      ],
      actions: [
        {
          id: "leave",
          do: set("scene", "apartmentgate"),
          label: "Leave ⟶",
        },
        {
          id: "notelandlord",
          locked: true,
          do: flow(
            addItems("sceneUnlocks.payphone", ["landlord"]),
            clearItems("sceneUnlocks.neighbor1", ["notelandlord"])
          ),
          label: "✍️ Write number down",
        },
        {
          id: "enter",
          locked: true,
          do: flow(
            clearItems("sceneUnlocks.neighbor1", ["enter"]),
            set("scene", "apartmenthall")
          ),
          label: "Enter apartment ⟶",
        },
      ],
      on: {
        end: set("scene", "apartmentgate"),
        enter: addItems("sceneUnlocks.neighbor1", ["enter"]),
      },
      stringMatches: [
        {
          match: "805-555-1498",
          do: addItems("sceneUnlocks.neighbor1", ["notelandlord"]),
        },
      ],
    },
  },
  neighbor1hall: {
    app: "chat",
    config: {
      bot: "neighbor1",
      bg: apartmenthall,
      waitMode: "Knocking...",
      enforceMode: ["door"],
      preload: [
        {
          text: "Who is it?",
          isOwn: false,
          ts: 0,
        },
      ],
      actions: [
        {
          id: "leave",
          do: set("scene", "apartmenthall"),
          label: "Leave ⟶",
        },
        {
          id: "notelandlord",
          locked: true,
          do: flow(
            addItems("sceneUnlocks.payphone", ["landlord"]),
            clearItems("sceneUnlocks.neighbor1hall", ["notelandlord"])
          ),
          label: "✍️ Write number down",
        },
        {
          id: "takekey",
          locked: true,
          do: flow(
            clearItems("sceneUnlocks.neighbor1hall", ["takekey"]),
            addItems("sceneUnlocks.apartmenthall", ["key3b"])
          ),
          label: "🔑 Take key",
        },
      ],
      on: {
        end: set("scene", "apartmenthall"),
        givekey: addItems("sceneUnlocks.neighbor1hall", ["takekey"]),
      },
      stringMatches: [
        {
          match: "805-555-1498",
          do: addItems("sceneUnlocks.neighbor1hall", ["notelandlord"]),
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
          locked: false,
          do: set("scene", "title"),
          label: "Accept the case ⟶",
        },
        {
          id: "noteaddress",
          locked: true,
          do: flow(
            addItems("sceneUnlocks.world", ["apartmentgate"]),
            clearItems("sceneUnlocks.start", ["noteaddress"])
          ),
          label: "✍️ Write address down",
        },
      ],
      stringMatches: [
        {
          match: "76 Seaborn Avenue",
          do: addItems("sceneUnlocks.start", ["noteaddress"]),
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
      waitMode: "Ringing...",
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
        {
          id: "noteaddress",
          locked: true,
          do: flow(
            addItems("sceneUnlocks.world", ["landlord"]),
            clearItems("sceneUnlocks.phonefilomena", ["noteaddress"])
          ),
          label: "✍️ Write address down",
        },
      ],
      stringMatches: [
        {
          match: "76 Seaborn Avenue",
          do: addItems("sceneUnlocks.phonefilomena", ["noteaddress"]),
        },
      ],
    },
  },
  landlord: {
    app: "chat",
    config: {
      bot: "landlord",
      bg: payphone,
      waitMode: "Ringing...",
      preload: [
        {
          text: "This is Harold",
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
        {
          id: "notekeycode",
          locked: true,
          do: flow(
            addItems("sceneUnlocks.apartments", ["keycode"]),
            clearItems("sceneUnlocks.landlord", ["notekeycode"])
          ),
          label: "✍️ Write address down",
        },
      ],
      on: {
        hangup: set("scene", "payphone"),
        call2b: addItems("botStates.neighbor1", ["landlordcalled"]),
      },
      stringMatches: [
        {
          match: "1234",
          do: flow(
            addItems("sceneUnlocks.landlord", ["notekeycode"]),
            addItems("botStates.neighbor1", ["landlordcalled"])
          ),
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
        {
          id: "key",
          locked: true,
          do: flow(
            addItems("sceneUnlocks.receptionist", ["gotoroom"]),
            clearItems("sceneUnlocks.receptionist", ["key"]),
            addItems("sceneUnlocks.world", ["checkedin"]),
            clearItems("sceneUnlocks.world", ["checkedin"])
          ),
          label: "🔑 Take key",
        },
        {
          id: "gotoroom",
          locked: true,
          do: flow(set("scene", "motelroom")),
          label: "Go to your room ⟶",
        },
      ],
      on: {
        key: addItems("sceneUnlocks.receptionist", ["key"]),
      },
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
      on: {
        frank: addItems("sceneUnlocks.policedesk", ["frank"]),
      },
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
        {
          id: "notelandlord",
          locked: true,
          do: flow(
            addItems("sceneUnlocks.payphone", ["landlord"]),
            clearItems("sceneUnlocks.detective", ["notelandlord"])
          ),
          label: "✍️ Write number down",
        },
        {
          id: "noteaddress",
          locked: true,
          do: flow(
            addItems("sceneUnlocks.world", ["landlord"]),
            clearItems("sceneUnlocks.detective", ["noteaddress"])
          ),
          label: "✍️ Write address down",
        },
      ],
      on: {
        arrest: set("scene", "arrested"),
      },
      stringMatches: [
        {
          match: "805-555-1498",
          do: addItems("sceneUnlocks.detective", ["notelandlord"]),
        },
        {
          match: "76 Seaborn Avenue",
          do: addItems("sceneUnlocks.detective", ["noteaddress"]),
        },
      ],
    },
  },
  arrested: {
    app: "chat",
    config: {
      bot: "detective",
      bg: imprisoned,
      preload: [],
      actions: [],
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
