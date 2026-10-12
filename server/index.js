import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Path to persistent quizzes
const QUIZZES_FILE = path.join(__dirname, 'data', 'quizzes.json');

function loadQuizzes() {
  try {
    if (fs.existsSync(QUIZZES_FILE)) {
      const data = fs.readFileSync(QUIZZES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading quizzes:', err);
  }
  return [];
}

function saveQuizzes(quizzes) {
  try {
    const dir = path.dirname(QUIZZES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(QUIZZES_FILE, JSON.stringify(quizzes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving quizzes:', err);
  }
}

// Get local IPv4 address for QR code generation
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// API Routes
app.get('/api/network-ip', (req, res) => {
  const localIp = getLocalIpAddress();
  const hostHeader = req.headers.host || '';
  const port = hostHeader.includes(':') ? hostHeader.split(':')[1] : (process.env.CLIENT_PORT || 3000);
  res.json({
    localIp,
    port,
    clientUrl: `http://${localIp}:${port}`,
  });
});

app.get('/api/quizzes', (req, res) => {
  const quizzes = loadQuizzes();
  res.json(quizzes);
});

app.get('/api/quizzes/:id', (req, res) => {
  const quizzes = loadQuizzes();
  const quiz = quizzes.find((q) => q.id === req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  res.json(quiz);
});

app.post('/api/quizzes', (req, res) => {
  const quizzes = loadQuizzes();
  const newQuiz = {
    ...req.body,
    id: req.body.id || `quiz-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  quizzes.push(newQuiz);
  saveQuizzes(quizzes);
  res.status(201).json(newQuiz);
});

app.put('/api/quizzes/:id', (req, res) => {
  const quizzes = loadQuizzes();
  const idx = quizzes.findIndex((q) => q.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  quizzes[idx] = { ...quizzes[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveQuizzes(quizzes);
  res.json(quizzes[idx]);
});

app.delete('/api/quizzes/:id', (req, res) => {
  let quizzes = loadQuizzes();
  quizzes = quizzes.filter((q) => q.id !== req.params.id);
  saveQuizzes(quizzes);
  res.json({ success: true });
});

// Real-time Rooms State Management
const rooms = new Map();

function generateUniquePin() {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(pin));
  return pin;
}

function getLeaderboard(room) {
  const playersList = Object.values(room.players);
  playersList.sort((a, b) => b.score - a.score);
  return playersList.map((p, idx) => ({
    rank: idx + 1,
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    score: p.score,
    streak: p.streak,
    isBot: !!p.isBot,
    answersCount: p.answers.length,
    correctCount: p.answers.filter((a) => a.isCorrect).length,
  }));
}

function computeGameStats(room) {
  const totalQuestions = room.quiz.questions.length;
  const playersList = Object.values(room.players);
  const totalPlayers = playersList.length;

  let totalCorrect = 0;
  let totalAnswered = 0;

  const questionBreakdown = room.quiz.questions.map((q, qIndex) => {
    const optionCounts = [0, 0, 0, 0];
    let qCorrect = 0;
    let qTotal = 0;
    let qTotalTime = 0;

    playersList.forEach((player) => {
      const ans = player.answers.find((a) => a.questionIndex === qIndex);
      if (ans) {
        qTotal++;
        if (ans.selectedOption >= 0 && ans.selectedOption < 4) {
          optionCounts[ans.selectedOption]++;
        }
        if (ans.isCorrect) {
          qCorrect++;
          totalCorrect++;
        }
        qTotalTime += ans.timeTaken || 0;
        totalAnswered++;
      }
    });

    const accuracy = qTotal > 0 ? Math.round((qCorrect / qTotal) * 100) : 0;
    const avgTime = qTotal > 0 ? (qTotalTime / qTotal).toFixed(1) : 0;

    return {
      questionIndex: qIndex,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation || '',
      optionCounts,
      totalResponses: qTotal,
      accuracy,
      avgTime,
    };
  });

  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Find toughest and easiest questions
  let toughestQuestion = null;
  let easiestQuestion = null;
  if (questionBreakdown.length > 0) {
    const sorted = [...questionBreakdown].filter((q) => q.totalResponses > 0);
    if (sorted.length > 0) {
      sorted.sort((a, b) => a.accuracy - b.accuracy);
      toughestQuestion = sorted[0];
      easiestQuestion = sorted[sorted.length - 1];
    }
  }

  // Detailed player report
  const studentReports = playersList.map((player) => {
    const correctCount = player.answers.filter((a) => a.isCorrect).length;
    const accuracy = player.answers.length > 0 ? Math.round((correctCount / player.answers.length) * 100) : 0;
    const totalTime = player.answers.reduce((acc, a) => acc + (a.timeTaken || 0), 0);

    return {
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      score: player.score,
      correctCount,
      incorrectCount: player.answers.length - correctCount,
      totalQuestionsAnswered: player.answers.length,
      accuracy,
      totalTime: Math.round(totalTime),
      answers: player.answers,
    };
  });

  studentReports.sort((a, b) => b.score - a.score);

  return {
    quizTitle: room.quiz.title,
    totalPlayers,
    overallAccuracy,
    toughestQuestion,
    easiestQuestion,
    questionBreakdown,
    studentReports,
    finalLeaderboard: getLeaderboard(room),
  };
}

// Bot simulation for interactive demo
const BOT_NAMES = ['Bảo Nam 🤖', 'Minh Thư 🦄', 'Hải Đăng ⚡', 'Tuệ Lâm 🌸', 'Quốc Huy 🦁', 'Khánh Linh 🦊'];
const BOT_AVATARS = ['🤖', '🦄', '⚡', '🌸', '🦁', '🦊'];

function simulateBotAnswers(room, questionIndex) {
  const currentQ = room.quiz.questions[questionIndex];
  if (!currentQ) return;

  const bots = Object.values(room.players).filter((p) => p.isBot && !p.isCurrentAnswered);
  bots.forEach((bot) => {
    // Random answer delay between 3s and 10s
    const timeLimit = currentQ.timeLimit || 20;
    const answerDelaySec = Math.min(timeLimit - 2, 2 + Math.floor(Math.random() * (timeLimit - 4)));
    const timeRemaining = Math.max(1, timeLimit - answerDelaySec);

    setTimeout(() => {
      if (room.status !== 'in_progress' || room.currentQuestionIndex !== questionIndex) return;
      if (bot.isCurrentAnswered) return;

      // 75% chance of correct answer
      const isCorrect = Math.random() < 0.75;
      let selectedOption = currentQ.correctIndex;
      if (!isCorrect) {
        const wrongOptions = [0, 1, 2, 3].filter((idx) => idx !== currentQ.correctIndex);
        selectedOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
      }

      // Calculate score
      const speedBonus = Math.max(50, Math.round(500 * (timeRemaining / timeLimit)));
      const streakBonus = bot.streak * 50;
      const points = isCorrect ? 500 + speedBonus + streakBonus : 0;

      bot.score += points;
      bot.streak = isCorrect ? bot.streak + 1 : 0;
      bot.isCurrentAnswered = true;
      bot.answers.push({
        questionIndex,
        selectedOption,
        isCorrect,
        points,
        timeTaken: answerDelaySec,
      });

      // Update room leaderboard
      io.to(`room:${room.pin}`).emit('room:leaderboard_update', {
        leaderboard: getLeaderboard(room),
        answeredCount: Object.values(room.players).filter((p) => p.isCurrentAnswered).length,
        totalPlayers: Object.values(room.players).length,
      });

      // Check if all players answered
      checkAllAnswered(room);
    }, answerDelaySec * 1000);
  });
}

function checkAllAnswered(room) {
  const players = Object.values(room.players);
  if (players.length === 0) return;
  const allAnswered = players.every((p) => p.isCurrentAnswered);
  if (allAnswered) {
    // Notify host that all players finished this question
    io.to(room.hostSocketId).emit('host:all_players_answered', {
      questionIndex: room.currentQuestionIndex,
    });
  }
}

// Socket.io handlers
io.on('connection', (socket) => {
  // HOST: Create Room
  socket.on('host:create_room', ({ quizId }) => {
    const quizzes = loadQuizzes();
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) {
      socket.emit('error', { message: 'Không tìm thấy bộ đề trắc nghiệm' });
      return;
    }

    const pin = generateUniquePin();
    const room = {
      pin,
      quizId,
      quiz,
      hostSocketId: socket.id,
      status: 'lobby',
      currentQuestionIndex: -1,
      questionStartTime: null,
      players: {},
    };

    rooms.set(pin, room);
    socket.join(`room:${pin}`);

    console.log(`[Host] Created room ${pin} for quiz "${quiz.title}"`);
    socket.emit('host:room_created', {
      pin,
      quizTitle: quiz.title,
      totalQuestions: quiz.questions.length,
      players: [],
    });
  });

  // HOST: Add Bot Player
  socket.on('host:add_bot', ({ pin }) => {
    const room = rooms.get(pin);
    if (!room || room.status !== 'lobby') return;

    const botIndex = Object.values(room.players).filter((p) => p.isBot).length;
    const name = BOT_NAMES[botIndex % BOT_NAMES.length];
    const avatar = BOT_AVATARS[botIndex % BOT_AVATARS.length];
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const botPlayer = {
      id: botId,
      name,
      avatar,
      score: 0,
      streak: 0,
      answers: [],
      isCurrentAnswered: false,
      isBot: true,
    };

    room.players[botId] = botPlayer;
    io.to(`room:${pin}`).emit('room:players_update', {
      players: Object.values(room.players).map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        isBot: p.isBot,
      })),
    });
  });

  // HOST: Kick Player
  socket.on('host:kick_player', ({ pin, playerId }) => {
    const room = rooms.get(pin);
    if (!room) return;

    if (room.players[playerId]) {
      delete room.players[playerId];
      io.to(playerId).emit('player:kicked', { message: 'Bạn đã bị mời rời khỏi phòng' });
      io.to(`room:${pin}`).emit('room:players_update', {
        players: Object.values(room.players).map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          score: p.score,
          isBot: p.isBot,
        })),
      });
    }
  });

  // PLAYER: Join Room
  socket.on('player:join_room', ({ pin, name, avatar }) => {
    const cleanPin = (pin || '').trim();
    const room = rooms.get(cleanPin);

    if (!room) {
      socket.emit('player:join_error', { message: 'Mã PIN phòng không hợp lệ hoặc phòng không tồn tại!' });
      return;
    }

    if (room.status !== 'lobby') {
      socket.emit('player:join_error', { message: 'Trò chơi đã bắt đầu hoặc đã kết thúc!' });
      return;
    }

    const cleanName = (name || '').trim() || `Người chơi ${Math.floor(100 + Math.random() * 900)}`;
    const playerAvatar = avatar || '🦊';

    const player = {
      id: socket.id,
      name: cleanName,
      avatar: playerAvatar,
      score: 0,
      streak: 0,
      answers: [],
      isCurrentAnswered: false,
    };

    room.players[socket.id] = player;
    socket.join(`room:${cleanPin}`);
    socket.data = { pin: cleanPin, playerId: socket.id, isHost: false };

    console.log(`[Player] ${cleanName} (${playerAvatar}) joined room ${cleanPin}`);

    socket.emit('player:join_success', {
      pin: cleanPin,
      quizTitle: room.quiz.title,
      playerId: socket.id,
      player,
    });

    // Notify all in room of updated player list
    io.to(`room:${cleanPin}`).emit('room:players_update', {
      players: Object.values(room.players).map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        isBot: p.isBot,
      })),
    });
  });

  // HOST: Start Game
  socket.on('host:start_game', ({ pin }) => {
    const room = rooms.get(pin);
    if (!room || room.status !== 'lobby') return;

    room.status = 'starting';
    console.log(`[Game] Starting room ${pin}`);

    // 3-2-1 countdown
    let countdown = 3;
    io.to(`room:${pin}`).emit('game:countdown', { count: countdown });

    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        io.to(`room:${pin}`).emit('game:countdown', { count: countdown });
      } else {
        clearInterval(countdownInterval);
        io.to(`room:${pin}`).emit('game:countdown', { count: 0 }); // "BẮT ĐẦU!"
        setTimeout(() => {
          startQuestion(room, 0);
        }, 1000);
      }
    }, 1000);
  });

  function startQuestion(room, questionIndex) {
    if (questionIndex >= room.quiz.questions.length) {
      endGame(room);
      return;
    }

    room.status = 'in_progress';
    room.currentQuestionIndex = questionIndex;
    room.questionStartTime = Date.now();

    // Reset currentAnswered flag for all players
    Object.values(room.players).forEach((p) => {
      p.isCurrentAnswered = false;
    });

    const q = room.quiz.questions[questionIndex];
    const duration = q.timeLimit || 20;

    // Send question without revealing correctIndex to players!
    io.to(`room:${room.pin}`).emit('game:new_question', {
      questionIndex,
      totalQuestions: room.quiz.questions.length,
      question: q.question,
      options: q.options,
      duration,
      quizTitle: room.quiz.title,
    });

    // Send host live question info including correct answer
    io.to(room.hostSocketId).emit('host:question_info', {
      questionIndex,
      correctIndex: q.correctIndex,
      explanation: q.explanation || '',
    });

    // Simulate bots answering
    simulateBotAnswers(room, questionIndex);

    // Auto advance timer
    if (room.questionTimer) clearTimeout(room.questionTimer);
    room.questionTimer = setTimeout(() => {
      // Time up for question
      if (room.status === 'in_progress' && room.currentQuestionIndex === questionIndex) {
        io.to(`room:${room.pin}`).emit('game:question_time_up', {
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        });
      }
    }, (duration + 1) * 1000);
  }

  // PLAYER: Submit Answer
  socket.on('player:submit_answer', ({ pin, questionIndex, selectedOption, timeRemaining }) => {
    const room = rooms.get(pin);
    if (!room || room.status !== 'in_progress') return;
    if (room.currentQuestionIndex !== questionIndex) return;

    const player = room.players[socket.id];
    if (!player || player.isCurrentAnswered) return;

    const q = room.quiz.questions[questionIndex];
    if (!q) return;

    const isCorrect = selectedOption === q.correctIndex;
    const duration = q.timeLimit || 20;
    const timeTaken = Math.max(1, duration - (timeRemaining || 0));

    // Calculate score (Base + Speed bonus + Streak bonus)
    const speedBonus = isCorrect ? Math.max(50, Math.round(500 * (timeRemaining / duration))) : 0;
    const streakBonus = isCorrect ? player.streak * 50 : 0;
    const points = isCorrect ? 500 + speedBonus + streakBonus : 0;

    player.score += points;
    player.streak = isCorrect ? player.streak + 1 : 0;
    player.isCurrentAnswered = true;
    player.answers.push({
      questionIndex,
      selectedOption,
      isCorrect,
      points,
      timeTaken,
    });

    // Send personal feedback to student
    const leaderboard = getLeaderboard(room);
    const playerRank = leaderboard.findIndex((p) => p.id === player.id) + 1;

    socket.emit('player:answer_feedback', {
      isCorrect,
      pointsEarned: points,
      speedBonus,
      streakBonus,
      streak: player.streak,
      correctIndex: q.correctIndex,
      explanation: q.explanation || '',
      currentScore: player.score,
      currentRank: playerRank,
    });

    // Send updated leaderboard to host & all players
    io.to(`room:${pin}`).emit('room:leaderboard_update', {
      leaderboard,
      answeredCount: Object.values(room.players).filter((p) => p.isCurrentAnswered).length,
      totalPlayers: Object.values(room.players).length,
    });

    checkAllAnswered(room);
  });

  // HOST: Next Question
  socket.on('host:next_question', ({ pin }) => {
    const room = rooms.get(pin);
    if (!room) return;

    if (room.questionTimer) clearTimeout(room.questionTimer);
    const nextIdx = room.currentQuestionIndex + 1;
    if (nextIdx < room.quiz.questions.length) {
      startQuestion(room, nextIdx);
    } else {
      endGame(room);
    }
  });

  // HOST: End Game early or finished
  socket.on('host:end_game', ({ pin }) => {
    const room = rooms.get(pin);
    if (!room) return;
    endGame(room);
  });

  function endGame(room) {
    if (room.questionTimer) clearTimeout(room.questionTimer);
    room.status = 'finished';

    const stats = computeGameStats(room);
    console.log(`[Game] Ended room ${room.pin}. Leaderboard:`, stats.finalLeaderboard.map((p) => `${p.name}: ${p.score}`));

    io.to(`room:${room.pin}`).emit('game:ended', stats);
  }

  // Handle Disconnect
  socket.on('disconnect', () => {
    rooms.forEach((room, pin) => {
      if (room.hostSocketId === socket.id) {
        console.log(`[Host] Disconnected from room ${pin}`);
        io.to(`room:${pin}`).emit('host:disconnected', {
          message: 'Chủ phòng đã rời cuộc chơi!',
        });
      } else if (room.players[socket.id]) {
        console.log(`[Player] ${room.players[socket.id].name} disconnected`);
        if (room.status === 'lobby') {
          delete room.players[socket.id];
          io.to(`room:${pin}`).emit('room:players_update', {
            players: Object.values(room.players).map((p) => ({
              id: p.id,
              name: p.name,
              avatar: p.avatar,
              score: p.score,
              isBot: p.isBot,
            })),
          });
        }
      }
    });
  });
});

// Serve built client in production if available
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`🚀 Quizizz Server running on http://localhost:${PORT}`);
  console.log(`🌐 Local LAN IP: http://${localIp}:${PORT}`);
});
