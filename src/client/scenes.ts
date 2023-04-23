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
import jasonsapartment from "./assets/scenes/jasonsapartment.png";

export type SceneAction = {
  id?: string;
  locked?: boolean;
  do?: (state: GameState) => GameState;
  label: string;
  flash?: boolean;
  pre?: (state?: GameState) => string;
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
    pre?: (state?: GameState) => string;
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
          flash: true,
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
            addItems("sceneUnlocks.apartmentgate", ["keycode"]),
            clearItems("sceneUnlocks.landlord", ["notekeycode"])
          ),
          label: "✍️ Write address down",
          flash: true,
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
  // APARTMENTS
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
          flash: true,
        },
        {
          id: "enter",
          locked: true,
          do: flow(
            clearItems("sceneUnlocks.neighbor1", ["enter"]),
            set("scene", "apartmenthall")
          ),
          label: "Enter apartment Building ⟶",
          flash: true,
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
          flash: true,
        },
        {
          id: "takekey",
          locked: true,
          do: flow(
            clearItems("sceneUnlocks.neighbor1hall", ["takekey"]),
            addItems("sceneUnlocks.apartmenthall", ["key3b"])
          ),
          label: "🔑 Take key",
          flash: true,
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
  jasonsapartment: {
    app: "options",
    config: {
      bg: jasonsapartment,
      pre: () =>
        `Air stale, curtains drawn, room shrouded in darkness. No signs of life for at least a week. Floorboards creak, musty scent of neglect hung in the air, and unease creeps over like a parasite.`,
      actions: [
        {
          do: set("scene", "jasonsbedroom"),
          label: "Enter bedroom",
        },
        {
          do: set("scene", "jasonslivingroom"),
          label: "Enter living room",
        },
        {
          do: set("scene", "jasonskitchen"),
          label: "Enter kitchen",
        },
        {
          do: set("scene", "apartmenthall"),
          label: "Leave ⟶",
        },
      ],
    },
  },
  jasonsbedroom: {
    app: "options",
    config: {
      bg: jasonsapartment,
      pre: () =>
        `Darkness shrouds the room. Only light comes from a thin beam of sunlight struggling to penetrate the drawn curtains. Bed is a mess. Pile of clothes outgrows the hamper. Piles of books on nightstand, clearly not read.`,
      actions: [
        {
          pre: () => `Seems to be a makeshift storage solution. No shoes.`,
          label: "Check closet",
        },
        {
          pre: () =>
            `A disarray of personal items, sparsely an item of clothing. Nothing to note, nothing of value.`,
          label: "Check dresser",
        },
        {
          do: set("scene", "jasonslivingroom"),
          label: "Enter living room",
        },
        {
          do: set("scene", "jasonskitchen"),
          label: "Enter kitchen",
        },
        {
          do: set("scene", "apartmenthall"),
          label: "Leave ⟶",
        },
      ],
    },
  },
  jasonslivingroom: {
    app: "options",
    config: {
      bg: jasonsapartment,
      pre: () =>
        `Blinds down. A couch. In front of a TV. Predictable. A computer desk in the corner.`,
      actions: [
        {
          pre: () =>
            `Remote is missing, but a button on the set works. Instead of the familiar mindless glow of sound and vision... static. A droning monochrome noise. For a moment, a sense of ease, drawn in by the siren's call of oblivion.`,
          label: "Turn on the tv",
        },
        {
          pre: () =>
            `A glow emanates from the CRT screen, and then a mechanical symphony of nonsense, as if the dusty old tower were housing a rabid robotic ferret. Amidst the glow of the monitor, a cursor blinks, almost straining. A flurry of technobabble fills the screen, but among the noise, a solitary piece of natural language: Error: No bootable device found. Press any key to reboot.`,
          label: "Turn on the computer",
        },
        {
          pre: () => `It's old, used, but surprisingly very comfortable.`,
          label: "Sit on the couch",
        },
        {
          do: set("scene", "jasonsbedroom"),
          label: "Enter bedroom",
        },
        {
          do: set("scene", "jasonskitchen"),
          label: "Enter kitchen",
        },
        {
          do: set("scene", "apartmenthall"),
          label: "Leave ⟶",
        },
      ],
    },
  },
  jasonskitchen: {
    app: "options",
    config: {
      bg: jasonsapartment,
      pre: () => `TODO`,
      actions: [
        {
          pre: () =>
            `A cold, empty interior. Food's been cleaned out, all that remains are standard condiments and an expired pack of healthy yogurts, ambitions nobody wanted to touch.`,
          label: "Open the fridge",
        },
        {
          pre: () => `Empty. With a fresh liner.`,
          label: "Check the trash",
        },
        {
          do: set("scene", "jasonsbedroom"),
          label: "Enter bedroom",
        },
        {
          do: set("scene", "jasonslivingroom"),
          label: "Enter living room",
        },
        {
          do: set("scene", "apartmenthall"),
          label: "Leave ⟶",
        },
      ],
    },
  },
  // BAR
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
  // MOTEL
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
          flash: true,
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
  // POLICE STATION
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
          flash: true,
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
          label: "✍️ Write phone number down",
          flash: true,
        },
        {
          id: "noteaddress",
          locked: true,
          do: flow(
            addItems("sceneUnlocks.world", ["landlord"]),
            clearItems("sceneUnlocks.detective", ["noteaddress"])
          ),
          label: "✍️ Write address down",
          flash: true,
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
  // MISC
  arrested: {
    app: "chat",
    config: {
      bot: "detective",
      bg: imprisoned,
      preload: [],
      actions: [],
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
          flash: true,
        },
        {
          id: "noteaddress",
          locked: true,
          do: flow(
            addItems("sceneUnlocks.world", ["apartmentgate"]),
            clearItems("sceneUnlocks.start", ["noteaddress"])
          ),
          label: "✍️ Write address down",
          flash: true,
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
  title: {
    app: "cutscene",
    config: {
      component: "title",
      next: "world",
    },
  },
};

export default scenes;
