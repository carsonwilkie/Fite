import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import usePaidStatus from "./usePaidStatus";
import { CATEGORIES, DIFFICULTIES } from "./constants";

const C = {
  bg:          "#020817",
  surface:     "#0d1b2a",
  surfaceHigh: "#1b263b",
  surfaceLow:  "#0b1120",
  primary:     "#1565C0",
  secondary:   "#4FC3F7",
  gold:        "#c9a84c",
  text:        "#f8fafc",
  textMuted:   "#94a3b8",
  border:      "rgba(21, 101, 192, 0.18)",
  success:     "#22c55e",
  warn:        "#f59e0b",
  danger:      "#ef4444",
};
const cyberGrad = "linear-gradient(45deg, #1565C0, #4FC3F7)";

const scoreColor = s => s >= 8 ? C.success : s >= 5 ? C.warn : C.danger;

function ScoreChip({ score }) {
  if (score === null || score === undefined) return null;
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${scoreColor(score)}`, background: `${scoreColor(score)}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 900, color: scoreColor(score) }}>{score}</span>
    </div>
  );
}

function Badge({ text, accent }) {
  return (
    <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", backgroundColor: accent ? `${accent}18` : "rgba(21,101,192,0.1)", color: accent || C.textMuted, border: `1px solid ${accent ? `${accent}30` : C.border}` }}>
      {text}
    </span>
  );
}

function EntryCard({ entry, index, expanded, onToggle }) {
  const isInterview = entry.type === "interview";
  const title       = isInterview ? (entry.scenario || "Interview Session") : entry.question;
  const shortTitle  = title?.length > 120 ? title.slice(0, 117) + "…" : title;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.2) }}
      style={{ borderRadius: 12, backgroundColor: C.surface, border: `1px solid ${expanded ? "rgba(79,195,247,0.3)" : C.border}`, overflow: "hidden", transition: "border-color 0.2s" }}
      id={`entry-${index}`}
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 12 }}
      >
        <ScoreChip score={entry.score ?? null} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.5, marginBottom: 7 }}>{shortTitle}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {isInterview && <Badge text="Interview" accent={C.gold} />}
            {entry.category && <Badge text={entry.category} />}
            {entry.difficulty && <Badge text={entry.difficulty} />}
            {entry.math && entry.math !== "No Math" && <Badge text="Math" accent={C.secondary} />}
            {entry.customPrompt && <Badge text={entry.customPrompt} accent={C.secondary} />}
          </div>
        </div>
        <span style={{ fontSize: 12, color: C.textMuted, flexShrink: 0, marginTop: 2, transition: "transform 0.2s", display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>

              {isInterview ? (
                /* Interview entry */
                entry.questions?.map((q, qi) => (
                  <div key={qi} style={{ padding: "12px 14px", borderRadius: 10, backgroundColor: C.surfaceLow, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: C.secondary, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 6 }}>Q{qi + 1}</div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: "0 0 8px 0", lineHeight: 1.5 }}>{q.question}</p>
                    {q.userAnswer && (
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 900, color: C.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 4 }}>Your Answer</div>
                        <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 6px 0", lineHeight: 1.6 }}>{q.userAnswer}</p>
                      </div>
                    )}
                    {q.feedback && (
                      <div style={{ padding: "8px 12px", borderRadius: 8, backgroundColor: C.surfaceHigh, borderLeft: `3px solid ${q.score !== null ? scoreColor(q.score) : C.primary}` }}>
                        {q.score !== null && <span style={{ fontSize: 11, fontWeight: 900, color: scoreColor(q.score), marginRight: 8 }}>{q.score}/10</span>}
                        <span style={{ fontSize: 12, color: C.text }}>{q.feedback}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                /* Regular question entry */
                <>
                  {entry.userAnswer && (
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 900, color: C.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 6 }}>Your Answer</div>
                      <p style={{ fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.7 }}>{entry.userAnswer}</p>
                    </div>
                  )}
                  {entry.feedback && (
                    <div style={{ padding: "12px 14px", borderRadius: 10, backgroundColor: C.surfaceLow, borderLeft: `3px solid ${scoreColor(entry.score ?? 5)}` }}>
                      <div style={{ fontSize: 9, fontWeight: 900, color: C.secondary, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 6 }}>AI Feedback</div>
                      <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.7 }}>{entry.feedback}</p>
                    </div>
                  )}
                  {entry.answer && (
                    <div style={{ padding: "12px 14px", borderRadius: 10, backgroundColor: C.surfaceLow, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, fontWeight: 900, color: C.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif", marginBottom: 6 }}>Model Answer</div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }} className="history-dark-md">
                        <ReactMarkdown>{entry.answer}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HistoryDark() {
  const router  = useRouter();
  const { user } = useUser();
  const { isPaid, loading } = usePaidStatus();

  const [entries,           setEntries]           = useState([]);
  const [loadingData,       setLoadingData]       = useState(true);
  const [expandedIndex,     setExpandedIndex]     = useState(null);
  const [search,            setSearch]            = useState("");
  const [selectedCategory,  setSelectedCategory]  = useState("");
  const [selectedDifficulty,setSelectedDifficulty]= useState("");
  const [selectedMath,      setSelectedMath]      = useState("");
  const [sortOrder,         setSortOrder]         = useState("newest");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (loading) return;
    if (!isPaid) { router.push("/"); return; }
    if (!user?.id) return;
    fetch(`/api/history?userId=${user.id}`)
      .then(r => r.json())
      .then(d => { setEntries(d.entries || []); setLoadingData(false); });
  }, [user, isPaid, loading, router]);

  const getDateStr = ts => new Date(ts).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const filtered = entries
    .filter(e => {
      const text = e.type === "interview" ? (e.scenario || "") : (e.question || "");
      const matchSearch     = !search || text.toLowerCase().includes(search.toLowerCase());
      const matchCategory   = !selectedCategory || selectedCategory === "All" || e.category === selectedCategory;
      const matchDifficulty = !selectedDifficulty || e.difficulty === selectedDifficulty;
      const matchMath       = !selectedMath ||
        (selectedMath === "No Math" && (!e.math || e.math === "No Math")) ||
        (selectedMath === "With Math" && e.math === "With Math");
      return matchSearch && matchCategory && matchDifficulty && matchMath;
    })
    .sort((a, b) => sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);

  const grouped = {};
  filtered.forEach(e => {
    const d = getDateStr(e.timestamp);
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });

  let globalIdx = 0;

  const FilterChip = ({ label, value, active, onClick }) => (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "Manrope, sans-serif", cursor: "pointer", border: `1px solid ${active ? C.secondary : C.border}`, background: active ? "rgba(79,195,247,0.12)" : "transparent", color: active ? C.secondary : C.textMuted, whiteSpace: "nowrap", transition: "all 0.15s" }}
    >
      {label}
    </motion.button>
  );

  if (loading || loadingData) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 13, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>Loading history...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, color: C.text, fontFamily: "Inter, sans-serif" }}>

      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", backgroundColor: `${C.bg}ee`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <motion.img
            src={isPaid ? "/Fite_Premium_NB.png" : "/favicon.png"}
            alt="logo"
            onClick={() => router.push("/")}
            whileTap={{ scale: 0.95 }}
            style={{ height: 32, width: 32, cursor: "pointer", borderRadius: 6, flexShrink: 0 }}
          />
          <motion.button
            onClick={() => router.push("/dashboard")}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 13, fontFamily: "Manrope, sans-serif", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
          >
            ← Dashboard
          </motion.button>
          <div style={{ width: 1, height: 16, backgroundColor: C.border }} />
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: C.text, fontFamily: "Manrope, sans-serif" }}>Question History</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "Manrope, sans-serif" }}>{entries.length} entries</span>
          <motion.button
            onClick={() => router.push("/stats")}
            whileTap={{ scale: 0.97 }}
            style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 11, fontWeight: 700, fontFamily: "Manrope, sans-serif", cursor: "pointer", letterSpacing: "0.06em" }}
          >
            Stats →
          </motion.button>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => startTransition(() => setSearch(e.target.value))}
            style={{ width: "100%", padding: "13px 16px 13px 42px", backgroundColor: C.surface, border: `1px solid ${search ? C.secondary : C.border}`, borderRadius: 10, fontSize: 14, color: C.text, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
          />
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: search ? C.secondary : C.textMuted, fontSize: 16, pointerEvents: "none", transition: "color 0.2s" }}>⌕</span>
        </div>

        {/* Filters — grouped by type */}
        <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 28, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Category row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", width: 64, flexShrink: 0 }}>Category</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["", ...CATEGORIES.filter(c => c !== "All")].map(cat => (
                <FilterChip key={cat || "_all"} label={cat || "All"} active={selectedCategory === cat} onClick={() => startTransition(() => setSelectedCategory(selectedCategory === cat ? "" : cat))} />
              ))}
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: C.border }} />

          {/* Difficulty row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", width: 64, flexShrink: 0 }}>Difficulty</span>
            <div style={{ display: "flex", gap: 6 }}>
              {DIFFICULTIES.map(d => (
                <FilterChip key={d} label={d} active={selectedDifficulty === d} onClick={() => startTransition(() => setSelectedDifficulty(selectedDifficulty === d ? "" : d))} />
              ))}
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: C.border }} />

          {/* Math + Sort row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textMuted, fontFamily: "Manrope, sans-serif", width: 64, flexShrink: 0 }}>Math</span>
            <div style={{ display: "flex", gap: 6, flex: 1 }}>
              {["With Math", "No Math"].map(m => (
                <FilterChip key={m} label={m} active={selectedMath === m} onClick={() => startTransition(() => setSelectedMath(selectedMath === m ? "" : m))} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
              <FilterChip label="↓ Newest" active={sortOrder === "newest"} onClick={() => setSortOrder("newest")} />
              <FilterChip label="↑ Oldest" active={sortOrder === "oldest"} onClick={() => setSortOrder("oldest")} />
            </div>
          </div>
        </div>

        {/* Results count */}
        {entries.length > 0 && (
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Manrope, sans-serif", marginBottom: 16, letterSpacing: "0.04em" }}>
            Showing <span style={{ color: C.text, fontWeight: 700 }}>{filtered.length}</span> of <span style={{ color: C.text, fontWeight: 700 }}>{entries.length}</span> entries
          </div>
        )}

        {/* Entries */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: C.textMuted, fontFamily: "Manrope, sans-serif", fontSize: 14 }}>
            {entries.length === 0 ? "No history yet — answer some questions to get started." : "No results match your filters."}
          </div>
        ) : (
          Object.entries(grouped).map(([date, group]) => (
            <div key={date} style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.secondary, fontFamily: "Manrope, sans-serif", marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>{date}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {group.map(entry => {
                  const gi = globalIdx++;
                  return (
                    <EntryCard
                      key={gi}
                      entry={entry}
                      index={gi}
                      expanded={expandedIndex === gi}
                      onToggle={() => setExpandedIndex(expandedIndex === gi ? null : gi)}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx global>{`
        html, body { background: ${C.bg}; }
        .history-dark-md p { font-size: 13px; color: ${C.text}; line-height: 1.75; margin: 4px 0; }
        .history-dark-md ul, .history-dark-md ol { padding-left: 16px; margin: 4px 0; }
        .history-dark-md li { font-size: 13px; color: ${C.text}; line-height: 1.6; margin: 2px 0; }
        .history-dark-md strong { color: ${C.secondary}; font-weight: 700; }
      `}</style>
    </div>
  );
}
