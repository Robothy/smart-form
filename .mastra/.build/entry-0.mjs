import { Mastra } from '@mastra/core/mastra';
import { Agent } from '@mastra/core/agent';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

"use strict";
const zhipuAI = createOpenAICompatible({
  baseURL: process.env.ZHIPU_BASE_URL || "https://open.bigmodel.cn/api/paas/v4",
  apiKey: process.env.ZHIPU_API_KEY || "44a6fae5796d436f8c52cd113c51a074.MWX3yXZTSGNFLD2l"
});
const formBuilderAgent = new Agent({
  name: "form-builder",
  description: "AI assistant for building forms",
  instructions: "You are a helpful form building assistant. Help users create forms by understanding their requirements.",
  model: zhipuAI("glm-4.7")
});

"use strict";
const mastra = new Mastra({
  agents: {
    formBuilder: formBuilderAgent
  }
});

export { mastra };
