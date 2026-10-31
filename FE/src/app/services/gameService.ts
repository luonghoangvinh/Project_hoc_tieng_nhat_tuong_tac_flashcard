/**
 * Game Service
 *
 * Centralizes all game logic: deck lookup, question generation,
 * session persistence, and card study record management.
 *
 * localStorage keys:
 *   jlpt_game_sessions      — GameSession[]
 *   jlpt_card_study_records — Record<deckId_cardId, CardStudyRecord>
 *
 * To connect to a real API: replace the storage functions below with
 * fetch calls using the same return types — UI components do not change.
 */

import { Deck, Flashcard, QuizQuestion, MatchingItem, GameSession, CardStudyRecord, QuizDirection } from '../types';
import { getDecks } from '../utils/deckStorage';
import { mockDecks } from '../data/mockData';
import { mockCommunityDecks } from '../data/mockCommunity';

const SESSIONS_KEY = 'jlpt_game_sessions';
const STUDY_RECORDS_KEY = 'jlpt_card_study_records';
const userStr = localStorage.getItem('user');
const userData = userStr ? JSON.parse(userStr) : null;
const userId = userData ? userData.id : null;
// ─── Deck Lookup ─────────────────────────────────────────────────────────────


// ─── Question Generation ─────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Minimum cards needed to generate a valid quiz question (1 correct + 3 distractors).
 */
export const QUIZ_MIN_CARDS = 4;

/**
 * Generate quiz questions from a list of flashcards.
 * Returns an empty array if there are fewer than QUIZ_MIN_CARDS cards.
 */
export function generateQuizQuestions(
  cards: Flashcard[],
  count: number,
  direction: QuizDirection
): QuizQuestion[] {
  if (cards.length < QUIZ_MIN_CARDS) return [];

  const actualCount = Math.min(count, cards.length);
  const questionCards = shuffle(cards).slice(0, actualCount);

  return questionCards.map(card => {
    const question = direction === 'jp-to-vn' ? card.front : card.back;
    const correctAnswer = direction === 'jp-to-vn' ? card.back : card.front;

    // Pick 3 distractors: other cards' answer field, different from correct
    const distractorPool = cards
      .filter(c => c._id !== card._id)
      .map(c => (direction === 'jp-to-vn' ? c.back : c.front))
      .filter(answer => answer !== correctAnswer && answer.trim() !== '');

    const distractors = shuffle(distractorPool).slice(0, 3);

    // If not enough unique distractors, still proceed with what we have
    const allOptions = shuffle([correctAnswer, ...distractors]);
    const correctIndex = allOptions.indexOf(correctAnswer);

    return {
      cardId: card._id??"",
      question,
      correctAnswer,
      options: allOptions,
      correctIndex,
      direction
    };
  });
}

// ─── Matching Game ────────────────────────────────────────────────────────────

export const MATCHING_MIN_CARDS = 4;
export const MATCHING_MAX_PAIRS = 8;

/**
 * Generate shuffled left and right columns for a matching game.
 */
export function generateMatchingColumns(
  cards: Flashcard[],
  pairCount: number
): { leftItems: MatchingItem[]; rightItems: MatchingItem[] } {
  const clampedCount = Math.min(pairCount, cards.length, MATCHING_MAX_PAIRS);
  const selectedCards = shuffle(cards).slice(0, clampedCount);

  const leftItems: MatchingItem[] = selectedCards.map(card => ({
    id: `left-${card._id}`,
    text: card.front,
    pairId: card._id??"",
    state: 'idle'
  }));

  const rightItems: MatchingItem[] = shuffle(
    selectedCards.map(card => ({
      id: `right-${card._id}`,
      text: card.back,
      pairId: card._id??"",
      state: 'idle' as const
    }))
  );

  return { leftItems, rightItems };
}

// ─── Game Sessions ────────────────────────────────────────────────────────────

export function saveGameSession(session: GameSession): void {
  const sessions = getGameSessions();
  sessions.push(session);
  // Keep last 200 sessions to avoid unlimited growth
  const trimmed = sessions.slice(-200);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
}

export function getGameSessions(deckId?: string): GameSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const sessions: GameSession[] = JSON.parse(raw).map((s: any) => ({
      ...s,
      startedAt: new Date(s.startedAt),
      completedAt: new Date(s.completedAt)
    }));
    return deckId ? sessions.filter(s => s.deckId === deckId) : sessions;
  } catch {
    return [];
  }
}

export function getRecentSessionsForDeck(deckId: string, limit = 5): GameSession[] {
  return getGameSessions(deckId)
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
    .slice(0, limit);
}

// ─── Card Study Records ───────────────────────────────────────────────────────

function studyRecordKey(deckId: string, cardId: string): string {
  return `${deckId}__${cardId}`;
}

function getAllStudyRecords(): Record<string, CardStudyRecord> {
  try {
    const raw = localStorage.getItem(STUDY_RECORDS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Revive dates
    for (const key in parsed) {
      if (parsed[key].lastStudied) {
        parsed[key].lastStudied = new Date(parsed[key].lastStudied);
      }
    }
    return parsed;
  } catch {
    return {};
  }
}

function saveAllStudyRecords(records: Record<string, CardStudyRecord>): void {
  localStorage.setItem(STUDY_RECORDS_KEY, JSON.stringify(records));
}

export function getCardStudyRecord(deckId: string, cardId: string): CardStudyRecord | null {
  const all = getAllStudyRecords();
  return all[studyRecordKey(deckId, cardId)] || null;
}

/**
 * Update a card's study record after a quiz answer.
 * Call this after every answer in Quiz, SmartReview, and SpeedChallenge.
 */
export function updateCardStudyRecord(deckId: string, cardId: string, correct: boolean): void {
  const all = getAllStudyRecords();
  const key = studyRecordKey(deckId, cardId);
  const existing = all[key] || {
    cardId,
    deckId,
    lastStudied: new Date(),
    timesStudied: 0,
    timesCorrect: 0,
    timesWrong: 0
  };

  all[key] = {
    ...existing,
    lastStudied: new Date(),
    timesStudied: existing.timesStudied + 1,
    timesCorrect: existing.timesCorrect + (correct ? 1 : 0),
    timesWrong: existing.timesWrong + (correct ? 0 : 1)
  };

  saveAllStudyRecords(all);
}

// ─── Smart Review ──────────────────────────────────────────────────────────────

/**
 * Return cards sorted by review priority (highest need first):
 * 1. Never studied
 * 2. High error rate (>= 50% wrong)
 * 3. Not studied in > 3 days
 * 4. Studied with low error rate
 */
export function getCardsForSmartReview(deckId: string, cards: Flashcard[]): Flashcard[] {
  const all = getAllStudyRecords();
  const now = Date.now();
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

  return [...cards].sort((a, b) => {
    const ra = all[studyRecordKey(deckId, a._id??"")];
    const rb = all[studyRecordKey(deckId, b._id??"")];

    // Never studied → highest priority
    const aNew = !ra || ra.timesStudied === 0;
    const bNew = !rb || rb.timesStudied === 0;
    if (aNew && !bNew) return -1;
    if (!aNew && bNew) return 1;
    if (aNew && bNew) return 0;

    // Error rate
    const aRate = ra!.timesWrong / ra!.timesStudied;
    const bRate = rb!.timesWrong / rb!.timesStudied;
    if (aRate !== bRate) return bRate - aRate;

    // Staleness (haven't studied in a while)
    const aStale = (now - ra!.lastStudied.getTime()) > THREE_DAYS;
    const bStale = (now - rb!.lastStudied.getTime()) > THREE_DAYS;
    if (aStale && !bStale) return -1;
    if (!aStale && bStale) return 1;

    return 0;
  });
}

// ─── Summary Stats ────────────────────────────────────────────────────────────

export interface DeckStudyStats {
  totalStudied: number;
  totalNew: number;
  overallAccuracy: number;
  highErrorCards: Flashcard[];
}

export function getDeckStudyStats(deckId: string, cards: Flashcard[]): DeckStudyStats {
  const all = getAllStudyRecords();
  let totalStudied = 0;
  let totalNew = 0;
  let correctSum = 0;
  let studiedSum = 0;
  const highErrorCards: Flashcard[] = [];

  for (const card of cards) {
    const record = all[studyRecordKey(deckId, card._id??"")];
    if (!record || record.timesStudied === 0) {
      totalNew++;
    } else {
      totalStudied++;
      correctSum += record.timesCorrect;
      studiedSum += record.timesStudied;
      if (record.timesWrong > 0 && record.timesWrong / record.timesStudied >= 0.4) {
        highErrorCards.push(card);
      }
    }
  }

  return {
    totalStudied,
    totalNew,
    overallAccuracy: studiedSum > 0 ? Math.round((correctSum / studiedSum) * 100) : 0,
    highErrorCards
  };
}
