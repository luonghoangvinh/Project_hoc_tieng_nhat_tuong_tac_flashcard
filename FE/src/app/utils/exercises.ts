
import { JLPTLevel, Question, QuestionType } from '../types';
const API_URL = import.meta.env.VITE_API_URL;

export interface Exercise {
  _id: string;
  title: string;
  questionIDs: string[]; // List of question IDs associated with this exercise
  description: string;
  type: QuestionType;
  level: JLPTLevel;
  questionCount: number;
  timeLimit: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  score?: number;
  progressId?: string;
}

// Generate mock exercises
export const generateExercises = (): Exercise[] => {
  const exercises: Exercise[] = [];


  return exercises;
};

const token = localStorage.getItem('access_token');
export async function getExercises() {
  const res = await fetch(`${API_URL}/exercises`);
  return res.json();
}

function getTypeName(type: QuestionType): string {
  const names: Record<QuestionType, string> = {
    vocabulary: 'Từ vựng',
    grammar: 'Ngữ pháp',
    listening: 'Nghe hiểu',
    reading: 'Đọc hiểu'
  };
  return names[type];
}



export function getExercisesByTypeAndLevel(userId: string, type: QuestionType, level: JLPTLevel){
  const getExercises = async (type: QuestionType, level: JLPTLevel) => {
    try {
      const exercises = await fetch(`${API_URL}/exercises/findBy?userId=${userId}&type=${type}&level=${level}`,
        {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
      );
      const data: Exercise[] = await exercises.json();
      return data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
  }
  return getExercises(type, level);
}



export async function getExerciseById(userId: string, id: string): Promise<Exercise | undefined> {
  try{
    const exercise = await fetch(`${API_URL}/exercises/ByUserIandId?id=${id}&userId=${userId}`);
    const data: Exercise = await exercise.json();
    return data;
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return undefined;
  }
}

export async function getExercisesQuestion(exerciseId: string): Promise<Question[]> {
  try{
    const res= await fetch(`${API_URL}/exercises/${exerciseId}/questions`);
    const data: Question[] = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching exercise questions:', error);
    return [];
  }
}
