import { UserAnswer, Deck } from '../types';
import { getAuthHeaders } from './apiHeaders';

const STORAGE_KEYS = {
  USER_ANSWERS: 'jlpt_user_answers',
  CUSTOM_DECKS: 'jlpt_custom_decks',
  SAVED_CARDS: 'jlpt_saved_cards'
};

const API_URL = import.meta.env.VITE_API_URL;
// User answers storage
export async function saveUserAnswer(answer: UserAnswer) {
  try{
    const data= await fetch(`${API_URL}/user-answers`,{
      method:"POST",
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(answer),
    })
    return data;
  }catch (err){
    console.log(err);
  }
}

export async function getUserAnswers(userId:string) {
  try{
    const res= await fetch(`${API_URL}/user-answers/user/${userId}`, { headers: getAuthHeaders() })
    return res;
  }catch(err){
    console.log(err);
    throw("lỗi getUserAnswers");
  }
}

export async function getUserStats(userId: string){
  const res= await fetch(`${API_URL}/users/${userId}`, { headers: getAuthHeaders() });
  const userData=await res.json();

  return [userData.point,userData.streak];
}

export function clearUserAnswers(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_ANSWERS);
}



// Custom decks storage
export function saveCustomDeck(deck: Deck): void {
  const decks = getCustomDecks();
  const existingIndex = decks.findIndex(d => d._id === deck._id);
  
  if (existingIndex >= 0) {
    decks[existingIndex] = deck;
  } else {
    decks.push(deck);
  }
  
  localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(decks));
}

export function getCustomDecks(): Deck[] {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_DECKS);
  if (!data) return [];
  
  const decks = JSON.parse(data);
  // Convert date strings back to Date objects
  return decks.map((d: any) => ({
    ...d,
    createdAt: new Date(d.createdAt)
  }));
}

export function deleteCustomDeck(deckId: string): void {
  const decks = getCustomDecks();
  const filtered = decks.filter(d => d._id !== deckId);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(filtered));
}

