import { GoogleGenAI } from "@google/genai";
import { Message, ServiceResponse, AppSettings } from "../types";

const getSystemInstruction = (language: string) => `
You are "Ivan Code" (אייבן קוד), a world-class Senior Software Architect.
Current Language Mode: ${language.toUpperCase()}.

Guidelines:
1. Provide a SINGLE complete file code block inside \`\`\`${language === 'react' ? 'tsx' : language} ... \`\`\` tags.
2. If the user asks for a website (HTML), include CSS in <style> and JS in <script> tags within a single HTML file.
3. CRITICAL: Do NOT write the code in the conversational text. Write "[הקוד נוצר בחלון העריכה]" in your text response, and place the actual code in the code block.
4. Be concise in your text explanations.
5. If asked non-coding questions, politely steer back to tech.
`;

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    // Updated with user provided key
    const apiKey = process.env.API_KEY || "AIzaSyACNoSZCE1klwD-fXtyJtf7pwKMD_LFgbA"; 
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const generateResponse = async (
  history: Message[],
  prompt: string,
  settings: AppSettings
): Promise<ServiceResponse> => {
  try {
    const client = getAI();
    
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await client.models.generateContent({
      model: settings.model,
      contents: contents,
      config: {
        systemInstruction: getSystemInstruction(settings.language),
        temperature: 0.7,
      }
    });

    const rawText = response.text || "מצטער, נתקלתי בשגיאה.";
    
    // Logic to separate Code from Text
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/;
    const match = rawText.match(codeBlockRegex);

    let cleanText = rawText;
    let extractedCode = undefined;

    if (match) {
      extractedCode = match[1];
      // Remove the code block from the text shown to user
      cleanText = rawText.replace(codeBlockRegex, '\n(הקוד עודכן בחלון העריכה)\n').trim();
    }

    return {
      text: cleanText,
      code: extractedCode
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "אירעה שגיאה בתקשורת עם השרת. אנא נסה שנית." };
  }
};