// Yoga Pose Animated SVG Components — Days 1–10
// No imports required — pure TSX/SVG
// ViewBox: 0 0 160 180 | Body color: #d4d4d4

interface PoseAnimProps {
  paused?: boolean
}

// ─────────────────────────────────────────────
// Day 1 · Mountain Pose · prefix: mp
// Subtle chest lift + crown lift from relaxed standing
// ─────────────────────────────────────────────
export function MountainPoseAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .mp-body, .mp-larm, .mp-rarm { animation: none !important; }
        }
        .mp-body {
          transform-box: fill-box;
          transform-origin: center;
          animation: mp-rise 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .mp-larm {
          transform-box: fill-box;
          transform-origin: center;
          animation: mp-larm-out 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .mp-rarm {
          transform-box: fill-box;
          transform-origin: center;
          animation: mp-rarm-out 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes mp-rise {
          0%   { transform: translateY(2px); }
          100% { transform: translateY(0px); }
        }
        @keyframes mp-larm-out {
          0%   { transform: rotate(5deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes mp-rarm-out {
          0%   { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5" />

      <g className="mp-body">
        {/* head */}
        <circle cx="80" cy="22" r="13" fill="#d4d4d4" />
        {/* neck + torso */}
        <line x1="80" y1="35" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        {/* left arm — straight down, slightly rotated outward */}
        <g className="mp-larm">
          <line x1="80" y1="48" x2="67" y2="78" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
          <line x1="67" y1="78" x2="60" y2="108" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        </g>
        {/* right arm — straight down, slightly rotated outward */}
        <g className="mp-rarm">
          <line x1="80" y1="48" x2="93" y2="78" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
          <line x1="93" y1="78" x2="100" y2="108" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        </g>
        {/* left leg — feet together */}
        <line x1="80" y1="108" x2="72" y2="138" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="72" y1="138" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
        {/* right leg — feet together */}
        <line x1="80" y1="108" x2="88" y2="138" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="88" y1="138" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 2 · Bird Dog · prefix: bd
// On all fours: right arm + left leg lift simultaneously
// ─────────────────────────────────────────────
export function BirdDogAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .bd-rarm, .bd-lleg { animation: none !important; }
        }
        .bd-rarm {
          transform-box: fill-box;
          transform-origin: center;
          animation: bd-arm-extend 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .bd-lleg {
          transform-box: fill-box;
          transform-origin: center;
          animation: bd-leg-extend 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes bd-arm-extend {
          0%   { transform: rotate(75deg) translateX(-10px); }
          100% { transform: rotate(0deg) translateX(0px); }
        }
        @keyframes bd-leg-extend {
          0%   { transform: rotate(-75deg) translateX(10px); }
          100% { transform: rotate(0deg) translateX(0px); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="145" x2="150" y2="145" stroke="#2a2a2a" strokeWidth="1.5" />

      {/* tabletop spine — horizontal */}
      <line x1="50" y1="103" x2="115" y2="103" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />

      {/* head — left side, facing forward-left */}
      <circle cx="30" cy="93" r="13" fill="#d4d4d4" />
      {/* neck */}
      <line x1="42" y1="96" x2="52" y2="103" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />

      {/* left arm planted — front shoulder to wrist on ground */}
      <line x1="52" y1="103" x2="45" y2="128" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />

      {/* right arm extends forward — from rear shoulder */}
      <g className="bd-rarm" style={{ transformOrigin: '113px 103px' }}>
        <line x1="113" y1="103" x2="145" y2="103" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* right leg planted — from rear hip down to knee */}
      <line x1="113" y1="103" x2="118" y2="130" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />

      {/* left leg extends back — from front hip */}
      <g className="bd-lleg" style={{ transformOrigin: '55px 107px' }}>
        <line x1="55" y1="107" x2="20" y2="107" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 3 · Horse Pose · prefix: hp
// Standing wide squat, arms rise to goal-post shape
// ─────────────────────────────────────────────
export function HorsePoseAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .hp-body, .hp-larm, .hp-rarm { animation: none !important; }
        }
        .hp-body {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: hp-sink 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .hp-larm {
          transform-box: fill-box;
          transform-origin: 80px 60px;
          animation: hp-larm-rise 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .hp-rarm {
          transform-box: fill-box;
          transform-origin: 80px 60px;
          animation: hp-rarm-rise 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes hp-sink {
          0%   { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes hp-larm-rise {
          0%   { transform: rotate(20deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes hp-rarm-rise {
          0%   { transform: rotate(-20deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5" />

      {/* wide stance legs — static end position */}
      {/* left leg: wide, knee bent outward */}
      <line x1="80" y1="120" x2="55" y2="138" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="55" y1="138" x2="45" y2="165" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      {/* right leg */}
      <line x1="80" y1="120" x2="105" y2="138" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="105" y1="138" x2="115" y2="165" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />

      {/* upper body — animated sink */}
      <g className="hp-body">
        {/* head */}
        <circle cx="80" cy="25" r="13" fill="#d4d4d4" />
        {/* torso — hip at 120 */}
        <line x1="80" y1="38" x2="80" y2="120" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />

        {/* left arm — upper arm horizontal, forearm vertical up (goal-post) */}
        <g className="hp-larm">
          <line x1="80" y1="60" x2="50" y2="68" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="68" x2="50" y2="42" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        </g>
        {/* right arm */}
        <g className="hp-rarm">
          <line x1="80" y1="60" x2="110" y2="68" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
          <line x1="110" y1="68" x2="110" y2="42" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 4 · Cat–Cow · prefix: cc
// On all fours, continuous spinal wave
// ─────────────────────────────────────────────
export function CatCowAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .cc-spine, .cc-head { animation: none !important; }
        }
        .cc-spine {
          transform-box: fill-box;
          transform-origin: center;
          animation: cc-spine-wave 4s ease-in-out infinite;
          animation-play-state: ${ps};
        }
        .cc-head {
          transform-box: fill-box;
          transform-origin: right center;
          animation: cc-head-wave 4s ease-in-out infinite;
          animation-play-state: ${ps};
        }
        @keyframes cc-spine-wave {
          0%   { transform: translateY(0px); }
          25%  { transform: translateY(8px); }
          50%  { transform: translateY(0px); }
          75%  { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes cc-head-wave {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(-15deg); }
          50%  { transform: rotate(0deg); }
          75%  { transform: rotate(15deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="162" x2="150" y2="162" stroke="#2a2a2a" strokeWidth="1.5" />

      {/* wrists — static, planted on ground */}
      <line x1="40" y1="118" x2="40" y2="150" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
      <line x1="120" y1="118" x2="120" y2="150" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />

      {/* knees — static */}
      <line x1="50" y1="128" x2="50" y2="155" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="110" y1="128" x2="110" y2="155" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />

      {/* animated spine group */}
      <g className="cc-spine">
        {/* spine bar */}
        <line x1="40" y1="118" x2="120" y2="118" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        {/* upper arm connections to knees */}
        <line x1="50" y1="118" x2="50" y2="128" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        <line x1="110" y1="118" x2="110" y2="128" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* animated head — opposite phase to spine */}
      <g className="cc-head" style={{ transformOrigin: '42px 112px' }}>
        <line x1="42" y1="112" x2="26" y2="106" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="15" cy="98" r="13" fill="#d4d4d4" />
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 5 · Forward Fold · prefix: ff
// Standing to forward fold, hinging at hip
// ─────────────────────────────────────────────
export function ForwardFoldAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .ff-upper { animation: none !important; }
        }
        .ff-upper {
          transform-box: fill-box;
          transform-origin: center;
          animation: ff-fold 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes ff-fold {
          0%   { transform: rotate(-5deg); }
          100% { transform: rotate(85deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5" />

      {/* legs — static */}
      <line x1="80" y1="108" x2="65" y2="138" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="65" y1="138" x2="58" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="80" y1="108" x2="95" y2="138" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="95" y1="138" x2="102" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />

      {/* upper body rotates forward from hip pivot */}
      <g className="ff-upper" style={{ transformOrigin: '80px 108px' }}>
        {/* torso */}
        <line x1="80" y1="48" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        {/* neck + head */}
        <line x1="80" y1="35" x2="80" y2="48" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="80" cy="22" r="13" fill="#d4d4d4" />
        {/* left arm hangs */}
        <line x1="80" y1="60" x2="60" y2="80" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        <line x1="60" y1="80" x2="55" y2="108" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        {/* right arm hangs */}
        <line x1="80" y1="60" x2="100" y2="80" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        <line x1="100" y1="80" x2="105" y2="108" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 6 · Half Forward Bend · prefix: hfb
// Flat back extension, spine parallel to floor
// ─────────────────────────────────────────────
export function HalfForwardBendAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .hfb-upper { animation: none !important; }
        }
        .hfb-upper {
          transform-box: fill-box;
          transform-origin: center;
          animation: hfb-spine 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes hfb-spine {
          0%   { transform: rotate(78deg); }
          100% { transform: rotate(88deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5" />

      {/* legs — static, straight */}
      <line x1="80" y1="108" x2="65" y2="138" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="65" y1="138" x2="60" y2="165" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="80" y1="108" x2="95" y2="138" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="95" y1="138" x2="100" y2="165" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />

      {/* upper body — near horizontal, spine flat */}
      <g className="hfb-upper" style={{ transformOrigin: '80px 108px' }}>
        {/* spine horizontal */}
        <line x1="80" y1="52" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        {/* neck + head lifted */}
        <line x1="80" y1="40" x2="80" y2="52" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="80" cy="27" r="13" fill="#d4d4d4" />
        {/* arms reach down to shins */}
        <line x1="80" y1="65" x2="62" y2="76" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        <line x1="62" y1="76" x2="58" y2="93" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        <line x1="80" y1="65" x2="98" y2="76" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        <line x1="98" y1="76" x2="102" y2="93" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 7 · Cobra · prefix: cb
// Prone, chest peels off floor
// ─────────────────────────────────────────────
export function CobraAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .cb-chest { animation: none !important; }
        }
        .cb-chest {
          transform-box: fill-box;
          transform-origin: center;
          animation: cb-peel 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes cb-peel {
          0%   { transform: translateY(15px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="150" x2="150" y2="150" stroke="#2a2a2a" strokeWidth="1.5" />

      {/* legs flat on ground — static */}
      <line x1="80" y1="132" x2="110" y2="134" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="110" y1="134" x2="148" y2="136" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="80" y1="136" x2="110" y2="140" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="110" y1="140" x2="148" y2="143" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />

      {/* hip/pelvis anchor */}
      <circle cx="80" cy="134" r="5" fill="#d4d4d4" />

      {/* chest peels up — animated group */}
      <g className="cb-chest">
        {/* torso */}
        <line x1="80" y1="130" x2="40" y2="124" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        {/* neck */}
        <line x1="40" y1="124" x2="30" y2="113" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        {/* head — lifted, chin up */}
        <circle cx="20" cy="103" r="13" fill="#d4d4d4" />
        {/* left arm pressing into floor */}
        <line x1="72" y1="127" x2="55" y2="132" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        <line x1="55" y1="132" x2="48" y2="147" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        {/* right arm pressing into floor */}
        <line x1="82" y1="128" x2="100" y2="132" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        <line x1="100" y1="132" x2="108" y2="147" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 8 · Downward Dog · prefix: dd
// From all-fours to inverted V, hips rise
// ─────────────────────────────────────────────
export function DownwardDogAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .dd-hips { animation: none !important; }
        }
        .dd-hips {
          transform-box: fill-box;
          transform-origin: center;
          animation: dd-hips-rise 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes dd-hips-rise {
          0%   { transform: translateY(45px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="145" x2="150" y2="145" stroke="#2a2a2a" strokeWidth="1.5" />

      {/* hands — static, planted */}
      <circle cx="35" cy="135" r="4" fill="#d4d4d4" />
      <circle cx="125" cy="135" r="4" fill="#d4d4d4" />

      {/* feet — static */}
      <circle cx="55" cy="140" r="4" fill="#d4d4d4" />
      <circle cx="105" cy="140" r="4" fill="#d4d4d4" />

      {/* inverted V — hips peak, arms and legs connect */}
      <g className="dd-hips">
        {/* left arm: hand to hip */}
        <line x1="35" y1="135" x2="80" y2="55" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        {/* right arm: hip to right hand */}
        <line x1="80" y1="55" x2="125" y2="135" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        {/* left leg: hip to left foot */}
        <line x1="80" y1="55" x2="55" y2="140" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
        {/* right leg: hip to right foot */}
        <line x1="80" y1="55" x2="105" y2="140" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
        {/* hip apex */}
        <circle cx="80" cy="55" r="5" fill="#d4d4d4" />
        {/* head between arms */}
        <line x1="56" y1="100" x2="62" y2="87" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="62" cy="75" r="13" fill="#d4d4d4" />
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 9 · Plank · prefix: pl
// Straight body line, subtle core engagement pulse
// ─────────────────────────────────────────────
export function PlankAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .pl-body, .pl-core { animation: none !important; }
        }
        .pl-body {
          transform-box: fill-box;
          transform-origin: center;
          animation: pl-sway 2s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .pl-core {
          transform-box: fill-box;
          transform-origin: center;
          animation: pl-core-pulse 2s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes pl-sway {
          0%   { transform: translateY(1px); }
          100% { transform: translateY(-1px); }
        }
        @keyframes pl-core-pulse {
          0%   { transform: scale(1.0); }
          100% { transform: scale(1.008); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="142" x2="150" y2="142" stroke="#2a2a2a" strokeWidth="1.5" />

      <g className="pl-body">
        {/* hands/arms — planted */}
        <line x1="40" y1="113" x2="40" y2="135" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        <line x1="120" y1="113" x2="120" y2="135" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />

        {/* body straight line */}
        <line x1="40" y1="113" x2="120" y2="113" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />

        {/* core pulse */}
        <g className="pl-core">
          <circle cx="80" cy="113" r="5" fill="#d4d4d4" />
        </g>

        {/* neck + head */}
        <line x1="40" y1="113" x2="28" y2="106" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="18" cy="99" r="13" fill="#d4d4d4" />

        {/* feet / toes */}
        <line x1="120" y1="113" x2="140" y2="115" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="140" y1="115" x2="148" y2="122" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 10 · Low Lunge · prefix: ll
// Step forward, back knee lowers, arms sweep overhead
// ─────────────────────────────────────────────
export function LowLungeAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .ll-rise, .ll-body { animation: none !important; }
        }
        .ll-body {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: ll-sink 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .ll-rise {
          transform-box: fill-box;
          transform-origin: 80px 80px;
          animation: ll-arms-sweep 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes ll-sink {
          0%   { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes ll-arms-sweep {
          0%   { transform: rotate(35deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* ground */}
      <line x1="10" y1="165" x2="150" y2="165" stroke="#2a2a2a" strokeWidth="1.5" />

      {/* back leg — left knee on floor, foot behind */}
      <line x1="85" y1="118" x2="115" y2="140" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="115" y1="140" x2="122" y2="162" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />

      {/* front leg — right foot forward, knee bent */}
      <line x1="85" y1="118" x2="65" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="65" y1="128" x2="60" y2="162" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round" />

      {/* upper body — animated lunge sink */}
      <g className="ll-body">
        {/* torso upright */}
        <line x1="80" y1="70" x2="85" y2="118" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        {/* neck */}
        <line x1="80" y1="58" x2="80" y2="70" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round" />
        {/* head */}
        <circle cx="80" cy="45" r="13" fill="#d4d4d4" />

        {/* arms sweep overhead */}
        <g className="ll-rise">
          {/* left arm */}
          <line x1="80" y1="80" x2="62" y2="60" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
          <line x1="62" y1="60" x2="55" y2="38" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
          {/* right arm */}
          <line x1="80" y1="80" x2="98" y2="60" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
          <line x1="98" y1="60" x2="105" y2="38" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}
