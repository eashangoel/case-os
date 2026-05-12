import React from "react";
import { Icon } from "./components/ui";
import { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio } from "./tweaks-panel";
import { HomeScreen } from "./screens/home";
import { SimulatorScreen } from "./screens/simulator";
import { ScorecardScreen } from "./screens/scorecard";
import { ProgressScreen } from "./screens/progress";

const SCREENS = [
  { key: "home",      label: "Case Library", icon: "library",   crumb: "Home" },
  { key: "simulator", label: "Simulator",    icon: "simulator", crumb: "Simulator" },
  { key: "scorecard", label: "Scorecard",    icon: "scorecard", crumb: "Scorecard" },
  { key: "progress",  label: "Progress",     icon: "progress",  crumb: "Progress" },
];

const TWEAK_DEFAULTS = {
  accent: "#4F8EF7",
  fontStyle: "geometric",
  density: "comfortable",
};

const computeStreak = (history) => {
  if (!history.length) return 0;
  const dates = [...new Set(history.map((s) => s.date))];
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / (1000 * 60 * 60 * 24);
    if (diff <= 1) streak++;
    else break;
  }
  return streak;
};

const App = () => {
  const [screen, setScreen] = React.useState("home");
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Session state — flows between screens
  const [activeCase, setActiveCase] = React.useState(null);
  const [sessionMessages, setSessionMessages] = React.useState([]);
  const [sessionPhase, setSessionPhase] = React.useState(0);
  const [coachMode, setCoachMode] = React.useState("interview");
  const [scorecardData, setScorecardData] = React.useState(null);

  // Streak from localStorage (re-reads when screen changes)
  const streak = React.useMemo(() => {
    try {
      const history = JSON.parse(localStorage.getItem("caseHistory") || "[]");
      return computeStreak(history);
    } catch { return 0; }
  }, [screen]);

  // Apply accent CSS variable
  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
    const hex = t.accent.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    document.documentElement.style.setProperty("--accent-soft", `rgba(${r}, ${g}, ${b}, 0.12)`);
    document.documentElement.style.setProperty("--accent-line", `rgba(${r}, ${g}, ${b}, 0.35)`);
  }, [t.accent]);

  React.useEffect(() => {
    const fonts = {
      geometric: '"Inter", -apple-system, sans-serif',
      humanist:  '"Geist", "Inter", sans-serif',
      classical: '"GT Sectra", "Charter", Georgia, serif',
    };
    document.documentElement.style.setProperty("--font-sans", fonts[t.fontStyle] || fonts.geometric);
  }, [t.fontStyle]);

  const handleStart = (caseObj) => {
    setActiveCase(caseObj);
    setSessionMessages([]);
    setSessionPhase(0);
    setCoachMode("interview");
    setScorecardData(null);
    setScreen("simulator");
  };

  const handleSimulatorSubmit = (elapsedSeconds) => {
    setScreen("scorecard");
  };

  const screenDef = SCREENS.find((s) => s.key === screen);

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return <HomeScreen onStart={handleStart} />;
      case "simulator":
        return (
          <SimulatorScreen
            activeCase={activeCase}
            sessionMessages={sessionMessages}
            setSessionMessages={setSessionMessages}
            sessionPhase={sessionPhase}
            setSessionPhase={setSessionPhase}
            coachMode={coachMode}
            setCoachMode={setCoachMode}
            setScorecardData={setScorecardData}
            onSubmit={handleSimulatorSubmit}
          />
        );
      case "scorecard":
        return (
          <ScorecardScreen
            scorecardData={scorecardData}
            activeCase={activeCase}
            sessionMessages={sessionMessages}
            onAnother={() => setScreen("home")}
            onDash={() => setScreen("progress")}
          />
        );
      case "progress":
        return (
          <ProgressScreen
            onReview={() => setScreen("scorecard")}
            onStartCase={() => setScreen("home")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app" data-screen-label={screenDef.crumb}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C/</div>
          <div className="brand-name">CaseOS</div>
          <div className="brand-version">v0.4</div>
        </div>

        <div className="nav-group">
          <div className="nav-label">Workspace</div>
          {SCREENS.map((s, i) => (
            <button
              key={s.key}
              className={"nav-item " + (screen === s.key ? "active" : "")}
              onClick={() => setScreen(s.key)}
            >
              <Icon name={s.icon} />
              <span>{s.label}</span>
              <span className="kbd">{i + 1}</span>
            </button>
          ))}
        </div>

        <div className="nav-group">
          <div className="nav-label">Library</div>
          <button className="nav-item"><Icon name="book" /> Frameworks</button>
          <button className="nav-item"><Icon name="calc" /> Math drills</button>
          <button className="nav-item"><Icon name="scale" /> Benchmarks</button>
        </div>

        <div className="nav-group">
          <div className="nav-label">Account</div>
          <button className="nav-item"><Icon name="settings" /> Settings</button>
        </div>

        <div className="sidebar-foot">
          <div className="avatar">YOU</div>
          <div className="user-meta">
            <span className="user-name">Candidate</span>
            <span className="user-sub">CASEOS · FREE</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="crumbs">
            <span>CaseOS</span>
            <span className="sep">/</span>
            <span className="here">{screenDef.crumb}</span>
            {screen === "simulator" && activeCase && (
              <><span className="sep">/</span><span style={{ color: "var(--text-3)" }}>{activeCase.title}</span></>
            )}
          </div>
          <div className="top-actions">
            {streak > 0 && (
              <span className="streak">
                <span className="dot" />
                <Icon name="flame" size={11} style={{ color: "var(--warn)" }} />
                <span>{streak}-day streak</span>
              </span>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => setScreen("progress")}>
              My Progress <Icon name="arrow-up-right" size={11} />
            </button>
            <span style={{ width: 1, height: 18, background: "var(--line-1)" }} />
            <button className="btn btn-sm">
              <Icon name="search" size={12} /> Quick find <span className="kbd-inline" style={{ marginLeft: 4 }}>⌘K</span>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {renderScreen()}
        </div>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent">
          <TweakColor
            label="Color"
            value={t.accent}
            options={["#4F8EF7", "#F5A623", "#7C5CFF", "#58C97A"]}
            onChange={(v) => setTweak("accent", v)}
          />
        </TweakSection>
        <TweakSection label="Typography">
          <TweakRadio
            label="Style"
            value={t.fontStyle}
            options={["geometric", "humanist", "classical"]}
            onChange={(v) => setTweak("fontStyle", v)}
          />
        </TweakSection>
        <TweakSection label="Jump to screen">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {SCREENS.map((s) => (
              <button
                key={s.key}
                onClick={() => setScreen(s.key)}
                style={{
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid " + (screen === s.key ? "var(--accent-line)" : "var(--line-1)"),
                  background: screen === s.key ? "var(--accent-soft)" : "var(--bg-2)",
                  color: screen === s.key ? "var(--accent)" : "var(--text-1)",
                  fontSize: 11.5,
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  textAlign: "left",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

export default App;
