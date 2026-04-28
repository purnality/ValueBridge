import { useState, useEffect, useRef, useMemo } from "react";
import * as Recharts from "recharts";

const { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, Legend } = Recharts;

// --- Constants ---
const COLORS = {
  navy: "#0B1F3A",
  navyLight: "#132D52",
  navyMid: "#1A3A6A",
  gold: "#C9A227",
  goldLight: "#D4B44A",
  goldMuted: "rgba(201,162,39,0.15)",
  white: "#FFFFFF",
  offWhite: "#F7F8FA",
  gray100: "#F0F2F5",
  gray200: "#E2E6EC",
  gray300: "#C8CFD9",
  gray500: "#7A8599",
  gray700: "#3D4A5C",
  green: "#2E8B57",
  greenBg: "rgba(46,139,87,0.08)",
  amber: "#D4880F",
  amberBg: "rgba(212,136,15,0.08)",
  red: "#C0392B",
  redBg: "rgba(192,57,43,0.08)",
};

const DUMMY_DATA = [
  { id: 1, name: "Automate Invoice Processing", cost: 1200000, value: 8, risk: 3 },
  { id: 2, name: "Outsource IT Helpdesk", cost: 800000, value: 5, risk: 7 },
  { id: 3, name: "Consolidate Cloud Vendors", cost: 2500000, value: 9, risk: 4 },
  { id: 4, name: "Reduce Marketing Spend 20%", cost: 500000, value: 3, risk: 8 },
  { id: 5, name: "Implement RPA in Finance", cost: 1800000, value: 7, risk: 2 },
  { id: 6, name: "Renegotiate Supplier Contracts", cost: 350000, value: 6, risk: 3 },
  { id: 7, name: "Downsize Regional Offices", cost: 3200000, value: 4, risk: 9 },
];

const AI_INSIGHTS = {
  "Automate Invoice Processing": "High-value automation initiative with strong ROI potential. Low operational risk due to mature technology. Recommend phased rollout starting with accounts payable to demonstrate quick wins before scaling across departments.",
  "Outsource IT Helpdesk": "Moderate value offset by significant execution risk. Vendor dependency and knowledge transfer gaps could impact service quality. Consider a hybrid model retaining Tier-2 support in-house while outsourcing routine tickets.",
  "Consolidate Cloud Vendors": "Strategic initiative with substantial long-term savings. Moderate migration risk is manageable with proper planning. Multi-cloud consolidation typically yields 25-35% cost reduction within 18 months.",
  "Reduce Marketing Spend 20%": "High-risk cost reduction that may erode brand equity and pipeline growth. Short-term savings could translate to long-term revenue decline. Consider reallocating spend to higher-performing channels instead of blanket cuts.",
  "Implement RPA in Finance": "Strong candidate for investment. Process automation in finance delivers measurable efficiency gains with minimal disruption. Low risk profile due to rule-based nature of target processes.",
  "Renegotiate Supplier Contracts": "Low-cost, high-impact initiative. Minimal risk with potential for immediate savings. Leverage volume commitments and market benchmarking to achieve 10-15% cost improvement.",
  "Downsize Regional Offices": "Significant cost savings potential but carries substantial organizational and cultural risk. Employee morale impact and talent attrition could offset financial gains. Evaluate remote-work hybrid alternatives first.",
};

function generateInsight(initiative) {
  if (AI_INSIGHTS[initiative.name]) return AI_INSIGHTS[initiative.name];
  const score = calcScore(initiative.value, initiative.risk);
  const rec = getRecommendation(score);
  if (rec === "Invest") return `This initiative shows strong value-to-risk ratio with a priority score of ${score.toFixed(1)}. The cost of ₹${formatCost(initiative.cost)} is justified by high expected returns. Recommend fast-tracking with quarterly review cadence.`;
  if (rec === "Review") return `Mixed value-risk profile requires deeper analysis. Consider a pilot phase to validate assumptions before full commitment. Engage cross-functional stakeholders to assess hidden dependencies.`;
  return `Current risk profile outweighs projected value. The initiative may consume resources without proportional returns. Recommend deferring or restructuring the approach to improve the risk-adjusted outlook.`;
}

function calcScore(value, risk) {
  return (value * 0.6) - (risk * 0.4);
}

function getRecommendation(score) {
  if (score >= 5) return "Invest";
  if (score >= 2) return "Review";
  return "Avoid";
}

function formatCost(num) {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCostFull(num) {
  return new Intl.NumberFormat("en-IN").format(num);
}

// --- Styled micro-components ---
function Badge({ type }) {
  const config = {
    Invest: { bg: COLORS.greenBg, color: COLORS.green, border: `1px solid ${COLORS.green}22` },
    Review: { bg: COLORS.amberBg, color: COLORS.amber, border: `1px solid ${COLORS.amber}22` },
    Avoid: { bg: COLORS.redBg, color: COLORS.red, border: `1px solid ${COLORS.red}22` },
  };
  const c = config[type];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.color, border: c.border, letterSpacing: 0.5,
      textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: c.color,
      }} />
      {type}
    </span>
  );
}

function ScoreBar({ score }) {
  const max = 6;
  const pct = Math.max(0, Math.min(100, ((score + 4) / (max + 4)) * 100));
  const color = score >= 5 ? COLORS.green : score >= 2 ? COLORS.amber : COLORS.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 120 }}>
      <div style={{
        flex: 1, height: 6, background: COLORS.gray200, borderRadius: 3, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color, borderRadius: 3,
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'DM Mono', monospace", minWidth: 32 }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

// --- Landing Page ---
function LandingPage({ onStart }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: `linear-gradient(160deg, ${COLORS.navy} 0%, ${COLORS.navyLight} 40%, ${COLORS.navyMid} 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Geometric accents */}
      <div style={{
        position: "absolute", top: -120, right: -120, width: 500, height: 500,
        border: `1px solid ${COLORS.gold}15`, borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute", bottom: -80, left: -80, width: 350, height: 350,
        border: `1px solid ${COLORS.gold}10`, borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute", top: "20%", right: "15%", width: 200, height: 200,
        border: `1px solid ${COLORS.gold}08`, transform: "rotate(45deg)",
      }} />
      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: `linear-gradient(${COLORS.gold} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.gold} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "28px 48px", position: "relative", zIndex: 2,
        opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(-20px)",
        transition: "all 0.8s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18,
            color: COLORS.navy, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}>V</div>
          <span style={{
            fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600,
            color: COLORS.white, letterSpacing: 1,
          }}>VALUEBRIDGE</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase" }}>
          {["Methodology", "Case Studies", "Contact"].map(t => (
            <span key={t} style={{
              color: COLORS.gray300, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "color 0.3s",
            }}
            onMouseEnter={e => e.target.style.color = COLORS.gold}
            onMouseLeave={e => e.target.style.color = COLORS.gray300}
            >{t}</span>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "center", textAlign: "center", padding: "0 48px", position: "relative", zIndex: 2,
      }}>
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)",
          transition: "all 1s ease 0.2s",
        }}>
          <div style={{
            display: "inline-block", padding: "6px 20px", borderRadius: 20,
            border: `1px solid ${COLORS.gold}30`, background: `${COLORS.gold}08`,
            fontSize: 11, letterSpacing: 3, textTransform: "uppercase",
            color: COLORS.gold, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            marginBottom: 32,
          }}>Cost-to-Value Intelligence</div>
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 72, fontWeight: 700,
          color: COLORS.white, lineHeight: 1.1, margin: "0 0 8px 0", maxWidth: 800,
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)",
          transition: "all 1s ease 0.4s",
        }}>
          Value<span style={{ color: COLORS.gold }}>Bridge</span>
        </h1>

        <p style={{
          fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400,
          color: COLORS.gray300, margin: "0 0 16px 0", fontStyle: "italic",
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)",
          transition: "all 1s ease 0.5s",
        }}>
          From Cost Cutting to Value Creation
        </p>

        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: COLORS.gray500,
          maxWidth: 540, lineHeight: 1.7, margin: "0 0 48px 0",
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)",
          transition: "all 1s ease 0.6s",
        }}>
          Evaluate cost reduction initiatives through the lens of business value and risk.
          Make strategic decisions backed by data, not guesswork.
        </p>

        <button onClick={onStart} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
          letterSpacing: 2, textTransform: "uppercase",
          padding: "18px 48px", border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
          color: COLORS.navy, borderRadius: 4,
          boxShadow: `0 4px 24px ${COLORS.gold}40`,
          transition: "all 0.3s ease",
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)",
        }}
        onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 8px 32px ${COLORS.gold}50`; }}
        onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 4px 24px ${COLORS.gold}40`; }}
        >
          Start Analysis →
        </button>

        {/* Stats bar */}
        <div style={{
          display: "flex", gap: 64, marginTop: 80,
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)",
          transition: "all 1s ease 0.8s",
        }}>
          {[
            { val: "₹2.4Cr+", label: "Average Savings Identified" },
            { val: "340+", label: "Initiatives Evaluated" },
            { val: "92%", label: "Decision Accuracy" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700,
                color: COLORS.gold, marginBottom: 6,
              }}>{s.val}</div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.gray500,
                letterSpacing: 1, textTransform: "uppercase",
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer line */}
      <div style={{
        padding: "24px 48px", textAlign: "center",
        fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: COLORS.gray500,
        letterSpacing: 1, borderTop: `1px solid ${COLORS.white}08`,
      }}>
        © 2026 ValueBridge · Strategic Intelligence Platform
      </div>
    </div>
  );
}

// --- Input Form ---
function InputForm({ onAdd }) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [value, setValue] = useState(5);
  const [risk, setRisk] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !cost) return;
    setSubmitting(true);
    setTimeout(() => {
      onAdd({ name: name.trim(), cost: Number(cost), value, risk });
      setName(""); setCost(""); setValue(5); setRisk(5);
      setSubmitting(false);
    }, 400);
  };

  const inputStyle = {
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, padding: "14px 16px",
    border: `1px solid ${COLORS.gray200}`, borderRadius: 6,
    background: COLORS.white, color: COLORS.navy, outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s", width: "100%", boxSizing: "border-box",
  };
  const labelStyle = {
    fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
    color: COLORS.gray500, letterSpacing: 1.5, textTransform: "uppercase",
    marginBottom: 8, display: "block",
  };

  return (
    <div style={{
      background: COLORS.white, borderRadius: 12, padding: 32,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
      border: `1px solid ${COLORS.gray200}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 32, height: 32, background: COLORS.goldMuted, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>+</div>
        <div>
          <h3 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600,
            color: COLORS.navy, margin: 0,
          }}>New Initiative</h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.gray500, margin: 0 }}>
            Add a cost reduction initiative to evaluate
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Initiative Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Automate Invoice Processing"
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = COLORS.gold; e.target.style.boxShadow = `0 0 0 3px ${COLORS.gold}15`; }}
            onBlur={e => { e.target.style.borderColor = COLORS.gray200; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Estimated Cost (₹)</label>
          <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="e.g., 1500000"
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = COLORS.gold; e.target.style.boxShadow = `0 0 0 3px ${COLORS.gold}15`; }}
            onBlur={e => { e.target.style.borderColor = COLORS.gray200; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={labelStyle}>Value Impact</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="range" min={1} max={10} value={value} onChange={e => setValue(Number(e.target.value))}
                style={{ flex: 1, accentColor: COLORS.gold }} />
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700,
                color: COLORS.navy, minWidth: 28, textAlign: "center",
              }}>{value}</span>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Risk Level</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="range" min={1} max={10} value={risk} onChange={e => setRisk(Number(e.target.value))}
                style={{ flex: 1, accentColor: COLORS.red }} />
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700,
                color: COLORS.navy, minWidth: 28, textAlign: "center",
              }}>{risk}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      {name && cost && (
        <div style={{
          marginTop: 20, padding: "12px 16px", borderRadius: 8,
          background: COLORS.offWhite, border: `1px solid ${COLORS.gray200}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.gray500 }}>
            Preview Score:
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ScoreBar score={calcScore(value, risk)} />
            <Badge type={getRecommendation(calcScore(value, risk))} />
          </div>
        </div>
      )}

      <button onClick={handleSubmit} disabled={!name.trim() || !cost || submitting}
        style={{
          width: "100%", marginTop: 24, padding: "16px",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
          letterSpacing: 1, textTransform: "uppercase",
          border: "none", borderRadius: 6, cursor: name.trim() && cost ? "pointer" : "not-allowed",
          background: name.trim() && cost
            ? `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyMid})`
            : COLORS.gray200,
          color: name.trim() && cost ? COLORS.white : COLORS.gray500,
          transition: "all 0.3s",
          boxShadow: name.trim() && cost ? `0 4px 12px ${COLORS.navy}30` : "none",
        }}
        onMouseEnter={e => { if (name.trim() && cost) e.target.style.boxShadow = `0 6px 20px ${COLORS.navy}40`; }}
        onMouseLeave={e => { if (name.trim() && cost) e.target.style.boxShadow = `0 4px 12px ${COLORS.navy}30`; }}
      >
        {submitting ? "Adding..." : "Add Initiative"}
      </button>
    </div>
  );
}

// --- Scenario Simulator ---
function ScenarioSimulator({ initiatives, onSimulate }) {
  const [target, setTarget] = useState("");
  const [cutPct, setCutPct] = useState(20);
  const [result, setResult] = useState(null);

  const run = () => {
    const found = initiatives.find(i => i.name.toLowerCase().includes(target.toLowerCase()));
    if (!found) return;
    const newCost = found.cost * (1 - cutPct / 100);
    const newValue = Math.max(1, Math.round(found.value * (1 - cutPct / 200)));
    const newRisk = Math.min(10, Math.round(found.risk * (1 + cutPct / 150)));
    const origScore = calcScore(found.value, found.risk);
    const newScore = calcScore(newValue, newRisk);
    setResult({
      name: found.name, cutPct,
      origCost: found.cost, newCost,
      origValue: found.value, newValue,
      origRisk: found.risk, newRisk,
      origScore, newScore,
      origRec: getRecommendation(origScore),
      newRec: getRecommendation(newScore),
    });
  };

  return (
    <div style={{
      background: COLORS.white, borderRadius: 12, padding: 32,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
      border: `1px solid ${COLORS.gray200}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 32, height: 32, background: `${COLORS.navyMid}15`, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>⚡</div>
        <div>
          <h3 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600,
            color: COLORS.navy, margin: 0,
          }}>Scenario Simulator</h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.gray500, margin: 0 }}>
            What-if analysis on existing initiatives
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select value={target} onChange={e => { setTarget(e.target.value); setResult(null); }}
          style={{
            flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 14, padding: "12px 14px",
            border: `1px solid ${COLORS.gray200}`, borderRadius: 6, background: COLORS.white,
            color: COLORS.navy, outline: "none",
          }}>
          <option value="">Select initiative...</option>
          {initiatives.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.gray500, whiteSpace: "nowrap" }}>Cut</span>
          <input type="range" min={5} max={50} step={5} value={cutPct} onChange={e => setCutPct(Number(e.target.value))}
            style={{ width: 80, accentColor: COLORS.gold }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, color: COLORS.navy, minWidth: 36 }}>{cutPct}%</span>
        </div>
        <button onClick={run} disabled={!target}
          style={{
            padding: "12px 24px", border: "none", borderRadius: 6, cursor: target ? "pointer" : "not-allowed",
            background: target ? COLORS.navy : COLORS.gray200,
            color: target ? COLORS.white : COLORS.gray500,
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
          }}>Simulate</button>
      </div>

      {result && (
        <div style={{
          padding: 20, borderRadius: 8, background: COLORS.offWhite, border: `1px solid ${COLORS.gray200}`,
        }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.navy,
            marginBottom: 16,
          }}>
            "{result.name}" — {result.cutPct}% Budget Reduction
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "Cost", orig: `₹${formatCost(result.origCost)}`, next: `₹${formatCost(result.newCost)}` },
              { label: "Value Impact", orig: result.origValue, next: result.newValue },
              { label: "Risk Level", orig: result.origRisk, next: result.newRisk },
            ].map(d => (
              <div key={d.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.gray500, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{d.label}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: COLORS.gray500, textDecoration: "line-through" }}>{d.orig}</span>
                  <span style={{ color: COLORS.gold }}>→</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 700, color: COLORS.navy }}>{d.next}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            display: "flex", justifyContent: "center", gap: 24, marginTop: 20, paddingTop: 16,
            borderTop: `1px solid ${COLORS.gray200}`,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: COLORS.gray500, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>BEFORE</div>
              <Badge type={result.origRec} />
            </div>
            <div style={{ fontSize: 20, color: COLORS.gold, alignSelf: "flex-end" }}>→</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: COLORS.gray500, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>AFTER</div>
              <Badge type={result.newRec} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Initiative Card (expanded insight) ---
function InsightPanel({ initiative }) {
  const score = calcScore(initiative.value, initiative.risk);
  const rec = getRecommendation(score);
  const insight = generateInsight(initiative);

  return (
    <div style={{
      padding: "16px 20px", background: COLORS.offWhite, borderRadius: 8,
      borderLeft: `3px solid ${rec === "Invest" ? COLORS.green : rec === "Review" ? COLORS.amber : COLORS.red}`,
      marginTop: 8,
    }}>
      <div style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
        color: COLORS.gold, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8,
      }}>AI Insight</div>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.7,
        color: COLORS.gray700, margin: 0,
      }}>{insight}</p>
    </div>
  );
}

// --- Dashboard Table ---
function Dashboard({ initiatives }) {
  const [sortField, setSortField] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [searchText, setSearchText] = useState("");

  const enriched = initiatives.map(i => {
    const score = calcScore(i.value, i.risk);
    return { ...i, score, recommendation: getRecommendation(score) };
  });

  const filtered = enriched.filter(i => {
    if (filter !== "All" && i.recommendation !== filter) return false;
    if (searchText && !i.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortField === "name") return dir * a.name.localeCompare(b.name);
    return dir * (a[sortField] - b[sortField]);
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const counts = { All: enriched.length, Invest: 0, Review: 0, Avoid: 0 };
  enriched.forEach(i => counts[i.recommendation]++);

  const headerStyle = (field) => ({
    fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
    color: sortField === field ? COLORS.navy : COLORS.gray500,
    letterSpacing: 1.2, textTransform: "uppercase", cursor: "pointer",
    padding: "14px 16px", textAlign: "left", userSelect: "none",
    borderBottom: `2px solid ${sortField === field ? COLORS.gold : COLORS.gray200}`,
    transition: "all 0.2s", whiteSpace: "nowrap",
  });

  return (
    <div>
      {/* Controls */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 20, flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "Invest", "Review", "Avoid"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                padding: "8px 16px", borderRadius: 20, cursor: "pointer",
                border: filter === f ? "none" : `1px solid ${COLORS.gray200}`,
                background: filter === f ? COLORS.navy : "transparent",
                color: filter === f ? COLORS.white : COLORS.gray500,
                transition: "all 0.2s",
              }}>
              {f} ({counts[f]})
            </button>
          ))}
        </div>
        <input placeholder="Search initiatives..." value={searchText} onChange={e => setSearchText(e.target.value)}
          style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: "10px 16px",
            border: `1px solid ${COLORS.gray200}`, borderRadius: 8, outline: "none",
            width: 220, background: COLORS.white, color: COLORS.navy,
          }}
          onFocus={e => e.target.style.borderColor = COLORS.gold}
          onBlur={e => e.target.style.borderColor = COLORS.gray200}
        />
      </div>

      {/* Table */}
      <div style={{
        background: COLORS.white, borderRadius: 12, overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
        border: `1px solid ${COLORS.gray200}`,
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerStyle("name")} onClick={() => toggleSort("name")}>
                Initiative {sortField === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th style={headerStyle("cost")} onClick={() => toggleSort("cost")}>
                Cost {sortField === "cost" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th style={headerStyle("value")} onClick={() => toggleSort("value")}>
                Value {sortField === "value" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th style={headerStyle("risk")} onClick={() => toggleSort("risk")}>
                Risk {sortField === "risk" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th style={headerStyle("score")} onClick={() => toggleSort("score")}>
                Priority {sortField === "score" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th style={{ ...headerStyle(""), cursor: "default", borderBottom: `2px solid ${COLORS.gray200}` }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, idx) => (
              <>
                <tr key={item.id}
                  style={{
                    background: idx % 2 === 0 ? COLORS.white : COLORS.offWhite,
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.goldMuted}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? COLORS.white : COLORS.offWhite}
                >
                  <td style={{
                    padding: "16px", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                    fontWeight: 500, color: COLORS.navy,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: COLORS.gray300 }}>{expanded === item.id ? "▼" : "▶"}</span>
                      {item.name}
                    </div>
                  </td>
                  <td style={{ padding: "16px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: COLORS.gray700 }}>
                    ₹{formatCostFull(item.cost)}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 32, height: 32, borderRadius: 8,
                      background: `${COLORS.green}12`, color: COLORS.green,
                      fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
                    }}>{item.value}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 32, height: 32, borderRadius: 8,
                      background: `${COLORS.red}12`, color: COLORS.red,
                      fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
                    }}>{item.risk}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <ScoreBar score={item.score} />
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Badge type={item.recommendation} />
                  </td>
                </tr>
                {expanded === item.id && (
                  <tr key={`insight-${item.id}`}>
                    <td colSpan={6} style={{ padding: "0 16px 16px 16px", background: COLORS.offWhite }}>
                      <InsightPanel initiative={item} />
                    </td>
                  </tr>
                )}
              </>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} style={{
                  padding: 48, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
                  color: COLORS.gray500, fontSize: 14,
                }}>
                  No initiatives match your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Charts ---
function Charts({ initiatives }) {
  const data = initiatives.map(i => ({
    name: i.name.length > 25 ? i.name.slice(0, 22) + "..." : i.name,
    value: i.value,
    risk: i.risk,
    cost: i.cost,
    score: calcScore(i.value, i.risk),
    rec: getRecommendation(calcScore(i.value, i.risk)),
  }));

  const dotColors = { Invest: COLORS.green, Review: COLORS.amber, Avoid: COLORS.red };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* Scatter: Value vs Risk */}
      <div style={{
        background: COLORS.white, borderRadius: 12, padding: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
        border: `1px solid ${COLORS.gray200}`,
      }}>
        <h4 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600,
          color: COLORS.navy, margin: "0 0 20px 0",
        }}>Value vs Risk Matrix</h4>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} />
            <XAxis dataKey="risk" name="Risk" type="number" domain={[0, 10]}
              tick={{ fontSize: 11, fill: COLORS.gray500, fontFamily: "'DM Sans'" }}
              label={{ value: "Risk →", position: "insideBottom", offset: -5, fontSize: 11, fill: COLORS.gray500 }} />
            <YAxis dataKey="value" name="Value" type="number" domain={[0, 10]}
              tick={{ fontSize: 11, fill: COLORS.gray500, fontFamily: "'DM Sans'" }}
              label={{ value: "Value →", angle: -90, position: "insideLeft", fontSize: 11, fill: COLORS.gray500 }} />
            <Tooltip
              contentStyle={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, borderRadius: 8,
                border: `1px solid ${COLORS.gray200}`, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(val, name) => [val, name]}
              labelFormatter={() => ""}
            />
            <Scatter data={data} fill={COLORS.gold}>
              {data.map((d, i) => (
                <Cell key={i} fill={dotColors[d.rec]} r={Math.max(6, d.cost / 500000)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
          {Object.entries(dotColors).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: COLORS.gray500, fontFamily: "'DM Sans'" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: v }} />
              {k}
            </div>
          ))}
        </div>
      </div>

      {/* Bar: Priority Scores */}
      <div style={{
        background: COLORS.white, borderRadius: 12, padding: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
        border: `1px solid ${COLORS.gray200}`,
      }}>
        <h4 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600,
          color: COLORS.navy, margin: "0 0 20px 0",
        }}>Priority Score Ranking</h4>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={[...data].sort((a, b) => b.score - a.score)} layout="vertical"
            margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} horizontal={false} />
            <XAxis type="number" domain={[-4, 6]}
              tick={{ fontSize: 11, fill: COLORS.gray500, fontFamily: "'DM Sans'" }} />
            <YAxis type="category" dataKey="name" width={140}
              tick={{ fontSize: 10, fill: COLORS.gray700, fontFamily: "'DM Sans'" }} />
            <Tooltip
              contentStyle={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, borderRadius: 8,
                border: `1px solid ${COLORS.gray200}`,
              }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {[...data].sort((a, b) => b.score - a.score).map((d, i) => (
                <Cell key={i} fill={dotColors[d.rec]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Summary Cards ---
function SummaryCards({ initiatives }) {
  const enriched = initiatives.map(i => ({ ...i, score: calcScore(i.value, i.risk), rec: getRecommendation(calcScore(i.value, i.risk)) }));
  const totalCost = enriched.reduce((s, i) => s + i.cost, 0);
  const investCost = enriched.filter(i => i.rec === "Invest").reduce((s, i) => s + i.cost, 0);
  const avgScore = enriched.length ? (enriched.reduce((s, i) => s + i.score, 0) / enriched.length) : 0;
  const investPct = totalCost ? Math.round((investCost / totalCost) * 100) : 0;

  const cards = [
    { label: "Total Initiatives", value: enriched.length, sub: `${enriched.filter(i => i.rec === "Invest").length} recommended`, accent: COLORS.navy },
    { label: "Total Cost Under Review", value: `₹${formatCost(totalCost)}`, sub: `₹${formatCost(investCost)} in "Invest" tier`, accent: COLORS.gold },
    { label: "Average Priority Score", value: avgScore.toFixed(1), sub: getRecommendation(avgScore) + " zone", accent: avgScore >= 5 ? COLORS.green : avgScore >= 2 ? COLORS.amber : COLORS.red },
    { label: "Value-Aligned Spend", value: `${investPct}%`, sub: "of cost in Invest initiatives", accent: COLORS.green },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: COLORS.white, borderRadius: 12, padding: "24px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
          border: `1px solid ${COLORS.gray200}`, borderTop: `3px solid ${c.accent}`,
        }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
            color: COLORS.gray500, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12,
          }}>{c.label}</div>
          <div style={{
            fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700,
            color: COLORS.navy, marginBottom: 4,
          }}>{c.value}</div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.gray500,
          }}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

// --- Main App ---
export default function ValueBridge() {
  const [page, setPage] = useState("landing");
  const [initiatives, setInitiatives] = useState(DUMMY_DATA);
  const [nextId, setNextId] = useState(8);

  const addInitiative = (data) => {
    setInitiatives(prev => [...prev, { id: nextId, ...data }]);
    setNextId(n => n + 1);
  };

  if (page === "landing") {
    return <LandingPage onStart={() => setPage("app")} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite }}>
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${COLORS.offWhite}; }
        input[type="range"] { height: 4px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.gray300}; border-radius: 3px; }
      `}</style>

      {/* Top bar */}
      <header style={{
        background: COLORS.navy, padding: "0 48px", height: 64,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: `0 2px 12px ${COLORS.navy}30`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
          onClick={() => setPage("landing")}>
          <div style={{
            width: 28, height: 28, background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 14,
            color: COLORS.navy, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}>V</div>
          <span style={{
            fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600,
            color: COLORS.white, letterSpacing: 1,
          }}>VALUEBRIDGE</span>
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.gray300,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: COLORS.green,
            boxShadow: `0 0 6px ${COLORS.green}`,
          }} />
          {initiatives.length} initiatives loaded
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 48px 64px" }}>
        {/* Section title */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700,
            color: COLORS.navy, margin: "0 0 4px 0",
          }}>Intelligence Dashboard</h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: COLORS.gray500,
          }}>Evaluate, prioritize, and simulate cost reduction initiatives</p>
        </div>

        {/* Summary */}
        <SummaryCards initiatives={initiatives} />

        {/* Input + Simulator row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
          <InputForm onAdd={addInitiative} />
          <ScenarioSimulator initiatives={initiatives} />
        </div>

        {/* Charts */}
        <div style={{ marginBottom: 28 }}>
          <Charts initiatives={initiatives} />
        </div>

        {/* Dashboard Table */}
        <div style={{ marginBottom: 12 }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600,
            color: COLORS.navy, marginBottom: 16,
          }}>Initiative Analysis</h3>
        </div>
        <Dashboard initiatives={initiatives} />

        {/* Footer */}
        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: `1px solid ${COLORS.gray200}`,
          textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 11,
          color: COLORS.gray500, letterSpacing: 1,
        }}>
          VALUEBRIDGE — Cost-to-Value Intelligence Platform · Formula: Priority = (Value × 0.6) − (Risk × 0.4)
        </div>
      </div>
    </div>
  );
}
