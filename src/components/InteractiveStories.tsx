import { Link } from "@/components/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Volume2,
} from "lucide-react";
import { languages } from "@/lib/content";
import { useLearner } from "@/lib/store";
import { playSound } from "@/lib/sound";
import { speakText } from "@/lib/audio";
import { ScriptText } from "./LanguageLens";

export type BranchingChoice = {
  id: string;
  label: string;
  transliteration?: string;
  outcomeText: string;
  outcomeTranslation: string;
};

export type StoryScene = {
  id: string;
  speaker: string;
  nativeText: string;
  translation: string;
  transliteration: string;
  choices?: BranchingChoice[];
};

export type InteractiveStory = {
  id: string;
  title: string;
  nativeTitle: string;
  difficulty: "Starter" | "Growing" | "Intermediate";
  readTime: string;
  scenario: string;
  summary: string;
  scenes: StoryScene[];
  comprehensionQuiz: {
    question: string;
    choices: string[];
    answer: string;
    explanation: string;
  };
};

export const indianStories: InteractiveStory[] = [
  {
    id: "mr-story-1",
    title: "A Rainy Friendship",
    nativeTitle: "छत्रीची मैत्री",
    difficulty: "Starter",
    readTime: "3 min read",
    scenario: "Bus Stop on a Rainy Evening",
    summary: "Meera is caught in sudden monsoon rains at the bus stop when a friendly neighbor arrives with an umbrella.",
    scenes: [
      {
        id: "s1",
        speaker: "Narrator",
        nativeText: "संध्याकाळी अचानक जोरात पाऊस सुरू झाला. मीरा बस थांब्यावर थांबली होती.",
        translation: "In the evening, heavy rain began suddenly. Meera was waiting at the bus stop.",
        transliteration: "Sandhyākāḷī acānak jorāt pāūs surū jhālā. Mīrā bas thāṁbyāvar thāṁblī hotī.",
      },
      {
        id: "s2",
        speaker: "Aman",
        nativeText: "नमस्कार मीरा! माझ्याकडे मोठी छत्री आहे. आपण एकत्र जाऊया का?",
        translation: "Hello Meera! I have a big umbrella. Shall we go together?",
        transliteration: "Namaskār Mīrā! Mājhyākaḍe mothī chattrī āhe. Āpaṇ ekatra jāūyā kā?",
        choices: [
          {
            id: "c1",
            label: "हो, नक्की! खूप धन्यवाद.",
            transliteration: "Ho, nakkī! Khūp dhanyavād.",
            outcomeText: "मीराने हसत उत्तर दिले: 'हो, नक्की! खूप धन्यवाद.' दोघे छत्रीखाली हसत घरी निघाले.",
            outcomeTranslation: "Meera smiled: 'Yes, absolutely! Thank you very much.' Both walked home together under the umbrella.",
          },
          {
            id: "c2",
            label: "नाही, बस लवकर येईल.",
            transliteration: "Nāhī, bas lavkar yeīl.",
            outcomeText: "मीरा म्हणाली: 'नाही, बस येईल.' अमन म्हणाला: 'ठीक आहे, काळजी घ्या!' आणि त्याने मीरासाठी छत्री थांब्यावर ठेवली.",
            outcomeTranslation: "Meera said: 'No, the bus will arrive.' Aman said: 'Alright, take care!' and kindly held the umbrella till the bus arrived.",
          },
        ],
      },
      {
        id: "s3",
        speaker: "Narrator",
        nativeText: "पावसातही मैत्रीचा एक छोटा क्षण आठवणीत राहिला. दोघेही सुरक्षित घरी पोहोचले.",
        translation: "Even in the rain, a small act of friendship stayed in their memory. Both reached home safely.",
        transliteration: "Pāvsāt-hī maitrīcā ek choṭā kṣaṇ āṭhavaṇīt rāhilā. Doghe-hī surakṣit gharī pohocle.",
      },
    ],
    comprehensionQuiz: {
      question: "Why did Aman offer his umbrella to Meera?",
      choices: [
        "Because it was raining heavily at the bus stop",
        "Because they were going to school",
        "Because the bus was broken",
      ],
      answer: "Because it was raining heavily at the bus stop",
      explanation: "Aman saw Meera waiting without protection from the sudden monsoon downpour and offered to share.",
    },
  },
  {
    id: "mr-story-2",
    title: "A Lively Market Trip",
    nativeTitle: "बाजारातील सफर",
    difficulty: "Growing",
    readTime: "4 min read",
    scenario: "Local Vegetable & Fruit Market",
    summary: "Ravi visits the bustling bazaar to buy fresh mangoes and coriander for family dinner.",
    scenes: [
      {
        id: "s1",
        speaker: "Narrator",
        nativeText: "रविवारी सकाळी रवी स्थानिक बाजारात गेला. बाजारात खूप गर्दी आणि ताजी फळे होती.",
        translation: "On Sunday morning, Ravi went to the local market. The market was bustling with fresh fruits.",
        transliteration: "Ravivārī sakāḷī Ravī sthānīk bājārāt gelā. Bājārāt khūp gardī āṇi tājī phaḷe hotī.",
      },
      {
        id: "s2",
        speaker: "Shopkeeper",
        nativeText: "नमस्कार भाऊ! आज गोड हापूस आंबे आले आहेत. किती देऊ?",
        translation: "Hello brother! Fresh sweet Alphonso mangoes have arrived today. How many would you like?",
        transliteration: "Namaskār bhāū! Āja goḍ hāpūs āṁbe āle āhēt. Kitī deū?",
        choices: [
          {
            id: "c1",
            label: "मला एक डझन गोड आंबे द्या.",
            transliteration: "Malā ek ḍajhan goḍ āṁbe dyā.",
            outcomeText: "विक्रेत्याने हसत पिवळेधमक आंबे मोजले: 'हे घ्या, अगदी मधासारखे गोड आहेत!'",
            outcomeTranslation: "The seller smiled and packed golden mangoes: 'Here you go, they are as sweet as honey!'",
          },
          {
            id: "c2",
            label: "आंब्यांचा दर काय आहे?",
            transliteration: "Āṁbyāñcā dar kāy āhe?",
            outcomeText: "विक्रेता म्हणाला: 'योग्य भाव लावतो, तुम्ही घरचेच आहात!' आणि त्याने उत्तम आंबे निवडून दिले.",
            outcomeTranslation: "The seller said: 'I will give you a fair price, you are regular family!' and handpicked the best ones.",
          },
        ],
      },
      {
        id: "s3",
        speaker: "Narrator",
        nativeText: "रवीने धन्यवाद दिले आणि पिशवी घेऊन आनंदाने घरी परतला.",
        translation: "Ravi expressed gratitude and returned home happily with his bag.",
        transliteration: "Ravīne dhanyavād dile āṇi pishvī gheūn ānaṁdāne gharī paratlā.",
      },
    ],
    comprehensionQuiz: {
      question: "What specialty fruit was the vendor offering at the market?",
      choices: ["Sweet Alphonso mangoes", "Fresh apples", "Green grapes"],
      answer: "Sweet Alphonso mangoes",
      explanation: "The vendor welcomed Ravi with fresh sweet Alphonso mangoes ('हापूस आंबे').",
    },
  },
  {
    id: "mr-story-3",
    title: "The Salted Tea Mystery",
    nativeTitle: "चहाचा कप",
    difficulty: "Starter",
    readTime: "3 min read",
    scenario: "Morning at Grandfather's House",
    summary: "Grandfather makes morning chai with great care, but a comical kitchen mix-up surprises everyone.",
    scenes: [
      {
        id: "s1",
        speaker: "Narrator",
        nativeText: "सकाळी आजोबांनी सगळ्यांसाठी प्रेमाने आल्याचा चहा बनवला.",
        translation: "In the morning, grandfather lovingly brewed ginger tea for everyone.",
        transliteration: "Sakāḷī ājojbānnī sagḷyānsāṭhī premāne ālyācā chahā banavlā.",
      },
      {
        id: "s2",
        speaker: "Aaji (Grandmother)",
        nativeText: "अरे देवा! हा चहा खारट का लागतोय? साखरेऐवजी मीठ टाकले की काय?",
        translation: "Oh goodness! Why does this tea taste salty? Did someone put salt instead of sugar?",
        transliteration: "Are devā! Hā chahā khāraṭ kā lāgtoy? Sākhre-aivajī mīṭh ṭākle kī kāy?",
        choices: [
          {
            id: "c1",
            label: "सगळे खळखळून हसू लागले.",
            transliteration: "Sagḷe khaḷkhaḷūn hasū lāgle.",
            outcomeText: "आजोबांनी कपाळावर हात मारला आणि सगळे जोरात हसले. आजोबा म्हणाले: 'चला, आता गोड चहा परत करू!'",
            outcomeTranslation: "Grandfather tapped his forehead and everyone laughed heartily. He said: 'Come on, let's brew a sweet one together!'",
          },
          {
            id: "c2",
            label: "नवीन चहा एकत्र बनवूया.",
            transliteration: "Navīn chahā ekatra banavūyā.",
            outcomeText: "सगळ्यांनी मिळून गॅस पेटवला, यावेळी बरोबर साखर घातली आणि गरमागरम चहाचा आनंद घेतला.",
            outcomeTranslation: "Everyone gathered around the stove, made sure to add sugar this time, and enjoyed warm tea together.",
          },
        ],
      },
      {
        id: "s3",
        speaker: "Narrator",
        nativeText: "लहानशा चुकीमुळे घरात हशा पिकला आणि दिवस आनंदी सुरू झाला.",
        translation: "A tiny mistake brought warm laughter to the house and made the morning cheerful.",
        transliteration: "Lāhānshā cukīmuḷe gharāt hashā piklā āṇi divas ānaṁdī surū jhālā.",
      },
    ],
    comprehensionQuiz: {
      question: "What was the accidental mix-up in grandfather's tea?",
      choices: ["Salt was added instead of sugar", "Pepper was added instead of ginger", "No milk was available"],
      answer: "Salt was added instead of sugar",
      explanation: "Grandfather accidentally grabbed the salt container instead of sugar ('साखरेऐवजी मीठ').",
    },
  },
];

export function StoryLibrary() {
  const { state } = useLearner();
  const profile = languages[state.target];
  const progress = state.progress[state.target];
  const [filter, setFilter] = useState<string>("All");

  const filteredStories = indianStories.filter(
    (s) => filter === "All" || s.difficulty === filter,
  );

  return (
    <div className="screen-stack">
      <header className="screen-heading">
        <div>
          <span className="eyebrow">{profile.native} · Interactive Cultural Stories</span>
          <h1>Indian Stories & Scenarios</h1>
          <p>
            Immerse yourself in conversational Indian narratives with branching dialogues, native voice audio, and comprehension questions.
          </p>
        </div>
        <div className="screen-actions">
          <div className="filter-tabs">
            {["All", "Starter", "Growing"].map((lvl) => (
              <button
                key={lvl}
                className={filter === lvl ? "active" : ""}
                onClick={() => setFilter(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="story-grid">
        {filteredStories.map((story) => {
          const isCompleted = progress.completedStories?.includes(story.id);
          return (
            <Link
              key={story.id}
              href={`/app/stories/${story.id}`}
              className={`story-card glass-card ${isCompleted ? "story-completed" : ""}`}
            >
              <div className="story-header-pill">
                <span className="story-difficulty-chip">{story.difficulty}</span>
                <span className="story-readtime-chip">
                  <Clock size={12} /> {story.readTime}
                </span>
                {isCompleted && (
                  <span className="story-completed-badge">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                )}
              </div>

              <h2>
                <ScriptText language={state.target}>{story.nativeTitle}</ScriptText>
                <small>{story.title}</small>
              </h2>

              <p className="story-scenario-text">📍 {story.scenario}</p>
              <p className="story-summary-text">{story.summary}</p>

              <div className="story-card-footer">
                <span className="read-story-btn">
                  {isCompleted ? "Read Again" : "Start Story"} <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function StoryReader({ storyId }: { storyId: string }) {
  const { state, recordActivity } = useLearner();
  const profile = languages[state.target];
  const story = indianStories.find((s) => s.id === storyId) ?? indianStories[0];

  const [sceneIdx, setSceneIdx] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<BranchingChoice | null>(null);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedQuizChoice, setSelectedQuizChoice] = useState<string | null>(null);
  const [isQuizCorrect, setIsQuizCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const currentScene = story.scenes[sceneIdx];

  const handleAudio = (slow = false) => {
    const textToSpeak = selectedBranch ? selectedBranch.outcomeText : currentScene.nativeText;
    speakText(textToSpeak, profile.locale, { rate: slow ? 0.65 : 0.85 });
  };

  const handleBranchChoice = (choice: BranchingChoice) => {
    setSelectedBranch(choice);
    playSound("success");
    speakText(choice.outcomeText, profile.locale);
  };

  const handleNextScene = () => {
    if (sceneIdx < story.scenes.length - 1) {
      setSceneIdx((i) => i + 1);
      setSelectedBranch(null);
    }
  };

  const handlePrevScene = () => {
    if (sceneIdx > 0) {
      setSceneIdx((i) => i - 1);
      setSelectedBranch(null);
    }
  };

  const handleQuizSubmit = async (choice: string) => {
    if (quizAnswered) return;
    setSelectedQuizChoice(choice);
    const correct = choice === story.comprehensionQuiz.answer;
    setIsQuizCorrect(correct);
    setQuizAnswered(true);

    if (correct) {
      playSound("success");
    } else {
      playSound("miss");
    }

    const res = await recordActivity({
      languageId: state.target,
      activityType: "story",
      activityId: story.id,
      score: 20,
      accuracy: correct ? 1.0 : 0.6,
      completedStoryId: story.id,
    });

    setEarnedXp(res.xpAwarded);
    setCompleted(true);
  };

  return (
    <div className="reader-shell">
      <header className="reader-toolbar">
        <Link href="/app/stories" className="soft-button">
          <ArrowLeft size={16} /> Library
        </Link>
        <div className="story-title-box">
          <span className="eyebrow">{story.scenario} · {story.readTime}</span>
          <h1>
            <ScriptText language={state.target}>{story.nativeTitle}</ScriptText> · {story.title}
          </h1>
        </div>
        <div className="reader-toggles">
          <button
            className={`soft-button ${showTransliteration ? "active" : ""}`}
            onClick={() => setShowTransliteration((v) => !v)}
            title="Toggle Roman transliteration"
          >
            Aa Transliteration
          </button>
          <button
            className={`soft-button ${showTranslation ? "active" : ""}`}
            onClick={() => setShowTranslation((v) => !v)}
            title="Toggle English translation"
          >
            English Meaning
          </button>
        </div>
      </header>

      <main className="story-reader glass-card">
        <div className="scene-progress-dots">
          {story.scenes.map((_, i) => (
            <span
              key={i}
              className={`scene-dot ${i === sceneIdx ? "active" : ""} ${i < sceneIdx ? "visited" : ""}`}
            />
          ))}
          <span className={`scene-dot ${sceneIdx === story.scenes.length - 1 ? "active" : ""}`}>
            Quiz
          </span>
        </div>

        {/* Scene Text Card */}
        <div className="scene-content-card">
          <div className="speaker-tag">
            <span>🗣️ {currentScene.speaker}</span>
            <button className="soft-button audio-btn" onClick={() => handleAudio(false)}>
              <Volume2 size={18} /> Listen
            </button>
          </div>

          <p className="scene-native-text">
            <ScriptText language={state.target}>
              {selectedBranch ? selectedBranch.outcomeText : currentScene.nativeText}
            </ScriptText>
          </p>

          {showTransliteration && (
            <p className="scene-translit-text">
              {selectedBranch?.transliteration || currentScene.transliteration}
            </p>
          )}

          {showTranslation && (
            <p className="scene-translation-text">
              {selectedBranch?.outcomeTranslation || currentScene.translation}
            </p>
          )}
        </div>

        {/* Branching Dialog Choices */}
        {currentScene.choices && !selectedBranch && (
          <div className="branching-choices-area">
            <span className="branch-prompt">What should happen next? Choose your dialogue:</span>
            <div className="branch-choices-list">
              {currentScene.choices.map((choice) => (
                <button
                  key={choice.id}
                  className="branch-choice-btn"
                  onClick={() => handleBranchChoice(choice)}
                >
                  <ScriptText language={state.target}>{choice.label}</ScriptText>
                  {choice.transliteration && <small>{choice.transliteration}</small>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <div className="scene-nav-bar">
          <button
            className="soft-button"
            disabled={sceneIdx === 0}
            onClick={handlePrevScene}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span>Scene {sceneIdx + 1} of {story.scenes.length}</span>
          <button
            className="primary-button"
            disabled={sceneIdx >= story.scenes.length - 1}
            onClick={handleNextScene}
          >
            Next Scene <ArrowRight size={16} />
          </button>
        </div>

        {/* Comprehension Quiz on Last Scene */}
        {sceneIdx === story.scenes.length - 1 && (
          <section className="comprehension-quiz-section glass-card">
            <span className="eyebrow">Comprehension Check</span>
            <h2>{story.comprehensionQuiz.question}</h2>

            <div className="quiz-options-list">
              {story.comprehensionQuiz.choices.map((c) => {
                const isSelected = selectedQuizChoice === c;
                let cls = "";
                if (quizAnswered) {
                  if (c === story.comprehensionQuiz.answer) cls = "correct";
                  else if (isSelected) cls = "incorrect";
                }
                return (
                  <button
                    key={c}
                    className={`quiz-option-card ${cls}`}
                    disabled={quizAnswered}
                    onClick={() => handleQuizSubmit(c)}
                  >
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>

            {completed && (
              <div className={`quiz-feedback-box ${isQuizCorrect ? "correct" : "incorrect"}`}>
                <strong>{isQuizCorrect ? "🎉 Great reading comprehension!" : "Notice the story detail:"}</strong>
                <p>{story.comprehensionQuiz.explanation}</p>
                <div className="story-finish-banner">
                  <span>+{earnedXp} XP awarded</span>
                  <Link href="/app/stories" className="primary-button">
                    Complete & Return to Stories
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
