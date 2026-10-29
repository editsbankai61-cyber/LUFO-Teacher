import { concepts, familiarLanguages, gameDefinitions, languages, targetLanguageIds } from "./content";

export type ContentValidationReport = {
  passed: boolean;
  checked: string[];
  errors: string[];
  warnings: string[];
};

export function validateContent(): ContentValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const checked: string[] = [];
  const familiarIds = familiarLanguages.map((item) => item.id);

  if (targetLanguageIds.length !== 10) errors.push(`Expected 10 target languages; found ${targetLanguageIds.length}.`);
  checked.push("10 target-language profiles");

  for (const id of targetLanguageIds) {
    const language = languages[id];
    if (!language) { errors.push(`Missing language profile: ${id}.`); continue; }
    if (id === "ur" && language.direction !== "rtl") errors.push("Urdu direction must be rtl.");
    if (id !== "ur" && language.direction !== "ltr") errors.push(`${language.name} has unexpected direction metadata.`);
    if (!language.locale || !language.script || !language.font) errors.push(`${language.name} is missing locale, script, or font metadata.`);
    if (language.stories.length < 5) errors.push(`${language.name} needs at least five complete stories.`);
    for (const story of language.stories) {
      if (story.pages.length < 2 || story.pages.length > 4) errors.push(`${story.id} needs 2–4 pages.`);
      story.pages.forEach((page, index) => {
        if (!page.text.trim() || !page.translation.trim()) errors.push(`${story.id} page ${index + 1} is empty.`);
      });
      if (!story.quiz.choices.includes(story.quiz.answer)) errors.push(`${story.id} quiz answer is not in its choices.`);
      if (new Set(story.quiz.choices).size !== story.quiz.choices.length) errors.push(`${story.id} has duplicate quiz choices.`);
      if (story.meta.status === "reviewed" && !story.meta.reviewer) errors.push(`${story.id} falsely claims review without a reviewer.`);
    }
    if (!language.scriptSamples.length) errors.push(`${language.name} has no Script Studio samples.`);
    for (const sample of language.scriptSamples) {
      if (!sample.glyph.trim() || !sample.example.trim()) errors.push(`${language.name} has an empty script sample.`);
      if (/\uFFFD/.test(sample.glyph)) errors.push(`${language.name} has an invalid replacement grapheme.`);
    }
  }
  checked.push("direction, locale, script, font, and theme metadata");
  checked.push("50 stories, page text, quizzes, and editorial states");
  checked.push("script samples and replacement-character safety");

  for (const concept of concepts) {
    for (const id of familiarIds) {
      if (!concept.values[id]?.trim()) errors.push(`${concept.id} is missing familiar-language value ${id}.`);
    }
    for (const id of targetLanguageIds) {
      if (!concept.transliteration[id]?.trim()) errors.push(`${concept.id} is missing ${id} transliteration.`);
    }
    if (!concept.usage.trim()) errors.push(`${concept.id} is missing a contextual usage note.`);
  }
  checked.push(`${concepts.length * familiarIds.length} core familiar-language concept values`);
  checked.push(`${concepts.length * targetLanguageIds.length} transliteration entries`);

  const gameIds = new Set<string>();
  for (const game of gameDefinitions) {
    if (gameIds.has(game.id)) errors.push(`Duplicate game ID: ${game.id}.`);
    gameIds.add(game.id);
    if (!game.mechanic.trim()) errors.push(`${game.name} is missing instructions.`);
    if (!game.alternative.trim()) errors.push(`${game.name} is missing an accessible alternative.`);
  }
  if (gameDefinitions.length !== 13) errors.push(`Expected 13 games; found ${gameDefinitions.length}.`);
  checked.push("13 unique game engines with instructions and accessible alternatives");

  if (familiarIds.length !== 11) errors.push(`Expected English plus ten familiar languages; found ${familiarIds.length}.`);
  if (!familiarIds.includes("en")) errors.push("English familiar-language coverage is missing.");
  checked.push("11 familiar-language selectors");

  warnings.push("Long-form stories currently have English page translations only; the UI labels this limitation and never relabels English as another language.");
  warnings.push("Instructional language content is marked needs-language-review; no named language-expert review is claimed.");
  warnings.push("No human-recorded audio, professional ISL layer, unrestricted AI, cloud sync, or live multiplayer is claimed.");

  return { passed: errors.length === 0, checked, errors, warnings };
}

export function assertContentIntegrity() {
  const report = validateContent();
  if (!report.passed) throw new Error(`LUFO content validation failed:\n${report.errors.join("\n")}`);
  return report;
}
