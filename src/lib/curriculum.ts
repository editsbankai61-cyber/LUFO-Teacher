// @ts-check
import { type LanguageId } from "./content";

export type ExerciseType =
  | "multiple-choice"
  | "translate-to-target"
  | "sentence-builder"
  | "listening"
  | "fill-in-the-blank";

export type Exercise = {
  id: string;
  type: ExerciseType;
  prompt: string;
  targetText?: string;
  romanTransliteration?: string;
  correctAnswer: string;
  choices: string[];
  explanation: string;
  conceptId?: string;
};

export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  xp: number;
  exercises: Exercise[];
};

export type CourseUnit = {
  id: string;
  unitNumber: number;
  level: "beginner" | "intermediate" | "advanced";
  title: string;
  subtitle: string;
  description: string;
  requiredUnitId: string | null;
  xpReward: number;
  lessons: Lesson[];
};

/**
 * Rich Marathi Beginner Curriculum (LUFO's core showcase course).
 */
export const marathiUnits: CourseUnit[] = [
  {
    id: "mr-u1",
    unitNumber: 1,
    level: "beginner",
    title: "First Connections & Greetings",
    subtitle: "नमस्कार, धन्यवाद, and everyday polite phrases",
    description: "Learn how to greet people, say thank you, and introduce yourself respectfully.",
    requiredUnitId: null,
    xpReward: 35,
    lessons: [
      {
        id: "mr-u1-l1",
        title: "Hello and Thank You",
        subtitle: "Core greetings and gratitude",
        xp: 15,
        exercises: [
          {
            id: "mr-u1-l1-e1",
            type: "multiple-choice",
            prompt: "What is the universal respectful greeting in Marathi?",
            correctAnswer: "नमस्कार",
            choices: ["नमस्कार", "धन्यवाद", "पाणी", "जेवण"],
            explanation: "‘नमस्कार’ (namaskār) is universally used across Maharashtra at any time of day to greet someone politely.",
            conceptId: "hello",
            targetText: "नमस्कार",
            romanTransliteration: "namaskār",
          },
          {
            id: "mr-u1-l1-e2",
            type: "translate-to-target",
            prompt: "How do you say “Thank you” in Marathi?",
            correctAnswer: "धन्यवाद",
            choices: ["धन्यवाद", "हो", "नाही", "चांगले"],
            explanation: "‘धन्यवाद’ (dhanyavād) expresses sincere gratitude. In casual speech, ‘आभारी आहे’ (ābhārī āhe) is also used.",
            conceptId: "thanks",
            targetText: "धन्यवाद",
            romanTransliteration: "dhanyavād",
          },
          {
            id: "mr-u1-l1-e3",
            type: "multiple-choice",
            prompt: "How do you say “Yes” in Marathi?",
            correctAnswer: "हो",
            choices: ["हो", "नाही", "कुठे", "मित्र"],
            explanation: "‘हो’ (ho) means ‘Yes’. Its polite companion is ‘होय’ (hoy).",
            conceptId: "yes",
            targetText: "हो",
            romanTransliteration: "ho",
          },
          {
            id: "mr-u1-l1-e4",
            type: "listening",
            prompt: "Listen to the word and select the correct text:",
            targetText: "नमस्कार",
            correctAnswer: "नमस्कार",
            choices: ["नमस्कार", "धन्यवाद", "जेवण", "पाणी"],
            explanation: "You heard ‘नमस्कार’ (namaskār).",
            conceptId: "hello",
            romanTransliteration: "namaskār",
          },
          {
            id: "mr-u1-l1-e5",
            type: "sentence-builder",
            prompt: "Arrange the words to say: “Hello, how are you?”",
            correctAnswer: "नमस्कार तुम्ही कसे आहात",
            choices: ["कसे", "नमस्कार", "आहात", "तुम्ही"],
            explanation: "‘नमस्कार, तुम्ही कसे आहात?’ (namaskār, tumhī kase āhāt?) is the standard polite inquiry into someone's well-being.",
            conceptId: "hello",
            targetText: "नमस्कार तुम्ही कसे आहात",
            romanTransliteration: "namaskār tumhī kase āhāt",
          },
        ],
      },
      {
        id: "mr-u1-l2",
        title: "Yes, No & Friendly Responses",
        subtitle: "Affirmations and simple conversational replies",
        xp: 15,
        exercises: [
          {
            id: "mr-u1-l2-e1",
            type: "multiple-choice",
            prompt: "What does ‘नाही’ (nāhī) mean?",
            correctAnswer: "No",
            choices: ["No", "Yes", "Where", "Please"],
            explanation: "‘नाही’ (nāhī) is the standard negative response in Marathi.",
            conceptId: "no",
            targetText: "नाही",
            romanTransliteration: "nāhī",
          },
          {
            id: "mr-u1-l2-e2",
            type: "fill-in-the-blank",
            prompt: "Complete the sentence: “मी _____ आहे.” (I am good.)",
            correctAnswer: "छान",
            choices: ["छान", "नाही", "पाणी", "कुठे"],
            explanation: "‘छान’ (chān) means nice, pleasant, or good. ‘मी छान आहे’ means ‘I am doing well.’",
            conceptId: "good",
            targetText: "मी छान आहे",
            romanTransliteration: "mī chān āhe",
          },
          {
            id: "mr-u1-l2-e3",
            type: "sentence-builder",
            prompt: "Arrange the words: “हो, धन्यवाद” (Yes, thank you)",
            correctAnswer: "हो धन्यवाद",
            choices: ["धन्यवाद", "नाही", "हो", "मित्र"],
            explanation: "‘हो, धन्यवाद’ (ho, dhanyavād) combines affirmation with courtesy.",
            conceptId: "thanks",
            targetText: "हो धन्यवाद",
            romanTransliteration: "ho dhanyavād",
          },
        ],
      },
    ],
  },
  {
    id: "mr-u2",
    unitNumber: 2,
    level: "beginner",
    title: "Around the Table: Food & Drink",
    subtitle: "पाणी, जेवण, and requesting meals kindly",
    description: "Learn how to order chai, ask for water, and talk about delicious Indian meals.",
    requiredUnitId: "mr-u1",
    xpReward: 40,
    lessons: [
      {
        id: "mr-u2-l1",
        title: "Water and Tea",
        subtitle: "Everyday refreshments in Maharashtra",
        xp: 15,
        exercises: [
          {
            id: "mr-u2-l1-e1",
            type: "multiple-choice",
            prompt: "What is the Marathi word for “Water”?",
            correctAnswer: "पाणी",
            choices: ["पाणी", "चहा", "जेवण", "दूध"],
            explanation: "‘पाणी’ (pāṇī) means water. ‘पाणी द्या’ (pāṇī dyā) means ‘Please give water.’",
            conceptId: "water",
            targetText: "पाणी",
            romanTransliteration: "pāṇī",
          },
          {
            id: "mr-u2-l1-e2",
            type: "sentence-builder",
            prompt: "Build the sentence: “मला पाणी द्या” (Please give me water)",
            correctAnswer: "मला पाणी द्या",
            choices: ["द्या", "मला", "चहा", "पाणी"],
            explanation: "‘मला पाणी द्या’ (malā pāṇī dyā) is the standard respectful way to ask for water.",
            conceptId: "water",
            targetText: "मला पाणी द्या",
            romanTransliteration: "malā pāṇī dyā",
          },
          {
            id: "mr-u2-l1-e3",
            type: "multiple-choice",
            prompt: "What does ‘चहा’ (chahā) mean?",
            correctAnswer: "Tea",
            choices: ["Tea", "Coffee", "Milk", "Juice"],
            explanation: "‘चहा’ (chahā) is tea, an indispensable part of daily social life in Maharashtra.",
            conceptId: "tea",
            targetText: "चहा",
            romanTransliteration: "chahā",
          },
          {
            id: "mr-u2-l1-e4",
            type: "listening",
            prompt: "Listen to the word and select the item:",
            targetText: "चहा",
            correctAnswer: "चहा",
            choices: ["चहा", "पाणी", "जेवण", "दूध"],
            explanation: "You heard ‘चहा’ (chahā, tea).",
            conceptId: "tea",
            romanTransliteration: "chahā",
          },
        ],
      },
      {
        id: "mr-u2-l2",
        title: "Mealtime and Tastes",
        subtitle: "Talking about food and meals",
        xp: 15,
        exercises: [
          {
            id: "mr-u2-l2-e1",
            type: "multiple-choice",
            prompt: "What is the Marathi word for “Food / Meal”?",
            correctAnswer: "जेवण",
            choices: ["जेवण", "पाणी", "मित्र", "गाव"],
            explanation: "‘जेवण’ (jevaṇ) refers to a meal or food.",
            conceptId: "food",
            targetText: "जेवण",
            romanTransliteration: "jevaṇ",
          },
          {
            id: "mr-u2-l2-e2",
            type: "fill-in-the-blank",
            prompt: "Complete: “जेवण खूप _____ होते.” (The food was very good.)",
            correctAnswer: "छान",
            choices: ["छान", "नाही", "कुठे", "पाणी"],
            explanation: "‘खूप छान’ (khūp chān) means ‘very good’ or ‘delicious’.",
            conceptId: "good",
            targetText: "जेवण खूप छान होते",
            romanTransliteration: "jevaṇ khūp chān hote",
          },
        ],
      },
    ],
  },
  {
    id: "mr-u3",
    unitNumber: 3,
    level: "intermediate",
    title: "People, Friends & Family",
    subtitle: "मित्र, मैत्रीण, family, and social registers",
    description: "Connect with people, speak about companions, and understand honorifics.",
    requiredUnitId: "mr-u2",
    xpReward: 45,
    lessons: [
      {
        id: "mr-u3-l1",
        title: "Meeting a Friend",
        subtitle: "Everyday conversation with peers",
        xp: 20,
        exercises: [
          {
            id: "mr-u3-l1-e1",
            type: "multiple-choice",
            prompt: "What is the word for “Friend” (male/general) in Marathi?",
            correctAnswer: "मित्र",
            choices: ["मित्र", "मुलगा", "भाऊ", "शिक्षक"],
            explanation: "‘मित्र’ (mitra) means friend. A female friend is specifically ‘मैत्रीण’ (maitrīṇ).",
            conceptId: "friend",
            targetText: "मित्र",
            romanTransliteration: "mitra",
          },
          {
            id: "mr-u3-l1-e2",
            type: "sentence-builder",
            prompt: "Build: “हा माझा मित्र आहे” (This is my friend)",
            correctAnswer: "हा माझा मित्र आहे",
            choices: ["मित्र", "आहे", "हा", "माझा"],
            explanation: "‘हा माझा मित्र आहे’ (hā mājhā mitra āhe): ‘हा’ = this (masc), ‘माझा’ = my, ‘आहे’ = is.",
            conceptId: "friend",
            targetText: "हा माझा मित्र आहे",
            romanTransliteration: "hā mājhā mitra āhe",
          },
        ],
      },
    ],
  },
  {
    id: "mr-u4",
    unitNumber: 4,
    level: "intermediate",
    title: "Out and About: Places & Directions",
    subtitle: "कुठे, रस्ता, बाजार, and city navigation",
    description: "Ask where things are, find your way through markets and bus stations.",
    requiredUnitId: "mr-u3",
    xpReward: 50,
    lessons: [
      {
        id: "mr-u4-l1",
        title: "Asking Where",
        subtitle: "Finding places in town",
        xp: 20,
        exercises: [
          {
            id: "mr-u4-l1-e1",
            type: "multiple-choice",
            prompt: "What is the Marathi question word for “Where?”",
            correctAnswer: "कुठे",
            choices: ["कुठे", "कधी", "कोण", "कसे"],
            explanation: "‘कुठे’ (kuṭhe) means ‘Where?’. E.g., ‘बाजार कुठे आहे?’ (Where is the market?).",
            conceptId: "where",
            targetText: "कुठे",
            romanTransliteration: "kuṭhe",
          },
          {
            id: "mr-u4-l1-e2",
            type: "sentence-builder",
            prompt: "Arrange: “बाजार कुठे आहे?” (Where is the market?)",
            correctAnswer: "बाजार कुठे आहे",
            choices: ["आहे", "कुठे", "बाजार", "रस्ता"],
            explanation: "In Marathi (SOV structure), the question word often appears right before the final verb ‘आहे’.",
            conceptId: "where",
            targetText: "बाजार कुठे आहे",
            romanTransliteration: "bājār kuṭhe āhe",
          },
        ],
      },
    ],
  },
  {
    id: "mr-u5",
    unitNumber: 5,
    level: "advanced",
    title: "Numbers, Time & Action",
    subtitle: "एक, दोन, तीन, today, tomorrow, and verbs",
    description: "Count, understand prices, schedule meetings, and talk about time.",
    requiredUnitId: "mr-u4",
    xpReward: 55,
    lessons: [
      {
        id: "mr-u5-l1",
        title: "Counting to Five",
        subtitle: "Everyday numbers in Devanagari",
        xp: 20,
        exercises: [
          {
            id: "mr-u5-l1-e1",
            type: "multiple-choice",
            prompt: "What is ‘दोन’ (don) in English?",
            correctAnswer: "Two",
            choices: ["Two", "One", "Three", "Four"],
            explanation: "‘एक’ = 1, ‘दोन’ = 2, ‘तीन’ = 3, ‘चार’ = 4, ‘पाच’ = 5.",
            conceptId: "numbers",
            targetText: "दोन",
            romanTransliteration: "don",
          },
        ],
      },
    ],
  },
];

/**
 * Universal Fallback Course Generator for other Indian Languages.
 * Generates structured, authentic multi-unit courses adapting to the target language profile.
 */
export function getCourseUnitsForLanguage(
  languageId: LanguageId,
  langData: { name: string; native: string; phrase: string },
): CourseUnit[] {
  if (languageId === "mr") {
    return marathiUnits;
  }

  // Generate language-specific unit structure reusing validated concepts
  return [
    {
      id: `${languageId}-u1`,
      unitNumber: 1,
      level: "beginner",
      title: `First Steps in ${langData.name}`,
      subtitle: `Greetings and foundational words in ${langData.native}`,
      description: `Start your ${langData.name} journey with essential greetings and politeness.`,
      requiredUnitId: null,
      xpReward: 35,
      lessons: [
        {
          id: `${languageId}-u1-l1`,
          title: "Greetings and Respect",
          subtitle: "First conversational words",
          xp: 15,
          exercises: [
            {
              id: `${languageId}-u1-l1-e1`,
              type: "multiple-choice",
              prompt: `What is the greeting phrase in ${langData.name}?`,
              correctAnswer: langData.phrase,
              choices: [langData.phrase, "No", "Water", "Friend"],
              explanation: `‘${langData.phrase}’ is an important conversational expression in ${langData.name}.`,
              targetText: langData.phrase,
            },
          ],
        },
      ],
    },
    {
      id: `${languageId}-u2`,
      unitNumber: 2,
      level: "beginner",
      title: "Daily Essentials",
      subtitle: "Food, water, and simple requests",
      description: `Essential everyday vocabulary in ${langData.name}.`,
      requiredUnitId: `${languageId}-u1`,
      xpReward: 40,
      lessons: [
        {
          id: `${languageId}-u2-l1`,
          title: "Table and Hospitality",
          subtitle: "Kind requests and refreshments",
          xp: 15,
          exercises: [
            {
              id: `${languageId}-u2-l1-e1`,
              type: "multiple-choice",
              prompt: `Learn about meals and hospitality in ${langData.name}.`,
              correctAnswer: "Yes",
              choices: ["Yes", "No", "Never", "Later"],
              explanation: `Hospitality is central to ${langData.name}-speaking communities.`,
            },
          ],
        },
      ],
    },
  ];
}
