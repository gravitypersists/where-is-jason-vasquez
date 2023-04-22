import { v5 as uuidv5 } from "uuid";
import OpenApiEmbeddings, { EmbeddingResponse } from "../npcs/base/Embeddings";
import * as fs from "fs";
import * as path from "path";
import { fromPairs, toPairs } from "lodash";
import paths from "./npcPaths";
import readConfig from "./readConfig";

export type VectorizedContext = {
  [key: string]: {
    vector: EmbeddingResponse;
    id: string;
    facts: string[];
  };
};

(async () => {
  try {
    paths.forEach(async (p) => {
      const embeddingsFile = path.join(__dirname, "../npcs/embeddings.json");
      const embeddings = JSON.parse(fs.readFileSync(embeddingsFile, "utf8"));
      const { actions, contexts } = readConfig(p);
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
