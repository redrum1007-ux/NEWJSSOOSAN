import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestoreDB } from './firebase';

export async function readDB<T>(name: string, defaultValue: T[] = []): Promise<T[]> {
  try {
    const docRef = doc(firestoreDB, 'jsonDB', name);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return defaultValue;
    }
    
    const data = docSnap.data();
    return (data?.data as T[]) || defaultValue;
  } catch (error) {
    console.error(`Error reading ${name} from Firestore:`, error);
    return defaultValue;
  }
}

export async function writeDB<T>(name: string, data: T[]): Promise<void> {
  try {
    const docRef = doc(firestoreDB, 'jsonDB', name);
    await setDoc(docRef, { data });
  } catch (error) {
    console.error(`Error writing ${name} to Firestore:`, error);
  }
}

// 개별 문서(상품 등 용량이 큰 데이터용) 컬렉션 관리 함수
import { collection, getDocs, deleteDoc } from 'firebase/firestore';

export async function readCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(firestoreDB, collectionName);
    const snap = await getDocs(colRef);
    if (snap.empty) return [];
    return snap.docs.map(d => d.data() as T);
  } catch (error) {
    console.error(`Error reading collection ${collectionName}:`, error);
    return [];
  }
}

// 에러 발생 시 null, 실제로 비어있으면 [] 반환 (빈 DB와 읽기 오류를 구분)
export async function readCollectionSafe<T>(collectionName: string): Promise<T[] | null> {
  try {
    const colRef = collection(firestoreDB, collectionName);
    const snap = await getDocs(colRef);
    if (snap.empty) return [];
    return snap.docs.map(d => d.data() as T);
  } catch (error) {
    console.error(`Error reading collection ${collectionName}:`, error);
    return null; // 에러 시 null 반환 (빈 배열과 구분)
  }
}

export async function setDocument<T extends Record<string, any>>(collectionName: string, id: string, data: T): Promise<void> {
  const docRef = doc(firestoreDB, collectionName, id);
  await setDoc(docRef, data); // 에러 발생 시 호출부로 throw 하여 API가 500 에러를 반환하게 함
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const docRef = doc(firestoreDB, collectionName, id);
  await deleteDoc(docRef);
}
