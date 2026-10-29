import { Link } from "@/components/link";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Accessibility, BarChart3, Map, BookOpenText, Boxes, ChevronDown, CircleUserRound, Download, Gamepad2, GraduationCap, LayoutDashboard, Menu, MessageCircle, Palette, Settings, Sparkles, Wifi, WifiOff, X } from "lucide-react";
import { languages, targetLanguageIds, type LanguageId } from "@/lib/content";
import { useLearner } from "@/lib/store";
import { HelpDrawer } from "./LanguageLens";
import { Lufo } from "./Lufo";
import { SoundToggle } from "./sound-toggle";
import { ThemeSwitch } from "./theme-switch";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { playSound } from "@/lib/sound";

const mainNav = [
  { href: "/app/learn", label: "Learn", icon: GraduationCap },
  { href: "/app/games", label: "Play", icon: Gamepad2 },
  { href: "/app/stories", label: "Stories", icon: BookOpenText },
  { href: "/app/script", label: "Script", icon: Palette },
  { href: "/app/talk", label: "Talk", icon: MessageCircle },
];

const moreNav = [
  { href: "/app/dashboard", label: "My progress", icon: BarChart3 },
  { href: "/app/flashcards", label: "My words", icon: Boxes },
  { href: "/app/culture", label: "Cultural corner", icon: Sparkles },
  { href: "/app/map", label: "3D India atlas", icon: Map },
  { href: "/app/offline", label: "Offline packs", icon: Download },
  { href: "/app/access", label: "Access Studio", icon: Accessibility },
  { href: "/app/settings", label: "Settings & data", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state, update } = useLearner();
  const [menu, setMenu] = useState(false);
  const [online, setOnline] = useState(true);
  const [portal, setPortal] = useState(false);
  const language = languages[state.target];

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  const switchLanguage = (id: LanguageId) => {
    if (id === state.target) return;
    playSound("whoosh");
    setPortal(true);
    update({ target: id });
    window.setTimeout(() => setPortal(false), state.access.reducedMotion ? 20 : 520);
  };

  return (
    <div className={`app-frame theme-${state.target} motif-${language.motif} ${portal ? "portal-shift" : ""}`}>
      <a className="skip-link" href="#main-content">Skip to learning content</a>
      <header className="app-topbar">
        <Link className="brand" href="/" aria-label="LUFO home"><span className="brand-orbit">L</span><span>LUFO</span></Link>
        <div className="topbar-center">
          <label className="language-switcher">
            <span className="sr-only">Target language</span>
            <span className="language-dot" />
            <select value={state.target} onChange={(event) => switchLanguage(event.target.value as LanguageId)} aria-label="Change target language">
              {targetLanguageIds.map((id) => <option value={id} key={id}>{languages[id].native} · {languages[id].name}</option>)}
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </label>
          <span className="theme-caption">{language.environment}</span>
        </div>
        <div className="topbar-actions"><ThemeSwitch /><SoundToggle />
          <div className="topbar-stats" aria-label="Learner stats">
            <span className="stat-xp" title="Total XP">⚡ {state.progress[state.target].xp} XP</span>
            <span className="stat-streak" title="Daily streak">🔥 {state.progress[state.target].currentStreak || 0}</span>
          </div>
          <span className={`connectivity ${online ? "online" : "offline"}`} title={online ? "Online" : "Offline — local activities remain available"}>{online ? <Wifi size={15} /> : <WifiOff size={15} />}<span>{online ? "Online" : "Offline"}</span></span>
          <Link className="icon-button" href="/app/access" aria-label="Open Access Studio" title="Access Studio"><Accessibility size={18} /></Link>
          <SignedIn><span className="account-slot"><UserButton /></span></SignedIn><SignedOut><Link className="soft-button account-link" href="/login">Sign in</Link></SignedOut><Link className="profile-pill" href="/app/dashboard"><CircleUserRound size={18} /><span>{state.name}</span></Link>
          <button className="icon-button menu-toggle" onClick={() => setMenu((value) => !value)} aria-expanded={menu} aria-controls="app-navigation" aria-label="Toggle app menu">{menu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <aside id="app-navigation" className={`app-sidebar ${menu ? "open" : ""}`} aria-label="Main application">
        <nav>
          <p className="nav-label">Explore</p>
          {mainNav.map((item) => <NavLink key={item.href} {...item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} onNavigate={() => setMenu(false)} />)}
          <p className="nav-label">Your space</p>
          {moreNav.map((item) => <NavLink key={item.href} {...item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} onNavigate={() => setMenu(false)} />)}
        </nav>
        <div className="sidebar-progress">
          <div className="xp-ring"><span>{state.progress[state.target].xp}</span><small>XP</small></div>
          <div className="streak-indicator" title="Keep learning daily to grow your streak!">
            <span className="streak-flame">🔥</span>
            <strong>{state.progress[state.target].currentStreak || 0}</strong>
            <small>streak</small>
          </div>
          <div><strong>Gentle momentum</strong><span>{state.progress[state.target].completedLessons.length} lessons explored</span></div>
        </div>
      </aside>

      <main id="main-content" className="app-main" tabIndex={-1}>{children}</main>

      <nav className="mobile-nav" aria-label="Primary mobile navigation">
        {mainNav.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <Link key={item.href} href={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}><Icon size={20} /><span>{item.label}</span></Link>;
        })}
        <button onClick={() => setMenu(true)} aria-label="Open more navigation"><Menu size={20} /><span>More</span></button>
      </nav>
      <HelpDrawer />
      <Lufo compact />
      <div className="portal-overlay" aria-hidden="true"><span>{language.native}</span></div>
    </div>
  );
}

function NavLink({ href, label, icon: Icon, active, onNavigate }: { href: string; label: string; icon: typeof LayoutDashboard; active: boolean; onNavigate: () => void }) {
  return <Link href={href} className={`nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} onClick={onNavigate}><Icon size={19} /><span>{label}</span></Link>;
}
