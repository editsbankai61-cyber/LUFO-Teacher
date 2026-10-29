import { Link } from "@/components/link";
import { useEffect, useState } from "react";
import { Accessibility, ArrowRight, BadgeCheck, BookOpen, Check, ChevronDown, CirclePlay, Download, Gamepad2, Globe2, Languages as LanguagesIcon, Menu, MessageCircle, MousePointer2, PenLine, Play, ShieldCheck, Sparkles, Volume2, WifiOff, X } from "lucide-react";
import { gameDefinitions, languages, targetLanguageIds, type LanguageId } from "@/lib/content";
import { useLearner } from "@/lib/store";
import { LensCard } from "./LanguageLens";
import { SoundToggle } from "./sound-toggle";
import { ThemeSwitch } from "./theme-switch";
import { ClientStage } from "./three/client-stage";

export function Landing() {
  const { state, update } = useLearner();
  const [menu, setMenu] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const profile = languages[state.target];

  useEffect(() => {
    const onScroll = () => document.documentElement.style.setProperty("--scroll-y", `${Math.min(window.scrollY * 0.05, 30)}px`);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className={`landing theme-${state.target} motif-${profile.motif}`}>
    <a className="skip-link" href="#landing-main">Skip to main content</a>
    <header className="landing-nav">
      <Link className="brand" href="/" aria-label="LUFO home"><span className="brand-orbit">L</span><span>LUFO</span></Link>
      <nav className={menu ? "open" : ""} aria-label="Website navigation"><a href="#why">Why LUFO</a><Link href="/app/map">3D atlas</Link><a href="#explore">Explore</a><a href="#languages">Languages</a><a href="#access">Access</a><a href="#scope">Project scope</a></nav>
      <div className="landing-actions"><Link className="text-link" href="/login">Sign in</Link><Link className="text-link" href="/register">Register</Link><ThemeSwitch /><SoundToggle /><Link className="primary-button" href="/register">Start learning<ArrowRight /></Link><button className="icon-button landing-menu" onClick={() => setMenu((value) => !value)} aria-expanded={menu} aria-label="Toggle website menu">{menu ? <X /> : <Menu />}</button></div>
    </header>
    <main id="landing-main">
      <section className="hero-section">
        <div className="hero-aurora" aria-hidden="true"><i /><i /><i /></div>
        <div className="hero-copy">
          <span className="hero-kicker"><Sparkles size={15} />Ten languages. One curious companion.</span>
          <h1>Let your next language feel <em>alive.</em></h1>
          <p>Learn through stories, playful challenges, script practice, memes, and conversation—with explanations in a language you already know.</p>
          <div className="hero-actions"><Link className="primary-button hero-cta" href="/register">Create your account<ArrowRight /></Link><Link className="soft-button" href="/login">Sign in</Link><Link className="soft-button" href="/app/onboarding">Explore as guest</Link><a className="soft-button" href="#lens"><CirclePlay />Try Language Lens</a></div>
          <div className="hero-proof"><span><Check />10 functional language paths</span><span><Check />13 playable game mechanics</span><span><Check />Accounts, guest mode, and device progress</span></div>
        </div>
        <div className="hero-world has-stage" aria-label="Original LUFO companion floats in a three-dimensional language studio">
          <ClientStage kind="hero" /><div className="language-orbit orbit-one"><span>வணக்கம்</span><span>নমস্কার</span><span>ನಮಸ್ಕಾರ</span></div>
          <div className="language-orbit orbit-two"><span>ਨਮਸਕਾਰ</span><span>سلام</span><span>నమస్కారం</span></div>
          <div className="landing-lufo" aria-hidden="true"><div className="landing-hat"><i /><b /></div><div className="landing-body"><div className="landing-eyes"><i /><i /></div><div className="landing-smile" /><span className="lufo-star">✦</span></div><div className="landing-arm left" /><div className="landing-arm right" /><div className="landing-foot left" /><div className="landing-foot right" /></div>
          <div className="hero-card card-word"><span>WORD OF THE DAY</span><b>{profile.native}</b><small>{profile.name}</small></div>
          <div className="hero-card card-xp"><Sparkles /><b>+12 XP</b><small>No pressure. Just progress.</small></div>
          <div className="hero-floor" />
        </div>
        <a className="scroll-cue" href="#why"><MousePointer2 />Scroll to explore</a>
      </section>

      <section id="why" className="manifesto-section">
        <div className="section-number">01</div><div className="manifesto-copy"><span className="eyebrow">Learning should meet you where you are</span><h2>Not another streak machine.<br /><em>A world built for understanding.</em></h2></div><div className="manifesto-text"><p>Too many language apps turn local languages into decorative cards, hide help behind pressure, or treat accessibility as a setting added later.</p><p>LUFO starts with target-language content, keeps help within reach, and records whether recall was independent or assisted—without shame or lost access.</p></div>
      </section>


      <section className="saas-band" aria-label="Studio motion">
        <header className="landing-section-head"><span className="eyebrow">Depth you can feel</span><h2>A studio, not a flat deck.</h2><p>Glass panels drift in the hero. The atlas spins. Sound answers your taps — and stays optional.</p></header>
        <div className="tilt-row">
          <Link href="/app/learn" className="tilt-card tilt-a"><span>01</span><b>Lessons</b><p>Three calm units. Meanings stay hidden until you ask.</p></Link>
          <Link href="/app/map" className="tilt-card tilt-b"><span>02</span><b>3D India atlas</b><p>Orbit the peninsula and open a language community.</p></Link>
          <Link href="/app/games" className="tilt-card tilt-c"><span>03</span><b>Play</b><p>Thirteen mechanics. Untimed routes. Real words.</p></Link>
        </div>
      </section>
      <section id="explore" className="feature-story">
        <header className="landing-section-head"><span className="eyebrow">Three paths, one learning objective</span><h2>Follow your curiosity.</h2><p>Switch modes without losing your place, words, review history, or preferences.</p></header>
        <div className="feature-showcase">
          <div className="feature-tabs" role="tablist" aria-label="Learning mode previews">{[
            { title: "Learn with memes", sub: "Original humor, memorable context", icon: Sparkles },
            { title: "Learn by playing", sub: "Thirteen distinct mechanics", icon: Gamepad2 },
            { title: "Learn with stories", sub: "Fifty complete short stories", icon: BookOpen },
          ].map((item, index) => { const Icon = item.icon; return <button role="tab" aria-selected={activeFeature === index} onClick={() => setActiveFeature(index)} className={activeFeature === index ? "active" : ""} key={item.title}><span><Icon /></span><div><b>{item.title}</b><small>{item.sub}</small></div><ArrowRight /></button>; })}</div>
          <div className={`feature-visual visual-${activeFeature + 1}`}>
            {activeFeature === 0 && <div className="landing-meme"><span>ME: “ONE WORD TODAY”</span><div className="meme-face"><i /><i /><b /></div><strong>{profile.meme.punchline}</strong><small>Original LUFO template · tap to reveal in the app</small></div>}
            {activeFeature === 1 && <div className="landing-game"><div className="game-cloud cloud-a" /><div className="game-cloud cloud-b" /><div className="landing-kite"><i /><b /></div><div className="game-question"><span>Choose “Hello”</span><b>{profile.native}</b></div><div className="game-controls"><button>Climb</button><button>Hold</button><button>Sweep</button></div></div>}
            {activeFeature === 2 && <div className="landing-reader"><div className="reader-picture"><i /><b /></div><span>PAGE 1 OF 3</span><h3>{profile.stories[0].title}</h3><p>{profile.stories[0].pages[0].text}</p><div><button><ChevronDown />Meaning</button><button>Next page <ArrowRight /></button></div></div>}
          </div>
        </div>
      </section>

      <section id="lens" className="lens-demo-section">
        <div className="lens-demo-copy"><span className="section-number">02</span><span className="eyebrow">Language Lens</span><h2>Understand through a language you <em>already know.</em></h2><p>Target language stays first. Reveal Marathi, English, or another familiar language only when you ask. Translation and transliteration remain separate.</p><div className="lens-points"><span><EyeIcon />Meanings hidden by default</span><span><LanguagesIcon />Switch explanation instantly</span><span><ShieldCheck />Help is recorded without penalty</span></div><button className="soft-button" onClick={() => update({ target: "ta", familiar: ["mr", "en"], primaryFamiliar: "mr", lensMode: "hidden" })}>Load required Tamil → Marathi / English example</button></div>
        <div className="landing-lens-card"><div className="browser-bar"><i /><i /><i /><span>LUFO · Language Lens</span></div><LensCard conceptId="hello" activity="landing-demo" /></div>
      </section>

      <section className="meet-section">
        <div className="meet-lufo-art"><div className="meet-orbit" /><div className="landing-lufo large" aria-hidden="true"><div className="landing-hat"><i /><b /></div><div className="landing-body"><div className="landing-eyes"><i /><i /></div><div className="landing-smile" /><span className="lufo-star">✦</span></div><div className="landing-arm left" /><div className="landing-arm right" /><div className="landing-foot left" /><div className="landing-foot right" /></div><span className="reaction-chip chip-one">curious ✦</span><span className="reaction-chip chip-two">you’ve got this</span><span className="reaction-chip chip-three">hat: secure</span></div>
        <div className="meet-copy"><span className="eyebrow">Meet your companion</span><h2>Kind. Curious.<br /><em>A little mischievous.</em></h2><p>LUFO guides, explains, celebrates, and gives you space. Every expressive reaction has written meaning and a button alternative.</p><div className="state-list">{["Listening", "Thinking", "Encouraging", "Celebrating", "Resting"].map((item) => <span key={item}>{item}</span>)}</div><Link className="primary-button" href="/app/talk">Talk to LUFO <MessageCircle /></Link><span className="content-status">Scripted branching tutor · Clearly labeled Demo mode</span></div>
      </section>

      <section className="games-marquee">
        <header className="landing-section-head"><span className="eyebrow">Play is a serious learning tool</span><h2>Thirteen games. Thirteen mechanics.</h2><p>Every game has touch and keyboard controls, pause, hints, explanation, and an adapted route—not a generic quiz replacement.</p></header><div className="game-preview-strip">{gameDefinitions.slice(0, 6).map((game, index) => <Link href={`/app/games/${game.id}`} key={game.id} className={`landing-game-card game-${index + 1}`}><span>0{index + 1}</span><div><Gamepad2 /></div><h3>{game.name}</h3><p>{game.mechanic}</p><b>Play preview <ArrowRight /></b></Link>)}</div><Link className="soft-button centered-button" href="/app/games">See all 13 games<ArrowRight /></Link>
      </section>

      <section id="languages" className="language-section">
        <header><span className="eyebrow">Ten visual worlds</span><h2>One design system.<br /><em>Ten distinct atmospheres.</em></h2><p>Switching language changes words, script, content, theme, motif, and LUFO’s accessory—not just a color token.</p></header><div className="landing-language-grid">{targetLanguageIds.map((id) => <button key={id} className={`${state.target === id ? "active" : ""} language-tile motif-${languages[id].motif}`} onClick={() => update({ target: id })}><span>{languages[id].native.slice(0, 1)}</span><div><b>{languages[id].native}</b><small>{languages[id].name}</small></div>{state.target === id && <Check />}</button>)}</div><div className="theme-description"><span style={{ background: profile.accent }} /><b>{profile.name}</b><p>{profile.environment}</p></div>
      </section>

      <section className="script-preview-section">
        <div className="script-preview-copy"><span className="eyebrow">Script Studio</span><h2>Writing systems deserve <em>respect.</em></h2><p>Explore large letterforms, script-specific notes, transformations, tracing practice, identification, and word building. Urdu joining and direction are taught on their own terms; Punjabi defaults to Gurmukhi.</p><Link className="primary-button" href="/app/script">Enter Script Studio<PenLine /></Link></div><div className="glyph-wall" aria-label={`Decorative sample forms from ${profile.name}. Script information is available in text.`}>{profile.scriptSamples.map((item, index) => <div key={item.glyph} className={`glyph-block block-${index + 1}`}><span>{item.name}</span><b lang={profile.locale} dir={profile.direction}>{item.glyph}</b><small>{item.example}</small></div>)}</div>
      </section>

      <section id="access" className="access-section">
        <div className="access-head"><span className="section-number">03</span><div><span className="eyebrow">Access is not an extra</span><h2>Learn in the way that works <em>today.</em></h2></div><p>No learner should need perfect vision, hearing, speech, motor precision, reaction speed, or constant energy to participate meaningfully.</p></div><div className="access-grid">{[
          [Accessibility, "Flexible controls", "Keyboard, touch, mouse, named gesture alternatives, and untimed play."],
          [Volume2, "Sound is optional", "Captions, transcripts, visual rhythm, and text feedback remain available."],
          [Sparkles, "Motion under your control", "Reduced motion, no flashing, static celebrations, and no screen shake."],
          [BookOpen, "Reading comfort", "Larger text, solid surfaces, line focus, reflow, and distraction-free stories."],
          [MessageCircle, "Speech is never required", "Typing and selectable AAC-friendly phrases complete tutor routes."],
          [ShieldCheck, "Fair progress", "Help and adapted controls never remove access, rewards, or dignity."],
        ].map(([Icon, title, text]) => { const C = Icon as typeof Accessibility; return <article key={title as string}><C /><h3>{title as string}</h3><p>{text as string}</p></article>; })}</div><div className="access-cta"><span>Design target: WCAG 2.2 AA</span><p>Not a conformance claim. Participant testing and a documented manual audit remain future work.</p><Link className="soft-button" href="/app/access">Open Access Studio<ArrowRight /></Link></div>
      </section>

      <section className="offline-section"><div className="offline-art"><div className="download-orbit"><Download /></div><span className="floating-label one">LESSONS</span><span className="floating-label two">STORIES</span><span className="floating-label three">GAMES</span><span className="floating-label four">SCRIPTS</span></div><div><span className="eyebrow">Local first</span><h2>Your learning doesn’t disappear when the signal does.</h2><p>Authored content and progress are designed for local use. The current web pack caches visited routes; live AI, remote translation, and cloud sync are not claimed.</p><ul><li><Check />Per-language progress on this device</li><li><Check />Export, practical import, and deletion</li><li><WifiOff />Scripted tutor and local content offline</li></ul><Link className="primary-button" href="/app/offline">See offline scope<ArrowRight /></Link></div></section>

      <section id="scope" className="scope-section"><header className="landing-section-head"><span className="eyebrow">Built honestly</span><h2>What is real. What still needs people.</h2></header><div className="scope-grid"><article><BadgeCheck /><h3>Functional in this build</h3><p>All ten target languages, local core vocabulary pairs, lessons, 13 game engines, 50 stories, scripts, memes, tutor branches, themes, progress, access settings, and export.</p></article><article><ShieldCheck /><h3>Clearly labeled drafts</h3><p>Instructional content needs named expert review. English story translations exist; full long-form story translation into every familiar language does not.</p></article><article><Globe2 /><h3>External/native future scope</h3><p>Live AI, remote multiplayer, cloud sync, arbitrary translation, human-recorded audio, professional ISL video, native widgets, and installed icon switching.</p></article></div></section>

      <section className="final-cta"><div className="cta-orbit" aria-hidden="true" /><span className="eyebrow">Your next language is waiting</span><h2>Come for the games.<br /><em>Stay for the connection.</em></h2><p>Start with Marathi, or choose any of ten living language paths.</p><Link className="primary-button hero-cta" href="/register">Create an account and begin<ArrowRight /></Link><Link className="soft-button" href="/app/onboarding">Or explore as a guest</Link></section>
    </main>
    <footer className="landing-footer"><div><Link className="brand" href="/"><span className="brand-orbit">L</span><span>LUFO</span></Link><p>Educational App Development for Local Language Learning</p></div><div><strong>Explore</strong><Link href="/app/learn">Learning path</Link><Link href="/app/games">Games</Link><Link href="/app/stories">Stories</Link></div><div><strong>Project</strong><a href="#scope">Coverage & scope</a><Link href="/app/access">Accessibility</Link><Link href="/app/settings">Privacy & data</Link></div><div className="credits"><strong>CEP project credits</strong><p>Project team: Editable in <code>Landing.tsx</code></p><p>Content status: Educational draft</p><span>Made with curiosity, care, and no fake claims.</span></div></footer>
  </div>;
}

function EyeIcon() { return <span aria-hidden="true">◉</span>; }
