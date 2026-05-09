// Yoga Pose Animated SVG Components — Days 21–30
// No imports required — pure TSX/SVG
// ViewBox: 0 0 160 180 | Background: transparent | Body: #d4d4d4

interface PoseAnimProps {
  paused?: boolean
}

// ─────────────────────────────────────────────
// Day 21 · Wide Legs Forward Fold · prefix: wlf
// ─────────────────────────────────────────────
export function WideLegsForwardFoldAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .wlf-torso { animation: none !important; }
        }
        .wlf-torso {
          transform-origin: 80px 118px;
          animation: wlf-fold 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes wlf-fold {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(85deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* left leg */}
      <line x1="80" y1="118" x2="32" y2="145" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="32" y1="145" x2="25" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* right leg */}
      <line x1="80" y1="118" x2="128" y2="145" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="128" y1="145" x2="135" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hip joint */}
      <circle cx="80" cy="118" r="4" fill="#d4d4d4"/>
      {/* left knee joint */}
      <circle cx="32" cy="145" r="4" fill="#d4d4d4"/>
      {/* right knee joint */}
      <circle cx="128" cy="145" r="4" fill="#d4d4d4"/>
      {/* torso + arms + head group — rotates forward */}
      <g className="wlf-torso">
        {/* torso */}
        <line x1="80" y1="118" x2="80" y2="65" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* shoulder joints */}
        <circle cx="80" cy="80" r="4" fill="#d4d4d4"/>
        {/* left arm down to floor */}
        <line x1="80" y1="80" x2="60" y2="108" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="60" y1="108" x2="58" y2="130" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* right arm down to floor */}
        <line x1="80" y1="80" x2="100" y2="108" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="100" y1="108" x2="102" y2="130" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* elbow joints */}
        <circle cx="60" cy="108" r="4" fill="#d4d4d4"/>
        <circle cx="100" cy="108" r="4" fill="#d4d4d4"/>
        {/* head */}
        <circle cx="80" cy="52" r="13" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 22 · Eagle Pose · prefix: eg
// ─────────────────────────────────────────────
export function EaglePoseAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .eg-arms, .eg-legs { animation: none !important; }
        }
        .eg-arms {
          transform-box: fill-box;
          transform-origin: center;
          animation: eg-wrap 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .eg-legs {
          transform-box: fill-box;
          transform-origin: top center;
          animation: eg-hook 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes eg-wrap {
          0%   { transform: translateX(0px) scaleX(1); }
          100% { transform: translateX(-4px) scaleX(0.88); }
        }
        @keyframes eg-hook {
          0%   { transform: translateX(0px); }
          100% { transform: translateX(3px) rotate(-5deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
      {/* torso */}
      <line x1="80" y1="35" x2="80" y2="128" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* shoulder joints */}
      <circle cx="80" cy="68" r="4" fill="#d4d4d4"/>
      {/* hip joint */}
      <circle cx="80" cy="128" r="4" fill="#d4d4d4"/>
      {/* support leg — right, bent */}
      <line x1="80" y1="128" x2="80" y2="148" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="80" y1="148" x2="82" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* support knee joint */}
      <circle cx="80" cy="148" r="4" fill="#d4d4d4"/>
      {/* crossed legs group */}
      <g className="eg-legs">
        {/* left thigh over right */}
        <line x1="80" y1="128" x2="74" y2="148" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* left knee joint */}
        <circle cx="74" cy="148" r="4" fill="#d4d4d4"/>
        {/* left foot hooks behind right calf */}
        <line x1="74" y1="148" x2="78" y2="158" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      </g>
      {/* arms wrapped group */}
      <g className="eg-arms">
        {/* left arm under right, elbows lifted */}
        <line x1="80" y1="68" x2="68" y2="75" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="68" y1="75" x2="75" y2="55" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* elbow joint */}
        <circle cx="68" cy="75" r="4" fill="#d4d4d4"/>
        {/* right arm over left */}
        <line x1="80" y1="68" x2="92" y2="75" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="92" y1="75" x2="75" y2="55" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* elbow joint */}
        <circle cx="92" cy="75" r="4" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 23 · Kneeling Quad Stretch · prefix: kqs
// ─────────────────────────────────────────────
export function KneelingQuadStretchAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .kqs-backleg, .kqs-rarm { animation: none !important; }
        }
        .kqs-backleg {
          transform-box: fill-box;
          transform-origin: top center;
          animation: kqs-pull 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .kqs-rarm {
          transform-box: fill-box;
          transform-origin: top center;
          animation: kqs-pull 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes kqs-pull {
          0%   { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-18px) rotate(-12deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
      {/* torso upright */}
      <line x1="80" y1="35" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* shoulder joints */}
      <circle cx="80" cy="75" r="4" fill="#d4d4d4"/>
      {/* hip joint */}
      <circle cx="80" cy="118" r="4" fill="#d4d4d4"/>
      {/* front right leg — lunge */}
      <line x1="80" y1="118" x2="55" y2="132" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="55" y1="132" x2="55" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* front knee joint */}
      <circle cx="55" cy="132" r="4" fill="#d4d4d4"/>
      {/* left arm on front thigh */}
      <line x1="80" y1="75" x2="62" y2="115" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* left elbow joint */}
      <circle cx="71" cy="95" r="4" fill="#d4d4d4"/>
      {/* back leg + right arm group — lifts together */}
      <g className="kqs-backleg">
        {/* back thigh from hip */}
        <line x1="80" y1="118" x2="112" y2="152" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* back knee joint */}
        <circle cx="112" cy="152" r="4" fill="#d4d4d4"/>
        {/* back foot pulled up */}
        <line x1="112" y1="152" x2="105" y2="128" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      </g>
      <g className="kqs-rarm">
        {/* right arm reaching back to hold foot */}
        <line x1="80" y1="75" x2="105" y2="115" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* right elbow joint */}
        <circle cx="93" cy="95" r="4" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 24 · Child's Pose · prefix: cp
// ─────────────────────────────────────────────
export function ChildsPoseAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .cp-upper { animation: none !important; }
        }
        .cp-upper {
          transform-origin: 78px 148px;
          animation: cp-melt 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes cp-melt {
          0%   { transform: rotate(-60deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* hips/seat */}
      <line x1="65" y1="155" x2="95" y2="155" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* left knee */}
      <line x1="65" y1="155" x2="55" y2="148" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* right knee */}
      <line x1="95" y1="155" x2="105" y2="148" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* left shin back */}
      <line x1="55" y1="148" x2="57" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* right shin back */}
      <line x1="105" y1="148" x2="107" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* left knee joint */}
      <circle cx="55" cy="148" r="4" fill="#d4d4d4"/>
      {/* right knee joint */}
      <circle cx="105" cy="148" r="4" fill="#d4d4d4"/>
      {/* folded torso + head + arms group — pivots at hip/knee junction */}
      <g className="cp-upper">
        {/* torso forward and flat */}
        <line x1="78" y1="148" x2="30" y2="132" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* head — forehead near floor */}
        <circle cx="20" cy="132" r="13" fill="#d4d4d4"/>
        {/* shoulder area */}
        <circle cx="45" cy="138" r="4" fill="#d4d4d4"/>
        {/* arms extended forward */}
        <line x1="45" y1="138" x2="12" y2="128" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="45" y1="138" x2="38" y2="120" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 25 · Boat Pose · prefix: bt
// ─────────────────────────────────────────────
export function BoatPoseAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .bt-legs, .bt-torso { animation: none !important; }
        }
        .bt-legs {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: bt-lift 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .bt-torso {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: bt-lean 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes bt-lift {
          0%   { transform: rotate(30deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes bt-lean {
          0%   { transform: rotate(10deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* sit bones */}
      <circle cx="80" cy="148" r="4" fill="#d4d4d4"/>
      {/* head */}
      <circle cx="80" cy="82" r="13" fill="#d4d4d4"/>
      {/* torso leaning back */}
      <g className="bt-torso">
        <line x1="80" y1="148" x2="80" y2="95" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* shoulder joints */}
        <circle cx="80" cy="115" r="4" fill="#d4d4d4"/>
        {/* arms parallel forward */}
        <line x1="80" y1="115" x2="40" y2="120" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="80" y1="115" x2="120" y2="120" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      </g>
      {/* legs lifting to diagonal V */}
      <g className="bt-legs">
        <line x1="80" y1="148" x2="48" y2="115" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        <line x1="80" y1="148" x2="112" y2="115" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* knee joints */}
        <circle cx="60" cy="130" r="4" fill="#d4d4d4"/>
        <circle cx="100" cy="130" r="4" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 26 · Superman Pose · prefix: sm
// ─────────────────────────────────────────────
export function SupermanPoseAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .sm-arms, .sm-legs, .sm-head { animation: none !important; }
        }
        .sm-arms {
          transform-box: fill-box;
          transform-origin: right center;
          animation: sm-lift 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .sm-legs {
          transform-box: fill-box;
          transform-origin: left center;
          animation: sm-lift 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .sm-head {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: sm-lift 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes sm-lift {
          0%   { transform: translateY(0px); }
          100% { transform: translateY(-12px); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* pelvis/belly center — stays on floor */}
      <line x1="65" y1="148" x2="95" y2="148" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* shoulder anchor */}
      <circle cx="65" cy="144" r="4" fill="#d4d4d4"/>
      {/* hip anchor */}
      <circle cx="95" cy="144" r="4" fill="#d4d4d4"/>
      {/* arms group — extends forward and lifts */}
      <g className="sm-arms">
        <line x1="65" y1="140" x2="30" y2="126" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="65" y1="146" x2="30" y2="134" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* elbow joints */}
        <circle cx="47" cy="133" r="4" fill="#d4d4d4"/>
        <circle cx="47" cy="140" r="4" fill="#d4d4d4"/>
      </g>
      {/* legs group — extends back and lifts */}
      <g className="sm-legs">
        <line x1="95" y1="140" x2="135" y2="126" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        <line x1="95" y1="146" x2="135" y2="134" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* knee joints */}
        <circle cx="115" cy="133" r="4" fill="#d4d4d4"/>
        <circle cx="115" cy="140" r="4" fill="#d4d4d4"/>
      </g>
      {/* head group — lifts */}
      <g className="sm-head">
        <circle cx="22" cy="132" r="13" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 27 · Bridge Pose · prefix: br
// ─────────────────────────────────────────────
export function BridgePoseAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .br-hips { animation: none !important; }
        }
        .br-hips {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: br-peel 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes br-peel {
          0%   { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* head on floor */}
      <circle cx="30" cy="152" r="13" fill="#d4d4d4"/>
      {/* shoulders on floor */}
      <line x1="43" y1="148" x2="78" y2="148" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* shoulder joints */}
      <circle cx="55" cy="148" r="4" fill="#d4d4d4"/>
      <circle cx="78" cy="148" r="4" fill="#d4d4d4"/>
      {/* arms clasped under back */}
      <line x1="55" y1="148" x2="68" y2="160" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      <line x1="85" y1="148" x2="68" y2="160" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* feet on floor, knees bent */}
      <line x1="58" y1="130" x2="58" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="102" y1="130" x2="102" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* knee joints */}
      <circle cx="58" cy="148" r="4" fill="#d4d4d4"/>
      <circle cx="102" cy="148" r="4" fill="#d4d4d4"/>
      {/* hips peeling up — the arc */}
      <g className="br-hips">
        <line x1="58" y1="130" x2="80" y2="100" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        <line x1="102" y1="130" x2="80" y2="100" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* hip connector to shoulders */}
        <line x1="78" y1="148" x2="80" y2="100" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* hip joint at apex */}
        <circle cx="80" cy="100" r="4" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 28 · Bow Pose · prefix: bw
// ─────────────────────────────────────────────
export function BowPoseAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .bw-legs, .bw-chest { animation: none !important; }
        }
        .bw-legs {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: bw-bow 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .bw-chest {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: bw-rise 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes bw-bow {
          0%   { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-14px) rotate(-10deg); }
        }
        @keyframes bw-rise {
          0%   { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* belly on floor */}
      <line x1="60" y1="148" x2="100" y2="148" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* hip joints */}
      <circle cx="65" cy="148" r="4" fill="#d4d4d4"/>
      <circle cx="95" cy="148" r="4" fill="#d4d4d4"/>
      {/* chest + head lifting group */}
      <g className="bw-chest">
        <line x1="70" y1="148" x2="80" y2="115" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        <circle cx="80" cy="105" r="13" fill="#d4d4d4"/>
        {/* shoulder joints */}
        <circle cx="80" cy="128" r="4" fill="#d4d4d4"/>
        {/* hands reaching back to hold ankles */}
        <line x1="80" y1="128" x2="52" y2="110" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="80" y1="128" x2="108" y2="110" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* elbow joints */}
        <circle cx="60" cy="119" r="4" fill="#d4d4d4"/>
        <circle cx="100" cy="119" r="4" fill="#d4d4d4"/>
      </g>
      {/* legs bending up — knees and feet rise */}
      <g className="bw-legs">
        <line x1="65" y1="148" x2="55" y2="122" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        <line x1="55" y1="122" x2="50" y2="98" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* left knee joint */}
        <circle cx="55" cy="122" r="4" fill="#d4d4d4"/>
        <line x1="95" y1="148" x2="105" y2="122" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        <line x1="105" y1="122" x2="110" y2="98" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* right knee joint */}
        <circle cx="105" cy="122" r="4" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 29 · Hero Pose · prefix: hr
// ─────────────────────────────────────────────
export function HeroPoseAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .hr-torso { animation: none !important; }
        }
        .hr-torso {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: hr-lengthen 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes hr-lengthen {
          0%   { transform: scaleY(0.92); }
          100% { transform: scaleY(1); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* feet splayed to sides */}
      <line x1="80" y1="148" x2="58" y2="164" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="80" y1="148" x2="102" y2="164" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hip anchor */}
      <circle cx="80" cy="148" r="4" fill="#d4d4d4"/>
      {/* knee joints */}
      <circle cx="65" cy="156" r="4" fill="#d4d4d4"/>
      <circle cx="95" cy="156" r="4" fill="#d4d4d4"/>
      {/* torso lengthening group */}
      <g className="hr-torso">
        <line x1="80" y1="148" x2="80" y2="85" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* shoulder joints */}
        <circle cx="80" cy="110" r="4" fill="#d4d4d4"/>
        {/* arms on thighs */}
        <line x1="80" y1="110" x2="62" y2="122" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="80" y1="110" x2="98" y2="122" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* elbow joints */}
        <circle cx="68" cy="116" r="4" fill="#d4d4d4"/>
        <circle cx="92" cy="116" r="4" fill="#d4d4d4"/>
        {/* head */}
        <circle cx="80" cy="72" r="13" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Day 30 · Recline Big Toe · prefix: rbt
// ─────────────────────────────────────────────
export function ReclineBigToeAnim({ paused = false }: PoseAnimProps) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .rbt-rightleg { animation: none !important; }
        }
        .rbt-rightleg {
          transform-origin: 80px 108px;
          animation: rbt-lift 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes rbt-lift {
          0%   { transform: rotate(70deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* head on floor */}
      <circle cx="80" cy="18" r="13" fill="#d4d4d4"/>
      {/* torso along center */}
      <line x1="80" y1="31" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* shoulders */}
      <line x1="62" y1="40" x2="98" y2="40" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* shoulder joints */}
      <circle cx="65" cy="40" r="4" fill="#d4d4d4"/>
      <circle cx="95" cy="40" r="4" fill="#d4d4d4"/>
      {/* hip joint */}
      <circle cx="80" cy="108" r="4" fill="#d4d4d4"/>
      {/* left leg flat on floor */}
      <line x1="80" y1="108" x2="80" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* left knee joint */}
      <circle cx="80" cy="138" r="4" fill="#d4d4d4"/>
      {/* left arm at side */}
      <line x1="65" y1="40" x2="55" y2="90" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* left elbow joint */}
      <circle cx="58" cy="65" r="4" fill="#d4d4d4"/>
      {/* right leg group — lifts to vertical */}
      <g className="rbt-rightleg">
        <line x1="80" y1="108" x2="80" y2="32" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* right knee joint */}
        <circle cx="80" cy="70" r="4" fill="#d4d4d4"/>
        {/* right foot at top */}
        <circle cx="80" cy="24" r="4" fill="none" stroke="#d4d4d4" strokeWidth="3"/>
        {/* strap — dashed line from hand to foot */}
        <line x1="80" y1="24" x2="80" y2="34" stroke="#d4d4d4" strokeWidth="2" strokeDasharray="3,3" strokeLinecap="round"/>
      </g>
      {/* right arm holds strap — reaches up */}
      <line x1="95" y1="40" x2="80" y2="34" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* right elbow joint */}
      <circle cx="89" cy="37" r="4" fill="#d4d4d4"/>
    </svg>
  )
}
