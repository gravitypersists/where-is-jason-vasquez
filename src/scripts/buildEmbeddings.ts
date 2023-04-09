import { v5 as uuidv5 } from "uuid";
import OpenApiEmbeddings, { EmbeddingResponse } from "../npcs/base/Embeddings";
import * as fs from "fs";
import * as path from "path";
import { fromPairs, toPairs } from "lodash";

const args = process.argv;
const dir = args[2];

export type VectorizedContext = {
  [key: string]: {
    vector: EmbeddingResponse;
    id: string;
    facts: string[];
  };
};

const name = "Vega Cruz";

(async () => {
  try {
    const detailsFile = fs.readFileSync(
      path.join(dir, "./details.json"),
      "utf8"
    );
    const details = JSON.parse(detailsFile) as {
      name: string;
      baseSystem: string;
    };
    const factsFile = fs.readFileSync(path.join(dir, "./facts.json"), "utf8");
    const facts = JSON.parse(factsFile) as { [key: string]: string };
    const contextsFile = fs.readFileSync(
      path.join(dir, "./contexts.json"),
      "utf8"
    );
    const contexts = JSON.parse(contextsFile) as {
      [key: string]: keyof typeof facts[];
    };
    const embeds = toPairs(contexts);

    const filePath = path.join(dir, "./vecContext.json");
    const file = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, "utf8")
      : "{}";
    const existing = JSON.parse(file) as VectorizedContext;

    const vectorized = await Promise.all(
      embeds.map(async (ctx) => {
        const [prompt, facts] = ctx;
        if (existing[prompt]) {
          console.log(".");
          return [prompt, existing[prompt]];
        }
        console.log(`Embedding ${prompt}...`);
        const vector = await OpenApiEmbeddings.getEmbedding(prompt);
        const id = uuidv5(details.name + prompt, uuidv5.URL);
        return [prompt, { vector, id, facts }];
      })
    );
    fs.writeFileSync(
      path.join(dir, "./vecContext.json"),
      JSON.stringify(fromPairs(vectorized), null, 2),
      "utf8"
    );
  } catch (e) {
    console.error(e);
  }
})();
