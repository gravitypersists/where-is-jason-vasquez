import OpenApiChatCompletions from "./ChatCompletions";
import OpenApiEmbeddings from "./Embeddings";
import { getIndex } from "./Indexes";
import { takeRight, get, uniq } from "lodash";

const REMEMBER = 2;
const CONTEXT_THRESHOLD = 0.82;

interface Mode {
  name: string;
  system: string;
}

interface Message {
  role: "assistant" | "user" | "system";
  content: string;
}

interface Facts {
  [key: string]: string;
}

interface NpcOptions {
  name: string;
  baseSystem: string;
  facts: Facts;
}

class Npc {
  private readonly name: string;
  private readonly baseSystem: string;
  private readonly facts: Facts;
  private readonly modes: Mode[];
  private currentModeIndex: number;
  private currentConversation: Message[];

  constructor({ name, baseSystem, facts }: NpcOptions) {
    this.name = name;
    this.baseSystem = baseSystem;
    this.facts = facts;
    this.modes = [];
    this.currentModeIndex = 0;
    this.currentConversation = [{ role: "system", content: this.baseSystem }];
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
    const facts: string[] = uniq(
      queryResponse.matches.map((match: any, i: number) => {
        console.log(
          "Matched prompt: ",
          match.metadata.prompt,
          match.metadata.facts,
          match.score
        );
        return i === 0 || match.score < CONTEXT_THRESHOLD
          ? []
          : match.metadata.facts;
      })
    );

    return facts.map((fact) => get(this.facts, fact)).join(" ");
  }

  async respond(message: string): Promise<string> {
    const queryContext = await this.queryContext(message);
    this.currentConversation.push({ role: "user", content: message });
    const [head, ...tail] = this.currentConversation;
    const convo: Message[] = [
      { role: "system", content: this.baseSystem + " " + queryContext },
      ...takeRight(tail, REMEMBER + 1),
    ];
    console.log("Simulating chat:", convo);
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

  setMode(modeName: string): boolean {
    const modeIndex = this.modes.findIndex((mode) => mode.name === modeName);

    if (modeIndex === -1) {
      return false;
    }

    this.currentModeIndex = modeIndex;
    this.currentConversation = [
      {
        role: "system",
        content: this.modes[modeIndex].system,
      },
    ];

    return true;
  }
}

export default Npc;
