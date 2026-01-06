import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface AnalyzedNumber {
  number: string;
  reasoning: string;
  confidence: number;
}

export async function analyzeNewsForNumbers(
  title: string,
  content: string
): Promise<AnalyzedNumber[]> {
  const prompt = `คุณเป็นผู้เชี่ยวชาญด้านการวิเคราะห์ตัวเลขจากข่าวไทย

วิเคราะห์ข่าวต่อไปนี้และหาตัวเลข 3 หลักที่มีความสำคัญ:

หัวข้อ: ${title}

เนื้อหา: ${content}

กฎการวิเคราะห์:
1. หาตัวเลขที่ปรากฏในข่าวโดยตรง เช่น วันที่ เลขทะเบียน เลขที่บ้าน หมายเลขเที่ยวบิน
2. วิเคราะห์ตัวเลขที่เกี่ยวข้องกับเหตุการณ์ เช่น อายุผู้เสียชีวิต จำนวนผู้บาดเจ็บ
3. หากเป็นวันที่ ให้แปลงเป็น 3 หลัก เช่น 15 มกราคม = 015 หรือ 151
4. ให้ตัวเลข 3 หลักเท่านั้น (000-999)
5. หากไม่พบตัวเลขที่เกี่ยวข้อง ให้ตอบ []

ตอบในรูปแบบ JSON array เท่านั้น:
[
  {
    "number": "123",
    "reasoning": "เหตุผลที่เลือกเลขนี้",
    "confidence": 80
  }
]

หากไม่มีตัวเลข ให้ตอบ: []`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]) as AnalyzedNumber[];

    // Validate and filter results
    return parsed
      .filter((item) => {
        const num = parseInt(item.number);
        return !isNaN(num) && num >= 0 && num <= 999 && item.number.length <= 3;
      })
      .map((item) => ({
        number: item.number.padStart(3, "0"),
        reasoning: item.reasoning,
        confidence: Math.min(100, Math.max(0, item.confidence)),
      }));
  } catch (error) {
    console.error("Error analyzing news with Gemini:", error);
    return [];
  }
}
