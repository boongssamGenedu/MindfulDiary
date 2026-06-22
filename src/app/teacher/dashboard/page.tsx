"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  addStudent, 
  addStudentsBatch, 
  getStudents, 
  getAllDiaries,
  Student,
  Diary
} from "@/lib/firestore";
import { 
  GraduationCap, LogOut, UserPlus, Upload, Users, Loader2, AlertCircle, CheckCircle,
  FileSpreadsheet, BookHeart, Calendar, Heart
} from "lucide-react";
import Papa from "papaparse";

export default function TeacherDashboard() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // 탭 상태 (학생 관리 vs 일기 모아보기)
  const [activeTab, setActiveTab] = useState<'students' | 'diaries'>('students');

  // 학생 데이터 상태
  const [students, setStudents] = useState<Student[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);
  
  // 일기 데이터 상태
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isDiariesLoading, setIsDiariesLoading] = useState(false);

  // 개별 등록용 폼 상태
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/teacher/login");
      } else {
        setIsAuthLoading(false);
        fetchStudents();
        fetchDiaries();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchStudents = async () => {
    setIsStudentsLoading(true);
    const result = await getStudents();
    if (result.success && result.data) setStudents(result.data);
    setIsStudentsLoading(false);
  };

  const fetchDiaries = async () => {
    setIsDiariesLoading(true);
    const result = await getAllDiaries();
    if (result.success && result.data) setDiaries(result.data);
    setIsDiariesLoading(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  // 개별 학생 등록
  const handleAddSingleStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(""); setErrorMessage("");
    const num = parseInt(newNumber, 10);
    if (!newName.trim() || isNaN(num)) {
      setErrorMessage("이름과 올바른 번호를 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);
    const result = await addStudent(newName.trim(), num);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(`${newName} 학생이 성공적으로 등록되었습니다.`);
      setNewName(""); setNewNumber("");
      fetchStudents();
    } else {
      setErrorMessage(result.error || "학생 등록에 실패했습니다.");
    }
  };

  // CSV 일괄 업로드
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuccessMessage(""); setErrorMessage("");
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedData = results.data as any[];
        const studentsToAdd: { name: string; studentNumber: number }[] = [];

        for (let i = 0; i < parsedData.length; i++) {
          const row = parsedData[i];
          const name = row["이름"] || row["name"];
          const numStr = row["번호"] || row["number"];
          const studentNumber = parseInt(numStr, 10);

          if (!name || isNaN(studentNumber)) {
            setErrorMessage(`${i + 1}번째 줄 데이터 형식이 올바르지 않습니다.`);
            setIsSubmitting(false); return;
          }
          studentsToAdd.push({ name: name.trim(), studentNumber });
        }

        if (studentsToAdd.length === 0) {
          setErrorMessage("등록할 데이터가 없습니다.");
          setIsSubmitting(false); return;
        }

        const result = await addStudentsBatch(studentsToAdd);
        setIsSubmitting(false);

        if (result.success) {
          setSuccessMessage(`${studentsToAdd.length}명의 학생이 일괄 등록되었습니다.`);
          fetchStudents();
        } else {
          setErrorMessage(result.error || "일괄 등록 과정에서 오류가 발생했습니다.");
        }
      },
    });
  };

  // 감정 태그 색상 렌더링 헬퍼
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case "기뻐요": return "bg-amber-100 text-amber-700 border-amber-200";
      case "평온해요": return "bg-green-100 text-green-700 border-green-200";
      case "슬퍼요": return "bg-blue-100 text-blue-700 border-blue-200";
      case "화나요": return "bg-rose-100 text-rose-700 border-rose-200";
      case "불안해요": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 font-[family-name:'Noto Sans KR']">마음일기 교사 대시보드</h1>
            <div className="flex gap-4 mt-1">
              <button 
                onClick={() => setActiveTab('students')}
                className={`text-sm font-semibold transition-colors ${activeTab === 'students' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                학생 관리
              </button>
              <button 
                onClick={() => setActiveTab('diaries')}
                className={`text-sm font-semibold transition-colors ${activeTab === 'diaries' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                우리 반 일기 보기
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto p-6">
        
        {/* ===================== [학생 관리 탭] ===================== */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="space-y-6 lg:col-span-1">
              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-md space-y-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-purple-600" /> 개별 학생 등록
                </h2>
                <form onSubmit={handleAddSingleStudent} className="space-y-3">
                  <input type="text" placeholder="학생 이름" required value={newName} onChange={(e) => setNewName(e.target.value)} disabled={isSubmitting} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm" />
                  <input type="number" placeholder="번호 (예: 1)" required value={newNumber} onChange={(e) => setNewNumber(e.target.value)} disabled={isSubmitting} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm" />
                  <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-all flex justify-center gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "추가하기"}
                  </button>
                </form>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-md space-y-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" /> CSV 일괄 등록
                </h2>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition-all">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <FileSpreadsheet className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                    <p className="text-xs text-slate-500 font-medium mt-2">CSV 파일 선택</p>
                  </div>
                  <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} disabled={isSubmitting} />
                </label>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-md flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" /> 등록된 학생 명단
                </h2>
                <button onClick={fetchStudents} className="text-xs text-purple-600 font-semibold">새로고침</button>
              </div>
              {isStudentsLoading ? (
                <div className="flex-1 flex justify-center items-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : students.length === 0 ? (
                <div className="flex-1 flex justify-center items-center text-sm text-slate-400">등록된 학생이 없습니다.</div>
              ) : (
                <div className="overflow-x-auto flex-1 mt-4">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50/50 rounded-lg">
                      <tr><th className="px-6 py-3">학번/번호</th><th className="px-6 py-3">이름</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700">{s.studentNumber}번</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{s.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== [우리 반 일기 탭] ===================== */}
        {activeTab === 'diaries' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BookHeart className="w-6 h-6 text-rose-500" /> 학생들이 쓴 마음 일기
              </h2>
              <button onClick={fetchDiaries} className="text-sm px-4 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                최신순 새로고침
              </button>
            </div>

            {isDiariesLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : diaries.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-md p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
                <p className="text-slate-500 font-medium">아직 작성된 일기가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {diaries.map((diary) => (
                  <div key={diary.id} className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-all space-y-4 flex flex-col">
                    {/* 카드 헤더 (이름, 날짜, 감정) */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                          {diary.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-base">{diary.studentName} 학생</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {diary.createdAt.toLocaleDateString()} {diary.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getEmotionColor(diary.emotion)}`}>
                        {diary.emotion}
                      </span>
                    </div>
                    
                    {/* 학생 일기 내용 */}
                    <div className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap flex-1 bg-slate-50/50 p-4 rounded-2xl">
                      {diary.content}
                    </div>

                    {/* AI 피드백 내용 */}
                    <div className="mt-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 relative">
                      <div className="absolute -top-3 -left-2 bg-rose-400 rounded-full p-1.5 text-white shadow-sm">
                        <Heart className="w-3 h-3 fill-white" />
                      </div>
                      <h4 className="text-xs font-bold text-amber-800 mb-1 ml-4">AI 선생님의 답장</h4>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap ml-4">
                        {diary.aiResponse}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
