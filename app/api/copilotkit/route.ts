import { mastra } from '@/src/mastra';
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { MastraAgent } from '@ag-ui/mastra';
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest) => {
  // Get local Mastra agents for CopilotKit integration
  const mastraAgents = MastraAgent.getLocalAgents({
    mastra,
    resourceId: 'form-builder', // Required by MastraAgent.getLocalAgents
  });

  // Create CopilotKit runtime with Mastra agents
  const runtime = new CopilotRuntime({
    agents: mastraAgents,
  });

  // Create the Next.js App Router endpoint handler
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};
