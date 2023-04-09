import { getIndex } from "../npcs/base/Indexes";
import { VectorizedContext } from "./buildEmbeddings";
import * as fs from "fs";
import * as path from "path";
import lodash from "lodash";
const { toPairs } = lodash;

const args = process.argv;
const dir = args[2];

const filePath = path.join(dir, "./vecContext.json");
const vectorizedCtx: VectorizedContext = JSON.parse(
  fs.readFileSync(filePath, "utf8")
);

const details = JSON.parse(
  fs.readFileSync(path.join(dir, "./details.json"), "utf8")
);

(async () => {
  try {
    const index = await getIndex("npcs");
    const vectors = toPairs(vectorizedCtx).map((ctx) => {
      const [prompt, v] = ctx;
      const { id, vector, facts } = v;
      return {
        id,
        metadata: { prompt, facts },
        values: vector.data[0].embedding,
      };
    });
    await index.upsert({ upsertRequest: { vectors, namespace: details.name } });
  } catch (e) {
    console.error(e);
  }
})();
