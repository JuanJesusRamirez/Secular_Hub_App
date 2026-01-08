import { AzureOpenAI } from 'openai';
import OpenAI from 'openai';

interface CompletionOptions {
  temperature?: number;
  max_tokens?: number;
}

// Check for Azure environment variables
const isAzure = !!process.env.AZURE_OPENAI_ENDPOINT;

let client: AzureOpenAI | OpenAI;

if (isAzure) {
  if (!process.env.AZURE_OPENAI_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
    console.warn('Azure OpenAI credentials missing. AI features may not work.');
  }
  client = new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY || 'dummy-azure-key',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    apiVersion: '2024-05-01-preview', // Default to a recent version
  });
} else {
  if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API Key missing. AI features may not work.');
  }
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  });
}

export async function getCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: CompletionOptions = {}
) {
  try {
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';

    const response = await client.chat.completions.create({
      model: isAzure ? deploymentName : 'gpt-4-turbo', // Model is ignored by Azure client in favor of deployment
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error calling AI service:', error);
    throw error;
  }
}

export { client };
