"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// 환경 변수에서 무료 API 키를 가져옵니다. 
// "use server"가 선언된 이 파일은 서버에서만 실행되므로, 브라우저(클라이언트)에 API 키가 절대 유출되지 않습니다.
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export async function generateTeacherFeedback(
  studentName: string,
  mood: string,
  content: string
) {
  try {
    if (!apiKey) {
      throw new Error("서버에 API 키가 설정되지 않았습니다.");
    }

    // GoogleGenerativeAI 초기화
    const genAI = new GoogleGenerativeAI(apiKey);

    // 빠르고 성능이 좋은 최신 모델 사용
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      systemInstruction: "너는 초등학교 담임 선생님이야. 학생들이 일기 형태로 작성한 글을 읽고, 학생들의 감정에 깊이 공감해주며, 따뜻하고 친절하게 위로와 격려의 한마디를 해주는 역할을 해줘. 초등학생 눈높이에 맞게 쉬운 단어와 존댓말을 사용해줘."
    });

    const prompt = `
      학생 이름: ${studentName}
      오늘의 기분: ${mood}
      일기 내용: ${content}
      
      학생이 쓴 위 일기를 읽고, 학생의 감정에 깊이 공감해주며, 초등학교 담임 선생님의 따뜻하고 친절한 말투로 위로와 격려의 편지 한 통을 작성해줘. 
      학생의 이름을 부르며 시작하고, 내용 길이는 3~4문장 정도로 너무 길지 않게 아이들의 눈높이에 맞춰서 작성해줘.
    `;

    // AI에게 답변 요청
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return { success: true, feedback: responseText };
  } catch (error: any) {
    console.error("서버 AI 통신 오류:", error);
    return { success: false, error: error.message };
  }
}
