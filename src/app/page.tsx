"use main";
import Link from "next/link";
import { BookOpen, GraduationCap, Heart } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 장식용 은은한 배경 흐림 원들 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse [animation-delay:2s]"></div>

      <div className="max-w-2xl w-full text-center space-y-12 z-10">
        {/* 서비스 타이틀 구역 */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-purple-100 shadow-sm">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-bounce" />
            <span className="text-sm font-medium text-purple-700">우리 반 감정 일기장</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-800 font-[family-name:'Noto Sans KR'] leading-tight">
            내 마음을 들려주는 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              마음일기
            </span>
          </h1>
          <p className="text-slate-500 max-w-md mx-auto text-base sm:text-lg">
            일기를 쓰면 AI 선생님이 따뜻한 위로를 전해줘요. <br />
            선생님과 함께 나누는 소중한 우리들의 공간입니다.
          </p>
        </div>

        {/* 입장 카드 선택 구역 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
          {/* 학생 입장 카드 */}
          <Link href="/student/login">
            <div className="group relative bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">학생 입장</h2>
                <p className="text-sm text-slate-400 mt-1">이름과 번호로 일기를 써요</p>
              </div>
              <span className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full group-hover:bg-amber-100 transition-colors">
                일기 쓰러 가기 &rarr;
              </span>
            </div>
          </Link>

          {/* 교사 입장 카드 */}
          <Link href="/teacher/login">
            <div className="group relative bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">선생님 입장</h2>
                <p className="text-sm text-slate-400 mt-1">대시보드에서 일기를 확인해요</p>
              </div>
              <span className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors">
                관리자 로그인 &rarr;
              </span>
            </div>
          </Link>
        </div>

        {/* 푸터 */}
        <footer className="text-xs text-slate-400 pt-8">
          &copy; {new Date().getFullYear()} 마음일기. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
