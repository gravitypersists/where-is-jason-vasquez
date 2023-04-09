import axios, { AxiosResponse } from "axios";

interface Message {
  role: "assistant" | "user" | "system";
  content: string;
}

export interface ChatCompletionsRequest {
  messages: Message[];
  max_tokens?: number;
  temperature?: number;
  n?: number;
}

interface ChatCompletionsResponse {
  id: string;
  object: "text_completion";
  created: number;
  choices: {
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: "max_tokens" | "stop";
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

type Response = ChatCompletionsResponse | void;

class OpenApiChatCompletions {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = "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";
    this.apiUrl = "https://api.openai.com/v1/chat/completions";
  }

  async getChatCompletions(
    request: ChatCompletionsRequest
  ): Promise<ChatCompletionsResponse> {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };

    const data = {
      model: "gpt-3.5-turbo",
      messages: request.messages,
      max_tokens: request.max_tokens || 100,
      temperature: request.temperature || 0.5,
      n: request.n || 1,
    };

    const response: AxiosResponse<ChatCompletionsResponse> | void = await axios
      .post(this.apiUrl, data, { headers })
      .catch(function (error) {
        console.log(error.toJSON());
      });

    if (!response) {
      throw new Error("No response from OpenAI");
    }

    return response?.data;
  }
}

export default new OpenApiChatCompletions();
