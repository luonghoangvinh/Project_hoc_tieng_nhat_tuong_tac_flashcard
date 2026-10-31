
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';


export type QuestionType = 'vocabulary' | 'grammar' | 'listening' | 'reading';


export type FlashcardStatus = 'new' | 'learning' | 'mastered' | 'review';


export type DeckVisibility = 'personal' | 'community';

// Question data
export interface Question {
  _id: string;
  type: QuestionType;
  level: JLPTLevel;
  audioURL?: string; // For listening questions
  imageURL?: string; // For vocabulary,reading questions
  readingContent?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Flashcard data
export interface Flashcard {
  _id?: string;
  front: string;
  back: string;
  type: 'vocabulary' | 'grammar';
  level: JLPTLevel;
  example?: string;
  image?: string;
  audio?: string;
  status?: FlashcardStatus;
}

// Flashcard deck
export interface Deck {
  _id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  createdAt: Date;
  color?: string;
  icon?: string;
  visibility?: DeckVisibility;
  viewCount?: number; // For community decks
}

// User answer
export interface UserAnswer {
  userId:string;
  questionId: string;
  type: QuestionType;
  level: JLPTLevel;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  answeredAt: Date;
}

// Progress statistics
export interface ProgressStats {
  type: QuestionType;
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  averageTime: number;
}

// Question category for home page
export interface QuestionCategory {
  type: QuestionType;
  title: string;
  description: string;
  icon: string;
  color: string;
}
export interface ExerciseProgress{


  userId: string;

  exerciseId: string;

  exerciseTitle:string;

  completeAt: Date;

  updatedAt:Date;

  score: number;

  totalQuestion: number;

  rightAnswer: number;

  
}

export type GameType = 'quiz' | 'matching' | 'speed' | 'smart-review' | 'word-builder';
export type QuizDirection = 'jp-to-vn' | 'vn-to-jp';

export interface QuizQuestion {
  cardId: string;
  question: string;
  correctAnswer: string;
  options: string[];
  correctIndex: number;
  direction: QuizDirection;
}

export interface MatchingItem {
  id: string;
  text: string;
  pairId: string;
  state: 'idle' | 'selected' | 'matched' | 'wrong';
}

export interface GameSession {
  id: string;
  deckId: string;
  deckName: string;
  gameType: GameType;
  startedAt: Date;
  completedAt: Date;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  wrongCardIds: string[];
}

export interface CardStudyRecord {
  cardId: string;
  deckId: string;
  lastStudied: Date;
  timesStudied: number;
  timesCorrect: number;
  timesWrong: number;
}

// ─── Community Flashcard Types ───────────────────────────────────────────────

// Community deck topic
export type DeckTopic = 'vocabulary' | 'grammar' | 'kanji' | 'conversation' | 'other';

// Community deck - extends Deck with sharing metadata
export interface CommunityDeck extends Deck {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  jlptLevel?: JLPTLevel;
  topic: DeckTopic;
  rating: number;
  ratingCount: number;
  downloadCount: number;
  saveCount: number;
  publishedAt: Date;
  isPublic: boolean;
  tags?: string[];
}

// User rating for a community deck
export interface DeckRating {
  id: string;
  deckId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Config for publishing a deck
export interface PublishConfig {
  deckId: string;
  title: string;
  description: string;
  jlptLevel: JLPTLevel;
  topic: DeckTopic;
  tags?: string[];
}

// Config for PDF export
export interface PDFExportConfig {
  includeReading: boolean;
  includeExample: boolean;
  showAnswers: boolean;
  paperSize: 'a4' | 'letter';
  layout: 'front-only' | 'front-back';
}

// Sort options for community decks
export type CommunitySortOption = 'newest' | 'popular' | 'top-rated' | 'most-downloaded';