import { getIndex } from "../npcs/base/Indexes";
import OpenApiEmbeddings from "../npcs/base/Embeddings";

(async () => {
  try {
    const index = await getIndex("npcs");
    const embedResponse = await OpenApiEmbeddings.getEmbedding(
      "Have you noticed anything strange in this bar?"
    );
    const queryResponse = await index.query({
      queryRequest: {
        topK: 3,
        includeMetadata: true,
        vector: embedResponse.data[0].embedding,
      },
    });
    console.log(queryResponse);
  } catch (e) {
    console.error(e);
  }
})();
