import { getAuthHeaders } from './apiHeaders';

const API_URL = import.meta.env.VITE_API_URL;
export interface DayActivity {
  date: string; // YYYY-MM-DD
  exerciseCount: number;
  totalQuestions: number;
  accuracy: number;
}

export interface ExerciseDetail {
  id: string;
  type: string;
  level: string;
  totalQuestions: number;
  correctAnswers: number;
  averageTime: number;
  accuracy: number;
  completedAt: Date;
}

export async function getUserProgress(userId:string){
  const res=await fetch(`${API_URL}/exercise-progress/user/${userId}`, { headers: getAuthHeaders() })
  const activity= await res.json();
  return activity;
}
import { getAuthHeaders } from './apiHeaders';
