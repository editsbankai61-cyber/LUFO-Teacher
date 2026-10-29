export const targetLanguageIds = ["mr", "bn", "te", "ta", "gu", "ur", "kn", "or", "ml", "pa"] as const;
export type LanguageId = (typeof targetLanguageIds)[number];
export type FamiliarLanguageId = LanguageId | "en";

export type EditorialMeta = {
  author: string;
  source: string;
  context: string;
  status: "draft" | "needs-language-review" | "reviewed" | "published";
  reviewer: string | null;
  updated: string;
  limitations: string;
};

export const editorialMeta: EditorialMeta = {
  author: "LUFO project team",
  source: "Original educational draft; vocabulary cross-checked against general reference dictionaries",
  context: "Beginner educational demonstration",
  status: "needs-language-review",
  reviewer: null,
  updated: "2026-03-01",
  limitations: "Not yet reviewed by named language experts. Regional forms and politeness can vary.",
};

type Concept = {
  id: string;
  emoji: string;
  values: Record<FamiliarLanguageId, string>;
  transliteration: Record<LanguageId, string>;
  usage: string;
};

export const familiarLanguages: { id: FamiliarLanguageId; name: string; native: string; locale: string; direction: "ltr" | "rtl" }[] = [
  { id: "en", name: "English", native: "English", locale: "en", direction: "ltr" },
  { id: "mr", name: "Marathi", native: "मराठी", locale: "mr", direction: "ltr" },
  { id: "bn", name: "Bengali", native: "বাংলা", locale: "bn", direction: "ltr" },
  { id: "te", name: "Telugu", native: "తెలుగు", locale: "te", direction: "ltr" },
  { id: "ta", name: "Tamil", native: "தமிழ்", locale: "ta", direction: "ltr" },
  { id: "gu", name: "Gujarati", native: "ગુજરાતી", locale: "gu", direction: "ltr" },
  { id: "ur", name: "Urdu", native: "اردو", locale: "ur", direction: "rtl" },
  { id: "kn", name: "Kannada", native: "ಕನ್ನಡ", locale: "kn", direction: "ltr" },
  { id: "or", name: "Odia", native: "ଓଡ଼ିଆ", locale: "or", direction: "ltr" },
  { id: "ml", name: "Malayalam", native: "മലയാളം", locale: "ml", direction: "ltr" },
  { id: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", locale: "pa", direction: "ltr" },
];

export const concepts: Concept[] = [
  {
    id: "hello", emoji: "☀", usage: "A friendly greeting. Formality and time-of-day alternatives vary by community.",
    values: { en: "Hello / greetings", mr: "नमस्कार", bn: "নমস্কার", te: "నమస్కారం", ta: "வணக்கம்", gu: "નમસ્તે", ur: "سلام", kn: "ನಮಸ್ಕಾರ", or: "ନମସ୍କାର", ml: "നമസ്കാരം", pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ" },
    transliteration: { mr: "namaskār", bn: "nomoshkār", te: "namaskāram", ta: "vaṇakkam", gu: "namaste", ur: "salām", kn: "namaskāra", or: "namaskāra", ml: "namaskāram", pa: "sat srī akāl" },
  },
  {
    id: "thanks", emoji: "✦", usage: "A polite expression of gratitude; conversational alternatives also exist.",
    values: { en: "Thank you", mr: "धन्यवाद", bn: "ধন্যবাদ", te: "ధన్యవాదాలు", ta: "நன்றி", gu: "આભાર", ur: "شکریہ", kn: "ಧನ್ಯವಾದ", or: "ଧନ୍ୟବାଦ", ml: "നന്ദി", pa: "ਧੰਨਵਾਦ" },
    transliteration: { mr: "dhanyavād", bn: "dhonnobād", te: "dhanyavādālu", ta: "naṉṟi", gu: "ābhār", ur: "shukriyā", kn: "dhanyavāda", or: "dhanyabāda", ml: "nandi", pa: "dhannavād" },
  },
  {
    id: "water", emoji: "◌", usage: "The common noun for water. Case and postpositions change inside a sentence.",
    values: { en: "Water", mr: "पाणी", bn: "জল", te: "నీరు", ta: "தண்ணீர்", gu: "પાણી", ur: "پانی", kn: "ನೀರು", or: "ପାଣି", ml: "വെള്ളം", pa: "ਪਾਣੀ" },
    transliteration: { mr: "pāṇī", bn: "jol", te: "nīru", ta: "taṇṇīr", gu: "pāṇī", ur: "pānī", kn: "nīru", or: "pāṇi", ml: "veḷḷaṁ", pa: "pāṇī" },
  },
  {
    id: "food", emoji: "◒", usage: "A broad everyday term for food or a meal; exact usage depends on context.",
    values: { en: "Food / meal", mr: "जेवण", bn: "খাবার", te: "భోజనం", ta: "உணவு", gu: "ભોજન", ur: "کھانا", kn: "ಊಟ", or: "ଖାଦ୍ୟ", ml: "ഭക്ഷണം", pa: "ਖਾਣਾ" },
    transliteration: { mr: "jevaṇ", bn: "khābār", te: "bhōjanaṁ", ta: "uṇavu", gu: "bhojan", ur: "khānā", kn: "ūṭa", or: "khādya", ml: "bhakṣaṇaṁ", pa: "khāṇā" },
  },
  {
    id: "friend", emoji: "∞", usage: "A general word for friend. Gendered and informal forms may differ.",
    values: { en: "Friend", mr: "मित्र", bn: "বন্ধু", te: "స్నేహితుడు", ta: "நண்பர்", gu: "મિત્ર", ur: "دوست", kn: "ಸ್ನೇಹಿತ", or: "ବନ୍ଧୁ", ml: "സുഹൃത്ത്", pa: "ਦੋਸਤ" },
    transliteration: { mr: "mitra", bn: "bondhu", te: "snēhituḍu", ta: "naṇpar", gu: "mitra", ur: "dost", kn: "snēhita", or: "bandhu", ml: "suhr̥tt", pa: "dost" },
  },
  {
    id: "good", emoji: "↑", usage: "A positive descriptor. Its ending can change for agreement in some languages.",
    values: { en: "Good", mr: "चांगले", bn: "ভালো", te: "మంచి", ta: "நல்ல", gu: "સારું", ur: "اچھا", kn: "ಒಳ್ಳೆಯ", or: "ଭଲ", ml: "നല്ല", pa: "ਚੰਗਾ" },
    transliteration: { mr: "cāṅgle", bn: "bhālo", te: "man̄ci", ta: "nalla", gu: "sāruṁ", ur: "acchā", kn: "oḷḷeya", or: "bhala", ml: "nalla", pa: "caṅgā" },
  },
  {
    id: "yes", emoji: "✓", usage: "An affirmative response. Tone and gesture can alter conversational meaning.",
    values: { en: "Yes", mr: "हो", bn: "হ্যাঁ", te: "అవును", ta: "ஆம்", gu: "હા", ur: "ہاں", kn: "ಹೌದು", or: "ହଁ", ml: "അതെ", pa: "ਹਾਂ" },
    transliteration: { mr: "ho", bn: "hyām̐", te: "avunu", ta: "ām", gu: "hā", ur: "hā̃", kn: "haudu", or: "haṁ", ml: "ate", pa: "hā̃" },
  },
  {
    id: "where", emoji: "⌖", usage: "A question word for place. Sentence order and respectful forms vary.",
    values: { en: "Where?", mr: "कुठे?", bn: "কোথায়?", te: "ఎక్కడ?", ta: "எங்கே?", gu: "ક્યાં?", ur: "کہاں؟", kn: "ಎಲ್ಲಿ?", or: "କେଉଁଠି?", ml: "എവിടെ?", pa: "ਕਿੱਥੇ?" },
    transliteration: { mr: "kuṭhe?", bn: "kothāy?", te: "ekkaḍa?", ta: "eṅkē?", gu: "kyāṁ?", ur: "kahā̃?", kn: "elli?", or: "keuṁṭhi?", ml: "eviṭe?", pa: "kitthe?" },
  },
];

export type Story = { id: string; title: string; description: string; level: "Starter" | "Growing"; pages: { text: string; translation: string; alt: string }[]; quiz: { prompt: string; answer: string; choices: string[] }; meta: EditorialMeta };
export type LanguageProfile = {
  id: LanguageId; name: string; native: string; locale: string; script: string; direction: "ltr" | "rtl"; font: string;
  accent: string; accent2: string; ink: string; motif: string; environment: string; accessory: string;
  grammar: string; grammarSimple: string; scriptNote: string; scriptSamples: { glyph: string; name: string; example: string }[];
  phrase: string; phraseTranslation: string; meme: { setup: string; punchline: string };
  tutor: { greeting: string; choices: string[]; replies: string[] };
  culture: { title: string; body: string }[];
  stories: Story[];
};

const storyMeta = editorialMeta;
const makeStories = (id: string, rows: [string, string, string, string, string, string][]): Story[] => rows.map((row, index) => ({
  id: `${id}-story-${index + 1}`,
  title: row[0],
  description: row[1],
  level: index < 3 ? "Starter" : "Growing",
  pages: [
    { text: row[2], translation: row[3], alt: "A calm editorial illustration supporting the scene; the story information is also in text." },
    { text: row[4], translation: row[5], alt: "A patterned scene showing the character’s next action; no essential information is image-only." },
    { text: `${row[2]} ${row[4]}`, translation: `${row[3]} ${row[5]}`, alt: "The characters return home together after a small everyday adventure." },
  ],
  quiz: { prompt: "What connects the two moments?", answer: "A small act of friendship", choices: ["A small act of friendship", "A race", "A secret exam"] },
  meta: storyMeta,
}));

const marathiStories = makeStories("mr", [
  ["छत्रीची मैत्री", "A rainy-day friendship", "मीरा बस थांब्यावर उभी होती. पाऊस अचानक जोरात आला.", "Meera stood at the bus stop. The rain suddenly grew heavy.", "अमनने आपली छत्री पुढे केली. दोघे हसत घरी गेले.", "Aman offered his umbrella. They went home laughing."],
  ["चहाचा कप", "An unexpectedly salty cup of tea", "आजोबांनी चहा केला, पण साखरेऐवजी मीठ पडले.", "Grandfather made tea, but added salt instead of sugar.", "सगळ्यांनी चेहरा केला आणि मग नवीन चहा एकत्र केला.", "Everyone made a face, then brewed a fresh pot together."],
  ["हरवलेला पतंग", "A kite finds a new friend", "निळा पतंग किल्ल्याच्या भिंतीजवळ अडकला होता.", "A blue kite was caught near the fort wall.", "साराने तो सोडवला आणि छोट्या मुलाला परत दिला.", "Sara freed it and returned it to a young child."],
  ["बाजारातील यादी", "A lively trip to the market", "रवी बाजारात आंबे आणि कोथिंबीर घ्यायला गेला.", "Ravi went to the market for mangoes and coriander.", "तो यादी विसरला, पण विक्रेत्याने प्रेमाने मदत केली.", "He forgot the list, but the seller kindly helped."],
  ["लहानसा दिवा", "A shared festival light", "संध्याकाळी अंगणात एक लहान दिवा पेटला.", "At dusk, a small lamp glowed in the courtyard.", "शेजाऱ्यांनी गाणी आणि फराळ वाटून उत्सव साजरा केला.", "Neighbours shared songs and snacks to celebrate."],
]);

const bengaliStories = makeStories("bn", [
  ["বৃষ্টির ছাতা", "A shared umbrella", "রিমা বাসস্ট্যান্ডে দাঁড়িয়ে ছিল। হঠাৎ বৃষ্টি নামল।", "Rima waited at the bus stop. Rain suddenly began.", "আরিফ তার ছাতা ভাগ করল। তারা গল্প করতে করতে বাড়ি গেল।", "Arif shared his umbrella. They walked home talking."],
  ["মিষ্টির বাক্স", "A sweet mix-up", "মা টেবিলে একটি মিষ্টির বাক্স রাখলেন। বিড়ালটি খুব কৌতূহলী হল।", "Mother put a sweet box on the table. The cat grew curious.", "বাক্সে মিষ্টি নয়, রঙিন বোতাম ছিল। সবাই হেসে উঠল।", "The box held colourful buttons, not sweets. Everyone laughed."],
  ["বইয়ের বন্ধু", "Friends meet through a book", "নীলা পুরোনো বইয়ের ভেতর একটি চিঠি পেল।", "Neela found a letter inside an old book.", "চিঠিটি পাশের বাড়ির পাঠকের ছিল। তারা নতুন বন্ধু হল।", "It belonged to a reader next door. They became friends."],
  ["ট্রামের জানালা", "A city ride", "ট্রামের জানালা দিয়ে আলো আর ব্যস্ত রাস্তা দেখা যাচ্ছিল।", "Lights and busy streets passed outside the tram window.", "দাদু প্রতিটি মোড়ের একটি গল্প বললেন।", "Grandfather told a story about every turn."],
  ["আলপনার সকাল", "Preparing a welcoming pattern", "সকালে উঠোন পরিষ্কার করে সবাই রঙ নিয়ে বসল।", "In the morning everyone cleaned the courtyard and sat with colours.", "প্রতিটি রেখা আলাদা ছিল, কিন্তু নকশাটি সবার।", "Every line was different, but the pattern belonged to everyone."],
]);

const teluguStories = makeStories("te", [
  ["మామిడి బండి", "The mango cart", "అనూ బజారులో పసుపు మామిడి పండ్లు చూసింది.", "Anu saw yellow mangoes at the market.", "ఆమె ఒక పండు తీసుకుని స్నేహితుడితో పంచుకుంది.", "She chose one and shared it with a friend."],
  ["చిన్న గొడుగు", "A little umbrella", "వాన మొదలైంది. చిన్న గొడుగు కింద ముగ్గురు నిలబడ్డారు.", "Rain began. Three people stood beneath a tiny umbrella.", "వారు నెమ్మదిగా నడిచి నవ్వుతూ ఇంటికి చేరారు.", "They walked slowly and reached home laughing."],
  ["మాట్లాడే చిలుక", "The talkative parrot", "చిలుక ప్రతి ఉదయం నమస్కారం అని చెప్పేది.", "The parrot said hello every morning.", "ఒక రోజు అది అల్పాహారం అడిగింది. అమ్మమ్మ నవ్వింది.", "One day it asked for breakfast. Grandmother laughed."],
  ["బస్సు ప్రయాణం", "A helpful bus journey", "కిరణ్ కొత్త ఊరికి బస్సులో వెళ్లాడు.", "Kiran took a bus to a new town.", "కండక్టర్ సరైన చోటు చూపించి ధన్యవాదాలు అన్నాడు.", "The conductor showed the right stop and exchanged thanks."],
  ["రంగుల కథ", "A shared painted story", "పిల్లలు పొడవైన కాగితంపై పూలు గీశారు.", "The children painted flowers on a long sheet of paper.", "ప్రతి పువ్వు కలసి ఒక పెద్ద కథగా మారింది.", "Together the flowers became one large story."],
]);

const tamilStories = makeStories("ta", [
  ["மழையில் ஒரு குடை", "An umbrella in the rain", "மீனா பேருந்து நிறுத்தத்தில் நின்றாள். திடீரென மழை வந்தது.", "Meena stood at the bus stop. Rain arrived suddenly.", "ரவி தனது குடையைப் பகிர்ந்தான். இருவரும் சிரித்தபடி நடந்தனர்.", "Ravi shared his umbrella. They walked together smiling."],
  ["தோசையின் வடிவம்", "A wonderfully odd dosa", "காலை உணவில் தோசை வட்டமாக வரவில்லை.", "At breakfast the dosa did not turn out round.", "அது ஒரு வரைபடம் போல இருந்தது. எல்லோரும் புதிய ஊரைக் கண்டுபிடித்தனர்.", "It looked like a map. Everyone invented a new town on it."],
  ["பேசும் செடி", "The plant that asks politely", "ஜன்னல் அருகே இருந்த செடி சற்று வாடியது.", "The plant by the window drooped a little.", "லதா தண்ணீர் ஊற்றினாள். இலைகள் நன்றி சொல்வது போல அசைந்தன.", "Latha watered it. The leaves moved as if saying thank you."],
  ["கோலத்தின் பாதை", "A path through a kolam", "வாசலில் அழகான கோலம் விரிந்திருந்தது.", "A beautiful kolam spread across the entrance.", "குழந்தைகள் கோடுகளைத் தொடாமல் பாதையைத் தேடினர்.", "The children found a path without touching the lines."],
  ["ரயில் ஜன்னல்", "A journey seen from a train", "ரயில் ஜன்னலுக்கு வெளியே வயல்களும் மலைகளும் நகர்ந்தன.", "Fields and hills moved past the train window.", "பாட்டி ஒவ்வொரு நிலையத்துக்கும் ஒரு சிறிய கதை சொன்னார்.", "Grandmother told a short story for every station."],
]);

const gujaratiStories = makeStories("gu", [
  ["પતંગનો સંદેશ", "A message carried by a kite", "પીળો પતંગ ધીમે ધીમે નીચે આવ્યો.", "A yellow kite slowly floated down.", "તેની પૂંછડી પર મિત્રતાનો નાનો સંદેશ હતો.", "A small message of friendship was tied to its tail."],
  ["ચાનો કપ", "Tea and a kind shopkeeper", "મીરા બજારમાં ચા પીવા રોકાઈ.", "Meera stopped for tea in the market.", "તેનું પાકીટ ભૂલાયું હતું, પણ દુકાનદારે કહ્યું: કાલે આપજો.", "She had forgotten her wallet, but the seller said: pay tomorrow."],
  ["ગરબાનું પગલું", "Learning one dance step", "રાજને ગરબાનું એક પણ પગલું આવડતું નહોતું.", "Raj did not know a single garba step.", "મિત્રોએ ધીમે શીખવ્યું અને વર્તુળ મોટું બન્યું.", "Friends taught him slowly and the circle grew larger."],
  ["રણની રાત", "A quiet night in the salt desert", "સફેદ રણ પર ચાંદનો પ્રકાશ પડ્યો.", "Moonlight fell across the white salt desert.", "પરિવારે શાંતિથી આકાશ જોયું અને ગરમ ભોજન વહેંચ્યું.", "The family watched the sky quietly and shared a warm meal."],
  ["બજારની યાદી", "Remembering a market list", "અનિલે શાકભાજીની યાદી ઘરે મૂકી દીધી.", "Anil left the vegetable list at home.", "તેણે રંગ અને સુગંધથી બધું યાદ કર્યું.", "He remembered everything by colour and scent."],
]);

const urduStories = makeStories("ur", [
  ["بارش کی چھتری", "An umbrella in the rain", "سارہ بس اسٹاپ پر کھڑی تھی۔ اچانک بارش شروع ہوئی۔", "Sara stood at the bus stop. Rain began suddenly.", "علی نے اپنی چھتری بانٹی۔ دونوں ہنستے ہوئے گھر گئے۔", "Ali shared his umbrella. They went home laughing."],
  ["چائے کا راز", "The mystery of the tea", "دادی نے چائے بنائی مگر ذائقہ کچھ عجیب تھا۔", "Grandmother made tea, but it tasted strange.", "چینی کی جگہ نمک تھا۔ سب نے مل کر نئی چائے بنائی۔", "There was salt instead of sugar. Everyone made fresh tea together."],
  ["کتاب میں خط", "A letter inside a book", "حنا کو پرانی کتاب میں ایک چھوٹا خط ملا۔", "Hina found a small letter in an old book.", "خط ایک دوست کا تھا جو جواب کا منتظر تھا۔", "The letter was from a friend waiting for a reply."],
  ["بازار کا راستہ", "Finding the market", "زین نئے شہر میں بازار ڈھونڈ رہا تھا۔", "Zain was looking for the market in a new city.", "ایک دکاندار نے نرمی سے راستہ بتایا۔", "A shopkeeper kindly explained the way."],
  ["عید کی صبح", "A morning of sharing", "صبح گھر میں خوشبو اور روشنی تھی۔", "In the morning the home was filled with fragrance and light.", "پڑوسیوں نے کھانا اور نیک خواہشات بانٹیں۔", "Neighbours shared food and good wishes."],
]);

const kannadaStories = makeStories("kn", [
  ["ಮಳೆಯ ಛತ್ರಿ", "A shared umbrella", "ಮೀರಾ ಬಸ್ ನಿಲ್ದಾಣದಲ್ಲಿ ನಿಂತಿದ್ದಳು. ಮಳೆ ಶುರುವಾಯಿತು.", "Meera stood at the bus stop. Rain began.", "ರವಿ ತನ್ನ ಛತ್ರಿಯನ್ನು ಹಂಚಿಕೊಂಡನು. ಇಬ್ಬರೂ ಮನೆಗೆ ನಡೆದರು.", "Ravi shared his umbrella. They walked home."],
  ["ಮೈಸೂರಿನ ಗೊಂಬೆ", "A little wooden doll", "ಅಜ್ಜಿಯ ಪೆಟ್ಟಿಗೆಯಲ್ಲಿ ಹಳೆಯ ಗೊಂಬೆ ಇತ್ತು.", "There was an old doll in grandmother’s box.", "ಅದರ ಹಿಂದೆ ಬರೆದ ಹೆಸರು ಕುಟುಂಬದ ಕಥೆ ಹೇಳಿತು.", "A name written behind it revealed a family story."],
  ["ಮಾತನಾಡುವ ಕಾಫಿ", "Coffee with an imagined voice", "ಬಿಸಿ ಕಾಫಿಯ ನೊರೆ ವಿಚಿತ್ರ ಆಕಾರ ಮಾಡಿತು.", "The foam on the hot coffee made a strange shape.", "ಅದು ನಗುತ್ತಿರುವ ಮುಖ ಎಂದು ಎಲ್ಲರೂ ಹೇಳಿದರು.", "Everyone said it looked like a smiling face."],
  ["ಬಸ್ ಕಿಟಕಿ", "A town through the bus window", "ಬಸ್ ಕಿಟಕಿಯಿಂದ ಅರಮನೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಕಾಣಿಸಿದವು.", "A palace and market appeared through the bus window.", "ಅಮ್ಮ ಪ್ರತಿಯೊಂದು ಸ್ಥಳದ ಸಣ್ಣ ಕಥೆ ಹೇಳಿದರು.", "Mother told a small story about each place."],
  ["ಹೂವಿನ ದಾರಿ", "A path of flowers", "ಬೆಳಿಗ್ಗೆ ಬಾಗಿಲ ಮುಂದೆ ಹೂಗಳನ್ನು ಜೋಡಿಸಿದರು.", "In the morning flowers were arranged at the doorway.", "ಪ್ರತಿಯೊಬ್ಬರೂ ಒಂದು ಬಣ್ಣ ಆಯ್ದು ವಿನ್ಯಾಸ ಪೂರ್ಣಗೊಳಿಸಿದರು.", "Each person chose a colour and completed the design."],
]);

const odiaStories = makeStories("or", [
  ["ବର୍ଷାର ଛତା", "A shared umbrella", "ମୀରା ବସ୍ ଷ୍ଟପରେ ଠିଆ ହୋଇଥିଲା। ହଠାତ୍ ବର୍ଷା ହେଲା।", "Meera stood at the bus stop. It suddenly rained.", "ରବି ତାର ଛତା ବାଣ୍ଟିଲା। ଦୁହେଁ ହସି ହସି ଘରକୁ ଗଲେ।", "Ravi shared his umbrella. They went home laughing."],
  ["ଚକର କାହାଣୀ", "The wheel’s story", "ପୁରୁଣା ପଥରର ଚକ ପାଖରେ ଜଣେ ଗାଇଡ୍ ଠିଆ ଥିଲେ।", "A guide stood by an old stone wheel.", "ସେ ଆଲୋକ ଓ ସମୟର ଏକ ସୁନ୍ଦର କାହାଣୀ କହିଲେ।", "She told a beautiful story about light and time."],
  ["ମିଠା ବାକ୍ସ", "The surprising sweet box", "ଟେବୁଲ ଉପରେ ଏକ ସୁନ୍ଦର ବାକ୍ସ ଥିଲା।", "A beautiful box sat on the table.", "ଭିତରେ ମିଠା ନୁହେଁ, ରଙ୍ଗୀନ ପେନ୍ସିଲ ଥିଲା।", "Inside were colourful pencils, not sweets."],
  ["ସମୁଦ୍ରର ସକାଳ", "Morning beside the sea", "ସକାଳେ ସମୁଦ୍ର ଶାନ୍ତ ଓ ନୀଳ ଥିଲା।", "In the morning the sea was calm and blue.", "ମାଛଧରାଳିମାନେ ପରସ୍ପରକୁ ନମସ୍କାର କଲେ।", "The fishers greeted one another."],
  ["ଚିତ୍ରର ପକ୍ଷୀ", "A bird in a painted frame", "ଚିତ୍ରରେ ଏକ ଛୋଟ ପକ୍ଷୀ ଗଛରେ ବସିଥିଲା।", "In the painting a small bird sat in a tree.", "ପିଲାଟି ତା ପାଇଁ ଏକ ନୂଆ ଗୀତ ଲେଖିଲା।", "The child wrote a new song for it."],
]);

const malayalamStories = makeStories("ml", [
  ["മഴയിലെ കുട", "An umbrella in the rain", "മീര ബസ് സ്റ്റോപ്പിൽ നിന്നു. പെട്ടെന്ന് മഴ തുടങ്ങി.", "Meera stood at the bus stop. Rain began suddenly.", "രവി തന്റെ കുട പങ്കിട്ടു. അവർ ചിരിച്ചുകൊണ്ട് നടന്നു.", "Ravi shared his umbrella. They walked laughing."],
  ["വള്ളത്തിലെ പുസ്തകം", "A book on a boat", "ചെറിയ വള്ളത്തിൽ ഒരു പഴയ പുസ്തകം കിടന്നു.", "An old book lay in the little boat.", "അതിന്റെ ഉടമയെ കണ്ടെത്താൻ കൂട്ടുകാർ തീരത്തേക്ക് പോയി.", "Friends went along the shore to find its owner."],
  ["ചായയുടെ ചിത്രം", "A picture in tea foam", "ചായയുടെ മുകളിൽ ഒരു വട്ടം തെളിഞ്ഞു.", "A circle appeared on top of the tea.", "അമ്മ അതിനെ ചന്ദ്രൻ എന്നു വിളിച്ചു; കുട്ടി അത് ദോശയാണെന്ന് പറഞ്ഞു.", "Mother called it a moon; the child called it a dosa."],
  ["പൂക്കളുടെ രാവിലെ", "A morning with flowers", "എല്ലാവരും നിറമുള്ള പൂക്കൾ ശേഖരിച്ചു.", "Everyone gathered colourful flowers.", "ഒരുമിച്ച് അവർ വാതിലിനരികിൽ മനോഹരമായ രൂപം ഉണ്ടാക്കി.", "Together they made a beautiful design by the door."],
  ["പച്ചവഴി", "A green path home", "സ്കൂൾ കഴിഞ്ഞ് അനു പുതിയ വഴിയിലൂടെ നടന്നു.", "After school Anu walked along a new path.", "അയൽക്കാരി വഴി കാണിച്ചു; ഇരുവരും സുഹൃത്തുക്കളായി.", "A neighbour showed the way; they became friends."],
]);

const punjabiStories = makeStories("pa", [
  ["ਮੀਂਹ ਦੀ ਛਤਰੀ", "A shared umbrella", "ਮੀਰਾ ਬੱਸ ਅੱਡੇ ਤੇ ਖੜ੍ਹੀ ਸੀ। ਅਚਾਨਕ ਮੀਂਹ ਪੈਣ ਲੱਗਾ।", "Meera stood at the bus stop. Rain began suddenly.", "ਰਵੀ ਨੇ ਆਪਣੀ ਛਤਰੀ ਸਾਂਝੀ ਕੀਤੀ। ਦੋਵੇਂ ਹੱਸਦੇ ਘਰ ਗਏ।", "Ravi shared his umbrella. They went home laughing."],
  ["ਢੋਲ ਦੀ ਆਵਾਜ਼", "Following a gentle rhythm", "ਦੂਰੋਂ ਢੋਲ ਦੀ ਹੌਲੀ ਆਵਾਜ਼ ਆਈ।", "A gentle drum rhythm came from far away.", "ਦੋਸਤਾਂ ਨੇ ਤਾਲ ਗਿਣੀ ਅਤੇ ਇਕੱਠੇ ਕਦਮ ਸਿੱਖੇ।", "Friends counted the beat and learned steps together."],
  ["ਲੱਸੀ ਦਾ ਗਲਾਸ", "A very tall glass of lassi", "ਮੇਜ਼ ਉੱਤੇ ਲੱਸੀ ਦਾ ਬਹੁਤ ਲੰਮਾ ਗਲਾਸ ਸੀ।", "A very tall glass of lassi stood on the table.", "ਸਭ ਨੇ ਇੱਕ ਵੱਡੀ ਨਲੀ ਲੱਭੀ ਅਤੇ ਹੱਸ ਪਏ।", "Everyone found a long straw and laughed."],
  ["ਖੇਤ ਦਾ ਰਾਹ", "Finding a path through the fields", "ਗੁਰਪ੍ਰੀਤ ਨਵੇਂ ਰਾਹ ਰਾਹੀਂ ਘਰ ਜਾ ਰਿਹਾ ਸੀ।", "Gurpreet was taking a new path home.", "ਇੱਕ ਕਿਸਾਨ ਨੇ ਸਹੀ ਮੋੜ ਦੱਸਿਆ ਅਤੇ ਪਾਣੀ ਦਿੱਤਾ।", "A farmer showed the right turn and offered water."],
  ["ਫੁਲਕਾਰੀ ਦਾ ਰੰਗ", "A pattern made together", "ਦਾਦੀ ਨੇ ਰੰਗੀਨ ਧਾਗੇ ਮੇਜ਼ ਉੱਤੇ ਰੱਖੇ।", "Grandmother placed colourful threads on the table.", "ਹਰ ਟਾਂਕ ਨਾਲ ਪਰਿਵਾਰ ਦੀ ਇੱਕ ਯਾਦ ਜੁੜ ਗਈ।", "Each stitch carried a family memory."],
]);

export const languages: Record<LanguageId, LanguageProfile> = {
  mr: { id: "mr", name: "Marathi", native: "मराठी", locale: "mr-IN", script: "Devanagari", direction: "ltr", font: "Noto Sans Devanagari, system-ui, sans-serif", accent: "#e76f36", accent2: "#f0b429", ink: "#29180f", motif: "fort", environment: "Fort silhouettes · Warli-inspired rhythm · Paithani detail", accessory: "tiny saffron scarf", grammar: "Marathi nouns have grammatical gender, and adjectives or verbs may change to agree with them.", grammarSimple: "Word endings can change depending on who or what you mean.", scriptNote: "Devanagari uses a headline and combines consonants with vowel signs. Shown tracing is practice, not verified stroke scoring.", scriptSamples: [{ glyph: "अ", name: "a", example: "अननस" }, { glyph: "क", name: "ka", example: "कमळ" }, { glyph: "म", name: "ma", example: "मित्र" }], phrase: "तुम्ही कसे आहात?", phraseTranslation: "How are you?", meme: { setup: "मी: फक्त एक शब्द शिकेन", punchline: "पाच मिनिटांनी: पूर्ण वाक्य!" }, tutor: { greeting: "नमस्कार! आज आपण काय सराव करू?", choices: ["माझी ओळख", "जेवण मागवणे", "रस्ता विचारणे"], replies: ["छान! म्हणा: माझे नाव…", "नक्की. म्हणा: मला हे पाहिजे.", "म्हणा: बाजार कुठे आहे?"] }, culture: [{ title: "Many Marathis", body: "Marathi is spoken across regions and communities; vocabulary and pronunciation vary." }, { title: "Everyday etiquette", body: "नमस्कार is broadly useful; context and relationship shape other greetings." }], stories: marathiStories },
  bn: { id: "bn", name: "Bengali", native: "বাংলা", locale: "bn-IN", script: "Bengali–Assamese", direction: "ltr", font: "Noto Sans Bengali, system-ui, sans-serif", accent: "#d84b4b", accent2: "#f4ad4a", ink: "#281313", motif: "alpana", environment: "Alpana-inspired curves · Terracotta · Literary glow", accessory: "terracotta pin", grammar: "Bengali verbs reflect person and social register, while nouns do not have grammatical gender.", grammarSimple: "Verb forms can show how familiar or respectful the conversation is.", scriptNote: "Bengali letters share a headline and form conjuncts. Complex forms stay together as authored graphemes.", scriptSamples: [{ glyph: "অ", name: "ô", example: "অজগর" }, { glyph: "ক", name: "kô", example: "কলম" }, { glyph: "ব", name: "bô", example: "বন্ধু" }], phrase: "আপনি কেমন আছেন?", phraseTranslation: "How are you?", meme: { setup: "আমি: আজ একটি শব্দ", punchline: "পাঁচ মিনিট পরে: পুরো বাক্য!" }, tutor: { greeting: "নমস্কার! আজ কী অনুশীলন করব?", choices: ["পরিচয়", "খাবার চাই", "রাস্তা জিজ্ঞাসা"], replies: ["বলুন: আমার নাম…", "বলুন: আমি এটা চাই।", "বলুন: বাজার কোথায়?"] }, culture: [{ title: "Literary traditions", body: "Bengali has rich, diverse literary communities across borders and regions." }, { title: "Forms of address", body: "Pronouns and verb choices carry familiarity and respect." }], stories: bengaliStories },
  te: { id: "te", name: "Telugu", native: "తెలుగు", locale: "te-IN", script: "Telugu", direction: "ltr", font: "Noto Sans Telugu, system-ui, sans-serif", accent: "#b25a36", accent2: "#5aa68c", ink: "#231510", motif: "kalamkari", environment: "Kalamkari-inspired lines · Florals · Layered tales", accessory: "leaf-green sash", grammar: "Telugu commonly places the verb near the end and uses suffixes to show grammatical relationships.", grammarSimple: "The action word often comes near the end.", scriptNote: "Telugu’s rounded forms combine consonants and vowel marks. Grapheme clusters are presented intact.", scriptSamples: [{ glyph: "అ", name: "a", example: "అమ్మ" }, { glyph: "క", name: "ka", example: "కలం" }, { glyph: "న", name: "na", example: "నది" }], phrase: "మీరు ఎలా ఉన్నారు?", phraseTranslation: "How are you?", meme: { setup: "నేను: ఒక పదం మాత్రమే", punchline: "ఐదు నిమిషాల తర్వాత: పూర్తి వాక్యం!" }, tutor: { greeting: "నమస్కారం! ఏమి సాధన చేద్దాం?", choices: ["పరిచయం", "ఆహారం", "దారి"], replies: ["చెప్పండి: నా పేరు…", "చెప్పండి: నాకు ఇది కావాలి.", "చెప్పండి: బజారు ఎక్కడ?"] }, culture: [{ title: "Layered storytelling", body: "Oral, literary, cinematic, and performance traditions all shape contemporary Telugu." }, { title: "Respect in speech", body: "Plural and honorific forms can express respect." }], stories: teluguStories },
  ta: { id: "ta", name: "Tamil", native: "தமிழ்", locale: "ta-IN", script: "Tamil", direction: "ltr", font: "Noto Sans Tamil, system-ui, sans-serif", accent: "#7856c9", accent2: "#e07a4f", ink: "#1d1632", motif: "kolam", environment: "Kolam geometry · Architectural rhythm · Quiet violet", accessory: "kolam charm", grammar: "Tamil is typically subject–object–verb and builds meaning through carefully ordered suffixes.", grammarSimple: "Small endings attach to words to add meaning.", scriptNote: "Tamil combines base consonants with vowel signs. This studio describes forms without claiming verified handwriting accuracy.", scriptSamples: [{ glyph: "அ", name: "a", example: "அம்மா" }, { glyph: "க", name: "ka", example: "கடல்" }, { glyph: "வ", name: "va", example: "வணக்கம்" }], phrase: "நீங்கள் எப்படி இருக்கிறீர்கள்?", phraseTranslation: "How are you?", meme: { setup: "நான்: ஒரு சொல் மட்டும்", punchline: "ஐந்து நிமிடத்தில்: முழு வாக்கியம்!" }, tutor: { greeting: "வணக்கம்! இன்று எதைப் பயிற்சி செய்வோம்?", choices: ["அறிமுகம்", "உணவு கேட்பது", "வழி கேட்பது"], replies: ["சொல்லுங்கள்: என் பெயர்…", "சொல்லுங்கள்: எனக்கு இது வேண்டும்.", "சொல்லுங்கள்: சந்தை எங்கே?"] }, culture: [{ title: "Living classical language", body: "Tamil is used globally in everyday life, media, scholarship, and art." }, { title: "Politeness", body: "Pronouns and verb endings can mark respect; context matters." }], stories: tamilStories },
  gu: { id: "gu", name: "Gujarati", native: "ગુજરાતી", locale: "gu-IN", script: "Gujarati", direction: "ltr", font: "Noto Sans Gujarati, system-ui, sans-serif", accent: "#e64e75", accent2: "#49a7d5", ink: "#2b1220", motif: "bandhani", environment: "Bandhani dots · Kites · Circular celebration", accessory: "kite-tail ribbon", grammar: "Gujarati marks gender and number in many adjectives and verbs, with the verb often near the end.", grammarSimple: "Some word endings change to match gender and number.", scriptNote: "Gujarati is related to Devanagari but usually has no continuous headline. Combined signs remain intact.", scriptSamples: [{ glyph: "અ", name: "a", example: "અનાર" }, { glyph: "ક", name: "ka", example: "કમળ" }, { glyph: "મ", name: "ma", example: "મિત્ર" }], phrase: "તમે કેમ છો?", phraseTranslation: "How are you?", meme: { setup: "હું: માત્ર એક શબ્દ", punchline: "પાંચ મિનિટ પછી: આખું વાક્ય!" }, tutor: { greeting: "નમસ્તે! આજે શું શીખીએ?", choices: ["પરિચય", "ભોજન", "રસ્તો"], replies: ["કહો: મારું નામ…", "કહો: મને આ જોઈએ છે.", "કહો: બજાર ક્યાં છે?"] }, culture: [{ title: "Many communities", body: "Gujarati is used in India and a wide global diaspora with varied forms." }, { title: "Celebration and craft", body: "Local art forms are inspiration here, not a definition of every speaker." }], stories: gujaratiStories },
  ur: { id: "ur", name: "Urdu", native: "اردو", locale: "ur-IN", script: "Perso-Arabic (Nastaliq)", direction: "rtl", font: "Noto Nastaliq Urdu, Noto Sans Arabic, serif", accent: "#2b8b70", accent2: "#c9a451", ink: "#071e18", motif: "poetry", environment: "Poetic dusk · Calligraphic movement · Fine geometry", accessory: "emerald feather", grammar: "Urdu marks gender in nouns and agreement; respectful address affects pronouns and verbs.", grammarSimple: "Word forms can change for gender and respect.", scriptNote: "Urdu reads right to left. Letters join and change shape by position; it is not taught as a Devanagari sequence.", scriptSamples: [{ glyph: "ا", name: "alif", example: "انار" }, { glyph: "ب", name: "be", example: "بات" }, { glyph: "م", name: "mīm", example: "محبت" }], phrase: "آپ کیسے ہیں؟", phraseTranslation: "How are you?", meme: { setup: "میں: صرف ایک لفظ", punchline: "پانچ منٹ بعد: پورا جملہ!" }, tutor: { greeting: "سلام! آج کیا مشق کریں؟", choices: ["تعارف", "کھانا", "راستہ"], replies: ["کہیے: میرا نام…", "کہیے: مجھے یہ چاہیے۔", "کہیے: بازار کہاں ہے؟"] }, culture: [{ title: "Poetic and everyday", body: "Urdu belongs to diverse communities and is used in everyday speech, literature, media, and song." }, { title: "Respectful address", body: "آپ is a useful respectful form; social context shapes alternatives." }], stories: urduStories },
  kn: { id: "kn", name: "Kannada", native: "ಕನ್ನಡ", locale: "kn-IN", script: "Kannada", direction: "ltr", font: "Noto Sans Kannada, system-ui, sans-serif", accent: "#3d72b8", accent2: "#d49d3f", ink: "#101d31", motif: "mysuru", environment: "Architectural layers · Mysuru detail · Artistic bands", accessory: "golden brooch", grammar: "Kannada often places the verb last and uses case suffixes and levels of respectful address.", grammarSimple: "The action often comes last, and endings show relationships.", scriptNote: "Kannada’s rounded letters combine with vowel signs and consonant forms. Clusters remain whole.", scriptSamples: [{ glyph: "ಅ", name: "a", example: "ಅಮ್ಮ" }, { glyph: "ಕ", name: "ka", example: "ಕಮಲ" }, { glyph: "ಮ", name: "ma", example: "ಮನೆ" }], phrase: "ನೀವು ಹೇಗಿದ್ದೀರಿ?", phraseTranslation: "How are you?", meme: { setup: "ನಾನು: ಒಂದೇ ಪದ", punchline: "ಐದು ನಿಮಿಷದ ನಂತರ: ಪೂರ್ಣ ವಾಕ್ಯ!" }, tutor: { greeting: "ನಮಸ್ಕಾರ! ಇಂದು ಏನು ಅಭ್ಯಾಸ ಮಾಡೋಣ?", choices: ["ಪರಿಚಯ", "ಊಟ", "ದಾರಿ"], replies: ["ಹೇಳಿ: ನನ್ನ ಹೆಸರು…", "ಹೇಳಿ: ನನಗೆ ಇದು ಬೇಕು.", "ಹೇಳಿ: ಮಾರುಕಟ್ಟೆ ಎಲ್ಲಿ?"] }, culture: [{ title: "Many registers", body: "Kannada changes across regions and social contexts; this course begins with broadly useful forms." }, { title: "Art and architecture", body: "Visual references celebrate selected traditions without reducing a language to one region." }], stories: kannadaStories },
  or: { id: "or", name: "Odia", native: "ଓଡ଼ିଆ", locale: "or-IN", script: "Odia", direction: "ltr", font: "Noto Sans Oriya, system-ui, sans-serif", accent: "#c34f38", accent2: "#2f8f83", ink: "#2a130f", motif: "konark", environment: "Konark geometry · Narrative frames · Painted detail", accessory: "sun-wheel badge", grammar: "Odia often places the verb at the end and uses postpositions and suffixes for grammatical roles.", grammarSimple: "Endings and words after nouns show how things connect.", scriptNote: "Odia’s rounded forms reflect its manuscript history. Vowel signs and conjuncts are kept together.", scriptSamples: [{ glyph: "ଅ", name: "a", example: "ଅଜଗର" }, { glyph: "କ", name: "ka", example: "କମଳ" }, { glyph: "ମ", name: "ma", example: "ମାଛ" }], phrase: "ଆପଣ କେମିତି ଅଛନ୍ତି?", phraseTranslation: "How are you?", meme: { setup: "ମୁଁ: କେବଳ ଗୋଟିଏ ଶବ୍ଦ", punchline: "ପାଞ୍ଚ ମିନିଟ୍ ପରେ: ପୂରା ବାକ୍ୟ!" }, tutor: { greeting: "ନମସ୍କାର! ଆଜି କଣ ଅଭ୍ୟାସ କରିବା?", choices: ["ପରିଚୟ", "ଖାଦ୍ୟ", "ରାସ୍ତା"], replies: ["କୁହନ୍ତୁ: ମୋ ନାମ…", "କୁହନ୍ତୁ: ମୋତେ ଏହା ଦରକାର।", "କୁହନ୍ତୁ: ବଜାର କେଉଁଠି?"] }, culture: [{ title: "Narrative arts", body: "Odia stories appear in many visual, oral, performance, and literary forms." }, { title: "Everyday variation", body: "Pronunciation and vocabulary vary by region and community." }], stories: odiaStories },
  ml: { id: "ml", name: "Malayalam", native: "മലയാളം", locale: "ml-IN", script: "Malayalam", direction: "ltr", font: "Noto Sans Malayalam, system-ui, sans-serif", accent: "#16846c", accent2: "#e0a640", ink: "#071e19", motif: "backwater", environment: "Backwater reflections · Green layers · Floral arrangements", accessory: "water-lily pin", grammar: "Malayalam is generally subject–object–verb and builds long word forms with suffixes.", grammarSimple: "Endings attach to words to add relationships and detail.", scriptNote: "Malayalam has rounded letters and many conjunct forms. Authored grapheme groups are never split by code unit.", scriptSamples: [{ glyph: "അ", name: "a", example: "അമ്മ" }, { glyph: "ക", name: "ka", example: "കടൽ" }, { glyph: "മ", name: "ma", example: "മരം" }], phrase: "നിങ്ങൾക്ക് സുഖമാണോ?", phraseTranslation: "How are you?", meme: { setup: "ഞാൻ: ഒരു വാക്ക് മാത്രം", punchline: "അഞ്ച് മിനിറ്റിന് ശേഷം: മുഴുവൻ വാക്യം!" }, tutor: { greeting: "നമസ്കാരം! ഇന്ന് എന്ത് പരിശീലിക്കാം?", choices: ["പരിചയം", "ഭക്ഷണം", "വഴി"], replies: ["പറയൂ: എന്റെ പേര്…", "പറയൂ: എനിക്ക് ഇത് വേണം.", "പറയൂ: ചന്ത എവിടെ?"] }, culture: [{ title: "Across water and world", body: "Malayalam is used by communities in Kerala and around the world." }, { title: "Context matters", body: "Everyday forms vary by region, generation, and social relationship." }], stories: malayalamStories },
  pa: { id: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", locale: "pa-IN", script: "Gurmukhi", direction: "ltr", font: "Noto Sans Gurmukhi, system-ui, sans-serif", accent: "#d65a36", accent2: "#7552b6", ink: "#29140c", motif: "phulkari", environment: "Phulkari detail · Rhythmic geometry · Festive energy", accessory: "phulkari band", grammar: "Punjabi marks gender and number in agreement and commonly places the verb toward the end.", grammarSimple: "Some word endings change to match gender and number.", scriptNote: "This course defaults to Gurmukhi. Vowel signs attach around consonants while remaining one reading unit.", scriptSamples: [{ glyph: "ੳ", name: "ūṛā", example: "ਉਨ" }, { glyph: "ਕ", name: "kakkā", example: "ਕਲਮ" }, { glyph: "ਮ", name: "mammā", example: "ਮਿੱਤਰ" }], phrase: "ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?", phraseTranslation: "How are you?", meme: { setup: "ਮੈਂ: ਸਿਰਫ਼ ਇੱਕ ਸ਼ਬਦ", punchline: "ਪੰਜ ਮਿੰਟ ਬਾਅਦ: ਪੂਰਾ ਵਾਕ!" }, tutor: { greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਕੀ ਅਭਿਆਸ ਕਰੀਏ?", choices: ["ਜਾਣ-ਪਛਾਣ", "ਖਾਣਾ", "ਰਸਤਾ"], replies: ["ਕਹੋ: ਮੇਰਾ ਨਾਮ…", "ਕਹੋ: ਮੈਨੂੰ ਇਹ ਚਾਹੀਦਾ ਹੈ।", "ਕਹੋ: ਬਾਜ਼ਾਰ ਕਿੱਥੇ ਹੈ?"] }, culture: [{ title: "Gurmukhi by default", body: "This course begins with Gurmukhi while recognizing Punjabi’s wider script and community diversity." }, { title: "Warm registers", body: "Address and verb forms communicate familiarity and respect." }], stories: punjabiStories },
};

export const lessonUnits = [
  { id: "first-words", title: "First connections", subtitle: "Greetings, thanks, and confidence", concepts: ["hello", "thanks", "yes"] },
  { id: "shared-table", title: "Around the table", subtitle: "Food, water, and kind requests", concepts: ["food", "water", "thanks"] },
  { id: "out-and-about", title: "Find your way", subtitle: "Friends, places, and questions", concepts: ["friend", "where", "good"] },
];

export const gameDefinitions = [
  { id: "word-snake", name: "Word Snake", icon: "Route", mechanic: "Choose a step-by-step route to feed the snake the matching word.", alternative: "Turn-based directional controls; no steering speed required." },
  { id: "bubble-shooter", name: "Bubble Shooter", icon: "CircleDot", mechanic: "Aim at the numbered bubble containing the correct word.", alternative: "Named bubble buttons replace precise aiming." },
  { id: "kite-battle", name: "Kite Battle", icon: "MoveUpRight", mechanic: "Answer, then choose climb, hold, or sweep to gain sky position.", alternative: "Untimed turn-based kite decisions." },
  { id: "word-slash", name: "Word Slash", icon: "Sword", mechanic: "Slash the matching word while shielding distractors.", alternative: "Select named word buttons with keyboard or touch." },
  { id: "whack-a-word", name: "Whack-a-Word", icon: "Hammer", mechanic: "Mark only matching tiles in a stable word grid.", alternative: "Stable grid and disabled timer by default." },
  { id: "word-rain", name: "Word Rain", icon: "CloudRain", mechanic: "Catch the correct card from a pausable falling queue.", alternative: "Turn-based catch queue with previous/next controls." },
  { id: "flappy-gate", name: "Flappy Gate", icon: "PanelTopOpen", mechanic: "Choose the correct gate, then travel through it one step at a time.", alternative: "Numbered gate selection without timing." },
  { id: "memory-match", name: "Memory Match", icon: "PanelsTopLeft", mechanic: "Reveal and pair target words with familiar meanings.", alternative: "Ordered card list announces every card state." },
  { id: "lane-runner", name: "Lane Runner", icon: "Milestone", mechanic: "Move LUFO into the lane with the right meaning.", alternative: "Discrete lane buttons; no steering or reaction speed." },
  { id: "rhythm-tap", name: "Rhythm Tap", icon: "AudioLines", mechanic: "Arrange authored syllable beats into the displayed pattern.", alternative: "Untimed visual syllable sequence; sound is optional." },
  { id: "kabaddi-raid", name: "Kabaddi Raid", icon: "Footprints", mechanic: "Plan a three-move learning raid: enter, collect, return.", alternative: "Untimed strategy sequence with undo." },
  { id: "word-builder", name: "Word Builder", icon: "Blocks", mechanic: "Reorder authored grapheme pieces to rebuild a word.", alternative: "Add, remove, and reorder with labeled buttons." },
  { id: "boss-battle", name: "Boss Battle", icon: "Sparkles", mechanic: "Complete vocabulary, grammar, and context rounds.", alternative: "Text-first multi-round challenge with no timed task." },
] as const;

export function getConcept(id: string) {
  return concepts.find((concept) => concept.id === id) ?? concepts[0];
}

export function getQuestion(languageId: LanguageId, round = 0) {
  const concept = concepts[round % concepts.length];
  const others = concepts.filter((item) => item.id !== concept.id).slice(round % 4, round % 4 + 3);
  return {
    concept,
    prompt: `Choose “${concept.values.en}” in ${languages[languageId].name}`,
    answer: concept.values[languageId],
    choices: [concept, ...others].sort((a, b) => ((a.id.charCodeAt(0) + round) % 3) - ((b.id.charCodeAt(0) + round) % 3)).map((item) => item.values[languageId]),
  };
}

export function segmentGraphemes(value: string, locale: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), (part) => part.segment);
  }
  return Array.from(value);
}

export const coverageManifest = {
  targetLanguages: 10,
  familiarLanguages: 11,
  unitsPerLanguage: lessonUnits.length,
  storiesPerLanguage: 5,
  storyPagesPerLanguage: 15,
  gamesPerLanguage: gameDefinitions.length,
  coreConceptPairs: concepts.length * 10 * 11,
  reviewState: "Needs named language-expert review",
  humanRecordedAudio: 0,
  signedVideoLayers: 0,
  liveAI: false,
  liveMultiplayer: false,
} as const;
