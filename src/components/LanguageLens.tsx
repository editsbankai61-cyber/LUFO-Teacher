import { useEffect, useRef, useState } from "react";
import { BookmarkPlus, Ear, Eye, EyeOff, Languages, MessageCircleQuestion, Search, Volume2, X } from "lucide-react";
import { concepts, familiarLanguages, getConcept, languages, type FamiliarLanguageId } from "@/lib/content";
import { useLearner } from "@/lib/store";

export function ScriptText({ children, language, className = "" }: { children: React.ReactNode; language: FamiliarLanguageId; className?: string }) {
  const config = language === "en" ? familiarLanguages[0] : languages[language];
  return <span lang={config.locale} dir={config.direction} className={`script-text ${className}`} style={{ fontFamily: language === "en" ? undefined : languages[language].font }}>{children}</span>;
}

export function LensCard({ conceptId, compact = false, activity = "lesson" }: { conceptId: string; compact?: boolean; activity?: string }) {
  const { state, update, saveConcept, updateProgress } = useLearner();
  const [peeked, setPeeked] = useState(false);
  const [speechStatus, setSpeechStatus] = useState("");
  const concept = getConcept(conceptId);
  const language = languages[state.target];
  const visible = state.lensMode === "visible" || state.lensMode === "side-by-side" || peeked;

  const peek = () => {
    setPeeked(true);
    window.setTimeout(() => setPeeked(false), 3200);
  };

  const speak = () => {
    if (!("speechSynthesis" in window)) {
      setSpeechStatus("Speech is unavailable in this browser. The text remains available.");
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((item) => item.lang.toLowerCase().startsWith(language.locale.slice(0, 2).toLowerCase()));
    if (!voice) {
      setSpeechStatus(`No ${language.name} browser voice was found. LUFO will not substitute an unrelated voice.`);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(concept.values[state.target]);
    utterance.lang = language.locale;
    utterance.voice = voice;
    utterance.rate = 0.86;
    window.speechSynthesis.speak(utterance);
    setSpeechStatus("Playing browser-generated speech; this is not a human recording.");
  };

  const changeHelp = (id: FamiliarLanguageId) => {
    update({ primaryFamiliar: id, familiar: state.familiar.includes(id) ? state.familiar : [...state.familiar, id] });
  };

  return (
    <article className={`lens-card ${compact ? "compact" : ""}`} data-activity={activity}>
      <div className="lens-primary">
        <span className="eyebrow">Target first · {language.name}</span>
        <ScriptText language={state.target} className="target-word">{concept.values[state.target]}</ScriptText>
        {state.showTransliteration && <span className="transliteration">{concept.transliteration[state.target]}</span>}
      </div>
      <div className="lens-actions">
        <button className="soft-button" aria-expanded={visible} onClick={() => {
          const next = visible ? "hidden" : "visible";
          update({ lensMode: next });
          if (next === "visible") updateProgress(state.target, (p) => ({ ...p, assistedAnswers: p.assistedAnswers + 1 }));
        }}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}{visible ? "Hide meaning" : "Reveal meaning"}</button>
        {!visible && <button className="soft-button" onClick={peek}><Ear size={16} />Peek 3 sec</button>}
        <button className="icon-button" onClick={speak} aria-label={`Listen to browser-generated ${language.name} pronunciation`} title="Listen"><Volume2 size={17} /></button>
        <button className="icon-button" onClick={() => saveConcept(concept.id)} aria-label="Save to my words" title="Save to my words"><BookmarkPlus size={17} /></button>
        <a className="icon-button" href={`/app/talk?word=${concept.id}`} aria-label="Ask LUFO about this word" title="Ask LUFO"><MessageCircleQuestion size={17} /></a>
      </div>
      <div className="sr-status" aria-live="polite">{speechStatus}</div>
      {visible && (
        <div className="lens-reveal">
          <div className="lens-language-tabs" aria-label="Explanation language">
            {state.familiar.map((id) => {
              const item = familiarLanguages.find((entry) => entry.id === id)!;
              return <button key={id} className={state.primaryFamiliar === id ? "active" : ""} aria-pressed={state.primaryFamiliar === id} onClick={() => changeHelp(id)}>{item.native}</button>;
            })}
          </div>
          <ScriptText language={state.primaryFamiliar} className="meaning">{concept.values[state.primaryFamiliar]}</ScriptText>
          <p>{concept.usage}</p>
          <span className="content-status">Contextual authored note · Needs language review</span>
        </div>
      )}
    </article>
  );
}

export function HelpDrawer() {
  const { state, update, saveConcept } = useLearner();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<FamiliarLanguageId>(state.target);
  const [resultId, setResultId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  const close = () => {
    setOpen(false);
    window.setTimeout(() => openerRef.current?.focus(), 0);
  };

  const openWithSelection = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection) setQuery(selection);
    setSource(state.target);
    setOpen(true);
  };

  const findLocal = () => {
    const normalized = query.trim().toLocaleLowerCase();
    const found = concepts.find((concept) => Object.values(concept.values).some((value) => value.toLocaleLowerCase() === normalized || value.toLocaleLowerCase().includes(normalized)));
    setResultId(found?.id ?? null);
    setSearched(true);
  };

  const result = resultId ? getConcept(resultId) : null;

  return <>
    <button ref={openerRef} className="help-fab" onClick={openWithSelection}><Languages size={19} /><span>Help me understand</span></button>
    <dialog ref={dialogRef} className="help-dialog" onCancel={(event) => { event.preventDefault(); close(); }} aria-labelledby="help-title">
      <div className="dialog-head">
        <div><span className="eyebrow">Language Lens</span><h2 id="help-title">Help me understand</h2></div>
        <button className="icon-button" onClick={close} aria-label="Close help drawer"><X /></button>
      </div>
      <p>Select authored text before opening this drawer, or type a word or phrase. Local explanations work offline.</p>
      <label className="field-label">Text to understand<textarea value={query} onChange={(event) => { setQuery(event.target.value); setSearched(false); }} placeholder="Type or paste text" /></label>
      <div className="field-grid">
        <label className="field-label">Source language<select value={source} onChange={(event) => setSource(event.target.value as FamiliarLanguageId)}>{familiarLanguages.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label className="field-label">Explain in<select value={state.primaryFamiliar} onChange={(event) => update({ primaryFamiliar: event.target.value as FamiliarLanguageId })}>{familiarLanguages.filter((item) => state.familiar.includes(item.id)).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      </div>
      <button className="primary-button" onClick={findLocal} disabled={!query.trim()}><Search size={17} />Check local learning content</button>
      {searched && result && <div className="help-result">
        <span className="eyebrow">Authored local match · contextual sense</span>
        <ScriptText language={source}>{result.values[source]}</ScriptText>
        <strong><ScriptText language={state.primaryFamiliar}>{result.values[state.primaryFamiliar]}</ScriptText></strong>
        <p>{result.usage}</p>
        <div className="row-actions"><button className="soft-button" onClick={() => saveConcept(result.id)}><BookmarkPlus size={16} />Save to my words</button><a className="soft-button" href={`/app/talk?word=${result.id}`}><MessageCircleQuestion size={16} />Ask LUFO</a></div>
      </div>}
      {searched && !result && <div className="honest-state" role="status">
        <strong>No local explanation found</strong>
        <p>LUFO has no configured translation or AI service, so it will not invent a meaning or silently fall back to English. Try one of the authored course phrases. Arbitrary translation would require internet access and a reviewed external-service connection.</p>
      </div>}
      <p className="privacy-note">Nothing typed here leaves this device in the current build.</p>
    </dialog>
  </>;
}
