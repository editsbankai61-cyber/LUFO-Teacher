import { useState } from "react";
import { Link } from "@/components/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Palette,
  Search,
  Sparkles,
  Volume2,
} from "lucide-react";
import { languages, type LanguageId, targetLanguageIds } from "@/lib/content";
import { useLearner } from "@/lib/store";
import { playSound } from "@/lib/sound";
import { speakText } from "@/lib/audio";
import { ScriptText } from "./LanguageLens";
import { ClientStage } from "./three/client-stage";

export type RegionalProfile = {
  id: LanguageId;
  region: string;
  capitalOrHub: string;
  greetingNative: string;
  greetingRoman: string;
  culturalHeritage: string;
  traditionalArt: string;
  accentColor: string;
};

export const regionalProfiles: Record<LanguageId, RegionalProfile> = {
  mr: {
    id: "mr",
    region: "Maharashtra & Western India",
    capitalOrHub: "Mumbai / Pune",
    greetingNative: "नमस्कार!",
    greetingRoman: "Namaskār!",
    culturalHeritage: "Historic Sahyadri hill forts, Paithani silk weaving, and vibrant Ganesh Utsav festivities.",
    traditionalArt: "Warli tribal painting & Powada ballads",
    accentColor: "#e76f36",
  },
  bn: {
    id: "bn",
    region: "West Bengal & Eastern India",
    capitalOrHub: "Kolkata",
    greetingNative: "নমস্কার!",
    greetingRoman: "Nomoshkār!",
    culturalHeritage: "Deep literary traditions, terracotta architectural craftsmanship, and Rabindra sangeet.",
    traditionalArt: "Alpana floor patterns & Kantha embroidery",
    accentColor: "#d84b4b",
  },
  te: {
    id: "te",
    region: "Andhra Pradesh & Telangana",
    capitalOrHub: "Hyderabad / Vijayawada",
    greetingNative: "నమస్కారం!",
    greetingRoman: "Namaskāram!",
    culturalHeritage: "Rich classical Kuchipudi dance, historic Kakatiya archways, and vibrant film literature.",
    traditionalArt: "Kalamkari painted textiles & Bidri craft",
    accentColor: "#b25a36",
  },
  ta: {
    id: "ta",
    region: "Tamil Nadu & Southern India",
    capitalOrHub: "Chennai / Madurai",
    greetingNative: "வணக்கம்!",
    greetingRoman: "Vaṇakkam!",
    culturalHeritage: "Living classical Sangam heritage, towering temple gopurams, and Carnatic music traditions.",
    traditionalArt: "Kolam geometric designs & Tanjore painting",
    accentColor: "#7856c9",
  },
  gu: {
    id: "gu",
    region: "Gujarat & Western Coast",
    capitalOrHub: "Ahmedabad / Surat",
    greetingNative: "નમસ્તે!",
    greetingRoman: "Namaste!",
    culturalHeritage: "Centuries of maritime commerce, Rann of Kutch craftsmanship, and festive Garba dances.",
    traditionalArt: "Bandhani tie-dye & Rogan painting",
    accentColor: "#e64e75",
  },
  ur: {
    id: "ur",
    region: "Delhi, Hyderabad, Lucknow & Northern India",
    capitalOrHub: "Delhi / Lucknow / Hyderabad",
    greetingNative: "سلام!",
    greetingRoman: "Salām!",
    culturalHeritage: "Exquisite ghazal and qawwali musical heritage, historic courtly etiquette, and culinary artistry.",
    traditionalArt: "Nastaliq calligraphy & Zardozi gold embroidery",
    accentColor: "#2b8b70",
  },
  kn: {
    id: "kn",
    region: "Karnataka & Deccan Plateau",
    capitalOrHub: "Bengaluru / Mysuru",
    greetingNative: "ನಮಸ್ಕಾರ!",
    greetingRoman: "Namaskāra!",
    culturalHeritage: "Hampi stone architecture, Mysuru Dasara celebrations, and ancient Vachana literature.",
    traditionalArt: "Mysuru traditional painting & Channapatna wooden toys",
    accentColor: "#3d72b8",
  },
  or: {
    id: "or",
    region: "Odisha & Eastern Coast",
    capitalOrHub: "Bhubaneswar / Puri",
    greetingNative: "ନମସ୍କାର!",
    greetingRoman: "Namaskāra!",
    culturalHeritage: "The sacred Konark Sun Temple chariot, Odissi classical dance, and Rath Yatra traditions.",
    traditionalArt: "Pattachitra scroll paintings & Pipili applique",
    accentColor: "#c34f38",
  },
  ml: {
    id: "ml",
    region: "Kerala & Southwestern Coast",
    capitalOrHub: "Thiruvananthapuram / Kochi",
    greetingNative: "നമസ്കാരം!",
    greetingRoman: "Namaskāram!",
    culturalHeritage: "Lush coastal backwaters, Kathakali and Theyyam ritual dances, and Ayurvedic medicine.",
    traditionalArt: "Mural paintings & Aranmula metal mirrors",
    accentColor: "#16846c",
  },
  pa: {
    id: "pa",
    region: "Punjab & Northwestern India",
    capitalOrHub: "Amritsar / Chandigarh",
    greetingNative: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ!",
    greetingRoman: "Sat Srī Akāl!",
    culturalHeritage: "The golden architecture of Harmandir Sahib, lively Bhangra and Giddha, and agrarian warmth.",
    traditionalArt: "Phulkari floral embroidery & Punjabi woodwork",
    accentColor: "#d65a36",
  },
};

export function IndiaMapExplorer() {
  const { state, update } = useLearner();
  const [selectedLang, setSelectedLang] = useState<LanguageId>(state.target);
  const [searchQuery, setSearchQuery] = useState("");

  const activeProfile = regionalProfiles[selectedLang];
  const langData = languages[selectedLang];

  const handleSelectRegion = (id: LanguageId) => {
    setSelectedLang(id);
    playSound("pin");
    speakText(regionalProfiles[id].greetingNative, languages[id].locale);
  };

  const handleSetTarget = (id: LanguageId) => {
    update({ target: id });
    playSound("whoosh");
  };

  const filteredIds = targetLanguageIds.filter((id) => {
    const p = regionalProfiles[id];
    const l = languages[id];
    const term = searchQuery.toLowerCase();
    return (
      p.region.toLowerCase().includes(term) ||
      l.name.toLowerCase().includes(term) ||
      l.native.toLowerCase().includes(term) ||
      p.capitalOrHub.toLowerCase().includes(term)
    );
  });

  return (
    <div className="screen-stack">
      <header className="screen-heading">
        <div>
          <span className="eyebrow">A Living Linguistic Atlas</span>
          <h1>Multilingual India: Cultural Exploration</h1>
          <p>
            Languages are not borders — speakers move, overlap, and connect across communities. Click a region to hear traditional greetings, explore cultural heritage, and link to lessons.
          </p>
        </div>
      </header>

      <div className="map-explorer-layout">
        {/* Left: 3D Stage / Visual Map View */}
        <section className="map-visual-card glass-card">
          <div className="map-stage-wrapper" role="img" aria-label="3D Interactive India Language Atlas">
            <ClientStage kind="map" />
          </div>
          <div className="map-legend-row">
            <span>✨ Drag or orbit map to view regional markers</span>
            <span>📍 Active: {langData.name} ({activeProfile.region})</span>
          </div>
        </section>

        {/* Right: Selected Region Details & Direct Action Links */}
        <aside className="region-detail-sidebar glass-card">
          <div className="region-header-banner" style={{ borderLeft: `6px solid ${activeProfile.accentColor}` }}>
            <span className="eyebrow">📍 {activeProfile.region}</span>
            <h2>{langData.name} ({langData.native})</h2>
            <p className="hubs-text">Hubs: {activeProfile.capitalOrHub}</p>
          </div>

          <div className="greeting-card glass-card">
            <div className="greeting-topline">
              <span className="eyebrow">Traditional Greeting:</span>
              <button
                className="soft-button audio-greeting-btn"
                onClick={() => speakText(activeProfile.greetingNative, langData.locale)}
                aria-label={`Listen to ${langData.name} greeting`}
              >
                <Volume2 size={16} /> Listen
              </button>
            </div>
            <strong className="greeting-native-text">
              <ScriptText language={selectedLang}>{activeProfile.greetingNative}</ScriptText>
            </strong>
            <small className="greeting-roman-text">{activeProfile.greetingRoman}</small>
          </div>

          <div className="culture-snapshot-card">
            <strong>Heritage & Traditions:</strong>
            <p>{activeProfile.culturalHeritage}</p>
            <div className="art-tag">
              <Sparkles size={14} />
              <span>Art: {activeProfile.traditionalArt}</span>
            </div>
          </div>

          <div className="region-quick-links">
            {state.target !== selectedLang ? (
              <button
                className="primary-button switch-target-btn"
                onClick={() => handleSetTarget(selectedLang)}
              >
                Learn {langData.name} <ArrowRight size={16} />
              </button>
            ) : (
              <span className="active-target-badge">
                <CheckCircle2 size={16} /> Currently Learning {langData.name}
              </span>
            )}

            <div className="sub-links-row">
              <Link className="soft-button" href="/app/learn">
                <GraduationCap size={15} /> Lessons
              </Link>
              <Link className="soft-button" href="/app/stories">
                <BookOpen size={15} /> Stories
              </Link>
              <Link className="soft-button" href="/app/script">
                <Palette size={15} /> Script
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Accessible Region Filter & Direct Selection Grid */}
      <section className="accessible-regions-section glass-card">
        <div className="search-filter-row">
          <div className="search-input-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by state, city, or language name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter Indian regions"
            />
          </div>
          <span>Showing {filteredIds.length} linguistic communities</span>
        </div>

        <div className="regions-grid">
          {filteredIds.map((id) => {
            const r = regionalProfiles[id];
            const l = languages[id];
            const isSelected = selectedLang === id;
            return (
              <button
                key={id}
                className={`region-card-btn ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectRegion(id)}
              >
                <div className="card-accent-bar" style={{ background: r.accentColor }} />
                <div className="region-btn-info">
                  <strong>
                    <ScriptText language={id}>{l.native}</ScriptText> · {l.name}
                  </strong>
                  <small>{r.region}</small>
                  <span className="greeting-preview">{r.greetingNative} ({r.greetingRoman})</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
