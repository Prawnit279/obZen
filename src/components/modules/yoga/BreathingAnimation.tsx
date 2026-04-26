interface Props {
  techniqueId: string
}

export function BreathingAnimation({ techniqueId }: Props) {
  switch (techniqueId) {
    case 'basic-awareness': return <BasicBreathAnim />
    case 'nadi-shodhana':   return <NadiShodhanaAnim />
    case 'sheetali':        return <SheetaliAnim />
    case 'bhastrika':       return <BhastrikaAnim />
    case 'so-hum':          return <SoHumAnim />
    case 'ujjayi':          return <UjjayiAnim />
    case 'box-breathing':   return <BoxBreathingAnim />
    case '4-7-8':           return <Breath478Anim />
    case 'kapalbhati':      return <KapalbhatiAnim />
    case 'surya-bhedana':   return <SuryaBhedanaAnim />
    case 'chandra-bhedana': return <ChandraBhedanaAnim />
    case 'sitali':          return <SitaliAnim />
    default:                return null
  }
}

// ─── 1. Basic Breath Awareness ── expanding belly circle ─────────────────────

function BasicBreathAnim() {
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="120" viewBox="0 0 120 120" className="overflow-visible">
        <style>{`
          @keyframes belly-breath { 0%,100%{r:28;opacity:.4} 50%{r:46;opacity:.9} }
          @keyframes belly-outer  { 0%,100%{r:40;opacity:.15} 50%{r:58;opacity:.3} }
          .belly-inner { animation: belly-breath 4s ease-in-out infinite; }
          .belly-outer { animation: belly-outer  4s ease-in-out infinite; }
        `}</style>
        <circle className="belly-outer" cx="60" cy="60" r="40" fill="#d4d4d4" />
        <circle className="belly-inner" cx="60" cy="60" r="28" fill="#d4d4d4" />
        <line x1="60" y1="10"  x2="60" y2="20"  stroke="#555555" strokeWidth="1.5" />
        <line x1="60" y1="100" x2="60" y2="110" stroke="#555555" strokeWidth="1.5" />
        <line x1="10"  y1="60" x2="20"  y2="60" stroke="#555555" strokeWidth="1.5" />
        <line x1="100" y1="60" x2="110" y2="60" stroke="#555555" strokeWidth="1.5" />
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">4s cycle · belly expands on inhale</div>
    </div>
  )
}

// ─── 2. Alternate Nostril ── left/right highlight ─────────────────────────────

function NadiShodhanaAnim() {
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="130" viewBox="0 0 120 130">
        <style>{`
          @keyframes ns-left  { 0%,45%{fill:#d4d4d4} 50%,95%{fill:#2a2a2a} 100%{fill:#d4d4d4} }
          @keyframes ns-right { 0%,45%{fill:#2a2a2a} 50%,95%{fill:#d4d4d4} 100%{fill:#2a2a2a} }
          @keyframes ns-lflow { 0%,45%{opacity:1}    50%,95%{opacity:0}    100%{opacity:1}    }
          @keyframes ns-rflow { 0%,45%{opacity:0}    50%,95%{opacity:1}    100%{opacity:0}    }
          .ns-ln { animation: ns-left  6s ease-in-out infinite; }
          .ns-rn { animation: ns-right 6s ease-in-out infinite; }
          .ns-lf { animation: ns-lflow 6s ease-in-out infinite; }
          .ns-rf { animation: ns-rflow 6s ease-in-out infinite; }
        `}</style>
        <ellipse cx="60" cy="55" rx="32" ry="40" fill="none" stroke="#2a2a2a" strokeWidth="1.5" />
        <circle cx="60" cy="18" r="16" fill="#d4d4d4" />
        <ellipse className="ns-ln" cx="46" cy="65" rx="8" ry="5" />
        <ellipse className="ns-rn" cx="74" cy="65" rx="8" ry="5" />
        <path className="ns-lf" d="M38 80 Q30 95 38 105" fill="none" stroke="#d4d4d4" strokeWidth="2" strokeDasharray="4,3" />
        <path className="ns-rf" d="M82 80 Q90 95 82 105" fill="none" stroke="#d4d4d4" strokeWidth="2" strokeDasharray="4,3" />
        <text x="38" y="120" textAnchor="middle" fontSize="8" fill="#555555">LEFT</text>
        <text x="82" y="120" textAnchor="middle" fontSize="8" fill="#555555">RIGHT</text>
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">6s cycle · alternating nostrils</div>
    </div>
  )
}

// ─── 3. Sheetali ── rolled tongue profile ────────────────────────────────────

function SheetaliAnim() {
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="50" cy="35" r="22" fill="#d4d4d4" />
        <rect x="42" y="55" width="16" height="18" rx="4" fill="#d4d4d4" />
        <path d="M72 42 Q88 38 90 45 Q88 52 80 50 Q74 48 72 45Z" fill="#d4d4d4" />
        <path d="M80 44 Q88 40 90 45" fill="none" stroke="#0a0a0a" strokeWidth="1" />
        <path d="M92 44 L112 40" stroke="#555555" strokeWidth="1.5" strokeDasharray="4,3" />
        <polygon points="110,36 116,40 110,44" fill="#555555" />
        <text x="96" y="34" fontSize="7" fill="#555555">cool air</text>
        <line x1="0" y1="115" x2="120" y2="115" stroke="#2a2a2a" strokeWidth="1" />
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">static · inhale through rolled tongue</div>
    </div>
  )
}

// ─── 4. Bhastrika ── rapid diaphragm pump ────────────────────────────────────

function BhastrikaAnim() {
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="130" viewBox="0 0 120 130">
        <style>{`
          @keyframes bh-torso { 0%,100%{rx:22} 50%{rx:26} }
          .bh-torso { animation: bh-torso 0.6s ease-in-out infinite; }
        `}</style>
        <circle cx="60" cy="22" r="14" fill="#d4d4d4" />
        <rect x="53" y="34" width="14" height="10" rx="3" fill="#d4d4d4" />
        <ellipse className="bh-torso" cx="60" cy="72" rx="22" ry="30" fill="#d4d4d4" />
        <line x1="60" y1="40" x2="60" y2="50" stroke="#555555" strokeWidth="1.5" strokeDasharray="2,2" />
        <polygon points="56,40 60,33 64,40" fill="#555555" />
        <line x1="60" y1="102" x2="60" y2="110" stroke="#555555" strokeWidth="1.5" strokeDasharray="2,2" />
        <polygon points="56,110 60,117 64,110" fill="#555555" />
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">0.6s cycle · rapid diaphragm pump</div>
    </div>
  )
}

// ─── 5. So Hum ── expanding circle + fading mantra text ──────────────────────

function SoHumAnim() {
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="120" viewBox="0 0 120 120" className="overflow-visible">
        <style>{`
          @keyframes sh-circle { 0%,100%{r:24;opacity:.5} 50%{r:44;opacity:.9} }
          @keyframes sh-ring   { 0%,100%{r:38;opacity:.1} 50%{r:56;opacity:.25} }
          @keyframes sh-so     { 0%,20%{opacity:0} 30%,48%{opacity:.9} 52%,100%{opacity:0} }
          @keyframes sh-hum    { 0%,52%{opacity:0} 62%,80%{opacity:.9} 84%,100%{opacity:0} }
          .sh-circle { animation: sh-circle 4s ease-in-out infinite; }
          .sh-ring   { animation: sh-ring   4s ease-in-out infinite; }
          .sh-so     { animation: sh-so     4s ease-in-out infinite; }
          .sh-hum    { animation: sh-hum    4s ease-in-out infinite; }
        `}</style>
        <circle className="sh-ring"   cx="60" cy="60" r="38" fill="#d4d4d4" />
        <circle className="sh-circle" cx="60" cy="60" r="24" fill="#d4d4d4" />
        <text className="sh-so"  x="60" y="55" textAnchor="middle" fontSize="14" fill="#555555" fontStyle="italic">So</text>
        <text className="sh-hum" x="60" y="70" textAnchor="middle" fontSize="14" fill="#555555" fontStyle="italic">Hum</text>
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">4s cycle · mantra on each breath</div>
    </div>
  )
}

// ─── 6. Ujjayi ── throat ripple wave ─────────────────────────────────────────

function UjjayiAnim() {
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="130" viewBox="0 0 120 130">
        <style>{`
          @keyframes uj-wave1 { 0%,100%{opacity:0;transform:translateX(0) scaleX(.3)} 40%{opacity:.7;transform:translateX(15px) scaleX(1)} 70%{opacity:0;transform:translateX(30px) scaleX(.3)} }
          @keyframes uj-wave2 { 0%,100%{opacity:0;transform:translateX(0) scaleX(.3)} 40%{opacity:.5;transform:translateX(15px) scaleX(1)} 70%{opacity:0;transform:translateX(30px) scaleX(.3)} }
          .uj-w1 { transform-box:fill-box; transform-origin:left center; animation: uj-wave1 3s ease-in-out infinite; }
          .uj-w2 { transform-box:fill-box; transform-origin:left center; animation: uj-wave2 3s ease-in-out infinite .5s; }
        `}</style>
        {/* Side profile head + neck */}
        <circle cx="48" cy="30" r="20" fill="#d4d4d4" />
        <rect x="40" y="48" width="16" height="22" rx="5" fill="#d4d4d4" />
        {/* Throat area indicator */}
        <ellipse cx="48" cy="58" rx="6" ry="4" fill="#2a2a2a" />
        {/* Breath waves emanating from throat */}
        <path className="uj-w1" d="M56 56 Q70 48 84 56 Q70 64 56 56" fill="#d4d4d4" opacity=".7" />
        <path className="uj-w2" d="M56 60 Q72 50 88 60 Q72 70 56 60" fill="#888888" opacity=".5" />
        <text x="60" y="90" textAnchor="middle" fontSize="8" fill="#555555">ocean sound</text>
        <line x1="0" y1="120" x2="120" y2="120" stroke="#2a2a2a" strokeWidth="1" />
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">3s cycle · throat constriction</div>
    </div>
  )
}

// ─── 7. Box Breathing ── traced square ───────────────────────────────────────

function BoxBreathingAnim() {
  // Box sides: top=inhale, right=hold-full, bottom=exhale, left=hold-empty
  // 16s total, each side 4s → dashoffset animates around perimeter
  const SIDE = 60
  const PERIM = SIDE * 4   // 240
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes bb-trace {
            0%   { stroke-dashoffset: ${PERIM}; }
            100% { stroke-dashoffset: 0; }
          }
          .bb-active {
            stroke-dasharray: ${PERIM};
            stroke-dashoffset: ${PERIM};
            animation: bb-trace 16s linear infinite;
          }
        `}</style>
        {/* Static dim box */}
        <rect x="30" y="30" width={SIDE} height={SIDE} fill="none" stroke="#2a2a2a" strokeWidth="2" />
        {/* Animated traced line — starts at top-left, goes clockwise */}
        <rect
          className="bb-active"
          x="30" y="30"
          width={SIDE} height={SIDE}
          fill="none"
          stroke="#d4d4d4"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Corner labels */}
        <text x="60" y="26"  textAnchor="middle" fontSize="7" fill="#555555">INHALE</text>
        <text x="97" y="62"  textAnchor="start"  fontSize="7" fill="#555555">HOLD</text>
        <text x="60" y="103" textAnchor="middle" fontSize="7" fill="#555555">EXHALE</text>
        <text x="23" y="62"  textAnchor="end"    fontSize="7" fill="#555555">HOLD</text>
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">16s cycle · 4 counts each side</div>
    </div>
  )
}

// ─── 8. 4-7-8 ── circular arc progress ───────────────────────────────────────

function Breath478Anim() {
  const R = 44
  const C = 2 * Math.PI * R   // circumference ~276
  // 19s total: inhale 4s, hold 7s, exhale 8s
  // Arc fills during inhale (4/19), holds (7/19), drains during exhale (8/19)
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes arc-478 {
            0%              { stroke-dashoffset: ${C.toFixed(1)}; }
            ${(4/19*100).toFixed(1)}%  { stroke-dashoffset: 0; }
            ${(11/19*100).toFixed(1)}% { stroke-dashoffset: 0; }
            100%            { stroke-dashoffset: ${C.toFixed(1)}; }
          }
          @keyframes cnt-478 {
            0%,5%  { opacity:.3 }
            15%    { opacity:1  }
            58%,62%{ opacity:.3 }
            75%    { opacity:1  }
            98%    { opacity:.3 }
          }
          .arc-478 {
            stroke-dasharray: ${C.toFixed(1)};
            stroke-dashoffset: ${C.toFixed(1)};
            animation: arc-478 19s ease-in-out infinite;
            transform-origin: center;
            transform: rotate(-90deg);
          }
          .cnt-478 { animation: cnt-478 19s ease-in-out infinite; }
        `}</style>
        {/* Background circle */}
        <circle cx="60" cy="60" r={R} fill="none" stroke="#1e1e1e" strokeWidth="6" />
        {/* Animated arc */}
        <circle className="arc-478" cx="60" cy="60" r={R} fill="none" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round" />
        {/* Center label */}
        <text className="cnt-478" x="60" y="56" textAnchor="middle" fontSize="9" fill="#888888">4 · 7 · 8</text>
        <text x="60" y="68" textAnchor="middle" fontSize="7" fill="#555555">breath</text>
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">19s cycle · inhale 4 · hold 7 · exhale 8</div>
    </div>
  )
}

// ─── 9. Kapalbhati ── rapid belly pump ───────────────────────────────────────

function KapalbhatiAnim() {
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="130" viewBox="0 0 120 130">
        <style>{`
          @keyframes kb-belly { 0%,40%{transform:scaleY(1)} 50%{transform:scaleY(.75)} 60%,100%{transform:scaleY(1)} }
          @keyframes kb-dot1  { 0%{opacity:0;transform:translateY(0)} 25%{opacity:.8;transform:translateY(-10px)} 50%,100%{opacity:0;transform:translateY(-20px)} }
          @keyframes kb-dot2  { 0%,15%{opacity:0;transform:translateY(0)} 40%{opacity:.8;transform:translateY(-10px)} 65%,100%{opacity:0;transform:translateY(-20px)} }
          @keyframes kb-dot3  { 0%,30%{opacity:0;transform:translateY(0)} 55%{opacity:.8;transform:translateY(-10px)} 80%,100%{opacity:0;transform:translateY(-20px)} }
          .kb-belly { transform-box:fill-box; transform-origin:center bottom; animation: kb-belly .5s ease-in-out infinite; }
          .kb-d1    { animation: kb-dot1 .5s linear infinite; }
          .kb-d2    { animation: kb-dot2 .5s linear infinite; }
          .kb-d3    { animation: kb-dot3 .5s linear infinite; }
        `}</style>
        <circle cx="60" cy="22" r="14" fill="#d4d4d4" />
        <rect x="53" y="34" width="14" height="10" rx="3" fill="#d4d4d4" />
        <ellipse className="kb-belly" cx="60" cy="72" rx="22" ry="30" fill="#d4d4d4" />
        {/* Expelled breath dots */}
        <circle className="kb-d1" cx="52" cy="38" r="2.5" fill="#555555" />
        <circle className="kb-d2" cx="60" cy="36" r="2.5" fill="#555555" />
        <circle className="kb-d3" cx="68" cy="38" r="2.5" fill="#555555" />
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">0.5s cycle · sharp exhale pump</div>
    </div>
  )
}

// ─── 10. Surya Bhedana ── right nostril glows on inhale ──────────────────────

function SuryaBhedanaAnim() {
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="130" viewBox="0 0 120 130">
        <style>{`
          @keyframes sb-right { 0%,5%{fill:#d4d4d4} 50%,55%{fill:#2a2a2a} 100%{fill:#d4d4d4} }
          @keyframes sb-left  { 0%,5%{fill:#2a2a2a} 50%,55%{fill:#888888} 100%{fill:#2a2a2a} }
          @keyframes sb-rfing { 0%,5%{opacity:0} 10%,45%{opacity:.8} 50%,100%{opacity:0} }
          .sb-rn { animation: sb-right 6s ease-in-out infinite; }
          .sb-ln { animation: sb-left  6s ease-in-out infinite; }
          .sb-rf { animation: sb-rfing 6s ease-in-out infinite; }
        `}</style>
        <ellipse cx="60" cy="55" rx="32" ry="40" fill="none" stroke="#2a2a2a" strokeWidth="1.5" />
        <circle cx="60" cy="18" r="16" fill="#d4d4d4" />
        <ellipse className="sb-rn" cx="74" cy="65" rx="8" ry="5" />
        <ellipse className="sb-ln" cx="46" cy="65" rx="8" ry="5" />
        {/* Right thumb blocking left nostril */}
        <circle className="sb-rf" cx="46" cy="65" r="5" fill="#555555" opacity=".8" />
        <text x="46" y="120" textAnchor="middle" fontSize="8" fill="#555555">LEFT</text>
        <text x="74" y="120" textAnchor="middle" fontSize="8" fill="#555555">RIGHT</text>
        <text x="60" y="108" textAnchor="middle" fontSize="7" fill="#555555">☀ solar</text>
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">6s cycle · right = solar · heating</div>
    </div>
  )
}

// ─── 11. Chandra Bhedana ── left nostril glows on inhale ─────────────────────

function ChandraBhedanaAnim() {
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="130" viewBox="0 0 120 130">
        <style>{`
          @keyframes cb-left  { 0%,5%{fill:#d4d4d4} 50%,55%{fill:#2a2a2a} 100%{fill:#d4d4d4} }
          @keyframes cb-right { 0%,5%{fill:#2a2a2a} 50%,55%{fill:#888888} 100%{fill:#2a2a2a} }
          @keyframes cb-lfing { 0%,5%{opacity:0} 10%,45%{opacity:.8} 50%,100%{opacity:0} }
          .cb-ln { animation: cb-left  6s ease-in-out infinite; }
          .cb-rn { animation: cb-right 6s ease-in-out infinite; }
          .cb-lf { animation: cb-lfing 6s ease-in-out infinite; }
        `}</style>
        <ellipse cx="60" cy="55" rx="32" ry="40" fill="none" stroke="#2a2a2a" strokeWidth="1.5" />
        <circle cx="60" cy="18" r="16" fill="#d4d4d4" />
        <ellipse className="cb-ln" cx="46" cy="65" rx="8" ry="5" />
        <ellipse className="cb-rn" cx="74" cy="65" rx="8" ry="5" />
        {/* Ring finger blocking right nostril */}
        <circle className="cb-lf" cx="74" cy="65" r="5" fill="#555555" opacity=".8" />
        <text x="46" y="120" textAnchor="middle" fontSize="8" fill="#555555">LEFT</text>
        <text x="74" y="120" textAnchor="middle" fontSize="8" fill="#555555">RIGHT</text>
        <text x="60" y="108" textAnchor="middle" fontSize="7" fill="#555555">☽ lunar</text>
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">6s cycle · left = lunar · cooling</div>
    </div>
  )
}

// ─── 12. Sitali ── flat tongue profile (Sheetali variation) ──────────────────

function SitaliAnim() {
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes si-cool { 0%,100%{opacity:.3} 50%{opacity:.9} }
          .si-cool { animation: si-cool 4s ease-in-out infinite; }
        `}</style>
        <circle cx="50" cy="35" r="22" fill="#d4d4d4" />
        <rect x="42" y="55" width="16" height="18" rx="4" fill="#d4d4d4" />
        {/* Flat tongue (vs Sheetali's rolled tube) */}
        <rect x="66" y="41" width="24" height="6" rx="3" fill="#d4d4d4" />
        <line x1="66" y1="44" x2="90" y2="44" stroke="#0a0a0a" strokeWidth="1" />
        {/* Cool air flow */}
        <path className="si-cool" d="M92 44 L112 40" stroke="#555555" strokeWidth="1.5" strokeDasharray="4,3" />
        <polygon className="si-cool" points="110,36 116,40 110,44" fill="#555555" />
        <text x="60" y="85" textAnchor="middle" fontSize="7" fill="#555555">flat tongue</text>
        <text x="60" y="96" textAnchor="middle" fontSize="7" fill="#3a3a3a">Sheetali variation</text>
        <line x1="0" y1="112" x2="120" y2="112" stroke="#2a2a2a" strokeWidth="1" />
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">4s cycle · cool air over flat tongue</div>
    </div>
  )
}
