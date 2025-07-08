import axios from 'axios';
import { OllamaConfig, ChatRequest, ChatResponse } from '../types/index.js';
import { knowledgeBase, chatPrompts } from '../knowledge-base/data.js';
import { logger } from '../utils/logger.js';

export class OllamaService {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = config;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/tags`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      logger.error('Ollama health check failed:', error);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/tags`);
      return response.data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      logger.error('Failed to fetch available models:', error);
      return [];
    }
  }

  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      const model = request.model || this.config.model;
      
      // Build context-aware prompt
      const contextPrompt = this.buildContextPrompt(request.message, request.context);
      
      // Debug: Log the actual prompt being sent
      logger.info('Prompt being sent to Ollama:', contextPrompt.substring(0, 500) + '...');

      const ollamaRequest = {
        model: model,
        prompt: contextPrompt,
        stream: false,
        options: {
          temperature: this.config.temperature || 0.7,
          num_predict: this.config.maxTokens || 500,
          top_k: 40,
          top_p: 0.9,
          repeat_penalty: 1.1
        }
      };

      logger.info(`Sending request to Ollama: ${model}`);
      
      const response = await axios.post(
        `${this.config.baseUrl}/api/generate`,
        ollamaRequest,
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.response) {
        const chatResponse: ChatResponse = {
          message: request.message,
          response: response.data.response.trim(),
          sessionId: request.sessionId || 'default',
          messageId: this.generateMessageId(),
          timestamp: new Date(),
          model: model,
          success: true
        };

        logger.info(`Generated response for session: ${chatResponse.sessionId}`);
        return chatResponse;
      } else {
        throw new Error('No response generated from Ollama');
      }
    } catch (error) {
      logger.error('Failed to generate response:', error);
      
      const errorResponse: ChatResponse = {
        message: request.message,
        response: this.getFallbackResponse(),
        sessionId: request.sessionId || 'default',
        messageId: this.generateMessageId(),
        timestamp: new Date(),
        model: request.model || this.config.model,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      return errorResponse;
    }
  }

  async streamResponse(request: ChatRequest): Promise<AsyncGenerator<string, void, unknown>> {
    const model = request.model || this.config.model;
    const contextPrompt = this.buildContextPrompt(request.message, request.context);
    
    const ollamaRequest = {
      model: model,
      prompt: contextPrompt,
      stream: true,
      options: {
        temperature: this.config.temperature || 0.7,
        num_predict: this.config.maxTokens || 500,
        top_k: 40,
        top_p: 0.9,
        repeat_penalty: 1.1
      }
    };

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/generate`,
        ollamaRequest,
        {
          responseType: 'stream',
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return this.parseStreamingResponse(response.data);
    } catch (error) {
      logger.error('Failed to stream response:', error);
      throw error;
    }
  }

  private buildContextPrompt(message: string, context?: Record<string, any>): string {
    // Check if this is a simple greeting or casual conversation
    if (this.isSimpleGreeting(message)) {
      return `You are an AI assistant representing a skilled full-stack developer named ${knowledgeBase.personalInfo.name}.

User: ${message}

Please respond with a brief, friendly greeting. Keep it short and natural. Don't go into details about experience unless specifically asked.

Answer:`;
    }

    // Start with a basic context for more detailed questions
    let prompt = `You are an AI assistant representing a skilled full-stack developer. Here are the key facts about them:

Name: ${knowledgeBase.personalInfo.name}
Title: ${knowledgeBase.personalInfo.title}`;

    // Only add summary for more detailed questions
    if (this.isAboutPersonal(message) || this.isAboutExperience(message)) {
      prompt += `\nSummary: ${knowledgeBase.personalInfo.summary}`;
    }

    // Add relevant context based on question type
    if (this.isAboutSkills(message)) {
      prompt += `\n\nProgramming Languages: ${knowledgeBase.skills.languages.join(', ')}`;
      prompt += `\nTechnical Skills: ${knowledgeBase.skills.technical.slice(0, 10).join(', ')}`;
      prompt += `\nFrameworks: ${knowledgeBase.skills.frameworks.join(', ')}`;
    }

    if (this.isAboutExperience(message)) {
      prompt += `\n\nWork Experience:`;
      knowledgeBase.experience.forEach(exp => {
        prompt += `\n• ${exp.position} at ${exp.company} (${exp.duration})`;
        prompt += `\n  ${exp.description}`;
      });
    }

    if (this.isAboutProjects(message)) {
      prompt += `\n\nKey Projects:`;
      knowledgeBase.projects.slice(0, 2).forEach(proj => {
        prompt += `\n• ${proj.name}: ${proj.description}`;
      });
    }

    // Add the user's question and instruction
    prompt += `\n\nUser Question: ${message}`;
    
    // Provide different instructions based on question type
    if (this.isSimpleGreeting(message)) {
      prompt += `\n\nPlease respond with a brief, friendly greeting. Keep it short and conversational.`;
    } else if (this.isAboutSkills(message) || this.isAboutExperience(message) || this.isAboutProjects(message)) {
      prompt += `\n\nPlease answer as if you are this developer, using "I" statements. Be specific and reference the relevant information provided above.`;
    } else {
      prompt += `\n\nPlease answer as if you are this developer, using "I" statements. Keep your response focused and relevant to the question.`;
    }
    
    prompt += `\n\nAnswer:`;

    return prompt;
  }

  private isAboutProjects(message: string): boolean {
    const projectKeywords = ['project', 'built', 'developed', 'created', 'portfolio', 'github', 'demo'];
    return projectKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isAboutEducation(message: string): boolean {
    const educationKeywords = ['education', 'degree', 'university', 'college', 'study', 'course', 'certification'];
    return educationKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isAboutPersonal(message: string): boolean {
    const personalKeywords = ['who are you', 'about you', 'your name', 'contact', 'location', 'email', 'phone'];
    return personalKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isAboutSkills(message: string): boolean {
    const skillKeywords = ['skill', 'technology', 'programming', 'language', 'framework', 'tool', 'tech stack', 'expertise'];
    return skillKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isAboutExperience(message: string): boolean {
    const experienceKeywords = ['experience', 'work', 'job', 'company', 'role', 'position', 'career', 'professional'];
    return experienceKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isSimpleGreeting(message: string): boolean {
    const greetingKeywords = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'what\'s up', 'greetings'];
    const normalizedMessage = message.toLowerCase().trim();
    
    // Check for exact matches or very short messages with greeting words
    return greetingKeywords.some(keyword => 
      normalizedMessage === keyword || 
      (normalizedMessage.length <= 20 && normalizedMessage.includes(keyword))
    );
  }

  private async* parseStreamingResponse(stream: any): AsyncGenerator<string, void, unknown> {
    let buffer = '';
    
    for await (const chunk of stream) {
      buffer += chunk.toString();
      const lines = buffer.split('\\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              yield data.response;
            }
            if (data.done) {
              return;
            }
          } catch (error) {
            logger.error('Failed to parse streaming response:', error);
          }
        }
      }
    }
  }

  private getFallbackResponse(): string {
    const fallbacks = chatPrompts.fallbackResponses;
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const createOllamaService = (config: OllamaConfig): OllamaService => {
  return new OllamaService(config);
};
