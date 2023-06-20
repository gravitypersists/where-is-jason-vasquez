import { PineconeClient } from "@pinecone-database/pinecone";
import { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";

const pinecone = new PineconeClient();
const init = async () => {
  return await pinecone.init({
    environment: "asia-southeast1-gcp",
    apiKey: process.env.PINECONE_API_KEY || "",
  });
};

const genIndex = async (indexName: string) => {
  const indexesList = await pinecone.listIndexes();
  console.log(indexesList);
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

let index: VectorOperationsApi;

export const getIndex = async (indexName: string) => {
  if (index) return index;
  console.log("init");
  await init();
  console.log("getIndex");
  await genIndex(indexName);
  console.log(`Got index ${indexName}...`);
  index = pinecone.Index(indexName);
  return index;
};

export const deleteIndex = async (indexName: string) => {
  await init();
  await pinecone.deleteIndex({ indexName });
};
