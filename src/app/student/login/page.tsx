"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkStudentLogin } from "@/lib/firestore";
import { BookOpen, ArrowLeft, User, Hash, Loader2 } from "lucide-react";
import Link from "next/link";

export default function StudentLogin() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 학생 로그인 시도 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const num = parseInt(studentNumber, 10);
    if (!name.trim() || isNaN(num)) {
      setError("이름과 번호를 바르게 입력했는지 확인해 주세요.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. 데이터베이스(Firestore)에서 등록된 학생이 맞는지 검사합니다.
      const loginResult = await checkStudentLogin(name.trim(), num);
      
      if (!loginResult.success || !loginResult.student) {
        setError(loginResult.error || "등록되지 않은 학생입니다. 선생님께 확인해 보세요!");
        setIsLoading(false);
        return;
      }

      // 3. 브라우저 세션에 학생 정보를 저장하여 화면 이동 후에도 누군지 인지하게 합니다.
      const studentSession = {
        id: loginResult.student.id,
        name: loginResult.student.name,
        studentNumber: loginResult.student.studentNumber,
      };
      sessionStorage.setItem("student_session", JSON.stringify(studentSession));

      // 4. 일기장 페이지로 이동합니다.
      router.push("/student/diary");
    } catch (err: any) {
      console.error("학생 로그인 에러:", err);
      setError("로그인하는 도중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      {/* 뒤로가기 */}
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        메인으로 돌아가기
      </Link>

      {/* 어린이 친화적인 따뜻한 노란색/피치톤 카드 디자인 */}
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-amber-100 shadow-xl space-y-6">
        
        {/* 상단 타이틀 */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 font-[family-name:'Noto Sans KR']">
            나의 마음일기장
          </h2>
          <p className="text-sm text-slate-400">
            선생님이 알려주신 이름과 번호를 적어보세요!
          </p>
        </div>

        {/* 오류 안내 피드백 */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-semibold text-center">
            ⚠️ {error}
          </div>
        )}

        {/* 폼 입력구역 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1">나의 이름</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <User className="w-4 h-4 text-amber-500" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 적어주세요"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-base text-slate-800"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1">나의 번호 (학번)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Hash className="w-4 h-4 text-amber-500" />
              </span>
              <input
                type="number"
                required
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="번호를 적어주세요 (예: 7)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-base text-slate-800"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                문 열어주세요...
              </>
            ) : (
              "일기장 열기"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
