import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { Navbar } from './components/Navbar';
import { QuizList } from './components/QuizList';
import { QuizEditor } from './components/QuizEditor';
import { HostLobby } from './components/HostLobby';
import { HostLiveGame } from './components/HostLiveGame';
import { HostResults } from './components/HostResults';
import { StudentJoin } from './components/StudentJoin';
import { StudentGame } from './components/StudentGame';
import { StudentResults } from './components/StudentResults';
import type { 
  Quiz, 
  Player, 
  LeaderboardEntry, 
  GameStats, 
  AnswerFeedback 
} from './types';
import { sounds } from './utils/sound';

type ViewState = 
  | 'home' 
  | 'create' 
  | 'host_lobby' 
  | 'host_live' 
  | 'host_results' 
  | 'join' 
  | 'student_game' 
  | 'student_results';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentPin, setCurrentPin] = useState<string>('');
  const [currentQuizTitle, setCurrentQuizTitle] = useState<string>('');
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);

  // Host Live Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [currentDuration, setCurrentDuration] = useState<number>(20);
  const [hostCorrectIndex, setHostCorrectIndex] = useState<number | undefined>(undefined);
  const [hostExplanation, setHostExplanation] = useState<string | undefined>(undefined);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [answeredCount, setAnsweredCount] = useState<number>(0);

  // Student specific state
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [myPlayerName, setMyPlayerName] = useState<string>('');
  const [myPlayerAvatar, setMyPlayerAvatar] = useState<string>('🦊');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [studentFeedback, setStudentFeedback] = useState<AnswerFeedback | null>(null);
  const [studentScore, setStudentScore] = useState<number>(0);
  const [studentRank, setStudentRank] = useState<number>(1);
  const [studentStreak, setStudentStreak] = useState<number>(0);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // End Game Stats
  const [gameStats, setGameStats] = useState<GameStats | null>(null);

  // Check URL parameters for QR code join (e.g. ?pin=123456 or /join?pin=123456)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pinFromUrl = urlParams.get('pin');
    if (pinFromUrl) {
      setCurrentPin(pinFromUrl);
      setCurrentView('join');
    }
  }, []);

  // Fetch quizzes from API
  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const data = await quizDataOrDefault(await res.json());
        setQuizzes(data);
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    }
  };

  const quizDataOrDefault = (data: unknown): Quiz[] => {
    if (Array.isArray(data) && data.length > 0) return data as Quiz[];
    return [];
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Socket event listeners
  useEffect(() => {
    // HOST: Room Created
    socket.on('host:room_created', (data: { pin: string; quizTitle: string; totalQuestions: number; players: Player[] }) => {
      setCurrentPin(data.pin);
      setCurrentQuizTitle(data.quizTitle);
      setTotalQuestions(data.totalQuestions);
      setPlayers(data.players || []);
      setCurrentView('host_lobby');
    });

    // PLAYERS UPDATE (in lobby)
    socket.on('room:players_update', (data: { players: Player[] }) => {
      setPlayers(data.players || []);
      sounds.playLobbyJoin();
    });

    // COUNTDOWN (3, 2, 1)
    socket.on('game:countdown', (data: { count: number }) => {
      setCountdown(data.count);
      if (data.count === 0) {
        setTimeout(() => setCountdown(null), 1000);
      }
    });

    // NEW QUESTION STARTED
    socket.on('game:new_question', (data: {
      questionIndex: number;
      totalQuestions: number;
      question: string;
      options: string[];
      duration: number;
      quizTitle: string;
    }) => {
      setCountdown(null);
      setCurrentQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setCurrentQuestion(data.question);
      setCurrentOptions(data.options);
      setCurrentDuration(data.duration);
      setCurrentQuizTitle(data.quizTitle);
      setAnsweredCount(0);
      setStudentFeedback(null);

      // Determine view for Host vs Student
      if (myPlayerId) {
        setCurrentView('student_game');
      } else {
        setCurrentView('host_live');
      }
    });

    // HOST: Secret question info
    socket.on('host:question_info', (data: { questionIndex: number; correctIndex: number; explanation: string }) => {
      setHostCorrectIndex(data.correctIndex);
      setHostExplanation(data.explanation);
    });

    // LEADERBOARD UPDATE
    socket.on('room:leaderboard_update', (data: {
      leaderboard: LeaderboardEntry[];
      answeredCount: number;
      totalPlayers: number;
    }) => {
      setLeaderboard(data.leaderboard);
      setAnsweredCount(data.answeredCount);

      if (myPlayerId) {
        const myEntry = data.leaderboard.find((p) => p.id === myPlayerId);
        if (myEntry) {
          setStudentScore(myEntry.score);
          setStudentRank(myEntry.rank);
          setStudentStreak(myEntry.streak);
        }
      }
    });

    // STUDENT: Joined Success
    socket.on('player:join_success', (data: {
      pin: string;
      quizTitle: string;
      playerId: string;
      player: Player;
    }) => {
      setIsJoining(false);
      setJoinError(null);
      setMyPlayerId(data.playerId);
      setMyPlayerName(data.player.name);
      setMyPlayerAvatar(data.player.avatar);
      setCurrentPin(data.pin);
      setCurrentQuizTitle(data.quizTitle);
      setCurrentQuestionIndex(-1);
      setCurrentView('student_game');
    });

    // STUDENT: Join Error
    socket.on('player:join_error', (data: { message: string }) => {
      setIsJoining(false);
      setJoinError(data.message);
    });

    // STUDENT: Answer Feedback
    socket.on('player:answer_feedback', (data: AnswerFeedback) => {
      setStudentFeedback(data);
      setStudentScore(data.currentScore);
      setStudentRank(data.currentRank);
      setStudentStreak(data.streak);
    });

    // STUDENT: Kicked
    socket.on('player:kicked', (data: { message: string }) => {
      alert(data.message);
      setMyPlayerId('');
      setCurrentView('join');
    });

    // GAME ENDED (Podium & Stats)
    socket.on('game:ended', (stats: GameStats) => {
      setGameStats(stats);
      if (myPlayerId) {
        setCurrentView('student_results');
      } else {
        setCurrentView('host_results');
      }
    });

    return () => {
      socket.off('host:room_created');
      socket.off('room:players_update');
      socket.off('game:countdown');
      socket.off('game:new_question');
      socket.off('host:question_info');
      socket.off('room:leaderboard_update');
      socket.off('player:join_success');
      socket.off('player:join_error');
      socket.off('player:answer_feedback');
      socket.off('player:kicked');
      socket.off('game:ended');
    };
  }, [myPlayerId]);

  // Host actions
  const handleHostQuiz = (quizId: string) => {
    socket.emit('host:create_room', { quizId });
  };

  const handleStartGame = () => {
    socket.emit('host:start_game', { pin: currentPin });
  };

  const handleAddBot = () => {
    socket.emit('host:add_bot', { pin: currentPin });
  };

  const handleKickPlayer = (playerId: string) => {
    socket.emit('host:kick_player', { pin: currentPin, playerId });
  };

  const handleNextQuestion = () => {
    socket.emit('host:next_question', { pin: currentPin });
  };

  const handleEndGame = () => {
    socket.emit('host:end_game', { pin: currentPin });
  };

  // Student actions
  const handleJoinGame = (pin: string, name: string, avatar: string) => {
    setIsJoining(true);
    setJoinError(null);
    socket.emit('player:join_room', { pin, name, avatar });
  };

  const handleSubmitAnswer = (selectedOption: number, timeRemaining: number) => {
    socket.emit('player:submit_answer', {
      pin: currentPin,
      questionIndex: currentQuestionIndex,
      selectedOption,
      timeRemaining,
    });
  };

  // Create custom quiz
  const handleSaveQuiz = async (quizData: Partial<Quiz>) => {
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizData),
    });
    if (res.ok) {
      await fetchQuizzes();
      setCurrentView('home');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bộ đề này không?')) {
      await fetch('/api/quizzes/' + quizId, { method: 'DELETE' });
      await fetchQuizzes();
    }
  };

  const isInActiveGame = ['host_lobby', 'host_live', 'host_results', 'student_game', 'student_results'].includes(currentView);

  return (
    <div className="min-h-screen quiz-bg-pattern flex flex-col text-white selection:bg-purple-600 selection:text-white">
      {/* Quizizz Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'home') setCurrentView('home');
          if (view === 'create') setCurrentView('create');
          if (view === 'join') setCurrentView('join');
        }}
        isInGame={isInActiveGame}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <QuizList
            quizzes={quizzes}
            onHostQuiz={handleHostQuiz}
            onCreateNew={() => setCurrentView('create')}
            onDeleteQuiz={handleDeleteQuiz}
          />
        )}

        {currentView === 'create' && (
          <QuizEditor
            onSave={handleSaveQuiz}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'host_lobby' && (
          <HostLobby
            pin={currentPin}
            quizTitle={currentQuizTitle}
            totalQuestions={totalQuestions}
            players={players}
            onStartGame={handleStartGame}
            onAddBot={handleAddBot}
            onKickPlayer={handleKickPlayer}
            onExit={() => setCurrentView('home')}
          />
        )}

        {currentView === 'host_live' && (
          <HostLiveGame
            pin={currentPin}
            questionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            question={currentQuestion}
            options={currentOptions}
            duration={currentDuration}
            correctIndex={hostCorrectIndex}
            explanation={hostExplanation}
            leaderboard={leaderboard}
            answeredCount={answeredCount}
            totalPlayers={players.length}
            onNextQuestion={handleNextQuestion}
            onEndGame={handleEndGame}
          />
        )}

        {currentView === 'host_results' && gameStats && (
          <HostResults
            stats={gameStats}
            onPlayAgain={() => handleHostQuiz(quizzes[0]?.id || '')}
            onGoHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'join' && (
          <StudentJoin
            initialPin={currentPin}
            onJoin={handleJoinGame}
            error={joinError}
            isLoading={isJoining}
          />
        )}

        {currentView === 'student_game' && (
          <StudentGame
            pin={currentPin}
            quizTitle={currentQuizTitle}
            playerName={myPlayerName}
            playerAvatar={myPlayerAvatar}
            countdown={countdown}
            questionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            question={currentQuestion}
            options={currentOptions}
            duration={currentDuration}
            feedback={studentFeedback}
            currentScore={studentScore}
            currentRank={studentRank}
            streak={studentStreak}
            onSubmitAnswer={handleSubmitAnswer}
          />
        )}

        {currentView === 'student_results' && gameStats && (
          <StudentResults
            stats={gameStats}
            playerId={myPlayerId}
            onGoHome={() => {
              setMyPlayerId('');
              setCurrentView('home');
            }}
          />
        )}
      </main>
    </div>
  );
};

export default App;
