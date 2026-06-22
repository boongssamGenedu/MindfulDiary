// Firestore 데이터베이스 조작을 위한 헬퍼 함수 모음
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  writeBatch, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";

// 학생을 정의하는 TypeScript 타입
export interface Student {
  id?: string;
  name: string;
  studentNumber: number;
  role: "student";
  createdAt?: any;
}

// 일기를 정의하는 TypeScript 타입
export interface Diary {
  id?: string;
  userId: string;
  studentName: string;
  content: string;
  aiResponse: string;
  emotion: string;
  createdAt: any;
}

/**
 * 1. 개별 학생을 데이터베이스에 등록합니다.
 * @param name 학생 이름
 * @param studentNumber 학번(번호)
 */
export async function addStudent(name: string, studentNumber: number) {
  try {
    const studentCollection = collection(db, "students");
    
    // 이미 동일한 학번이나 이름이 등록되어 있는지 사전 검증합니다.
    const q = query(
      studentCollection, 
      where("studentNumber", "==", studentNumber)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { success: false, error: "이미 동일한 번호로 등록된 학생이 있습니다." };
    }

    const docRef = await addDoc(studentCollection, {
      name,
      studentNumber,
      role: "student",
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("학생 추가 오류:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. CSV 일괄 업로드 시 여러 학생을 일괄적으로 한 번에 등록합니다. (Firestore Batch 사용)
 * @param studentsToAdd { name: string, studentNumber: number } 구조의 배열
 */
export async function addStudentsBatch(studentsToAdd: { name: string; studentNumber: number }[]) {
  try {
    const batch = writeBatch(db);
    const studentCollection = collection(db, "students");

    // 성능 향상 및 대량 업로드 처리를 위해 Firestore의 writeBatch를 사용합니다.
    for (const student of studentsToAdd) {
      const newDocRef = doc(studentCollection); // 자동으로 새 문서 ID 발급
      batch.set(newDocRef, {
        name: student.name,
        studentNumber: student.studentNumber,
        role: "student",
        createdAt: serverTimestamp()
      });
    }

    // 일괄 저장 실행
    await batch.commit();
    return { success: true };
  } catch (error: any) {
    console.error("일괄 학생 추가 오류:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. 등록된 모든 학생 목록을 학번(번호) 순으로 조회합니다.
 */
export async function getStudents() {
  try {
    const studentCollection = collection(db, "students");
    const q = query(
      studentCollection, 
      orderBy("studentNumber", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    const students: Student[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      students.push({
        id: doc.id,
        name: data.name,
        studentNumber: data.studentNumber,
        role: data.role,
      });
    });

    return { success: true, data: students };
  } catch (error: any) {
    console.error("학생 목록 조회 오류:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. 학생이 이름과 번호로 로그인할 때 일치하는 정보가 있는지 확인합니다.
 * @param name 입력한 이름
 * @param studentNumber 입력한 학번
 */
export async function checkStudentLogin(name: string, studentNumber: number) {
  try {
    const studentCollection = collection(db, "students");
    const q = query(
      studentCollection,
      where("name", "==", name),
      where("studentNumber", "==", studentNumber)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return { success: false, error: "등록되지 않은 학생입니다. 이름과 번호를 확인해 주세요." };
    }

    // 일치하는 첫 번째 학생 문서 정보를 반환합니다.
    const studentDoc = querySnapshot.docs[0];
    return { 
      success: true, 
      student: { 
        id: studentDoc.id, 
        ...studentDoc.data() 
      } as Student 
    };
  } catch (error: any) {
    console.error("학생 로그인 검증 오류:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. 학생이 작성한 일기와 AI의 피드백을 데이터베이스에 저장합니다.
 * @param userId 학생 문서 ID
 * @param studentName 학생 이름
 * @param content 학생이 작성한 일기 내용
 * @param aiResponse Gemini AI가 작성한 다정한 피드백
 * @param emotion 학생이 선택한 감정
 */
export async function saveDiary(
  userId: string,
  studentName: string,
  content: string,
  aiResponse: string,
  emotion: string
) {
  try {
    const diaryCollection = collection(db, "diaries");
    const docRef = await addDoc(diaryCollection, {
      userId,
      studentName,
      content,
      aiResponse,
      emotion,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("일기 저장 오류:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 6. 교사 대시보드용: 모든 학생이 작성한 일기를 최신순으로 가져옵니다.
 */
export async function getAllDiaries() {
  try {
    const diaryCollection = collection(db, "diaries");
    const q = query(diaryCollection, orderBy("createdAt", "desc"));
    
    const querySnapshot = await getDocs(q);
    const diaries: Diary[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      diaries.push({
        id: doc.id,
        userId: data.userId,
        studentName: data.studentName,
        content: data.content,
        aiResponse: data.aiResponse,
        emotion: data.emotion,
        createdAt: data.createdAt?.toDate() || new Date(), // Timestamp를 Date 객체로 변환
      });
    });

    return { success: true, data: diaries };
  } catch (error: any) {
    console.error("일기 목록 조회 오류:", error);
    return { success: false, error: error.message };
  }
}

