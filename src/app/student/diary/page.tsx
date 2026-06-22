"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Smile, Frown, Angry, CloudRain, Sun, Send, LogOut, Loader2, Sparkles, Heart } from "lucide-react";
import { saveDiary } from "@/lib/firestore";
import { generateTeacherFeedback } from "@/app/actions/ai";

// 오늘의 기분 옵션들
const MOODS = [
  { id: "기뻐요", label: "기뻐요", icon: Smile, color: "bg-amber-100 text-amber-600 border-amber-200" },
  { id: "평온해요", label: "평온해요", icon: Sun, color: "bg-green-100 text-green-600 border-green-200" },
  { id: "슬퍼요", label: "슬퍼요", icon: CloudRain, color: "bg-blue-100 text-blue-600 border-blue-200" },
  { id: "화나요", label: "화나요", icon: Angry, color: "bg-rose-100 text-rose-600 border-rose-200" },
  { id: "불안해요", label: "불안해요", icon: Frown, color: "bg-purple-100 text-purple-600 border-purple-200" },
];

export default function StudentDiary() {
  const router = useRouter();
  const [student, setStudent] = useState<{ id: string; name: string; studentNumber: number } | null>(null);
  
  // 폼 상태
  const [selectedMood, setSelectedMood] = useState<string>("평온해요");
  const [diaryContent, setDiaryContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI 응답 상태
  const [aiResponse, setAiResponse] = useState<string>("");

  // 화면이 켜지면 저장해둔 학생 로그인 정보를 불러옵니다.
  useEffect(() => {
    const sessionData = sessionStorage.getItem("student_session");
    if (!sessionData) {
      alert("로그인이 필요합니다!");
      router.push("/student/login");
      return;
    }
    setStudent(JSON.parse(sessionData));
  }, [router]);

  // 로그아웃 처리
  const handleLogout = () => {
    sessionStorage.removeItem("student_session");
    router.push("/");
  };

  // 새 일기 쓰기 (초기화)
  const handleReset = () => {
    setDiaryContent("");
    setAiResponse("");
    setSelectedMood("평온해요");
  };

  // 일기 제출 처리 (AI에게 보내기)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryContent.trim()) {
      alert("일기 내용을 조금 더 적어주세요!");
      return;
    }
    
    if (!student) return;

    setIsSubmitting(true);
    
    try {
      // 1. Next.js 서버(Server Actions)로 일기 내용을 안전하게 전달하여 AI 답장을 받아옵니다.
      const result = await generateTeacherFeedback(
        student.name,
        selectedMood,
        diaryContent
      );
      
      if (!result.success || !result.feedback) {
        throw new Error(result.error || "답장을 받아오지 못했습니다.");
      }
      
      const responseText = result.feedback;
      
      // 2. 응답 결과 화면에 표시
      setAiResponse(responseText);

      // 3. Firestore 데이터베이스에 일기와 AI 피드백 저장
      await saveDiary(
        student.id,
        student.name,
        diaryContent,
        responseText,
        selectedMood
      );

    } catch (error) {
      console.error("AI 일기 분석 오류:", error);
      alert("선생님과 연결하는 도중 문제가 생겼어요. 다시 시도해 볼까요?");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!student) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-4 sm:p-6 lg:py-10">
      
      {/* 헤더 */}
      <header className="flex items-center justify-between mb-8 bg-white/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-300 to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {student.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              안녕, <span className="text-amber-600">{student.name}</span> 친구! 👋
            </h1>
            <p className="text-xs text-slate-500">오늘은 어떤 하루를 보냈나요?</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          나가기
        </button>
      </header>

      {/* 메인 일기장 영역 */}
      <div className="bg-white/90 backdrop-blur-md rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col flex-1">
        
        {/* 상단: 기분 선택 (결과가 나오면 숨김) */}
        {!aiResponse && (
          <div className="bg-slate-50/50 p-6 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700 mb-4 text-center">오늘의 내 기분은 어떤가요?</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {MOODS.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood.id)}
                    className={`
                      flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-300
                      ${isSelected ? mood.color + ' scale-110 shadow-md ring-2 ring-offset-1 ring-current' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:scale-105'}
                    `}
                  >
                    <Icon className="w-8 h-8 mb-1.5" />
                    <span className="text-xs font-bold">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 중단: 일기 작성 텍스트 영역 */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-6">
          <div className="flex-1 relative mb-6">
            <textarea
              value={diaryContent}
              onChange={(e) => setDiaryContent(e.target.value)}
              placeholder="여기에 오늘 있었던 일이나 지금 드는 생각, 감정을 솔직하게 적어보세요.&#13;&#10;AI 선생님이 따뜻하게 들어줄 거예요. 😊"
              className="w-full h-full min-h-[250px] p-4 text-base sm:text-lg text-slate-700 placeholder-slate-300 bg-transparent border-0 focus:ring-0 resize-none leading-relaxed"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #f1f5f9 31px, #f1f5f9 32px)',
                lineHeight: '32px',
                backgroundAttachment: 'local'
              }}
              disabled={isSubmitting || !!aiResponse} // 로딩중이거나 이미 결과가 나왔으면 수정 불가
            />
          </div>

          {/* 하단: 제출 버튼 (결과가 없을 때만 표시) */}
          {!aiResponse && (
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting || !diaryContent.trim()}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    선생님에게 편지 쓰는 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-100 group-hover:animate-pulse" />
                    다 썼어요! (AI 선생님께 보내기)
                    <Send className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* AI 선생님의 편지 (결과 영역) */}
        {aiResponse && (
          <div className="p-6 bg-amber-50/50 border-t-2 border-amber-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-tr from-rose-400 to-pink-400 rounded-2xl flex items-center justify-center text-white shadow-lg transform -rotate-12">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 ml-8">AI 선생님의 답장 💌</h3>
              <p className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                {aiResponse}
              </p>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm"
                >
                  새로운 일기 쓰기
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
