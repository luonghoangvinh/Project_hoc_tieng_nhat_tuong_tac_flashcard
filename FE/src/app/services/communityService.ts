/**
 * Community Service - Real API Implementation
 *
 * Fully integrated with Backend Community & Ratings Modules (NestJS + MongoDB)
 * Replaces mockCommunity.ts and LocalStorage with real REST API endpoints.
 */

import {
  CommunityDeck,
  DeckRating,
  PublishConfig,
  CommunitySortOption,
  JLPTLevel,
  DeckTopic,
} from '../types';
import { getAuthHeaders } from '../utils/apiHeaders';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SAVED_KEY = 'jlpt_saved_community_decks';
const RATINGS_KEY = 'jlpt_user_ratings';
const PUBLISHED_KEY = 'jlpt_published_deck_ids';

let cachedSavedIds: Set<string> = new Set();
try {
  const local = localStorage.getItem(SAVED_KEY);
  if (local) cachedSavedIds = new Set(JSON.parse(local));
} catch {
  cachedSavedIds = new Set();
}

let cachedUserRatings: Record<string, { rating: number; comment?: string }> = {};
try {
  const local = localStorage.getItem(RATINGS_KEY);
  if (local) cachedUserRatings = JSON.parse(local);
} catch {
  cachedUserRatings = {};
}

let cachedPublishedIds: Set<string> = new Set();
try {
  const local = localStorage.getItem(PUBLISHED_KEY);
  if (local) cachedPublishedIds = new Set(JSON.parse(local));
} catch {
  cachedPublishedIds = new Set();
}

function reviveDeck(d: any): CommunityDeck {
  return {
    ...d,
    _id: d._id || d.id,
    createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
    publishedAt: d.publishedAt ? new Date(d.publishedAt) : new Date(),
    cards: (d.cards || []).map((c: any) => ({
      ...c,
      _id: c._id || c.id,
    })),
  };
}

function reviveRating(r: any): DeckRating {
  return {
    ...r,
    id: r.id || r._id,
    createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
  };
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
 * Fetch all community decks with filtering, sorting, pagination from Backend API.
 * GET /community/decks?level=...&topic=...&sort=...&page=...&perPage=...
 */
export async function fetchCommunityDecks(
  filters: CommunityFilters = {},
  page = 1,
  perPage = 12
): Promise<PaginatedResult<CommunityDeck>> {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });

  if (filters.search && filters.search.trim()) {
    params.append('search', filters.search.trim());
  }
  if (filters.level && filters.level !== 'all') {
    params.append('level', filters.level);
  }
  if (filters.topic && filters.topic !== 'all') {
    params.append('topic', filters.topic);
  }
  if (filters.sort) {
    params.append('sort', filters.sort);
  }

  const res = await fetch(`${API_URL}/community/decks?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error('Không thể tải danh sách bộ thẻ cộng đồng');
  }

  const data = await res.json();
  return {
    items: (data.items || []).map(reviveDeck),
    total: data.total || 0,
    page: data.page || page,
    perPage: data.perPage || perPage,
    totalPages: data.totalPages || 1,
  };
}

/**
 * Fetch a single community deck by ID.
 * GET /community/decks/:id
 */
export async function fetchCommunityDeckById(id: string): Promise<CommunityDeck | null> {
  try {
    const res = await fetch(`${API_URL}/community/decks/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return reviveDeck(data);
  } catch {
    return null;
  }
}

/**
 * Fetch ratings for a community deck.
 * GET /community/decks/:id/ratings
 */
export async function fetchDeckRatings(deckId: string): Promise<DeckRating[]> {
  try {
    const res = await fetch(`${API_URL}/community/decks/${deckId}/ratings`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map(reviveRating);
  } catch {
    return [];
  }
}

/**
 * Get related decks (same topic or level).
 * GET /community/decks/:id/related
 */
export async function fetchRelatedDecks(deck: CommunityDeck): Promise<CommunityDeck[]> {
  try {
    const res = await fetch(`${API_URL}/community/decks/${deck._id}/related`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map(reviveDeck);
  } catch {
    return [];
  }
}

/**
 * Fetch saved deck IDs from backend for current user.
 * GET /community/saved-ids
 */
export async function fetchSavedDeckIds(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/community/saved-ids`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) return [...cachedSavedIds];
    const data = await res.json();
    const ids: string[] = data.savedIds || [];
    cachedSavedIds = new Set(ids);
    localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
    return ids;
  } catch {
    return [...cachedSavedIds];
  }
}

/**
 * Check if a deck is saved by current user (synchronous check).
 */
export function isDeckSaved(deckId: string): boolean {
  return cachedSavedIds.has(deckId);
}

/**
 * Save / Bookmark a community deck.
 * POST /community/saved/:deckId
 */
export async function saveDeck(deckId: string): Promise<void> {
  cachedSavedIds.add(deckId);
  localStorage.setItem(SAVED_KEY, JSON.stringify([...cachedSavedIds]));

  const res = await fetch(`${API_URL}/community/saved/${deckId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    cachedSavedIds.delete(deckId);
    localStorage.setItem(SAVED_KEY, JSON.stringify([...cachedSavedIds]));
    throw new Error('Lưu bộ thẻ thất bại');
  }
}

/**
 * Unsave / Remove bookmark for a community deck.
 * DELETE /community/saved/:deckId
 */
export async function unsaveDeck(deckId: string): Promise<void> {
  cachedSavedIds.delete(deckId);
  localStorage.setItem(SAVED_KEY, JSON.stringify([...cachedSavedIds]));

  const res = await fetch(`${API_URL}/community/saved/${deckId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    cachedSavedIds.add(deckId);
    localStorage.setItem(SAVED_KEY, JSON.stringify([...cachedSavedIds]));
    throw new Error('Bỏ lưu bộ thẻ thất bại');
  }
}

/**
 * Download a community deck as a copy into personal decks.
 * POST /community/decks/:id/download
 */
export async function downloadDeck(deck: CommunityDeck): Promise<boolean> {
  const res = await fetch(`${API_URL}/community/decks/${deck._id}/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    return false;
  }
  return true;
}

/**
 * Get current user's rating for a deck (synchronous lookup).
 */
export function getUserRating(deckId: string): { rating: number; comment?: string } | null {
  return cachedUserRatings[deckId] || null;
}

/**
 * Fetch current user's rating for a deck from API.
 * GET /community/decks/:id/ratings/me
 */
export async function fetchUserRating(deckId: string): Promise<{ rating: number; comment?: string } | null> {
  try {
    const res = await fetch(`${API_URL}/community/decks/${deckId}/ratings/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) return getUserRating(deckId);
    const data = await res.json();
    if (data) {
      cachedUserRatings[deckId] = { rating: data.rating, comment: data.comment };
      localStorage.setItem(RATINGS_KEY, JSON.stringify(cachedUserRatings));
      return cachedUserRatings[deckId];
    }
    return null;
  } catch {
    return getUserRating(deckId);
  }
}

/**
 * Submit a rating for a community deck.
 * POST /community/decks/:id/ratings
 */
export async function submitRating(
  deckId: string,
  rating: number,
  comment?: string
): Promise<void> {
  if (rating < 1 || rating > 5) throw new Error('Số sao phải từ 1 đến 5');

  cachedUserRatings[deckId] = { rating, comment };
  localStorage.setItem(RATINGS_KEY, JSON.stringify(cachedUserRatings));

  const res = await fetch(`${API_URL}/community/decks/${deckId}/ratings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ rating, comment }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Gửi đánh giá thất bại');
  }
}

/**
 * Publish a personal deck to the community.
 * POST /community/decks/publish
 */
export async function publishDeck(config: PublishConfig): Promise<void> {
  const res = await fetch(`${API_URL}/community/decks/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Xuất bản bộ thẻ thất bại');
  }

  cachedPublishedIds.add(config.deckId);
  localStorage.setItem(PUBLISHED_KEY, JSON.stringify([...cachedPublishedIds]));
}

/**
 * Check if a personal deck is published.
 */
export function isDeckPublished(deckId: string): boolean {
  return cachedPublishedIds.has(deckId);
}

/**
 * Unpublish a deck (remove from community).
 * DELETE /community/decks/:id/publish
 */
export async function unpublishDeck(deckId: string): Promise<void> {
  const res = await fetch(`${API_URL}/community/decks/${deckId}/publish`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Gỡ bộ thẻ thất bại');
  }

  cachedPublishedIds.delete(deckId);
  localStorage.setItem(PUBLISHED_KEY, JSON.stringify([...cachedPublishedIds]));
}

/**
 * Get featured sections for the community home page.
 * GET /community/featured
 */
export async function fetchFeaturedSections(): Promise<{
  newest: CommunityDeck[];
  topRated: CommunityDeck[];
  mostDownloaded: CommunityDeck[];
}> {
  const res = await fetch(`${API_URL}/community/featured`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error('Không thể tải các mục nổi bật');
  }

  const data = await res.json();
  return {
    newest: (data.newest || []).map(reviveDeck),
    topRated: (data.topRated || []).map(reviveDeck),
    mostDownloaded: (data.mostDownloaded || []).map(reviveDeck),
  };
}

/**
 * Get saved community decks for current user.
 * GET /community/saved
 */
export async function fetchSavedDecks(): Promise<CommunityDeck[]> {
  try {
    const res = await fetch(`${API_URL}/community/saved`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map(reviveDeck);
  } catch {
    return [];
  }
}
