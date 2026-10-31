import { createBrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Decks } from './pages/Decks';
import { FlashcardView } from './pages/FlashcardView';
import { Progress } from './pages/Progress';
import { PracticeList } from './pages/PracticeList';
import { PracticeSession } from './pages/PracticeSession';
import { PracticeResult } from './pages/PracticeResult';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Community } from './pages/Community';
import { CommunityDeckDetail } from './pages/CommunityDeckDetail';
import { StudyMode } from './pages/StudyMode';
import { QuizGame } from './pages/games/QuizGame';
import { MatchingGame } from './pages/games/MatchingGame';
import { SmartReview } from './pages/games/SmartReview';
import { SpeedChallenge } from './pages/games/SpeedChallenge';


export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout>
          <Home />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/practice/:type',
    element: (
      <ProtectedRoute>
        <PracticeList />
      </ProtectedRoute>
    )
  },
  {
    path: '/practice-session/:exerciseId',
    element: (
      <ProtectedRoute>
        <PracticeSession />
      </ProtectedRoute>
    )
  },
  {
    path: '/practice-result/:exerciseId',
    element: (
      <ProtectedRoute>
        <PracticeResult />
      </ProtectedRoute>
    )
  },
  {
    path: '/decks',
    element: (
      <ProtectedRoute>
        <Layout>
          <Decks />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/decks/:deckId',
    element: (
      <ProtectedRoute>
        <Layout>
          <FlashcardView />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/progress',
    element: (
      <ProtectedRoute>
        <Layout>
          <Progress />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Layout>
          <Profile />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Layout>
          <Settings />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/community',
    element: (
      <ProtectedRoute>
        <Layout>
          <Community />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/community/:deckId',
    element: (
      <ProtectedRoute>
        <Layout>
          <CommunityDeckDetail />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/decks/:deckId/study',
    element: (
      <ProtectedRoute>
        <Layout>
          <StudyMode />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/decks/:deckId/quiz',
    element: (
      <ProtectedRoute>
        <QuizGame />
      </ProtectedRoute>
    )
  },
  {
    path: '/decks/:deckId/matching',
    element: (
      <ProtectedRoute>
        <MatchingGame />
      </ProtectedRoute>
    )
  },
  {
    path: '/decks/:deckId/smart-review',
    element: (
      <ProtectedRoute>
        <SmartReview />
      </ProtectedRoute>
    )
  },
  {
    path: '/decks/:deckId/speed',
    element: (
      <ProtectedRoute>
        <SpeedChallenge />
      </ProtectedRoute>
    )
  }
]);