import { PineconeClient } from "@pinecone-database/pinecone";

const pinecone = new PineconeClient();
const init = async () => {
  return await pinecone.init({
    environment: "asia-southeast1-gcp",
    apiKey: "69747b40-4754-4ad3-8c7c-0dd3262f8bcb",
  });
};

const genIndex = async (indexName: string) => {
  const indexesList = await pinecone.listIndexes();
  if (indexesList.includes(indexName)) return;
  console.log(`Creating index ${indexName}...`);
  return await pinecone.createIndex({
    createRequest: {
      name: indexName,
      dimension: 1536,
      metric: "cosine",
      podType: "p1",
    },
  });
};

export const getIndex = async (indexName: string) => {
  await init();
  await genIndex(indexName);
  console.log(`Got index ${indexName}...`);
  return pinecone.Index(indexName);
};
