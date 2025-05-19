import axios from "axios";
import { url } from "inspector";

export interface AIChatRequest {
  message: string;
  apiKey?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  modelName?: string;
  imageUrl?: string; // 添加图片URL支持
  onReceive?: (content: string) => void;
  onFinish?: (content: string) => void;
}

export interface AIChatResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 阿里云百炼模型API地址
const DASHSCOPE_API_ENDPOINT =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

/**
 * 发送请求到阿里云百炼API
 *
 * @param apiKey 阿里云百炼API密钥
 * @param message 用户消息
 * @param history 历史消息记录
 * @param modelName 模型名称，默认为qwen-max
 * @param imageUrl 可选的图片URL(多模态模型使用)
 * @returns AI的回复
 */
export const sendDashScopeRequest = async (
  apiKey: string,
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  modelName: string = "qwen-max",
  imageUrl?: string,
  onReceive?: (content: string) => void,
  onFinish?: (content: string) => void
): Promise<AIChatResponse> => {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    // 构建消息内容
    let content: any;
    if (imageUrl) {
      // 多模态内容（包含图片）
      content = [
        { type: "text", text: message },
        { type: "image_url", image_url: { url: imageUrl } },
      ];
    } else {
      // 纯文本内容
      content = message;
    }

    // 构建消息历史
    const messages = [
      // ...history.map((msg) => ({
      //   role: msg.role,
      //   content: msg.content,
      // })),
      {
        role: "user",
        content: content,
      },
    ];

    // 百炼API请求格式
    const requestData = {
      model: modelName,
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    };

    console.log("发送百炼API请求:", {
      endpoint: DASHSCOPE_API_ENDPOINT,
      model: modelName,
      messageCount: messages.length,
      hasImage: !!imageUrl,
    });

    // const response = await axios.post(DASHSCOPE_API_ENDPOINT, requestData, {
    //   headers,
    // });
    // fetch(DASHSCOPE_API_ENDPOINT, requestData, { headers });

    fetch(DASHSCOPE_API_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(requestData),
      headers: headers,
    }).then((response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let contentText = "";
      function readChunk() {
        reader
          ?.read()
          .then(({ done, value }) => {
            if (done) {
              console.log("Stream finished");

              onFinish?.(contentText);

              return;
            }

            // 处理二进制数据块（如文本）
            const chunk = decoder.decode(value).replace("[DONE]", "");

            // 处理SSE格式的数据，按行分割并处理每个data事件
            const lines = chunk.split("\n\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  if (line.replace("data: ", "") === "") {
                    continue;
                  }
                  const data = JSON.parse(line.replace("data: ", ""));
                  if (data.choices && data.choices[0].delta) {
                    const content = data.choices[0].delta.content;
                    if (content) {
                      console.log("Received chunk:", content);
                      // 这里可以添加回调函数或事件发射器来将内容传递给UI
                      onReceive?.(content);
                      contentText += content;
                    }
                  }
                } catch (error) {
                  console.error("Error parsing SSE data:", error);
                }
              }
            }

            // 继续读取下一块
            readChunk();
          })
          .catch((err) => {
            console.error("Stream error:", err);
          });
      }

      readChunk();
    });

    //   reader?.read().then(function processText({ done, value }) {
    //     if (done) {
    //       return;
    //     }
    //     const text = decoder.decode(value || new Int8Array(), { stream: true });
    //     console.log(text);
    //     processText({ done, value });
    //   });
    // });
    // 解析百炼API响应
    const result: any = {
      // text: response.data.choices[0].message.content,
      // usage: response.data.usage ? {
      //   promptTokens: response.data.usage.prompt_tokens,
      //   completionTokens: response.data.usage.completion_tokens,
      //   totalTokens: response.data.usage.total_tokens
      // } : undefined
    };

    return result;
  } catch (error) {
    console.error("阿里云百炼API请求失败:", error);
    throw error;
  }
};

// DeepSeek的默认API地址
const DEEPSEEK_API_ENDPOINT = "https://api.deepseek.ai/v1/chat/completions";

/**
 * 发送请求到DeepSeek API
 *
 * @param apiKey DeepSeek API密钥
 * @param message 用户消息
 * @param history 历史消息记录
 * @param modelName 模型名称，默认为deepseek-chat
 * @returns AI的回复
 */
export const sendDeepSeekRequest = async (
  apiKey: string,
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  modelName: string = "deepseek-chat"
): Promise<AIChatResponse> => {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    // 构建消息历史
    const messages = [
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    // DeepSeek API请求格式
    const requestData = {
      model: modelName,
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
    };

    console.log("发送DeepSeek请求:", {
      endpoint: DEEPSEEK_API_ENDPOINT,
      model: modelName,
      messageCount: messages.length,
    });

    const response = await axios.post(DEEPSEEK_API_ENDPOINT, requestData, {
      headers,
    });

    // 解析DeepSeek响应
    const result = {
      text: response.data.choices[0].message.content,
      usage: {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens,
      },
    };

    return result;
  } catch (error) {
    console.error("DeepSeek API请求失败:", error);
    throw error;
  }
};

/**
 * 发送AI聊天请求
 *
 * @param endpoint API端点URL或特殊标识符
 * @param request 请求参数
 * @returns AI的回复
 */
export const sendAIChatRequest = async (
  endpoint: string,
  request: AIChatRequest,
  onReceive?: (content: string) => void,
  onFinish?: (content: string) => void
): Promise<AIChatResponse> => {
  // 检查是否是阿里云百炼API
  if (endpoint === "dashscope" || endpoint.includes("dashscope")) {
    if (!request.apiKey) {
      throw new Error("阿里云百炼API需要提供apiKey");
    }
    return sendDashScopeRequest(
      request.apiKey,
      request.message,
      request.history,
      request.modelName || "qwen-max",
      request.imageUrl,
      onReceive,
      onFinish
    );
  }

  // 检查是否是DeepSeek API
  if (endpoint === "deepseek" || endpoint.includes("deepseek")) {
    if (!request.apiKey) {
      throw new Error("DeepSeek API需要提供apiKey");
    }
    return sendDeepSeekRequest(
      request.apiKey,
      request.message,
      request.history,
      request.modelName
    );
  }

  // 常规API请求
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 如果提供了API密钥，则加到请求头中
    if (request.apiKey) {
      headers["Authorization"] = `Bearer ${request.apiKey}`;
    }

    const response = await axios.post(endpoint, request, { headers });
    return response.data;
  } catch (error) {
    console.error("AI请求失败:", error);
    throw error;
  }
};

/**
 * 模拟AI聊天请求（用于开发和测试）
 *
 * @param message 用户消息
 * @returns 模拟的AI回复
 */
export const mockAIChatRequest = async (
  message: string
): Promise<AIChatResponse> => {
  // 模拟网络延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      // 根据输入内容生成不同的回复
      let response = "";

      if (message.includes("你好") || message.includes("您好")) {
        response = "您好！我是AI助手，有什么可以帮您的吗？";
      } else if (message.includes("什么") || message.includes("如何")) {
        response = `关于"${message}"，我可以提供以下信息...`;
      } else if (message.length < 10) {
        response = `您的问题太简短了，能否详细描述一下您想了解的内容？`;
      } else {
        const responses = [
          `我理解您的问题是关于"${message.substring(
            0,
            15
          )}..."，这是一个很好的问题！`,
          `关于您提到的问题，我建议从以下几个方面考虑...`,
          `根据我的分析，这个问题的答案是...`,
          `这是一个有趣的问题！我的回答是...`,
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
      }

      resolve({
        text: response,
        usage: {
          promptTokens: message.length,
          completionTokens: response.length,
          totalTokens: message.length + response.length,
        },
      });
    }, 1000);
  });
};

export default {
  sendAIChatRequest,
  mockAIChatRequest,
  sendDeepSeekRequest,
  sendDashScopeRequest,
};
