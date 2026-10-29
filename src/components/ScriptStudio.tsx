import { useState, useRef } from "react";
import {
  CheckCircle2,
  Eraser,
  PenTool,
  Volume2,
  X,
} from "lucide-react";
import { languages } from "@/lib/content";
import { useLearner } from "@/lib/store";
import { playSound } from "@/lib/sound";
import { speakText } from "@/lib/audio";
import { ScriptText } from "./LanguageLens";

export type ScriptChar = {
  glyph: string;
  name: string;
  transliteration: string;
  exampleWord: string;
  exampleMeaning: string;
  category: "vowel" | "consonant" | "matra" | "conjunct";
  confusedWith?: string;
  note?: string;
};

export const devanagariScriptData: ScriptChar[] = [
  // Vowels (स्वर)
  { glyph: "अ", name: "a", transliteration: "a", exampleWord: "अननस (Pineapple)", exampleMeaning: "Short open 'a'", category: "vowel" },
  { glyph: "आ", name: "aa", transliteration: "ā", exampleWord: "आंबा (Mango)", exampleMeaning: "Long 'aa'", category: "vowel" },
  { glyph: "इ", name: "i", transliteration: "i", exampleWord: "इमारत (Building)", exampleMeaning: "Short 'i'", category: "vowel" },
  { glyph: "ई", name: "ee", transliteration: "ī", exampleWord: "ईडलिंबू (Lemon)", exampleMeaning: "Long 'ee'", category: "vowel" },
  { glyph: "उ", name: "u", transliteration: "u", exampleWord: "उखळ (Mortar)", exampleMeaning: "Short 'u'", category: "vowel" },
  { glyph: "ऊ", name: "oo", transliteration: "ū", exampleWord: "ऊस (Sugarcane)", exampleMeaning: "Long 'oo'", category: "vowel" },
  { glyph: "ए", name: "e", transliteration: "e", exampleWord: "एक (One)", exampleMeaning: "Pure vowel 'e'", category: "vowel" },
  { glyph: "ऐ", name: "ai", transliteration: "ai", exampleWord: "ऐरण (Anvil)", exampleMeaning: "Diphthong 'ai'", category: "vowel" },
  { glyph: "ओ", name: "o", transliteration: "o", exampleWord: "ओठ (Lips)", exampleMeaning: "Pure vowel 'o'", category: "vowel" },
  { glyph: "औ", name: "au", transliteration: "au", exampleWord: "औषध (Medicine)", exampleMeaning: "Diphthong 'au'", category: "vowel" },
  { glyph: "अं", name: "am", transliteration: "aṁ", exampleWord: "अंगठी (Ring)", exampleMeaning: "Anusvara nasal", category: "vowel" },

  // Consonants (व्यंजन)
  { glyph: "क", name: "ka", transliteration: "ka", exampleWord: "कमळ (Lotus)", exampleMeaning: "Velar voiceless", category: "consonant" },
  { glyph: "ख", name: "kha", transliteration: "kha", exampleWord: "खडू (Chalk)", exampleMeaning: "Aspirated velar", category: "consonant", confusedWith: "र + व (rav)" },
  { glyph: "ग", name: "ga", transliteration: "ga", exampleWord: "गणपती (Ganesha)", exampleMeaning: "Voiced velar", category: "consonant" },
  { glyph: "घ", name: "gha", transliteration: "gha", exampleWord: "घर (Home)", exampleMeaning: "Aspirated voiced velar", category: "consonant", confusedWith: "ध (dha)" },
  { glyph: "च", name: "cha", transliteration: "ca", exampleWord: "चमचा (Spoon)", exampleMeaning: "Palatal voiceless", category: "consonant" },
  { glyph: "छ", name: "chha", transliteration: "cha", exampleWord: "छत्री (Umbrella)", exampleMeaning: "Aspirated palatal", category: "consonant" },
  { glyph: "ज", name: "ja", transliteration: "ja", exampleWord: "जहाज (Ship)", exampleMeaning: "Voiced palatal", category: "consonant" },
  { glyph: "झ", name: "jha", transliteration: "jha", exampleWord: "झरा (Spring/Stream)", exampleMeaning: "Aspirated palatal", category: "consonant" },
  { glyph: "ट", name: "ta (retroflex)", transliteration: "ṭa", exampleWord: "टोपी (Cap)", exampleMeaning: "Retroflex voiceless", category: "consonant", confusedWith: "ठ (ṭha)" },
  { glyph: "ठ", name: "tha (retroflex)", transliteration: "ṭha", exampleWord: "ठसा (Stamp/Print)", exampleMeaning: "Aspirated retroflex", category: "consonant" },
  { glyph: "ड", name: "da (retroflex)", transliteration: "ḍa", exampleWord: "डबा (Box/Tiffin)", exampleMeaning: "Voiced retroflex", category: "consonant" },
  { glyph: "ढ", name: "dha (retroflex)", transliteration: "ḍha", exampleWord: "ढग (Cloud)", exampleMeaning: "Aspirated voiced retroflex", category: "consonant" },
  { glyph: "ण", name: "na (retroflex)", transliteration: "ṇa", exampleWord: "बाण (Arrow)", exampleMeaning: "Retroflex nasal", category: "consonant" },
  { glyph: "त", name: "ta (dental)", transliteration: "ta", exampleWord: "तवा (Pan)", exampleMeaning: "Dental voiceless", category: "consonant" },
  { glyph: "थ", name: "tha (dental)", transliteration: "tha", exampleWord: "थवा (Flock of birds)", exampleMeaning: "Aspirated dental", category: "consonant" },
  { glyph: "द", name: "da (dental)", transliteration: "da", exampleWord: "दवा (Medicine)", exampleMeaning: "Voiced dental", category: "consonant" },
  { glyph: "ध", name: "dha (dental)", transliteration: "dha", exampleWord: "धनुष्य (Bow)", exampleMeaning: "Aspirated voiced dental", category: "consonant", confusedWith: "घ (gha)" },
  { glyph: "न", name: "na (dental)", transliteration: "na", exampleWord: "नळ (Tap)", exampleMeaning: "Dental nasal", category: "consonant" },
  { glyph: "प", name: "pa", transliteration: "pa", exampleWord: "पतंग (Kite)", exampleMeaning: "Bilabial voiceless", category: "consonant" },
  { glyph: "फ", name: "pha", transliteration: "pha", exampleWord: "फळ (Fruit)", exampleMeaning: "Aspirated bilabial", category: "consonant" },
  { glyph: "ब", name: "ba", transliteration: "ba", exampleWord: "बदक (Duck)", exampleMeaning: "Voiced bilabial", category: "consonant" },
  { glyph: "भ", name: "bha", transliteration: "bha", exampleWord: "भात (Rice)", exampleMeaning: "Aspirated voiced bilabial", category: "consonant", confusedWith: "म (ma)" },
  { glyph: "म", name: "ma", transliteration: "ma", exampleWord: "मगर (Crocodile)", exampleMeaning: "Bilabial nasal", category: "consonant", confusedWith: "भ (bha)" },
  { glyph: "य", name: "ya", transliteration: "ya", exampleWord: "यज्ञ (Sacred ritual)", exampleMeaning: "Palatal semivowel", category: "consonant" },
  { glyph: "र", name: "ra", transliteration: "ra", exampleWord: "रवी (Churner)", exampleMeaning: "Alveolar trill", category: "consonant" },
  { glyph: "ल", name: "la", transliteration: "la", exampleWord: "लसूण (Garlic)", exampleMeaning: "Lateral approximant", category: "consonant" },
  { glyph: "व", name: "va", transliteration: "va", exampleWord: "वड (Banyan tree)", exampleMeaning: "Labiodental approximant", category: "consonant" },
  { glyph: "श", name: "sha (palatal)", transliteration: "śa", exampleWord: "शहामृग (Ostrich)", exampleMeaning: "Palatal sibilant", category: "consonant" },
  { glyph: "ष", name: "sha (retroflex)", transliteration: "ṣa", exampleWord: "षटकोन (Hexagon)", exampleMeaning: "Retroflex sibilant", category: "consonant" },
  { glyph: "स", name: "sa (dental)", transliteration: "sa", exampleWord: "ससा (Rabbit)", exampleMeaning: "Dental sibilant", category: "consonant" },
  { glyph: "ह", name: "ha", transliteration: "ha", exampleWord: "हत्ती (Elephant)", exampleMeaning: "Glottal fricative", category: "consonant" },
  { glyph: "ळ", name: "la (retroflex)", transliteration: "ḷa", exampleWord: "बाळ (Child)", exampleMeaning: "Distinctive Marathi retroflex lateral", category: "consonant" },

  // Matras (स्वरचिन्हे)
  { glyph: "ा", name: "Kana (आ मात्रा)", transliteration: "ā", exampleWord: "क + ा = का (Kaa)", exampleMeaning: "Attached right bar for long 'aa'", category: "matra" },
  { glyph: "ि", name: "Pahili Velanti (इ मात्रा)", transliteration: "i", exampleWord: "क + ि = कि (Ki)", exampleMeaning: "Left hook for short 'i'", category: "matra" },
  { glyph: "ी", name: "Dusri Velanti (ई मात्रा)", transliteration: "ī", exampleWord: "क + ी = की (Kee)", exampleMeaning: "Right hook for long 'ee'", category: "matra" },
  { glyph: "ु", name: "Pahila Ukaar (उ मात्रा)", transliteration: "u", exampleWord: "क + ु = कु (Ku)", exampleMeaning: "Bottom curl for short 'u'", category: "matra" },
  { glyph: "ू", name: "Dusra Ukaar (ऊ मात्रा)", transliteration: "ū", exampleWord: "क + ू = कू (Koo)", exampleMeaning: "Bottom tail for long 'oo'", category: "matra" },
  { glyph: "े", name: "Ek Maatra (ए मात्रा)", transliteration: "e", exampleWord: "क + े = के (Ke)", exampleMeaning: "Top stroke for vowel 'e'", category: "matra" },
  { glyph: "ै", name: "Don Maatre (ऐ मात्रा)", transliteration: "ai", exampleWord: "क + ै = कै (Kai)", exampleMeaning: "Two top strokes for diphthong 'ai'", category: "matra" },
  { glyph: "ो", name: "Kana-Maatra (ओ मात्रा)", transliteration: "o", exampleWord: "क + ो = को (Ko)", exampleMeaning: "Bar + stroke for vowel 'o'", category: "matra" },
  { glyph: "ौ", name: "Kana-Don Maatre (औ मात्रा)", transliteration: "au", exampleWord: "क + ौ = कौ (Kau)", exampleMeaning: "Bar + two strokes for 'au'", category: "matra" },
  { glyph: "ं", name: "Anusvara", transliteration: "aṁ", exampleWord: "क + ं = कं (Kam)", exampleMeaning: "Nasal dot above headline", category: "matra" },

  // Conjuncts (जोडाक्षरे)
  { glyph: "क्ष", name: "ksha", transliteration: "kṣa", exampleWord: "क + ष = क्ष (kṣa)", exampleMeaning: "Important Sanskrit-origin conjunct", category: "conjunct" },
  { glyph: "ज्ञ", name: "dnya / jna", transliteration: "jña", exampleWord: "ज + ञ = ज्ञ (dnyā / jña)", exampleMeaning: "Pronounced 'dnya' in Marathi", category: "conjunct" },
  { glyph: "त्र", name: "tra", transliteration: "tra", exampleWord: "त + र = त्र (tra)", exampleMeaning: "Dental + rhotic conjunct", category: "conjunct" },
  { glyph: "श्र", name: "shra", transliteration: "śra", exampleWord: "श + र = श्र (śra)", exampleMeaning: "Sibilant + rhotic conjunct", category: "conjunct" },
];

export function ScriptStudio() {
  const { state, recordActivity } = useLearner();
  const profile = languages[state.target];
  const [activeTab, setActiveTab] = useState<"vowel" | "consonant" | "matra" | "conjunct">("vowel");
  const [selectedChar, setSelectedChar] = useState<ScriptChar>(devanagariScriptData[0]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);

  // Canvas drawing ref for stroke tracing practice
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const filteredChars = devanagariScriptData.filter((c) => c.category === activeTab);

  const handleAudio = (text: string) => {
    speakText(text, profile.locale);
  };

  // Canvas drawing functions
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#e76f36";
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Character recognition quiz helpers
  const quizTarget = selectedChar;
  const quizDistractors = devanagariScriptData
    .filter((c) => c.glyph !== quizTarget.glyph && c.category === quizTarget.category)
    .slice(0, 3);
  const quizChoices = [quizTarget, ...quizDistractors].sort(() => 0.5 - Math.random());

  const handleQuizAnswer = async (glyph: string) => {
    if (quizAnswered) return;
    setSelectedQuizAnswer(glyph);
    setQuizAnswered(true);
    const correct = glyph === quizTarget.glyph;
    if (correct) {
      playSound("success");
      setQuizScore((s) => s + 10);
      await recordActivity({
        languageId: state.target,
        activityType: "script",
        activityId: `script-${quizTarget.glyph}`,
        score: 10,
        accuracy: 1.0,
      });
    } else {
      playSound("miss");
    }
  };

  return (
    <div className="screen-stack">
      <header className="screen-heading">
        <div>
          <span className="eyebrow">{profile.script} · Script Learning Lab</span>
          <h1>Indian Script Studio</h1>
          <p>
            Explore Devanagari vowels (स्वर), consonants (व्यंजन), vowel signs (मात्रा), and conjuncts (जोडाक्षरे) with stroke practice and native voice pronunciation.
          </p>
        </div>
        <div className="screen-actions">
          <div className="script-tab-pills">
            <button
              className={`pill-btn ${activeTab === "vowel" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("vowel");
                setSelectedChar(devanagariScriptData.find((c) => c.category === "vowel")!);
                clearCanvas();
              }}
            >
              स्वर Vowels ({devanagariScriptData.filter((c) => c.category === "vowel").length})
            </button>
            <button
              className={`pill-btn ${activeTab === "consonant" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("consonant");
                setSelectedChar(devanagariScriptData.find((c) => c.category === "consonant")!);
                clearCanvas();
              }}
            >
              व्यंजन Consonants ({devanagariScriptData.filter((c) => c.category === "consonant").length})
            </button>
            <button
              className={`pill-btn ${activeTab === "matra" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("matra");
                setSelectedChar(devanagariScriptData.find((c) => c.category === "matra")!);
                clearCanvas();
              }}
            >
              मात्रा Vowel Signs ({devanagariScriptData.filter((c) => c.category === "matra").length})
            </button>
            <button
              className={`pill-btn ${activeTab === "conjunct" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("conjunct");
                setSelectedChar(devanagariScriptData.find((c) => c.category === "conjunct")!);
                clearCanvas();
              }}
            >
              जोडाक्षरे Conjuncts ({devanagariScriptData.filter((c) => c.category === "conjunct").length})
            </button>
          </div>
        </div>
      </header>

      <div className="script-layout-grid">
        {/* Left Side: Glyph Gallery */}
        <section className="script-gallery-card glass-card">
          <span className="eyebrow">Select character to inspect & practice:</span>
          <div className="characters-scroll-grid">
            {filteredChars.map((item) => (
              <button
                key={item.glyph}
                className={`glyph-tile ${selectedChar.glyph === item.glyph ? "active" : ""}`}
                onClick={() => {
                  setSelectedChar(item);
                  setQuizAnswered(false);
                  setSelectedQuizAnswer(null);
                  clearCanvas();
                  handleAudio(item.glyph);
                }}
              >
                <span className="tile-glyph">
                  <ScriptText language={state.target}>{item.glyph}</ScriptText>
                </span>
                <small className="tile-name">{item.transliteration}</small>
              </button>
            ))}
          </div>
        </section>

        {/* Right Side: Interactive Character Inspector & Tracing Board */}
        <section className="character-inspector glass-card">
          <div className="inspector-header">
            <div className="char-badge-giant">
              <span className="giant-glyph">
                <ScriptText language={state.target}>{selectedChar.glyph}</ScriptText>
              </span>
            </div>
            <div className="char-meta-details">
              <span className="char-type-pill">{selectedChar.category.toUpperCase()}</span>
              <h2>
                <ScriptText language={state.target}>{selectedChar.glyph}</ScriptText> · {selectedChar.name}
              </h2>
              <p className="char-translit">Pronunciation: /{selectedChar.transliteration}/</p>
              <div className="char-actions-row">
                <button
                  className="primary-button audio-char-btn"
                  onClick={() => handleAudio(selectedChar.glyph)}
                >
                  <Volume2 size={20} /> Listen to Sound
                </button>
              </div>
            </div>
          </div>

          <div className="char-info-boxes">
            <div className="info-box">
              <strong>Example Word:</strong>
              <p>
                <ScriptText language={state.target}>{selectedChar.exampleWord}</ScriptText>
              </p>
            </div>
            <div className="info-box">
              <strong>Phonetic Role:</strong>
              <p>{selectedChar.exampleMeaning}</p>
            </div>
            {selectedChar.confusedWith && (
              <div className="info-box alert-box">
                <strong>⚠️ Commonly Confused With:</strong>
                <p>{selectedChar.confusedWith} — observe the distinct stroke joints!</p>
              </div>
            )}
          </div>

          {/* Interactive Tracing Canvas */}
          <div className="tracing-stage">
            <div className="tracing-header">
              <span className="eyebrow">
                <PenTool size={14} /> Guided Stroke Practice (Touch or Mouse)
              </span>
              <button className="soft-button clear-canvas-btn" onClick={clearCanvas}>
                <Eraser size={14} /> Clear
              </button>
            </div>

            <div className="canvas-wrapper">
              <div className="guideline-glyph" aria-hidden="true">
                <ScriptText language={state.target}>{selectedChar.glyph}</ScriptText>
              </div>
              <canvas
                ref={canvasRef}
                width={320}
                height={220}
                className="tracing-canvas"
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
              />
            </div>
            <small className="tracing-note">Draw over the guidelines to build muscle memory.</small>
          </div>

          {/* Recognition Mini-Quiz */}
          <div className="recognition-quiz-card glass-card">
            <div className="quiz-header">
              <strong>Character Recognition Check:</strong>
              <span>Which character is “{selectedChar.transliteration}” ({selectedChar.name})?</span>
              {quizScore > 0 && <span className="stat-xp">+{quizScore} XP</span>}
            </div>

            <div className="quiz-chips-grid">
              {quizChoices.map((c) => {
                const isSelected = selectedQuizAnswer === c.glyph;
                let cls = "";
                if (quizAnswered) {
                  if (c.glyph === selectedChar.glyph) cls = "correct";
                  else if (isSelected) cls = "incorrect";
                }
                return (
                  <button
                    key={c.glyph}
                    disabled={quizAnswered}
                    className={`quiz-choice-btn ${cls}`}
                    onClick={() => handleQuizAnswer(c.glyph)}
                  >
                    <ScriptText language={state.target}>{c.glyph}</ScriptText>
                  </button>
                );
              })}
            </div>

            {quizAnswered && (
              <div className={`quiz-feedback-row ${selectedQuizAnswer === selectedChar.glyph ? "correct" : "incorrect"}`}>
                {selectedQuizAnswer === selectedChar.glyph ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Correct identification! +10 XP</span>
                  </>
                ) : (
                  <>
                    <X size={18} />
                    <span>The correct glyph is {selectedChar.glyph}.</span>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
