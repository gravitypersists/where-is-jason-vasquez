import axios, { AxiosResponse } from "axios";

export interface EmbeddingResponse {
  object: string;
  data: {
    object: string;
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

class Embeddings {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.apiUrl = "https://api.openai.com/v1/embeddings";
    this.model = "text-embedding-ada-002";
  }

  async getEmbedding(input: string): Promise<EmbeddingResponse> {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };

    const data = {
      model: this.model,
      input,
    };

    const response: AxiosResponse<EmbeddingResponse> = await axios.post(
      this.apiUrl,
      data,
      { headers }
    );

    return response.data;
  }
}

export default new Embeddings();
