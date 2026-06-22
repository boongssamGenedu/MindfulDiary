"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { GraduationCap, ArrowLeft, Lock, Mail, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TeacherLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 제출 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Firebase Auth를 이용해 이메일과 비밀번호로 로그인 인증을 요청합니다.
      await signInWithEmailAndPassword(auth, email, password);
      // 로그인 성공 시 교사용 대시보드로 이동합니다.
      router.push("/teacher/dashboard");
    } catch (err: any) {
      console.error("로그인 실패:", err);
      // 한국어 에러 메시지로 변환하여 보여줍니다.
      if (err.code === "auth/invalid-email" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (err.code === "auth/too-many-requests") {
        setError("너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해 주세요.");
      } else {
        setError("로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      {/* 뒤로가기 버튼 */}
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        메인으로 돌아가기
      </Link>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        {/* 상단 타이틀 */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 font-[family-name:'Noto Sans KR']">선생님 로그인</h2>
          <p className="text-sm text-slate-400">등록한 이메일과 비밀번호로 로그인해 주세요.</p>
        </div>

        {/* 에러 피드백 */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">이메일 주소</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm text-slate-800"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">비밀번호</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm text-slate-800"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          계정이 없으신 경우 Firebase Console에서 <br />
          이메일/비밀번호 인증 제공업체를 활성화하고 사용자를 등록해 주세요.
        </div>
      </div>
    </div>
  );
}
