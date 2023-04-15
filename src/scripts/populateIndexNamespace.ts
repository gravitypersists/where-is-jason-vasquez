import { getIndex } from "../npcs/base/Indexes";
import { VectorizedContext } from "./buildEmbeddings";
import * as fs from "fs";
import * as path from "path";
import { isString, has, toPairs } from "lodash";

const args = process.argv;
const dir = args[2];

const filePath = path.join(dir, "./vecContext.json");
const vectorizedCtx: VectorizedContext = JSON.parse(
  fs.readFileSync(filePath, "utf8")
);

const details = JSON.parse(
  fs.readFileSync(path.join(dir, "./details.json"), "utf8")
);

type Context = string | { modeSwitch: string[] };
const contextMap = JSON.parse(
  fs.readFileSync(path.join(dir, "./contexts.json"), "utf8")
) as { [key: string]: Context[] };

(async () => {
  try {
    const index = await getIndex("npcs");
    const vectors = toPairs(vectorizedCtx).map((ctx) => {
      const [prompt, v] = ctx;
      const { id, vector } = v;
      const contextConfig = contextMap[prompt] || [];
      const facts = contextConfig.filter((item) => isString(item));
      const foundModeSwitch = contextConfig.find((i) => has(i, "modeSwitch"));
      const modeSwitch: string[] = foundModeSwitch
        ? (foundModeSwitch as { modeSwitch: string[] }).modeSwitch
        : [];
      return {
        id,
        metadata: { prompt, facts, modeSwitch },
        values: vector.data[0].embedding,
      };
    });
    await index.upsert({ upsertRequest: { vectors, namespace: details.name } });
  } catch (e) {
    console.error(e);
  }
})();
