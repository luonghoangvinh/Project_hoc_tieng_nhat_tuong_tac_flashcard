import { Deck, Flashcard } from '../types';
import { getAuthHeaders } from './apiHeaders';
const API_URL = import.meta.env.VITE_API_URL;
const DECKS_STORAGE_KEY = 'jlpt_decks';
// Get all decks
export async function getDecks(id:string):Promise<Deck[]>{
  try{
    const res =await fetch(`${API_URL}/decks/user/${id}`, { headers: getAuthHeaders() })
    const data=await res.json()
    return data;
  } catch(err){
    throw (err);
  }
}

// Get deck by ID
export async function getDeckById(id: string) {
  const deckData = await fetch(`${API_URL}/decks/${id}`, { headers: getAuthHeaders() });
  const deck = await deckData.json();
  return deck;
}

// Save all decks
function saveDecks(decks: Deck[]) {
  localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
}

// Create new deck
export async function createDeck(userId:string,name: string, description: string, cards:Flashcard[], color?: string, icon?: string, visibility?: 'personal' | 'community') {
  try {
    const newDeck = {
      //_id: `deck-${Date.now()}`,
      userId: userId,
      name,
      description,
      //cardCount: 0,
      cards: cards||[],
      color: color || '#3B82F6',
      icon: icon || '📚',
      visibility: visibility || 'personal'
    };
    newDeck.cards=newDeck.cards?.map(c=>{
    if(c._id) {
      const {_id,...card}=c;
      return card;
    }
    else return c;
})
    const res = await fetch(`${API_URL}/decks`,{
    method:"POST",
    headers:{
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(newDeck),
    }
    )
    const data= await res.json();
    return data;
  } catch (err) {
    throw (err)
  }
}

// Update deck
export async function updateDeck(id: string, updates: Partial<Deck>): Promise<boolean> {
  updates.cards=updates.cards?.map(c=>{
    if(c._id) {
      const {_id,...card}=c;
      return card;
    }
    else return c;
})
  const res= await fetch(`${API_URL}/decks/${id}`,{
    method: "PATCH",
    headers:{
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  })
  if(res.ok)
  return true;
else return false;
}

// Delete deck
export async function deleteDeck(id: string): Promise<boolean> {
  const res=await fetch(`${API_URL}/decks/${id}`,{method:"DELETE", headers: getAuthHeaders()})
  const data=res.ok;
  if(data)
  return true;
else return false;
}

// Duplicate deck
export async function duplicateDeck(id: string): Promise<Deck | null> {
  const res= await fetch(`${API_URL}/decks/${id}/duplicate`,{
    method:'POST',
    headers:{
      "Content-Type":"application/json",
      ...getAuthHeaders(),
    }
  })
  const data=await res.json();
  return data;
}

// Add card to deck
export async function addCardToDeck(userId:string,deckId: string, card: Omit<Flashcard, 'id'>): Promise<boolean> {
  const decks:Deck[] = await getDecks(userId);
  const deckIndex = decks.findIndex(d => d._id === deckId);
  if (deckIndex === -1) return false;

  const newCard: Flashcard = {
    ...card
  };

  decks[deckIndex].cards.push(newCard);
  decks[deckIndex].cards.length = decks[deckIndex].cards.length;
  saveDecks(decks);
  return true;
}

// Update card in deck
export async function updateCard(userId:string,deckId: string, cardId: string, updates: Partial<Flashcard>): Promise<boolean> {
  const decks :Deck[]= await getDecks(userId);
  const deckIndex = decks.findIndex(d => d._id === deckId);
  if (deckIndex === -1) return false;

  const cardIndex = decks[deckIndex].cards.findIndex(c => c._id === cardId);
  if (cardIndex === -1) return false;

  decks[deckIndex].cards[cardIndex] = {
    ...decks[deckIndex].cards[cardIndex],
    ...updates,
    _id: cardId // Preserve ID
  };

  saveDecks(decks);
  return true;
}

// Delete card from deck
export async function deleteCard(userId:string,deckId: string, cardId: string): Promise<boolean> {
  
  const decks:Deck[] = await getDecks(userId);
  const deckIndex = decks.findIndex(d => d._id === deckId);
  if (deckIndex === -1) return false;

  const originalLength = decks[deckIndex].cards.length;
  decks[deckIndex].cards = decks[deckIndex].cards.filter(c => c._id !== cardId);

  if (decks[deckIndex].cards.length === originalLength) return false;

  decks[deckIndex].cards.length = decks[deckIndex].cards.length;
  saveDecks(decks);
  return true;
}

// Duplicate card
export async function duplicateCard(userId:string,deckId: string, cardId: string): Promise<boolean> {
  const deck = await getDeckById(deckId);
  if (!deck) return false;

  const card = deck.cards.find((c:Flashcard) => c._id === cardId);
  if (!card) return false;

  const newCard: Flashcard = {
    ...card,
    //id: `card-${Date.now()}-${Math.random()}`,
    //status: 'new'
  };

  return addCardToDeck(userId,deckId, newCard);
}

// Export deck to JSON
export function exportDeck(id: string): string | null {
  const deck = getDeckById(id);
  if (!deck) return null;
  return JSON.stringify(deck, null, 2);
}

// Import deck from JSON
export async function importDeck(userId:string,jsonString: string): Promise<Deck | null> {
  try {
    const deck = JSON.parse(jsonString) as Deck;
    deck._id = `deck-${Date.now()}`;
    deck.createdAt = new Date();

    const decks:Deck[] = await getDecks(userId);
    decks.push(deck);
    saveDecks(decks);
    return deck;
  } catch {
    return null;
  }
}
