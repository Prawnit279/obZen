// Yoga Pose Animated SVG Components — Days 11–20
// No imports required — pure TSX/SVG
// ViewBox: 0 0 160 180 | Background: transparent | Body: #d4d4d4

// ─────────────────────────────────────────────
// Day 11 · Half Front Splits · prefix: hfs
// ─────────────────────────────────────────────
export function HalfFrontSplitsAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .hfs-torso, .hfs-leg { animation: none !important; }
        }
        .hfs-torso {
          transform-origin: 88px 132px;
          animation: hfs-fold 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .hfs-leg {
          transform-box: fill-box;
          transform-origin: top right;
          animation: hfs-straighten 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes hfs-fold {
          0%   { transform: rotate(-30deg); }
          100% { transform: rotate(-65deg); }
        }
        @keyframes hfs-straighten {
          0%   { transform: rotate(20deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>

      {/* back knee on floor */}
      <circle cx="115" cy="155" r="4" fill="#d4d4d4"/>
      {/* back shin */}
      <line x1="115" y1="155" x2="128" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>

      {/* hips */}
      <circle cx="88" cy="132" r="5" fill="#d4d4d4"/>
      {/* hip to back knee */}
      <line x1="88" y1="132" x2="115" y2="155" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>

      {/* front leg group — animates from bent to straighter */}
      <g className="hfs-leg">
        {/* hip to front ankle — nearly straight, long */}
        <line x1="88" y1="132" x2="50" y2="165" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* front foot */}
        <circle cx="50" cy="165" r="4" fill="#d4d4d4"/>
      </g>

      {/* torso group — folds forward */}
      <g className="hfs-torso">
        {/* torso (horizontal, hinging forward from hips) */}
        <line x1="88" y1="132" x2="55" y2="125" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* left hand */}
        <circle cx="45" cy="148" r="3.5" fill="#d4d4d4"/>
        {/* right hand */}
        <circle cx="65" cy="148" r="3.5" fill="#d4d4d4"/>
        {/* arms to hands */}
        <line x1="62" y1="128" x2="45" y2="148" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <line x1="62" y1="128" x2="65" y2="148" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* shoulder junction */}
        <circle cx="62" cy="128" r="3" fill="#d4d4d4"/>
        {/* neck + head */}
        <line x1="55" y1="125" x2="42" y2="120" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="35" cy="113" r="13" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 12 · High Lunge · prefix: hlu
// ─────────────────────────────────────────────
export function HighLungeAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .hlu-arms, .hlu-lunge { animation: none !important; }
        }
        .hlu-arms {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: hlu-arms-rise 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .hlu-lunge {
          transform-box: fill-box;
          transform-origin: top left;
          animation: hlu-back-extend 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes hlu-arms-rise {
          0%   { transform: rotate(70deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes hlu-back-extend {
          0%   { transform: rotate(-15deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>

      {/* front right leg — static bent knee */}
      {/* front foot */}
      <circle cx="55" cy="165" r="4" fill="#d4d4d4"/>
      {/* shin */}
      <line x1="55" y1="165" x2="55" y2="120" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* front knee */}
      <circle cx="55" cy="120" r="4" fill="#d4d4d4"/>
      {/* thigh */}
      <line x1="55" y1="120" x2="82" y2="120" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>

      {/* back leg group — animates to extend */}
      <g className="hlu-lunge">
        {/* hip to back foot */}
        <line x1="82" y1="120" x2="120" y2="162" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* back foot lifted slightly */}
        <circle cx="120" cy="162" r="4" fill="#d4d4d4"/>
      </g>

      {/* hips */}
      <circle cx="82" cy="120" r="5" fill="#d4d4d4"/>

      {/* torso */}
      <line x1="82" y1="120" x2="80" y2="58" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* shoulder */}
      <circle cx="80" cy="58" r="4" fill="#d4d4d4"/>

      {/* arms group — sweeps overhead */}
      <g className="hlu-arms">
        <line x1="80" y1="58" x2="65" y2="25" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <line x1="80" y1="58" x2="95" y2="25" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* hands */}
        <circle cx="65" cy="25" r="3" fill="#d4d4d4"/>
        <circle cx="95" cy="25" r="3" fill="#d4d4d4"/>
      </g>

      {/* head */}
      <circle cx="80" cy="15" r="13" fill="#d4d4d4"/>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 13 · Standing Side Stretch · prefix: sss
// ─────────────────────────────────────────────
export function StandingSideStretchAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .sss-curve, .sss-arm { animation: none !important; }
        }
        .sss-curve {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: sss-body-curve 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .sss-arm {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: sss-arm-sweep 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes sss-body-curve {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(-12deg); }
        }
        @keyframes sss-arm-sweep {
          0%   { transform: rotate(80deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>

      {/* feet — together */}
      <circle cx="76" cy="168" r="4" fill="#d4d4d4"/>
      <circle cx="84" cy="168" r="4" fill="#d4d4d4"/>

      {/* whole body curves left */}
      <g className="sss-curve">
        {/* legs */}
        <line x1="80" y1="110" x2="76" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="80" y1="110" x2="84" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* hips */}
        <circle cx="80" cy="110" r="4" fill="#d4d4d4"/>
        {/* torso curves left — slight arc via two segments */}
        <line x1="80" y1="110" x2="76" y2="75" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="76" y1="75" x2="72" y2="48" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* shoulders */}
        <circle cx="72" cy="48" r="3" fill="#d4d4d4"/>
        {/* left arm slides down */}
        <line x1="72" y1="48" x2="62" y2="125" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="62" cy="125" r="3" fill="#d4d4d4"/>
        {/* right arm group sweeps overhead */}
        <g className="sss-arm">
          <line x1="72" y1="48" x2="48" y2="12" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="48" cy="12" r="3" fill="#d4d4d4"/>
        </g>
        {/* neck + head */}
        <line x1="72" y1="48" x2="70" y2="36" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="68" cy="23" r="13" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 14 · Chair Pose · prefix: cha
// ─────────────────────────────────────────────
export function ChairPoseAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .cha-sit, .cha-arms { animation: none !important; }
        }
        .cha-sit {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: cha-lower 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .cha-arms {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: cha-arms-rise 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes cha-lower {
          0%   { transform: translateY(-18px); }
          100% { transform: translateY(0px); }
        }
        @keyframes cha-arms-rise {
          0%   { transform: rotate(75deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>

      {/* feet — fixed */}
      <circle cx="63" cy="168" r="4" fill="#d4d4d4"/>
      <circle cx="97" cy="168" r="4" fill="#d4d4d4"/>

      {/* sitting group — lowers down */}
      <g className="cha-sit">
        {/* shins */}
        <line x1="63" y1="168" x2="60" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="97" y1="168" x2="100" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* knees */}
        <circle cx="60" cy="128" r="4" fill="#d4d4d4"/>
        <circle cx="100" cy="128" r="4" fill="#d4d4d4"/>
        {/* thighs */}
        <line x1="60" y1="128" x2="80" y2="112" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="100" y1="128" x2="80" y2="112" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* hips */}
        <circle cx="80" cy="112" r="5" fill="#d4d4d4"/>
        {/* torso — slight forward lean */}
        <line x1="80" y1="112" x2="78" y2="65" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* shoulders */}
        <circle cx="78" cy="65" r="4" fill="#d4d4d4"/>
        {/* arms rise overhead */}
        <g className="cha-arms">
          <line x1="78" y1="65" x2="62" y2="28" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
          <line x1="78" y1="65" x2="98" y2="28" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="62" cy="28" r="3" fill="#d4d4d4"/>
          <circle cx="98" cy="28" r="3" fill="#d4d4d4"/>
        </g>
        {/* head */}
        <circle cx="80" cy="18" r="13" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 15 · Lizard Pose · prefix: lz
// ─────────────────────────────────────────────
export function LizardPoseAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .lz-drop { animation: none !important; }
        }
        .lz-drop {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: lz-sink 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes lz-sink {
          0%   { transform: translateY(-18px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>

      {/* whole low figure group sinks into position */}
      <g className="lz-drop">
        {/* back left leg extends straight back */}
        <line x1="88" y1="112" x2="132" y2="155" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="132" cy="155" r="4" fill="#d4d4d4"/>

        {/* hips */}
        <circle cx="88" cy="112" r="5" fill="#d4d4d4"/>

        {/* right front leg — foot outside hand */}
        <line x1="88" y1="112" x2="42" y2="112" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="42" cy="112" r="4" fill="#d4d4d4"/>
        {/* shin down to foot */}
        <line x1="42" y1="112" x2="38" y2="148" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="38" cy="148" r="4" fill="#d4d4d4"/>

        {/* torso — horizontal, low */}
        <line x1="88" y1="112" x2="48" y2="118" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>

        {/* forearms on floor */}
        {/* left forearm */}
        <line x1="48" y1="118" x2="38" y2="140" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* right forearm */}
        <line x1="48" y1="118" x2="55" y2="128" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="38" cy="140" r="3" fill="#d4d4d4"/>
        <circle cx="55" cy="128" r="3" fill="#d4d4d4"/>

        {/* head forward and low */}
        <line x1="48" y1="118" x2="32" y2="118" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="22" cy="115" r="13" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 16 · Warrior I · prefix: w1a
// ─────────────────────────────────────────────
export function WarriorIAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .w1a-arms, .w1a-knee { animation: none !important; }
        }
        .w1a-arms {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: w1a-arms-rise 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .w1a-knee {
          transform-box: fill-box;
          transform-origin: top right;
          animation: w1a-knee-bend 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes w1a-arms-rise {
          0%   { transform: rotate(60deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes w1a-knee-bend {
          0%   { transform: rotate(-15deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>

      {/* back left foot */}
      <circle cx="115" cy="162" r="4" fill="#d4d4d4"/>
      {/* back leg straight */}
      <line x1="115" y1="162" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>

      {/* hips */}
      <circle cx="80" cy="118" r="5" fill="#d4d4d4"/>

      {/* front knee bends deeper */}
      <g className="w1a-knee">
        <line x1="80" y1="118" x2="58" y2="118" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="58" cy="118" r="4" fill="#d4d4d4"/>
        <line x1="58" y1="118" x2="58" y2="165" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="58" cy="165" r="4" fill="#d4d4d4"/>
      </g>

      {/* torso tall */}
      <line x1="80" y1="118" x2="80" y2="55" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="80" cy="55" r="4" fill="#d4d4d4"/>

      {/* arms rise to prayer overhead */}
      <g className="w1a-arms">
        <line x1="80" y1="55" x2="76" y2="18" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <line x1="80" y1="55" x2="82" y2="18" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="79" cy="18" r="3" fill="#d4d4d4"/>
      </g>

      {/* head */}
      <circle cx="80" cy="8" r="11" fill="#d4d4d4"/>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 17 · Warrior II · prefix: w2a
// ─────────────────────────────────────────────
export function WarriorIIAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .w2a-open, .w2a-knee { animation: none !important; }
        }
        .w2a-open {
          transform-box: fill-box;
          transform-origin: center center;
          animation: w2a-arms-spread 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .w2a-knee {
          transform-box: fill-box;
          transform-origin: top center;
          animation: w2a-knee-bend 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes w2a-arms-spread {
          0%   { transform: scaleX(0.3); }
          100% { transform: scaleX(1); }
        }
        @keyframes w2a-knee-bend {
          0%   { transform: rotate(-12deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>

      {/* back left foot + straight leg */}
      <circle cx="132" cy="168" r="4" fill="#d4d4d4"/>
      <line x1="132" y1="168" x2="80" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>

      {/* hips */}
      <circle cx="80" cy="128" r="5" fill="#d4d4d4"/>

      {/* front right knee bends */}
      <g className="w2a-knee">
        <line x1="80" y1="128" x2="38" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="38" cy="128" r="4" fill="#d4d4d4"/>
        <line x1="38" y1="128" x2="32" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="32" cy="168" r="4" fill="#d4d4d4"/>
      </g>

      {/* torso tall */}
      <line x1="80" y1="128" x2="80" y2="72" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="80" cy="72" r="4" fill="#d4d4d4"/>

      {/* head turned right */}
      <circle cx="80" cy="60" r="11" fill="#d4d4d4"/>

      {/* arms spread full T */}
      <g className="w2a-open">
        <line x1="80" y1="72" x2="148" y2="72" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <line x1="80" y1="72" x2="12" y2="72" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="148" cy="72" r="3" fill="#d4d4d4"/>
        <circle cx="12" cy="72" r="3" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 18 · Warrior III · prefix: w3a
// ─────────────────────────────────────────────
export function WarriorIIIAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .w3a-tip { animation: none !important; }
        }
        .w3a-tip {
          transform-box: fill-box;
          transform-origin: 80px 168px;
          animation: w3a-body-tip 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes w3a-body-tip {
          0%   { transform: rotate(-20deg); }
          100% { transform: rotate(-80deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>

      {/* standing foot — fixed */}
      <circle cx="80" cy="168" r="4" fill="#d4d4d4"/>

      {/* whole body tips forward — pivots around standing foot */}
      <g className="w3a-tip">
        {/* standing leg */}
        <line x1="80" y1="168" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* hips */}
        <circle cx="80" cy="108" r="5" fill="#d4d4d4"/>
        {/* lifted leg extends back horizontally */}
        <line x1="80" y1="108" x2="148" y2="108" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="148" cy="108" r="4" fill="#d4d4d4"/>
        {/* torso horizontal forward */}
        <line x1="80" y1="108" x2="25" y2="108" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* arms forward */}
        <line x1="25" y1="108" x2="18" y2="108" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="18" cy="108" r="3" fill="#d4d4d4"/>
        {/* head level */}
        <circle cx="15" cy="102" r="11" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 19 · Reverse Warrior · prefix: rwa
// ─────────────────────────────────────────────
export function ReverseWarriorAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .rwa-arc, .rwa-back-arm { animation: none !important; }
        }
        .rwa-arc {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: rwa-front-arc 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .rwa-back-arm {
          transform-box: fill-box;
          transform-origin: top center;
          animation: rwa-back-lower 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes rwa-front-arc {
          0%   { transform: rotate(-90deg); }
          100% { transform: rotate(-140deg); }
        }
        @keyframes rwa-back-lower {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(40deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>

      {/* back left foot + straight leg */}
      <circle cx="132" cy="168" r="4" fill="#d4d4d4"/>
      <line x1="132" y1="168" x2="80" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>

      {/* hips */}
      <circle cx="80" cy="128" r="5" fill="#d4d4d4"/>

      {/* front right knee bent */}
      <line x1="80" y1="128" x2="38" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="38" cy="128" r="4" fill="#d4d4d4"/>
      <line x1="38" y1="128" x2="32" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="32" cy="168" r="4" fill="#d4d4d4"/>

      {/* torso leans back-right */}
      <line x1="80" y1="128" x2="90" y2="72" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="90" cy="72" r="4" fill="#d4d4d4"/>

      {/* head tilted back */}
      <circle cx="95" cy="60" r="11" fill="#d4d4d4"/>

      {/* front right arm arcs overhead-back */}
      <g className="rwa-arc">
        <line x1="90" y1="72" x2="105" y2="22" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="105" cy="22" r="3" fill="#d4d4d4"/>
      </g>

      {/* back left arm slides down toward back leg */}
      <g className="rwa-back-arm">
        <line x1="90" y1="72" x2="118" y2="110" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="118" cy="110" r="3" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 20 · Extended Triangle · prefix: eta
// ─────────────────────────────────────────────
export function ExtendedTriangleAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .eta-tilt, .eta-arm { animation: none !important; }
        }
        .eta-tilt {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: eta-body-tilt 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .eta-arm {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: eta-arm-extend 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes eta-body-tilt {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(30deg); }
        }
        @keyframes eta-arm-extend {
          0%   { transform: rotate(90deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>

      {/* wide feet */}
      <circle cx="28" cy="168" r="4" fill="#d4d4d4"/>
      <circle cx="132" cy="168" r="4" fill="#d4d4d4"/>

      {/* left straight leg */}
      <line x1="28" y1="168" x2="80" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>

      {/* right straight leg */}
      <line x1="132" y1="168" x2="80" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>

      {/* hips */}
      <circle cx="80" cy="128" r="5" fill="#d4d4d4"/>

      {/* torso tilts right over right leg */}
      <g className="eta-tilt">
        {/* torso */}
        <line x1="80" y1="128" x2="52" y2="88" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="52" cy="88" r="4" fill="#d4d4d4"/>

        {/* right lower arm reaches to left ankle */}
        <line x1="52" y1="88" x2="32" y2="148" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="32" cy="148" r="3" fill="#d4d4d4"/>

        {/* top arm extends straight up */}
        <g className="eta-arm">
          <line x1="52" y1="88" x2="80" y2="22" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="80" cy="22" r="3" fill="#d4d4d4"/>
        </g>

        {/* head looks up toward top hand */}
        <line x1="52" y1="88" x2="60" y2="76" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="68" cy="64" r="11" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}
