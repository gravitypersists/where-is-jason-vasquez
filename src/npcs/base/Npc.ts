import OpenApiChatCompletions from "./ChatCompletions";
import OpenApiEmbeddings from "./Embeddings";
import { getIndex } from "./Indexes";
import { takeRight, get, uniq, partition, last } from "lodash";

// how many chat messages to remember
const REMEMBER = 2;
// how many past facts to inject into context
const FACT_BUFFER_RECALL = 2;

const CONTEXT_THRESHOLD = 0.82;
const SWITCH_THRESHOLD = 0.85;
const ACTION_THRESHOLD = 0.89;

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

export interface NpcOptions {
  name: string;
  baseSystem: string;
  facts: Facts;
  preload?: string;
  switches?: { [key: string]: Switch };
  modePrompts?: { [key: string]: string };
  permanentFacts?: string[];
  onAction: (actions: string[]) => void;
}

class Npc {
  private readonly name: string;
  private readonly baseSystem: string;
  private readonly switches: { [key: string]: Switch };
  private readonly modePrompts: { [key: string]: string };
  private readonly facts: Facts;
  private readonly permanentFacts: string[];
  private readonly onAction: (actions: string[]) => void;
  private modes: string[];
  private factBuffer: string[][];
  private currentConversation: Message[];

  constructor({
    name,
    baseSystem,
    facts,
    permanentFacts,
    switches,
    modePrompts,
    preload,
    onAction,
  }: NpcOptions) {
    this.name = name;
    this.baseSystem = baseSystem;
    this.facts = facts;
    this.factBuffer = [[]];
    this.permanentFacts = permanentFacts || [];
    this.switches = switches || {};
    this.modePrompts = modePrompts || {};
    this.modes = [];
    this.onAction = onAction;
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

  async queryResponseContext(
    message: string
  ): Promise<{ modeSwitchers: string[]; facts: string[] }> {
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

    const modeSwitchers = uniq(
      queryResponse.matches
        .filter((match: any) => match.score > SWITCH_THRESHOLD)
        .map((match: any) => match.metadata.modeSwitch)
        .flat() as string[]
    );

    return { modeSwitchers, facts: acceptFacts };
  }

  calcContextString(incomingFacts: string[]): string {
    const bufferedFacts = takeRight(this.factBuffer, FACT_BUFFER_RECALL);
    const allFacts = uniq([...bufferedFacts.flat(), ...incomingFacts]);

    const facts = allFacts.map((fact) => get(this.facts, fact, "")).join(" ");
    const modeFacts = this.modes
      .map((mode) => get(this.facts, mode))
      .map((modeF) => allFacts.map((fact) => get(modeF, fact, "")).join(" "))
      .flat();

    const modePrompts = this.modes
      .map((mode) => get(this.modePrompts, mode, ""))
      .join(" ");

    return `${modeFacts} ${facts} ${modePrompts}`;
  }

  async respond(message: string): Promise<string> {
    const { facts, modeSwitchers } = await this.queryResponseContext(message);
    const lastFactBuffer = last(this.factBuffer);
    const permFacts = this.permanentFacts.filter((f) =>
      lastFactBuffer?.includes(f)
    );
    console.log({ permFacts });
    const withPermFacts = [...facts, ...permFacts];
    modeSwitchers.forEach((modeSwitch) => this.handleModeSwitch(modeSwitch));
    const queryContextString = this.calcContextString(withPermFacts);
    this.factBuffer.push(withPermFacts);

    this.currentConversation.push({ role: "user", content: message });
    const [head, ...tail] = this.currentConversation;
    const convo: Message[] = [
      { role: "system", content: this.baseSystem + " " + queryContextString },
      ...takeRight(tail, REMEMBER + 1),
    ];
    console.log(`Simulating chat [${this.modes.join(", ")}]:`, convo);
    const response = await OpenApiChatCompletions.getChatCompletions({
      messages: convo,
    });
    const reponseText = response.choices[0].message.content.trim();
    this.queryResponseActions(reponseText);
    this.currentConversation.push({
      role: "assistant",
      content: reponseText,
    });
    return reponseText;
  }

  async queryResponseActions(message: string): Promise<void> {
    const index = await getIndex("npcs");
    console.log(`Embedding message: ${message}...`);
    const embedResponse = await OpenApiEmbeddings.getEmbedding(message);
    const queryResponse: any = await index.query({
      queryRequest: {
        topK: 1,
        includeMetadata: true,
        vector: embedResponse.data[0].embedding,
        namespace: "act " + this.name,
      },
    });
    console.log(queryResponse.matches);
    if (queryResponse.matches.length === 0) return;
    const match = queryResponse.matches[0];
    if (match.score > ACTION_THRESHOLD) this.onAction(match.metadata.actions);
  }

  reset(): void {
    this.currentConversation = [
      {
        role: "system",
        content: this.baseSystem,
      },
    ];
    this.factBuffer = [[]];
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
