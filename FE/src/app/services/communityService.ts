/**
 * Community Service - Mock implementation
 *
 * All methods match the interface of a real API service.
 * To switch to a real API, replace each method body with the appropriate fetch/axios call.
 * The components that consume this service do not need to change.
 *
 * Storage keys:
 *   jlpt_saved_community_decks - string[] of saved deck IDs
 *   jlpt_user_ratings - Record<deckId, {rating, comment}>
 *   jlpt_published_deck_ids - string[] of deck IDs user has published
 */

import {
  CommunityDeck,
  DeckRating,
  PublishConfig,
  CommunitySortOption,
  JLPTLevel,
  DeckTopic,
  Deck
} from '../types';
import { mockCommunityDecks, generateMockRatings } from '../data/mockCommunity';
import { getDecks, createDeck, getDeckById } from '../utils/deckStorage';
import { useEffect, useState } from 'react';
  const userStr = localStorage.getItem('user');
  const userData = userStr ? JSON.parse(userStr) : null;
  const userId = userData ? userData.id : null;

const SAVED_KEY = 'jlpt_saved_community_decks';
const RATINGS_KEY = 'jlpt_user_ratings';
const PUBLISHED_KEY = 'jlpt_published_deck_ids';

function getSavedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
  } catch {
    return [];
  }
}

function setSavedIds(ids: string[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

function getUserRatings(): Record<string, { rating: number; comment?: string }> {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

function getPublishedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PUBLISHED_KEY) || '[]');
  } catch {
    return [];
  }
}

function setPublishedIds(ids: string[]) {
  localStorage.setItem(PUBLISHED_KEY, JSON.stringify(ids));
}

function getPersonalPublishedDecks(): CommunityDeck[] {
  const publishedIds = getPublishedIds();
  if (publishedIds.length === 0) return [];

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Bạn' };

  return publishedIds.flatMap(id => {
    const [deck, setDeck] = useState<Deck | undefined>(undefined);
        useEffect(() => {
      
          async function fetchDeck() {
            try {
              const result = await getDeckById(id || '');
                setDeck(result);
            } catch (error) {
              console.error('Không thể lấy deck:', error);
            } finally {
              
            }
          }
      
          fetchDeck();
        }, [id]);
    if (!deck) return [];
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - 1);
    const communityDeck: CommunityDeck = {
      ...deck,
      authorId: 'current-user',
      authorName: user.name || 'Bạn',
      jlptLevel: undefined,
      topic: 'vocabulary' as DeckTopic,
      rating: 0,
      ratingCount: 0,
      downloadCount: 0,
      saveCount: 0,
      publishedAt,
      isPublic: true,
      tags: [],
      visibility: 'community'
    };
    return [communityDeck];
  });
}

export interface CommunityFilters {
  level?: JLPTLevel | 'all';
  topic?: DeckTopic | 'all';
  sort?: CommunitySortOption;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Fetch all community decks with optional filtering, sorting, pagination.
 * API-ready: replace body with GET /api/community/decks?level=...&topic=...
 */
export async function fetchCommunityDecks(
  filters: CommunityFilters = {},
  page = 1,
  perPage = 12
): Promise<PaginatedResult<CommunityDeck>> {
  // Simulate async API call
  await new Promise(r => setTimeout(r, 300));

  const allDecks = [...mockCommunityDecks, ...getPersonalPublishedDecks()];
  let filtered = allDecks;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.authorName.toLowerCase().includes(q) ||
      (d.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  if (filters.level && filters.level !== 'all') {
    filtered = filtered.filter(d => d.jlptLevel === filters.level);
  }

  if (filters.topic && filters.topic !== 'all') {
    filtered = filtered.filter(d => d.topic === filters.topic);
  }

  const sort = filters.sort || 'popular';
  if (sort === 'newest') {
    filtered.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  } else if (sort === 'popular') {
    filtered.sort((a, b) => (b.downloadCount + b.saveCount) - (a.downloadCount + a.saveCount));
  } else if (sort === 'top-rated') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'most-downloaded') {
    filtered.sort((a, b) => b.downloadCount - a.downloadCount);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total, page, perPage, totalPages };
}

/**
 * Fetch a single community deck by ID.
 * API-ready: replace with GET /api/community/decks/:id
 */
export async function fetchCommunityDeckById(id: string): Promise<CommunityDeck | null> {
  await new Promise(r => setTimeout(r, 200));
  const all = [...mockCommunityDecks, ...getPersonalPublishedDecks()];
  return all.find(d => d._id === id) || null;
}

/**
 * Fetch ratings for a deck.
 * API-ready: replace with GET /api/community/decks/:id/ratings
 */
export async function fetchDeckRatings(deckId: string): Promise<DeckRating[]> {
  await new Promise(r => setTimeout(r, 200));
  return generateMockRatings(deckId);
}

/**
 * Get related decks (same topic or level).
 * API-ready: replace with GET /api/community/decks/:id/related
 */
export async function fetchRelatedDecks(deck: CommunityDeck): Promise<CommunityDeck[]> {
  await new Promise(r => setTimeout(r, 150));
  return mockCommunityDecks
    .filter(d => d._id !== deck._id && (d.topic === deck.topic || d.jlptLevel === deck.jlptLevel))
    .slice(0, 4);
}

/**
 * Check if a deck is saved by the current user.
 */
export function isDeckSaved(deckId: string): boolean {
  return getSavedIds().includes(deckId);
}

/**
 * Save a community deck (add reference, not copy).
 * API-ready: replace with POST /api/community/saved
 */
export async function saveDeck(deckId: string): Promise<void> {
  await new Promise(r => setTimeout(r, 100));
  const ids = getSavedIds();
  if (!ids.includes(deckId)) {
    setSavedIds([...ids, deckId]);
  }
}

/**
 * Unsave a community deck.
 * API-ready: replace with DELETE /api/community/saved/:deckId
 */
export async function unsaveDeck(deckId: string): Promise<void> {
  await new Promise(r => setTimeout(r, 100));
  setSavedIds(getSavedIds().filter(id => id !== deckId));
}

/**
 * Download a community deck as a copy into personal decks.
 * Returns false if already downloaded.
 * API-ready: replace with POST /api/community/decks/:id/download
 */
export async function downloadDeck(deck: CommunityDeck): Promise<boolean> {
  await new Promise(r => setTimeout(r, 300));

  const existing = await getDecks(userId);
  const alreadyDownloaded = existing.some(d => d._id === deck._id);
  if (alreadyDownloaded) return false;

  createDeck(
    `${deck.name} (Tải về)`,
    `${deck.description}\n(Tải về từ cộng đồng - ${deck.authorName})`,
    deck.color!,
    deck.cards,
    deck.icon,
    'personal'
  );

  return true;
}

/**
 * Get the current user's rating for a deck, if any.
 */
export function getUserRating(deckId: string): { rating: number; comment?: string } | null {
  const ratings = getUserRatings();
  return ratings[deckId] || null;
}

/**
 * Submit a rating for a community deck.
 * API-ready: replace with POST /api/community/decks/:id/ratings
 */
export async function submitRating(
  deckId: string,
  rating: number,
  comment?: string
): Promise<void> {
  await new Promise(r => setTimeout(r, 200));
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

  const ratings = getUserRatings();
  ratings[deckId] = { rating, comment };
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
}

/**
 * Publish a personal deck to the community.
 * API-ready: replace with POST /api/community/publish
 */
export async function publishDeck(config: PublishConfig): Promise<void> {
  await new Promise(r => setTimeout(r, 400));

  const publishedIds = getPublishedIds();
  if (!publishedIds.includes(config.deckId)) {
    setPublishedIds([...publishedIds, config.deckId]);
  }
}

/**
 * Check if a personal deck is already published.
 */
export function isDeckPublished(deckId: string): boolean {
  return getPublishedIds().includes(deckId);
}

/**
 * Unpublish a deck (remove from community).
 * This does NOT delete downloaded copies other users already have.
 * API-ready: replace with DELETE /api/community/decks/:id
 */
export async function unpublishDeck(deckId: string): Promise<void> {
  await new Promise(r => setTimeout(r, 300));
  setPublishedIds(getPublishedIds().filter(id => id !== deckId));
}

/**
 * Get featured sections for the community home page.
 * API-ready: replace with GET /api/community/featured
 */
export async function fetchFeaturedSections(): Promise<{
  newest: CommunityDeck[];
  topRated: CommunityDeck[];
  mostDownloaded: CommunityDeck[];
}> {
  await new Promise(r => setTimeout(r, 250));

  const sorted = [...mockCommunityDecks];
  const newest = [...sorted]
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, 4);
  const topRated = [...sorted].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const mostDownloaded = [...sorted].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 4);

  return { newest, topRated, mostDownloaded };
}

/**
 * Get saved community deck IDs for the current user.
 * API-ready: replace with GET /api/community/saved
 */
export async function fetchSavedDecks(): Promise<CommunityDeck[]> {
  await new Promise(r => setTimeout(r, 150));
  const savedIds = getSavedIds();
  const allDecks = [...mockCommunityDecks, ...getPersonalPublishedDecks()];
  return allDecks.filter(d => savedIds.includes(d._id));
}
