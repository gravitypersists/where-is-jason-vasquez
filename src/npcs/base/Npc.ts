import OpenApiChatCompletions from "./ChatCompletions";
import OpenApiEmbeddings from "./Embeddings";
import { getIndex } from "./Indexes";
import { takeRight, get, uniq, partition } from "lodash";

const REMEMBER = 2;
const CONTEXT_THRESHOLD = 0.82;
const SWITCH_THRESHOLD = 0.87;

interface Message {
  role: "assistant" | "user" | "system";
  content: string;
}

interface Facts {
  [key: string]: string;
}

interface Switch {
  add?: string[];
  remove?: string[];
  if?: string[];
  unless?: string[];
}

interface NpcOptions {
  name: string;
  baseSystem: string;
  facts: Facts;
  preload?: string;
  switches?: { [key: string]: Switch };
  modePrompts?: { [key: string]: string };
}

class Npc {
  private readonly name: string;
  private readonly baseSystem: string;
  private readonly switches: { [key: string]: Switch };
  private readonly modePrompts: { [key: string]: string };
  private readonly facts: Facts;
  private modes: string[];
  private currentConversation: Message[];

  constructor({
    name,
    baseSystem,
    facts,
    switches,
    modePrompts,
    preload,
  }: NpcOptions) {
    this.name = name;
    this.baseSystem = baseSystem;
    this.facts = facts;
    this.switches = switches || {};
    this.modePrompts = modePrompts || {};
    this.modes = [];
    const preloads: Message[] = preload
      ? [
          {
            role: "assistant",
            content: preload,
          },
        ]
      : [];
    this.currentConversation = [
      { role: "system", content: this.baseSystem },
      ...preloads,
    ];
  }

  async queryContext(message: string): Promise<string> {
    const index = await getIndex("npcs");
    console.log(`Embedding message: ${message}...`);
    const embedResponse = await OpenApiEmbeddings.getEmbedding(message);
    const queryResponse: any = await index.query({
      queryRequest: {
        topK: 3,
        includeMetadata: true,
        vector: embedResponse.data[0].embedding,
        namespace: this.name,
      },
    });
    console.log(
      queryResponse.matches
        .map((match: any) => `${match.score}: ${match.metadata.prompt}`)
        .join("\n")
    );
    const [acceptQueries, rejectQueries] = partition(
      queryResponse.matches,
      (match) => match.score > CONTEXT_THRESHOLD
    );
    const acceptFacts = uniq(
      acceptQueries.map((match) => match.metadata.facts).flat()
    );
    const rejectFacts = uniq(
      rejectQueries.map((match) => match.metadata.facts).flat()
    );
    console.log("Accept facts:", acceptFacts);
    console.log("Reject facts:", rejectFacts);

    const modeSwitchers = queryResponse.matches
      .filter((match: any) => match.score > SWITCH_THRESHOLD)
      .map((match: any) => match.metadata.modeSwitch)
      .flat() as string[];
    modeSwitchers.forEach((modeSwitch) => this.handleModeSwitch(modeSwitch));

    const facts = acceptFacts
      .map((fact) => get(this.facts, fact, ""))
      .join(" ");
    const modeFacts = this.modes
      .map((mode) => get(this.facts, mode))
      .map((modeF) => acceptFacts.map((fact) => get(modeF, fact, "")).join(" "))
      .flat();

    const modePrompts = this.modes
      .map((mode) => get(this.modePrompts, mode, ""))
      .join(" ");

    return `${modeFacts} ${facts} ${modePrompts}`;
  }

  async respond(message: string): Promise<string> {
    const queryContext = await this.queryContext(message);
    this.currentConversation.push({ role: "user", content: message });
    const [head, ...tail] = this.currentConversation;
    const convo: Message[] = [
      { role: "system", content: this.baseSystem + " " + queryContext },
      ...takeRight(tail, REMEMBER + 1),
    ];
    console.log(`Simulating chat [${this.modes.join(", ")}]:`, convo);
    const response = await OpenApiChatCompletions.getChatCompletions({
      messages: convo,
    });
    const selectedText = response.choices[0].message.content.trim();
    this.currentConversation.push({
      role: "assistant",
      content: selectedText,
    });
    return selectedText;
  }

  reset(): void {
    this.currentConversation = [
      {
        role: "system",
        content: this.baseSystem,
      },
    ];
  }

  handleModeSwitch(modeSwitch: string): void {
    const swtch = this.switches[modeSwitch];
    if (!swtch) return;
    const { add, remove, if: ifSwitch, unless } = swtch;
    console.log("Mode switch from:", this.modes);
    if (
      ifSwitch?.every((x) => this.modes.includes(x)) ||
      ifSwitch === undefined
    ) {
      if (unless?.some((x) => this.modes.includes(x))) {
        return;
      }
      if (add) {
        this.modes = uniq([...this.modes, ...add]);
      }
      if (remove) {
        this.modes = this.modes.filter((mode) => !remove.includes(mode));
      }
    }
    console.log("Mode switch done:", this.modes);
  }

  setModes(modes: string[]): void {
    this.modes = modes;
  }

  getModes(): string[] {
    return this.modes;
  }
}

export default Npc;
