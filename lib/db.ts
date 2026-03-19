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
