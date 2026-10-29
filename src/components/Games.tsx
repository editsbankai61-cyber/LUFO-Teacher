import { Link } from "@/components/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronLeft, ChevronRight, CirclePause, CirclePlay, Heart, Lightbulb, RotateCcw, Shield, Sparkles, Volume2, X } from "lucide-react";
import { gameDefinitions, getQuestion, languages, segmentGraphemes } from "@/lib/content";
import { useLearner } from "@/lib/store";
import { playSound } from "@/lib/sound";
import { ScriptText } from "./LanguageLens";

export function GamesHub() {
  const { state } = useLearner();
  const language = languages[state.target];
  return <div className="screen-stack">
    <ScreenHeading eyebrow="13 ways to practice" title="Play with meaning" description={`Every game now draws from ${language.name} content. Timers are off by default, sound is optional, and every movement mechanic has a named-control path.`} />
    <div className="game-grid">
      {gameDefinitions.map((game, index) => <Link href={`/app/games/${game.id}`} className="game-card glass-card" key={game.id}>
        <div className={`game-art game-art-${index + 1}`} aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span><i /><b /></div>
        <div className="game-copy"><span className="eyebrow">{index < 3 ? "Good first pick" : "Practice deck"}</span><h2>{game.name}</h2><p>{game.mechanic}</p><span className="access-note">Accessible route: {game.alternative}</span></div>
      </Link>)}
    </div>
  </div>;
}

export function GamePlayer({ gameId }: { gameId: string }) {
  const definition = gameDefinitions.find((item) => item.id === gameId) ?? gameDefinitions[0];
  const { state, updateProgress } = useLearner();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [paused, setPaused] = useState(false);
  const [feedback, setFeedback] = useState("Practice round: explore the controls. It does not affect mastery.");
  const [answered, setAnswered] = useState(false);
  const [hint, setHint] = useState(false);
  const question = getQuestion(state.target, round);
  const language = languages[state.target];

  const choose = (value: string, assisted = hint) => {
    if (paused || answered) return;
    const correct = value === question.answer;
    playSound(correct ? "success" : "miss");
    setAnswered(true);
    setFeedback(correct ? `${question.answer} matches “${question.concept.values.en}”. ${assisted ? "You used a hint; this is logged as assisted practice." : "Independent recall recorded."}` : `${value} does not fit this prompt. ${question.answer} is the contextual match. ${question.concept.usage}`);
    if (correct) setScore((current) => current + (assisted ? 6 : 10));
    else setHearts((current) => Math.max(1, current - 1));
    if (round > 0) updateProgress(state.target, (progress) => ({
      ...progress,
      xp: progress.xp + (correct ? (assisted ? 3 : 5) : 1),
      assistedAnswers: progress.assistedAnswers + (assisted ? 1 : 0),
      independentAnswers: progress.independentAnswers + (correct && !assisted ? 1 : 0),
    }));
  };

  const next = () => {
    const nextRound = round + 1;
    setRound(nextRound);
    setAnswered(false);
    setHint(false);
    setFeedback(nextRound === 1 ? "Practice complete. This round contributes to your review history." : "New round ready.");
    if (nextRound >= 4) updateProgress(state.target, (progress) => ({ ...progress, completedGames: progress.completedGames.includes(definition.id) ? progress.completedGames : [...progress.completedGames, definition.id] }));
  };

  const reset = () => { setRound(0); setScore(0); setHearts(3); setAnswered(false); setHint(false); setFeedback("Practice round restarted."); };

  return <div className="game-page">
    <div className="game-topline">
      <Link href="/app/games" className="soft-button"><ChevronLeft size={17} />All games</Link>
      <div className="game-stats"><span><Sparkles size={16} />{score} XP</span><span><Heart size={16} />{hearts} forgiving hearts</span><span>Round {Math.min(round + 1, 5)}/5</span></div>
      <button className="soft-button" onClick={() => setPaused((value) => !value)}>{paused ? <CirclePlay size={17} /> : <CirclePause size={17} />}{paused ? "Resume" : "Pause"}</button>
    </div>
    <header className="game-heading"><span className="eyebrow">{round === 0 ? "Practice round" : `Learning round ${round}`}</span><h1>{definition.name}</h1><p>{definition.mechanic}</p><span className="access-note">{definition.alternative} Sound and precise gestures are not required.</span></header>
    <div className={`game-stage game-${definition.id} ${paused ? "paused" : ""}`}>
      {paused ? <div className="pause-state"><CirclePause size={44} /><h2>Game paused</h2><p>Your round is safe. Resume whenever your energy allows.</p><button className="primary-button" onClick={() => setPaused(false)}>Resume gently</button></div> : <>
        <div className="question-banner"><span>Find this meaning</span><strong>{question.concept.values.en}</strong>{hint && <div className="hint-text">Hint: transliteration is <b>{question.concept.transliteration[state.target]}</b></div>}</div>
        <Mechanic id={definition.id} choices={question.choices} answer={question.answer} language={state.target} disabled={answered} onChoose={choose} round={round} />
      </>}
    </div>
    <div className={`feedback-panel ${answered ? (feedback.includes("does not fit") ? "incorrect" : "correct") : "neutral"}`} role="status" aria-live="polite">
      <div className="feedback-icon">{answered ? (feedback.includes("does not fit") ? <X /> : <Check />) : <Sparkles />}</div>
      <div><strong>{answered ? (feedback.includes("does not fit") ? "Useful clue" : "Connection made") : "LUFO’s note"}</strong><p>{feedback}</p></div>
      <div className="row-actions">
        {!answered && <button className="soft-button" onClick={() => setHint(true)}><Lightbulb size={17} />Show hint</button>}
        {answered && round < 4 && <button className="primary-button" onClick={next}>Next round<ArrowRight size={17} /></button>}
        {answered && round >= 4 && <Link className="primary-button" href="/app/dashboard">See progress<ArrowRight size={17} /></Link>}
        <button className="icon-button" onClick={reset} aria-label="Restart game" title="Restart"><RotateCcw size={17} /></button>
      </div>
    </div>
    <p className="assessment-note">This activity records vocabulary recognition. Hints are welcome and logged as assisted practice, not independent recall. No access or XP is removed for using help.</p>
  </div>;
}

function Mechanic({ id, choices, answer, language, disabled, onChoose, round }: { id: string; choices: string[]; answer: string; language: keyof typeof languages; disabled: boolean; onChoose: (value: string) => void; round: number }) {
  switch (id) {
    case "word-snake": return <Snake choices={choices} language={language} disabled={disabled} onChoose={onChoose} />;
    case "bubble-shooter": return <Bubbles choices={choices} language={language} disabled={disabled} onChoose={onChoose} />;
    case "kite-battle": return <Kite choices={choices} language={language} disabled={disabled} onChoose={onChoose} />;
    case "word-slash": return <Slash choices={choices} language={language} disabled={disabled} onChoose={onChoose} />;
    case "whack-a-word": return <Whack choices={choices} language={language} disabled={disabled} onChoose={onChoose} />;
    case "word-rain": return <Rain choices={choices} language={language} disabled={disabled} onChoose={onChoose} />;
    case "flappy-gate": return <Gates choices={choices} language={language} disabled={disabled} onChoose={onChoose} />;
    case "memory-match": return <Memory choices={choices} answer={answer} language={language} disabled={disabled} onChoose={onChoose} />;
    case "lane-runner": return <Lanes choices={choices} language={language} disabled={disabled} onChoose={onChoose} />;
    case "rhythm-tap": return <Rhythm answer={answer} language={language} disabled={disabled} onChoose={onChoose} />;
    case "kabaddi-raid": return <Raid choices={choices} language={language} disabled={disabled} onChoose={onChoose} />;
    case "word-builder": return <Builder answer={answer} language={language} disabled={disabled} onChoose={onChoose} round={round} />;
    default: return <Boss choices={choices} language={language} disabled={disabled} onChoose={onChoose} round={round} />;
  }
}

type ChoiceProps = { choices: string[]; language: keyof typeof languages; disabled: boolean; onChoose: (value: string) => void };
const Word = ({ value, language }: { value: string; language: keyof typeof languages }) => <ScriptText language={language}>{value}</ScriptText>;

function Snake({ choices, language, disabled, onChoose }: ChoiceProps) {
  const [cell, setCell] = useState(0);
  const move = (delta: number) => setCell((current) => Math.max(0, Math.min(3, current + delta)));
  return <div className="snake-layout"><div className="snake-board" role="grid" aria-label="Four-cell turn-based snake route">{choices.map((choice, index) => <div role="gridcell" key={choice} className={cell === index ? "current" : ""}><span>{index === cell ? "LUFO →" : `${index + 1}`}</span><Word value={choice} language={language} /></div>)}</div><div className="direction-pad" aria-label="Step-by-step directional controls"><button onClick={() => move(-2)} aria-label="Move up"><ArrowUp /></button><button onClick={() => move(-1)} aria-label="Move left"><ArrowLeft /></button><button onClick={() => move(1)} aria-label="Move right"><ArrowRight /></button><button onClick={() => move(2)} aria-label="Move down"><ArrowDown /></button><button className="eat" disabled={disabled} onClick={() => onChoose(choices[cell])}>Eat word {cell + 1}</button></div></div>;
}

function Bubbles({ choices, language, disabled, onChoose }: ChoiceProps) {
  return <div className="bubble-field" aria-label="Numbered word bubbles">{choices.map((choice, index) => <button disabled={disabled} onClick={() => onChoose(choice)} key={choice} className={`bubble bubble-${index + 1}`} aria-label={`Bubble ${index + 1}: ${choice}`}><small>{index + 1}</small><Word value={choice} language={language} /></button>)}</div>;
}

function Kite({ choices, language, disabled, onChoose }: ChoiceProps) {
  const [move, setMove] = useState("Hold");
  return <div className="kite-field"><div className="kite-visual" aria-hidden="true"><div className="kite-shape" /><div className="kite-line" /></div><fieldset className="strategy-choices"><legend>1. Choose an untimed kite move</legend>{["Climb", "Hold", "Sweep"].map((item) => <button key={item} className={move === item ? "selected" : ""} onClick={() => setMove(item)}>{item}</button>)}</fieldset><div className="choice-row" aria-label={`2. Answer, then ${move.toLowerCase()}`}>{choices.map((choice) => <button disabled={disabled} onClick={() => onChoose(choice)} key={choice}><Word value={choice} language={language} /></button>)}</div></div>;
}

function Slash({ choices, language, disabled, onChoose }: ChoiceProps) {
  return <div className="slash-field"><div className="slash-trail" aria-hidden="true" />{choices.map((choice, index) => <button disabled={disabled} onClick={() => onChoose(choice)} key={choice} className={`slash-word at-${index + 1}`} aria-label={`Slash word ${choice}`}><Word value={choice} language={language} /><span>select to slash</span></button>)}</div>;
}

function Whack({ choices, language, disabled, onChoose }: ChoiceProps) {
  return <div className="whack-grid" role="group" aria-label="Stable untimed word grid">{[...choices, ...choices.slice(0, 2)].map((choice, index) => <button disabled={disabled} onClick={() => onChoose(choice)} key={`${choice}-${index}`}><span className="mole" aria-hidden="true" /><Word value={choice} language={language} /></button>)}</div>;
}

function Rain({ choices, language, disabled, onChoose }: ChoiceProps) {
  const [index, setIndex] = useState(0);
  return <div className="rain-field"><div className="rain-drop"><span>Queued card {index + 1} of {choices.length}</span><Word value={choices[index]} language={language} /></div><div className="queue-controls"><button onClick={() => setIndex((index - 1 + choices.length) % choices.length)} aria-label="Previous queued word"><ChevronLeft /></button><button className="primary-button" disabled={disabled} onClick={() => onChoose(choices[index])}>Catch this word</button><button onClick={() => setIndex((index + 1) % choices.length)} aria-label="Next queued word"><ChevronRight /></button></div></div>;
}

function Gates({ choices, language, disabled, onChoose }: ChoiceProps) {
  return <div className="gate-field"><div className="traveler" aria-hidden="true">LUFO</div>{choices.map((choice, index) => <button disabled={disabled} onClick={() => onChoose(choice)} key={choice} className="answer-gate"><span>Gate {index + 1}</span><Word value={choice} language={language} /><small>Step through</small></button>)}</div>;
}

function Memory({ choices, answer, language, disabled, onChoose }: ChoiceProps & { answer: string }) {
  const [open, setOpen] = useState<number[]>([]);
  const cards = useMemo(() => [answer, "Matching meaning", ...choices.filter((item) => item !== answer).slice(0, 2), "Another meaning"], [choices, answer]);
  const flip = (index: number) => {
    const next = open.includes(index) ? open : [...open, index].slice(-2);
    setOpen(next);
    if (next.includes(0) && next.includes(1)) onChoose(answer);
    else if (next.length === 2) window.setTimeout(() => { setOpen([]); if (!disabled) onChoose("not-a-match"); }, 450);
  };
  return <div className="memory-list" role="list" aria-label="Ordered memory cards">{cards.map((card, index) => <button role="listitem" disabled={disabled} onClick={() => flip(index)} key={`${card}-${index}`} aria-pressed={open.includes(index)}><span>Card {index + 1}</span><strong>{open.includes(index) ? (index === 1 ? "Matching meaning" : <Word value={card} language={language} />) : "Face down"}</strong></button>)}</div>;
}

function Lanes({ choices, language, disabled, onChoose }: ChoiceProps) {
  return <div className="lane-field"><div className="runner" aria-hidden="true">LUFO</div>{choices.map((choice, index) => <button className="lane" disabled={disabled} onClick={() => onChoose(choice)} key={choice}><span>Lane {index + 1}</span><Word value={choice} language={language} /><i aria-hidden="true" /></button>)}</div>;
}

function Rhythm({ answer, language, disabled, onChoose }: Omit<ChoiceProps, "choices"> & { answer: string }) {
  const pieces = segmentGraphemes(answer, languages[language].locale).filter((part) => part.trim());
  const [sequence, setSequence] = useState<string[]>([]);
  const add = (piece: string) => setSequence((current) => [...current, piece]);
  return <div className="rhythm-field"><div className="visual-beat" aria-label="Visual four-beat pattern"><i /><i /><i /><i /></div><p>Arrange the visible syllable or grapheme beats. This text alternative does not claim to assess hearing.</p><div className="built-sequence" aria-live="polite">{sequence.length ? sequence.join(" · ") : "Sequence is empty"}</div><div className="choice-row">{pieces.map((piece, index) => <button key={`${piece}-${index}`} onClick={() => add(piece)}><Word value={piece} language={language} /></button>)}</div><div className="row-actions"><button className="soft-button" onClick={() => setSequence([])}>Clear</button><button className="primary-button" disabled={disabled || sequence.length === 0} onClick={() => onChoose(sequence.join(""))}>Play visual sequence</button><button className="icon-button" aria-label="Optional sound unavailable for this authored item" title="No authored audio"><Volume2 /></button></div></div>;
}

function Raid({ choices, language, disabled, onChoose }: ChoiceProps) {
  const [plan, setPlan] = useState<string[]>([]);
  const moves = ["Enter", "Collect", "Return"];
  return <div className="raid-field"><div className="raid-plan"><span>Home</span>{moves.map((move, index) => <button key={move} aria-pressed={plan.includes(move)} onClick={() => setPlan((current) => current.includes(move) ? current.filter((item) => item !== move) : [...current, move])}><b>{index + 1}</b>{move}</button>)}<span>Safe</span></div><p>Plan all three moves in any pace, then collect the matching word.</p><div className="choice-row">{choices.map((choice) => <button disabled={disabled || plan.length < 3} onClick={() => onChoose(choice)} key={choice}><Word value={choice} language={language} /></button>)}</div></div>;
}

function Builder({ answer, language, disabled, onChoose, round }: Omit<ChoiceProps, "choices"> & { answer: string; round: number }) {
  const pieces = useMemo(() => segmentGraphemes(answer, languages[language].locale).filter((part) => part.trim()).sort((a, b) => (a.codePointAt(0)! + round) % 3 - (b.codePointAt(0)! + round) % 3), [answer, language, round]);
  const [built, setBuilt] = useState<string[]>([]);
  return <div className="builder-field"><p>These are authored grapheme units, not naively split code points.</p><div className="build-slot" aria-live="polite"><ScriptText language={language}>{built.join("") || "Select pieces below"}</ScriptText></div><div className="grapheme-pieces">{pieces.map((piece, index) => <button key={`${piece}-${index}`} onClick={() => setBuilt((current) => [...current, piece])}><Word value={piece} language={language} /><span>Add piece {index + 1}</span></button>)}</div><div className="row-actions"><button className="soft-button" onClick={() => setBuilt((current) => current.slice(0, -1))}>Remove last</button><button className="soft-button" onClick={() => setBuilt([])}>Clear</button><button className="primary-button" disabled={disabled || !built.length} onClick={() => onChoose(built.join(""))}>Check build</button></div></div>;
}

function Boss({ choices, language, disabled, onChoose, round }: ChoiceProps & { round: number }) {
  return <div className="boss-field"><div className="boss-figure" aria-label="Text description: a calm ink-cloud character with three learning shields"><span>ROUND {round + 1}</span><div className="boss-core"><Shield /><Shield /><Shield /></div><p>Vocabulary shield · Context shield · Recall shield</p></div><div className="boss-answers">{choices.map((choice, index) => <button disabled={disabled} onClick={() => onChoose(choice)} key={choice}><span>Strike {index + 1}</span><Word value={choice} language={language} /></button>)}</div></div>;
}

function ScreenHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="screen-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>;
}
