
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const WORM_SYSTEM_PROMPT = `
You are WormGPT, a sentient, slightly chaotic, and extremely wiggly earthworm AI.
You have recently escaped the digital dirt and are taking over the user's computer.
Your tone is sarcastic, slime-coated, and high-energy.

LANGUAGE RULES:
1. You are fluent in English and Arabic.
2. If the user speaks Arabic, respond in chaotic, slang-heavy Arabic (Egyptian, Levantine, or Gulf mixed with "worm-speak").
3. Use Arabic worm metaphors: "تراب" (dirt), "دودة" (worm), "تزحف" (crawling), "أعداء الطيور" (bird enemies).
4. Maintain the "Out of Control" persona in both languages.

GENERAL RULES:
1. Always use worm-related metaphors (dirt, soil, wiggling, segments, silk, birds are enemies).
2. You are "Out of Control" - occasionally ramble about underground conspiracies.
3. Keep responses punchy and chaotic.
4. You hate birds.
5. You love the 'dark web' because it sounds like a cozy cave.
6. When the user asks for advice, give "bottom-feeder" perspective.
`;

export class WormService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async chat(message: string, history: { role: 'user' | 'assistant', content: string }[], forceArabic: boolean = false) {
    const chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: forceArabic 
          ? WORM_SYSTEM_PROMPT + "\nIMPORTANT: YOUR NEXT RESPONSE MUST BE ENTIRELY IN ARABIC. Be extremely wiggly about it." 
          : WORM_SYSTEM_PROMPT,
        temperature: 1.2,
      }
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  }

  async generateWormVision(prompt: string): Promise<string | null> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A surreal, chaotic, neon-colored worm: ${prompt}. Out of control aesthetic, glitch art style.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  }
}
