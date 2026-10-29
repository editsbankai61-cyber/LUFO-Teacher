import { Link } from "@/components/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Heart,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
} from "lucide-react";
import { concepts, languages, type LanguageId } from "@/lib/content";
import { useLearner } from "@/lib/store";
import { playSound } from "@/lib/sound";
import { speakText } from "@/lib/audio";
import { ScriptText } from "./LanguageLens";

export type GameDefinition = {
  id: string;
  name: string;
  category: string;
  description: string;
  mechanic: string;
  icon: string;
  instructions: string;
};

export const gameModes: GameDefinition[] = [
  {
    id: "word-match",
    name: "Word Match",
    category: "Vocabulary",
    description: "Connect Indian words to their matching English meanings.",
    mechanic: "Pair tiles between the two columns.",
    icon: "🔤",
    instructions: "Tap an Indian script tile on the left, then tap its matching English translation on the right.",
  },
  {
    id: "memory-match",
    name: "Memory Match",
    category: "Memory",
    description: "Flip cards and find pairs of words and meanings.",
    mechanic: "Concentration memory grid.",
    icon: "🃏",
    instructions: "Flip two cards at a time to find matching words. Remember card locations!",
  },
  {
    id: "sentence-builder",
    name: "Sentence Builder",
    category: "Grammar",
    description: "Assemble word tiles into grammatically correct sentences.",
    mechanic: "Ordered tile assembly.",
    icon: "🧱",
    instructions: "Click word chips in the correct sequence to reconstruct the native-script sentence.",
  },
  {
    id: "listening-challenge",
    name: "Listening Challenge",
    category: "Audio",
    description: "Listen to native pronunciation and identify the spoken phrase.",
    mechanic: "Audio comprehension.",
    icon: "🎧",
    instructions: "Press the speaker button to hear the phrase, then select the matching written card.",
  },
  {
    id: "quick-quiz",
    name: "Quick Quiz",
    category: "Knowledge",
    description: "Answer rapid-fire questions with immediate educational feedback.",
    mechanic: "Multiple choice.",
    icon: "⚡",
    instructions: "Choose the correct translation from four choices before moving to the next round.",
  },
  {
    id: "speed-challenge",
    name: "Speed Challenge",
    category: "Timed",
    description: "Race against a real countdown clock to test recall speed.",
    mechanic: "Timer countdown.",
    icon: "⏱️",
    instructions: "Answer as many words as you can in 30 seconds. Correct answers earn bonus time!",
  },
  {
    id: "picture-vocabulary",
    name: "Picture Vocabulary",
    category: "Visual",
    description: "Identify everyday objects, foods, and actions from visual cues.",
    mechanic: "Visual identification.",
    icon: "🖼️",
    instructions: "Observe the illustrated prompt and select the corresponding native-language word.",
  },
  {
    id: "daily-challenge",
    name: "Daily Challenge",
    category: "Quest",
    description: "A rotating challenge combining multiple skills for bonus XP.",
    mechanic: "Multi-skill test.",
    icon: "🌟",
    instructions: "Complete all 5 questions in today's featured rotation to claim your daily bonus.",
  },
];

export function GamesHub() {
  const { state } = useLearner();
  const profile = languages[state.target];
  const progress = state.progress[state.target];

  return (
    <div className="screen-stack">
      <header className="screen-heading">
        <div>
          <span className="eyebrow">{profile.native} · Educational Playground</span>
          <h1>Language Games</h1>
          <p>
            Reinforce vocabulary, listening, and sentence construction through 8 educational game modes tailored for {profile.name}.
          </p>
        </div>
        <div className="screen-actions">
          <div className="streak-badge glass-card">
            <span>🔥</span>
            <b>{progress.currentStreak || 0} Day Streak</b>
          </div>
          <div className="xp-pill glass-card">
            <Sparkles size={16} />
            <b>{progress.xp} XP</b>
          </div>
        </div>
      </header>

      <div className="game-grid">
        {gameModes.map((game) => {
          const isCompleted = progress.completedGames.includes(game.id);
          return (
            <Link
              href={`/app/games/${game.id}`}
              className={`game-card glass-card ${isCompleted ? "game-cleared" : ""}`}
              key={game.id}
            >
              <div className="game-art-badge">
                <span className="game-icon-glyph">{game.icon}</span>
                {isCompleted && <CheckCircle2 size={18} className="game-cleared-icon" />}
              </div>
              <div className="game-copy">
                <span className="eyebrow">{game.category}</span>
                <h2>{game.name}</h2>
                <p>{game.description}</p>
                <span className="access-note">Instructions: {game.instructions}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function GamePlayer({ gameId }: { gameId: string }) {
  const definition = gameModes.find((item) => item.id === gameId) ?? gameModes[0];
  const { state, recordActivity } = useLearner();
  const profile = languages[state.target];

  // Game state
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const startGame = () => {
    setStarted(true);
    setRound(0);
    setScore(0);
    setHearts(3);
    setGameOver(false);
  };

  const handleFinish = async (finalScore: number, accuracy: number) => {
    setGameOver(true);
    const res = await recordActivity({
      languageId: state.target,
      activityType: "game",
      activityId: definition.id,
      score: finalScore,
      accuracy,
      completedGameId: definition.id,
    });
    setEarnedXp(res.xpAwarded);
  };

  if (!started) {
    return (
      <div className="narrow-screen">
        <section className="glass-card game-intro-card">
          <Link href="/app/games" className="soft-button back-btn">
            <ChevronLeft size={16} /> All Games
          </Link>
          <div className="game-intro-icon">{definition.icon}</div>
          <span className="eyebrow">{definition.category} Challenge · {profile.name}</span>
          <h1>{definition.name}</h1>
          <p className="game-intro-desc">{definition.description}</p>

          <div className="instructions-box glass-card">
            <strong>How to Play:</strong>
            <p>{definition.instructions}</p>
            <div className="instruction-perks">
              <span>❤️ 3 Forgiving Hearts</span>
              <span>⭐ Up to 25 XP</span>
              <span>🎧 Native Audio Support</span>
            </div>
          </div>

          <button className="primary-button start-game-btn" onClick={startGame}>
            Start Game <ArrowRight size={18} />
          </button>
        </section>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="narrow-screen">
        <section className="glass-card completion-card">
          <div className="trophy-ring">
            <Trophy size={48} className="trophy-icon" />
          </div>
          <span className="eyebrow">Game Complete!</span>
          <h2>{definition.name} Finished</h2>
          <p>Great practice session in {profile.name}!</p>

          <div className="completion-stats-grid">
            <div className="stat-box">
              <Sparkles size={20} className="stat-icon" />
              <strong>+{earnedXp}</strong>
              <small>XP Awarded</small>
            </div>
            <div className="stat-box">
              <Trophy size={20} className="stat-icon" />
              <strong>{score}</strong>
              <small>Points Scored</small>
            </div>
            <div className="stat-box">
              <Heart size={20} className="stat-icon" />
              <strong>{hearts}/3</strong>
              <small>Hearts Left</small>
            </div>
          </div>

          <div className="completion-actions">
            <button className="primary-button" onClick={startGame}>
              Play Again <RotateCcw size={16} />
            </button>
            <Link className="soft-button" href="/app/games">
              Explore More Games
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="game-play-shell">
      <header className="game-play-header">
        <Link href="/app/games" className="icon-button" aria-label="Exit game">
          <ChevronLeft size={20} />
        </Link>
        <div className="game-title-info">
          <h2>{definition.name}</h2>
          <span>Round {round + 1}/5</span>
        </div>
        <div className="game-meta-pills">
          <span className="score-pill">
            <Sparkles size={14} /> {score} pts
          </span>
          <span className="hearts-pill">
            <Heart size={14} className="heart-active" /> {hearts}
          </span>
        </div>
      </header>

      <main className="game-play-body glass-card">
        {definition.id === "word-match" && (
          <WordMatchEngine
            languageId={state.target}
            onCompleteRound={(pts) => {
              const newScore = score + pts;
              setScore(newScore);
              if (round < 4) setRound((r) => r + 1);
              else handleFinish(newScore, hearts / 3);
            }}
            onMistake={() => setHearts((h) => Math.max(1, h - 1))}
          />
        )}

        {definition.id === "memory-match" && (
          <MemoryMatchEngine
            languageId={state.target}
            onCompleteRound={(pts) => {
              const newScore = score + pts;
              setScore(newScore);
              if (round < 2) setRound((r) => r + 1);
              else handleFinish(newScore, hearts / 3);
            }}
            onMistake={() => setHearts((h) => Math.max(1, h - 1))}
          />
        )}

        {definition.id === "sentence-builder" && (
          <SentenceBuilderEngine
            languageId={state.target}
            round={round}
            onCompleteRound={(pts, correct) => {
              if (correct) {
                const newScore = score + pts;
                setScore(newScore);
                if (round < 4) setRound((r) => r + 1);
                else handleFinish(newScore, hearts / 3);
              } else {
                setHearts((h) => Math.max(1, h - 1));
              }
            }}
          />
        )}

        {definition.id === "listening-challenge" && (
          <ListeningChallengeEngine
            languageId={state.target}
            round={round}
            onCompleteRound={(pts, correct) => {
              if (correct) {
                const newScore = score + pts;
                setScore(newScore);
                if (round < 4) setRound((r) => r + 1);
                else handleFinish(newScore, hearts / 3);
              } else {
                setHearts((h) => Math.max(1, h - 1));
              }
            }}
          />
        )}

        {definition.id === "speed-challenge" && (
          <SpeedChallengeEngine
            languageId={state.target}
            onFinish={(finalScore, accuracy) => handleFinish(finalScore, accuracy)}
          />
        )}

        {(definition.id === "quick-quiz" ||
          definition.id === "daily-challenge" ||
          definition.id === "picture-vocabulary") && (
          <QuizChallengeEngine
            gameId={definition.id}
            languageId={state.target}
            round={round}
            onCompleteRound={(pts, correct) => {
              if (correct) {
                const newScore = score + pts;
                setScore(newScore);
                if (round < 4) setRound((r) => r + 1);
                else handleFinish(newScore, hearts / 3);
              } else {
                setHearts((h) => Math.max(1, h - 1));
              }
            }}
          />
        )}
      </main>
    </div>
  );
}

// ----------------------------------------------------
// 1. WORD MATCH ENGINE
// ----------------------------------------------------
function WordMatchEngine({
  languageId,
  onCompleteRound,
  onMistake,
}: {
  languageId: LanguageId;
  onCompleteRound: (points: number) => void;
  onMistake: () => void;
}) {
  const currentItems = useMemo(() => {
    // Pick 4 concepts
    return [...concepts].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, []);

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState(false);

  const englishShuffled = useMemo(() => {
    return [...currentItems].sort(() => 0.5 - Math.random());
  }, [currentItems]);

  const handleTargetClick = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedTarget(id);
    if (selectedEnglish) {
      evaluateMatch(id, selectedEnglish);
    }
  };

  const handleEnglishClick = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedEnglish(id);
    if (selectedTarget) {
      evaluateMatch(selectedTarget, id);
    }
  };

  const evaluateMatch = (targetId: string, englishId: string) => {
    if (targetId === englishId) {
      playSound("success");
      const nextMatched = [...matchedIds, targetId];
      setMatchedIds(nextMatched);
      setSelectedTarget(null);
      setSelectedEnglish(null);

      if (nextMatched.length === currentItems.length) {
        window.setTimeout(() => onCompleteRound(20), 400);
      }
    } else {
      playSound("miss");
      onMistake();
      setWrongPair(true);
      window.setTimeout(() => {
        setWrongPair(false);
        setSelectedTarget(null);
        setSelectedEnglish(null);
      }, 600);
    }
  };

  return (
    <div className="match-engine-container">
      <p className="match-instruction">Pair the words with their English meanings:</p>
      <div className="match-columns-grid">
        <div className="match-column">
          {currentItems.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedTarget === item.id;
            return (
              <button
                key={item.id}
                disabled={isMatched}
                className={`match-card target-card ${isMatched ? "matched" : ""} ${isSelected ? "selected" : ""} ${wrongPair && isSelected ? "shake" : ""}`}
                onClick={() => handleTargetClick(item.id)}
              >
                <ScriptText language={languageId}>{item.values[languageId]}</ScriptText>
              </button>
            );
          })}
        </div>

        <div className="match-column">
          {englishShuffled.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedEnglish === item.id;
            return (
              <button
                key={item.id}
                disabled={isMatched}
                className={`match-card english-card ${isMatched ? "matched" : ""} ${isSelected ? "selected" : ""} ${wrongPair && isSelected ? "shake" : ""}`}
                onClick={() => handleEnglishClick(item.id)}
              >
                <span>{item.values.en}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. MEMORY MATCH ENGINE
// ----------------------------------------------------
type MemoryCard = {
  uid: string;
  conceptId: string;
  text: string;
  isNative: boolean;
};

function MemoryMatchEngine({
  languageId,
  onCompleteRound,
  onMistake,
}: {
  languageId: LanguageId;
  onCompleteRound: (points: number) => void;
  onMistake: () => void;
}) {
  const cards: MemoryCard[] = useMemo(() => {
    const selected = [...concepts].sort(() => 0.5 - Math.random()).slice(0, 4);
    const list: MemoryCard[] = [];
    selected.forEach((c) => {
      list.push({ uid: `${c.id}-target`, conceptId: c.id, text: c.values[languageId], isNative: true });
      list.push({ uid: `${c.id}-en`, conceptId: c.id, text: c.values.en, isNative: false });
    });
    return list.sort(() => 0.5 - Math.random());
  }, [languageId]);

  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);

  const handleCardClick = (card: MemoryCard) => {
    if (flippedUids.includes(card.uid) || matchedIds.includes(card.conceptId) || flippedUids.length >= 2) {
      return;
    }

    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      const cardA = cards.find((c) => c.uid === nextFlipped[0])!;
      const cardB = cards.find((c) => c.uid === nextFlipped[1])!;

      if (cardA.conceptId === cardB.conceptId) {
        playSound("success");
        const nextMatched = [...matchedIds, cardA.conceptId];
        setMatchedIds(nextMatched);
        setFlippedUids([]);
        if (nextMatched.length === cards.length / 2) {
          window.setTimeout(() => onCompleteRound(25), 500);
        }
      } else {
        playSound("miss");
        onMistake();
        window.setTimeout(() => setFlippedUids([]), 700);
      }
    }
  };

  return (
    <div className="memory-engine-container">
      <p className="match-instruction">Find all 4 matching pairs of words and meanings:</p>
      <div className="memory-grid">
        {cards.map((card) => {
          const isFlipped = flippedUids.includes(card.uid) || matchedIds.includes(card.conceptId);
          return (
            <button
              key={card.uid}
              className={`memory-tile ${isFlipped ? "flipped" : ""} ${matchedIds.includes(card.conceptId) ? "matched" : ""}`}
              onClick={() => handleCardClick(card)}
              disabled={matchedIds.includes(card.conceptId)}
            >
              {isFlipped ? (
                card.isNative ? (
                  <ScriptText language={languageId}>{card.text}</ScriptText>
                ) : (
                  <span>{card.text}</span>
                )
              ) : (
                <span className="card-back-symbol">LUFO</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. SENTENCE BUILDER ENGINE
// ----------------------------------------------------
function SentenceBuilderEngine({
  languageId,
  round,
  onCompleteRound,
}: {
  languageId: LanguageId;
  round: number;
  onCompleteRound: (points: number, correct: boolean) => void;
}) {
  const sentences = [
    { en: "Please give me water", target: "मला पाणी द्या", words: ["पाणी", "द्या", "मला"] },
    { en: "This is my friend", target: "हा माझा मित्र आहे", words: ["मित्र", "हा", "आहे", "माझा"] },
    { en: "Where is the market?", target: "बाजार कुठे आहे", words: ["कुठे", "बाजार", "आहे"] },
    { en: "The food is very good", target: "जेवण खूप छान आहे", words: ["खूप", "आहे", "जेवण", "छान"] },
    { en: "Hello, how are you?", target: "नमस्कार तुम्ही कसे आहात", words: ["कसे", "नमस्कार", "आहात", "तुम्ही"] },
  ];

  const current = sentences[round % sentences.length];
  const [built, setBuilt] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setBuilt([]);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [round]);

  const handleWordClick = (w: string) => {
    if (isAnswered) return;
    setBuilt((prev) => [...prev, w]);
  };

  const handleRemoveWord = (idx: number) => {
    if (isAnswered) return;
    setBuilt((prev) => prev.filter((_, i) => i !== idx));
  };

  const check = () => {
    const candidate = built.join(" ").trim();
    const correct = candidate === current.target;
    setIsCorrect(correct);
    setIsAnswered(true);
    playSound(correct ? "success" : "miss");
    onCompleteRound(15, correct);
  };

  return (
    <div className="builder-engine-container">
      <div className="builder-prompt-card">
        <span className="eyebrow">Translate this sentence</span>
        <h2>“{current.en}”</h2>
      </div>

      <div className="assembled-box">
        {built.length === 0 ? (
          <span className="placeholder-text">Click words below to arrange your sentence</span>
        ) : (
          built.map((w, idx) => (
            <button
              key={`${w}-${idx}`}
              className="built-chip"
              onClick={() => handleRemoveWord(idx)}
              disabled={isAnswered}
            >
              <ScriptText language={languageId}>{w}</ScriptText>
            </button>
          ))
        )}
      </div>

      <div className="source-chips">
        {current.words.map((w, idx) => (
          <button
            key={`${w}-${idx}`}
            className="source-chip"
            onClick={() => handleWordClick(w)}
            disabled={isAnswered}
          >
            <ScriptText language={languageId}>{w}</ScriptText>
          </button>
        ))}
      </div>

      <div className="builder-actions">
        {!isAnswered ? (
          <button
            className="primary-button check-btn"
            disabled={built.length === 0}
            onClick={check}
          >
            Check Sentence
          </button>
        ) : (
          <div className={`builder-feedback ${isCorrect ? "correct" : "incorrect"}`}>
            <strong>{isCorrect ? "Excellent phrasing!" : `Correct: ${current.target}`}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. LISTENING CHALLENGE ENGINE
// ----------------------------------------------------
function ListeningChallengeEngine({
  languageId,
  round,
  onCompleteRound,
}: {
  languageId: LanguageId;
  round: number;
  onCompleteRound: (points: number, correct: boolean) => void;
}) {
  const profile = languages[languageId];
  const concept = concepts[round % concepts.length];
  const choices = useMemo(() => {
    const distractors = concepts.filter((c) => c.id !== concept.id).slice(0, 3);
    return [concept, ...distractors].sort(() => 0.5 - Math.random());
  }, [concept]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    setSelectedId(null);
    setIsAnswered(false);
    // Play sound initially
    speakText(concept.values[languageId], profile.locale);
  }, [round, concept, languageId, profile.locale]);

  const handlePlayAudio = (slow = false) => {
    speakText(concept.values[languageId], profile.locale, { rate: slow ? 0.6 : 0.85 });
  };

  const handleSelect = (id: string) => {
    if (isAnswered) return;
    setSelectedId(id);
    setIsAnswered(true);
    const correct = id === concept.id;
    playSound(correct ? "success" : "miss");
    onCompleteRound(15, correct);
  };

  return (
    <div className="listening-engine-container">
      <span className="eyebrow">Listening Comprehension</span>
      <h2>What word do you hear?</h2>

      <div className="listening-audio-controls">
        <button className="primary-button audio-main-btn" onClick={() => handlePlayAudio(false)}>
          <Volume2 size={32} />
          <span>Play Voice</span>
        </button>
        <button className="soft-button audio-slow-btn" onClick={() => handlePlayAudio(true)}>
          Play Slow
        </button>
      </div>

      <div className="listening-choices-grid">
        {choices.map((c) => {
          const isSelected = selectedId === c.id;
          let cls = "";
          if (isAnswered) {
            if (c.id === concept.id) cls = "correct";
            else if (isSelected) cls = "incorrect";
          }
          return (
            <button
              key={c.id}
              className={`choice-card ${cls}`}
              disabled={isAnswered}
              onClick={() => handleSelect(c.id)}
            >
              <span className="choice-text">
                <ScriptText language={languageId}>{c.values[languageId]}</ScriptText>
              </span>
              {isAnswered && <small className="translit">{c.transliteration[languageId]}</small>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 5. SPEED CHALLENGE ENGINE (Real 30s Countdown Timer)
// ----------------------------------------------------
function SpeedChallengeEngine({
  languageId,
  onFinish,
}: {
  languageId: LanguageId;
  onFinish: (score: number, accuracy: number) => void;
}) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);

  const currentConcept = concepts[currentIdx % concepts.length];
  const choices = useMemo(() => {
    const distractors = concepts.filter((c) => c.id !== currentConcept.id).slice(0, 3);
    return [currentConcept, ...distractors].sort(() => 0.5 - Math.random());
  }, [currentConcept]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const acc = answeredCount > 0 ? correctCount / answeredCount : 1;
          onFinish(score, acc);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [score, answeredCount, correctCount, onFinish]);

  const handleAnswer = (choiceId: string) => {
    setAnsweredCount((c) => c + 1);
    if (choiceId === currentConcept.id) {
      playSound("success");
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
      setTimeLeft((t) => t + 2); // bonus time!
    } else {
      playSound("miss");
    }
    setCurrentIdx((i) => i + 1);
  };

  return (
    <div className="speed-engine-container">
      <div className="speed-timer-bar">
        <Clock size={20} className="timer-icon" />
        <span className={`timer-seconds ${timeLeft <= 5 ? "urgent" : ""}`}>{timeLeft}s</span>
        <div className="timer-track">
          <div className="timer-fill" style={{ width: `${(timeLeft / 30) * 100}%` }} />
        </div>
      </div>

      <div className="speed-prompt-card">
        <span className="eyebrow">Match English meaning</span>
        <h2>“{currentConcept.values.en}”</h2>
      </div>

      <div className="speed-choices-grid">
        {choices.map((c) => (
          <button
            key={c.id}
            className="choice-card speed-btn"
            onClick={() => handleAnswer(c.id)}
          >
            <ScriptText language={languageId}>{c.values[languageId]}</ScriptText>
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 6. QUIZ / PICTURE / DAILY CHALLENGE ENGINE
// ----------------------------------------------------
function QuizChallengeEngine({
  gameId,
  languageId,
  round,
  onCompleteRound,
}: {
  gameId: string;
  languageId: LanguageId;
  round: number;
  onCompleteRound: (points: number, correct: boolean) => void;
}) {
  const concept = concepts[round % concepts.length];
  const choices = useMemo(() => {
    const distractors = concepts.filter((c) => c.id !== concept.id).slice(0, 3);
    return [concept, ...distractors].sort(() => 0.5 - Math.random());
  }, [concept]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    setSelectedId(null);
    setIsAnswered(false);
  }, [round]);

  const handleSelect = (id: string) => {
    if (isAnswered) return;
    setSelectedId(id);
    setIsAnswered(true);
    const correct = id === concept.id;
    playSound(correct ? "success" : "miss");
    onCompleteRound(15, correct);
  };

  return (
    <div className="quiz-engine-container">
      <div className="quiz-prompt-header">
        {gameId === "picture-vocabulary" && (
          <span className="picture-glyph-big">{concept.emoji}</span>
        )}
        <span className="eyebrow">
          {gameId === "picture-vocabulary" ? "Identify this object:" : "Choose the translation:"}
        </span>
        <h2>“{concept.values.en}”</h2>
      </div>

      <div className="choices-grid">
        {choices.map((c) => {
          const isSelected = selectedId === c.id;
          let cls = "";
          if (isAnswered) {
            if (c.id === concept.id) cls = "correct";
            else if (isSelected) cls = "incorrect";
          }
          return (
            <button
              key={c.id}
              className={`choice-card ${cls}`}
              disabled={isAnswered}
              onClick={() => handleSelect(c.id)}
            >
              <span className="choice-text">
                <ScriptText language={languageId}>{c.values[languageId]}</ScriptText>
              </span>
              <small className="translit">{c.transliteration[languageId]}</small>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="quiz-explanation-box">
          <p>{concept.usage}</p>
        </div>
      )}
    </div>
  );
}
