import { v5 as uuidv5 } from "uuid";
import OpenApiEmbeddings, { EmbeddingResponse } from "../npcs/base/Embeddings";
import * as fs from "fs";
import * as path from "path";
import { fromPairs, toPairs } from "lodash";
import paths from "./npcPaths";

export type VectorizedContext = {
  [key: string]: {
    vector: EmbeddingResponse;
    id: string;
    facts: string[];
  };
};

function readFiles(dir: string) {
  const actionsFile = fs.readFileSync(
    path.join(__dirname, dir, "./actions.json"),
    "utf8"
  );
  const actions = JSON.parse(actionsFile) as { [key: string]: string };
  const contextsFile = fs.readFileSync(
    path.join(__dirname, dir, "./contexts.json"),
    "utf8"
  );
  const contexts = JSON.parse(contextsFile) as {
    [key: string]: string;
  };
  return { actions, contexts };
}

(async () => {
  try {
    paths.forEach(async (p) => {
      const embeddingsFile = path.join(__dirname, "../npcs/embeddings.json");
      const embeddings = JSON.parse(fs.readFileSync(embeddingsFile, "utf8"));
      const { actions, contexts } = readFiles(p);
      const embeds = Object.keys({ ...contexts, ...actions });

      const vectorized = await Promise.all(
        embeds.map(async (toEmbedString) => {
          if (embeddings[toEmbedString]) {
            console.log(".");
            return [toEmbedString, embeddings[toEmbedString]];
          }
          console.log(`Embedding ${toEmbedString}...`);
          const vector = await OpenApiEmbeddings.getEmbedding(toEmbedString);
          return [toEmbedString, { vector }];
        })
      );
      const output = { ...embeddings, ...fromPairs(vectorized) };
      fs.writeFileSync(
        path.join(__dirname, "../npcs/embeddings.json"),
        JSON.stringify(output, null, 2),
        "utf8"
      );
    });
  } catch (e) {
    console.error(e);
  }
})();
