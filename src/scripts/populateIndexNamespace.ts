import { v5 as uuidv5 } from "uuid";
import { getIndex } from "../npcs/base/Indexes";
import fs from "fs";
import path from "path";
import { isString, has, toPairs } from "lodash";
import paths from "./npcPaths";
import readConfig from "./readConfig";

const embeddingsFile = path.join(__dirname, "../npcs/embeddings.json");
const embeddings = JSON.parse(fs.readFileSync(embeddingsFile, "utf8"));

function readFiles(dir: string) {
  const details = JSON.parse(
    fs.readFileSync(path.join(__dirname, dir, "./details.json"), "utf8")
  );
  const actions = JSON.parse(
    fs.readFileSync(path.join(__dirname, dir, "./actions.json"), "utf8")
  );
  type Context = string | { modeSwitch: string[] };
  const contexts = JSON.parse(
    fs.readFileSync(path.join(__dirname, dir, "./contexts.json"), "utf8")
  ) as { [key: string]: Context[] };
  return { details, actions, contexts };
}

(async () => {
  try {
    const index = await getIndex("npcs");

    paths.forEach(async (p) => {
      const { name, actions, contexts } = readConfig(p);

      const contextVectors = toPairs(contexts).map((ctx) => {
        const [prompt, context] = ctx;
        const embedding = embeddings[prompt];
        if (!embedding) throw new Error(`No embed for ${prompt}`);
        const facts = context.filter((item) => isString(item));
        const foundModeSwitch = context.find((i) => has(i, "modeSwitch"));
        const modeSwitch: string[] = foundModeSwitch
          ? (foundModeSwitch as { modeSwitch: string[] }).modeSwitch
          : [];

        return {
          id: uuidv5(prompt + name, uuidv5.URL),
          metadata: { prompt, facts, modeSwitch },
          values: embedding.vector.data[0].embedding,
        };
      });

      const actionVectors = toPairs(actions).map((ctx) => {
        const [prompt, actions] = ctx;
        const embedding = embeddings[prompt];
        if (!embedding) throw new Error(`No embed for ${prompt}!`);

        return {
          id: uuidv5(prompt + "act" + name, uuidv5.URL),
          metadata: { prompt, actions },
          values: embedding.vector.data[0].embedding,
        };
      });

      if (contextVectors.length > 0) {
        console.log(`Upsert contexts index for ${name}...`);
        // console.log(name, contextVectors.length);
        await index.upsert({
          upsertRequest: { vectors: contextVectors, namespace: name },
        });
      }

      if (actionVectors.length > 0) {
        console.log(`Upsert actions index for ${name}...`);
        // console.log(name, actionVectors.length);
        await index.upsert({
          upsertRequest: {
            vectors: actionVectors,
            namespace: "act " + name,
          },
        });
      }
    });
  } catch (e) {
    console.error(e);
  }
})();
