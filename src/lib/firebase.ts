// Firebase SDK 앱 초기화 및 서비스 내보내기 파일
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAI, getGenerativeModel } from "firebase/ai";

// Firebase 프로젝트 설정 정보 (환경변수 파일 .env.local 에서 안전하게 로드합니다)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 중복 초기화를 방지하기 위해 이미 초기화된 앱이 있는지 확인한 후 실행합니다.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 1. 데이터베이스(Firestore) 객체 생성 및 내보내기
export const db = getFirestore(app);

// 2. 사용자 인증(Auth) 객체 생성 및 내보내기
export const auth = getAuth(app);

// 3. Firebase AI SDK (Vertex AI) 초기화 및 Gemini 모델 생성
// 학생들의 따뜻한 마음 일기 피드백을 위해 성능과 속도가 조화로운 'gemini-1.5-flash' 모델을 사용합니다.
const vertexAI = getAI(app);
export const aiModel = getGenerativeModel(vertexAI, {
  model: "gemini-3.5-flash",
  // AI의 역할을 친절하고 따뜻한 초등학교 선생님으로 정의하는 설정(systemInstruction)을 미리 부여합니다.
  systemInstruction: "너는 초등학교 담임 선생님이야. 학생들이 일기 형태로 작성한 글을 읽고, 학생들의 감정에 깊이 공감해주며, 따뜻하고 친절하게 위로와 격려의 한마디를 해주는 역할을 해줘. 초등학생 눈높이에 맞게 쉬운 단어와 존댓말을 사용해줘.",
});
