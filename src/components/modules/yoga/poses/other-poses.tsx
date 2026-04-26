export function UpwardSaluteAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .us-arms { animation: none !important; }
          .us-torso { animation: none !important; }
        }
        .us-arms {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: us-rise 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .us-torso {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: us-chest 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes us-rise {
          0%   { transform: translateY(8px) scaleY(0.92); }
          100% { transform: translateY(0px) scaleY(1); }
        }
        @keyframes us-chest {
          0%   { transform: translateY(2px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* feet */}
      <line x1="68" y1="148" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="92" y1="148" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* torso */}
      <g className="us-torso">
        <line x1="80" y1="35" x2="80" y2="105" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* hips */}
        <line x1="68" y1="105" x2="92" y2="105" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* upper legs */}
        <line x1="68" y1="105" x2="68" y2="148" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="92" y1="105" x2="92" y2="148" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      </g>
      {/* arms raised */}
      <g className="us-arms">
        <line x1="80" y1="55" x2="65" y2="18" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <line x1="80" y1="55" x2="95" y2="18" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* palms */}
        <line x1="65" y1="18" x2="95" y2="18" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round"/>
      </g>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
    </svg>
  )
}

export function ChaturangaAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .ct-body { animation: none !important; }
        }
        .ct-body {
          transform-box: fill-box;
          transform-origin: center;
          animation: ct-hover 2s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes ct-hover {
          0%   { transform: translateY(-2px); }
          100% { transform: translateY(2px); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      <g className="ct-body">
        {/* head */}
        <circle cx="25" cy="118" r="10" fill="#d4d4d4"/>
        {/* neck */}
        <line x1="35" y1="118" x2="42" y2="122" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* body horizontal */}
        <line x1="42" y1="122" x2="130" y2="122" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* left upper arm (elbow bent) */}
        <line x1="52" y1="122" x2="52" y2="135" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* left forearm on floor */}
        <line x1="40" y1="135" x2="64" y2="135" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* right upper arm */}
        <line x1="108" y1="122" x2="108" y2="135" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* right forearm on floor */}
        <line x1="96" y1="135" x2="120" y2="135" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* hips */}
        <line x1="125" y1="122" x2="130" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* feet */}
        <line x1="130" y1="128" x2="138" y2="135" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="132" y1="128" x2="142" y2="135" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

export function UpwardDogAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .ud-chest { animation: none !important; }
        }
        .ud-chest {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: ud-lift 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes ud-lift {
          0%   { transform: translateY(8px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* legs on floor */}
      <line x1="88" y1="148" x2="138" y2="158" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="80" y1="148" x2="130" y2="158" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* arms extended */}
      <line x1="40" y1="148" x2="55" y2="112" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="120" y1="148" x2="105" y2="112" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* lifted chest group */}
      <g className="ud-chest">
        {/* torso */}
        <line x1="55" y1="112" x2="80" y2="95" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="105" y1="112" x2="80" y2="95" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* shoulder line */}
        <line x1="55" y1="112" x2="105" y2="112" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* neck and head */}
        <line x1="80" y1="95" x2="80" y2="82" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="80" cy="72" r="10" fill="#d4d4d4"/>
        {/* hips */}
        <line x1="80" y1="140" x2="88" y2="148" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="80" y1="140" x2="72" y2="148" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="55" y1="112" x2="80" y2="140" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="105" y1="112" x2="80" y2="140" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

export function LegsUpWallAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .luw-legs { animation: none !important; }
        }
        .luw-legs {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: luw-breath 4s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes luw-breath {
          0%   { transform: translateY(-3px); }
          100% { transform: translateY(3px); }
        }
      `}</style>
      {/* wall on right */}
      <line x1="148" y1="10" x2="148" y2="170" stroke="#2a2a2a" strokeWidth="2"/>
      {/* floor */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* head (bottom, lying) */}
      <circle cx="40" cy="160" r="10" fill="#d4d4d4"/>
      {/* torso horizontal */}
      <line x1="40" y1="150" x2="40" y2="100" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* arms at sides */}
      <line x1="40" y1="130" x2="20" y2="148" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="40" y1="130" x2="60" y2="148" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* hips */}
      <line x1="30" y1="100" x2="50" y2="100" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* legs up against wall */}
      <g className="luw-legs">
        <line x1="35" y1="100" x2="80" y2="42" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="45" y1="100" x2="90" y2="42" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* feet touching wall */}
        <line x1="80" y1="42" x2="90" y2="42" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="85" y1="42" x2="148" y2="42" stroke="#d4d4d4" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4"/>
      </g>
    </svg>
  )
}

export function SupineTwistAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .st-knees { animation: none !important; }
        }
        .st-knees {
          transform-box: fill-box;
          transform-origin: top center;
          animation: st-twist 4s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes st-twist {
          0%   { transform: translateX(0px) rotate(0deg); }
          100% { transform: translateX(-8px) rotate(-8deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
      {/* torso vertical (lying) */}
      <line x1="80" y1="35" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* arms in T */}
      <line x1="80" y1="55" x2="20" y2="55" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="80" y1="55" x2="140" y2="55" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* hips */}
      <line x1="68" y1="108" x2="92" y2="108" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* knees falling left */}
      <g className="st-knees">
        <line x1="80" y1="108" x2="52" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="80" y1="108" x2="58" y2="130" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* lower legs */}
        <line x1="52" y1="128" x2="48" y2="152" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="58" y1="130" x2="54" y2="155" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

export function CorpsePoseAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .sa-torso { animation: none !important; }
        }
        .sa-torso {
          transform-box: fill-box;
          transform-origin: center;
          animation: sa-breath 5s ease-in-out infinite;
          animation-play-state: ${ps};
        }
        @keyframes sa-breath {
          0%   { transform: scale(1.0); }
          50%  { transform: scale(1.005); }
          100% { transform: scale(1.0); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* head */}
      <circle cx="80" cy="30" r="13" fill="#d4d4d4"/>
      {/* legs apart */}
      <line x1="68" y1="118" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="92" y1="118" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* arms at sides */}
      <line x1="68" y1="60" x2="50" y2="90" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="92" y1="60" x2="110" y2="90" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* torso group with breath */}
      <g className="sa-torso">
        {/* torso */}
        <line x1="80" y1="45" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* shoulders */}
        <line x1="65" y1="60" x2="95" y2="60" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* hips */}
        <line x1="68" y1="118" x2="92" y2="118" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

export function DolphinPlankAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .dp-body { animation: none !important; }
        }
        .dp-body {
          transform-box: fill-box;
          transform-origin: center;
          animation: dp-hold 2s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes dp-hold {
          0%   { transform: translateY(-2px); }
          100% { transform: translateY(2px); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      <g className="dp-body">
        {/* head */}
        <circle cx="20" cy="120" r="10" fill="#d4d4d4"/>
        {/* neck */}
        <line x1="30" y1="120" x2="38" y2="125" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* body straight */}
        <line x1="38" y1="125" x2="130" y2="125" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* left forearm flat */}
        <line x1="32" y1="138" x2="58" y2="138" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* left upper arm */}
        <line x1="45" y1="125" x2="45" y2="138" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* right forearm flat */}
        <line x1="106" y1="138" x2="132" y2="138" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* right upper arm */}
        <line x1="119" y1="125" x2="119" y2="138" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* hips slight up */}
        <line x1="125" y1="122" x2="132" y2="130" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* feet */}
        <line x1="132" y1="130" x2="140" y2="135" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="134" y1="130" x2="144" y2="135" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

export function ThreeLeggedDownDogAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .tdd-lift { animation: none !important; }
        }
        .tdd-lift {
          transform-box: fill-box;
          transform-origin: bottom left;
          animation: tdd-leg-up 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes tdd-leg-up {
          0%   { transform: rotate(20deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* hands on floor */}
      <line x1="35" y1="145" x2="55" y2="145" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="110" y1="145" x2="125" y2="145" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
      {/* arms to hips */}
      <line x1="45" y1="145" x2="80" y2="62" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="118" y1="145" x2="80" y2="62" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* head between arms */}
      <circle cx="80" cy="108" r="10" fill="#d4d4d4"/>
      {/* spine to hips */}
      <line x1="80" y1="62" x2="80" y2="72" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* grounded foot */}
      <line x1="80" y1="62" x2="62" y2="162" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* lifted leg */}
      <g className="tdd-lift">
        <line x1="80" y1="62" x2="145" y2="28" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* foot */}
        <line x1="145" y1="28" x2="150" y2="22" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

export function ArmBalanceSplitAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .abs-ext { animation: none !important; }
        }
        .abs-ext {
          transform-box: fill-box;
          transform-origin: left center;
          animation: abs-extend 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes abs-extend {
          0%   { transform: rotate(-30deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* hands on floor */}
      <line x1="38" y1="140" x2="55" y2="140" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="110" y1="140" x2="125" y2="140" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
      {/* arms bent */}
      <line x1="46" y1="140" x2="52" y2="120" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="118" y1="140" x2="112" y2="120" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* body low */}
      <line x1="52" y1="120" x2="112" y2="120" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* head */}
      <circle cx="38" cy="112" r="10" fill="#d4d4d4"/>
      {/* right knee on upper arm */}
      <line x1="52" y1="120" x2="52" y2="130" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="52" y1="130" x2="60" y2="138" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* left leg extended sideways */}
      <g className="abs-ext">
        <line x1="112" y1="120" x2="150" y2="118" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* foot */}
        <line x1="150" y1="118" x2="155" y2="122" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

export function HandstandAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .hs-feet { animation: none !important; }
        }
        .hs-feet {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: hs-balance 2.5s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes hs-balance {
          0%   { transform: translateX(-2px); }
          100% { transform: translateX(2px); }
        }
      `}</style>
      {/* wall on right */}
      <line x1="148" y1="10" x2="148" y2="170" stroke="#2a2a2a" strokeWidth="2"/>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* hands on floor */}
      <line x1="62" y1="162" x2="72" y2="162" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="88" y1="162" x2="98" y2="162" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
      {/* arms straight up */}
      <line x1="68" y1="162" x2="72" y2="128" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="92" y1="162" x2="88" y2="128" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* shoulders */}
      <line x1="72" y1="128" x2="88" y2="128" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* torso inverted */}
      <line x1="80" y1="128" x2="80" y2="68" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* hips */}
      <line x1="72" y1="68" x2="88" y2="68" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* legs up */}
      <g className="hs-feet">
        <line x1="75" y1="68" x2="75" y2="18" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="85" y1="68" x2="85" y2="18" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* feet at wall */}
        <line x1="75" y1="18" x2="85" y2="18" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
      {/* head (inverted, near hands) */}
      <circle cx="80" cy="148" r="10" fill="#d4d4d4"/>
    </svg>
  )
}

export function WristForearmStretchAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .wf-hand { animation: none !important; }
        }
        .wf-hand {
          transform-box: fill-box;
          transform-origin: left center;
          animation: wf-press 2.5s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes wf-press {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(-20deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* standing legs */}
      <line x1="72" y1="118" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="88" y1="118" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* torso */}
      <line x1="80" y1="35" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
      {/* shoulder line */}
      <line x1="65" y1="58" x2="95" y2="58" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* left arm (pressing hand) */}
      <line x1="65" y1="58" x2="88" y2="80" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* right arm extended forward */}
      <line x1="95" y1="58" x2="118" y2="80" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* right wrist/hand with flex animation */}
      <g className="wf-hand">
        <line x1="118" y1="80" x2="128" y2="70" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="128" y1="70" x2="132" y2="62" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round"/>
      </g>
      {/* left hand pressing right wrist */}
      <line x1="88" y1="80" x2="108" y2="75" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

export function NeckRollsAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .nr-head { animation: none !important; }
        }
        .nr-head {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: nr-roll 6s linear infinite;
          animation-play-state: ${ps};
        }
        @keyframes nr-roll {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* legs */}
      <line x1="72" y1="118" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="88" y1="118" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* torso */}
      <line x1="80" y1="48" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* hips */}
      <line x1="72" y1="118" x2="88" y2="118" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* shoulders */}
      <line x1="62" y1="65" x2="98" y2="65" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* arms */}
      <line x1="62" y1="65" x2="55" y2="105" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="98" y1="65" x2="105" y2="105" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* rolling head */}
      <g className="nr-head">
        <line x1="80" y1="48" x2="80" y2="38" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="80" cy="25" r="13" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

export function ThoracicRotationAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .tr-upper { animation: none !important; }
        }
        .tr-upper {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: tr-rotate 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes tr-rotate {
          0%   { transform: rotate(-25deg); }
          100% { transform: rotate(25deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* kneeling lower body */}
      {/* shins on floor */}
      <line x1="62" y1="138" x2="62" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="98" y1="138" x2="98" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* thighs */}
      <line x1="62" y1="138" x2="72" y2="112" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="98" y1="138" x2="88" y2="112" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* hips */}
      <line x1="72" y1="112" x2="88" y2="112" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* rotating upper torso */}
      <g className="tr-upper">
        <line x1="80" y1="112" x2="80" y2="58" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* shoulders */}
        <line x1="60" y1="75" x2="100" y2="75" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* arms */}
        <line x1="60" y1="75" x2="45" y2="105" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <line x1="100" y1="75" x2="115" y2="105" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* neck and head */}
        <line x1="80" y1="58" x2="80" y2="48" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="80" cy="35" r="13" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

export function ShoulderCirclesAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .sc-arm { animation: none !important; }
        }
        .sc-arm {
          transform-box: fill-box;
          transform-origin: 95px 65px;
          animation: sc-circle 3s linear infinite;
          animation-play-state: ${ps};
        }
        @keyframes sc-circle {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* legs */}
      <line x1="72" y1="118" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="88" y1="118" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* torso */}
      <line x1="80" y1="35" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* hips */}
      <line x1="72" y1="118" x2="88" y2="118" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
      {/* left arm static */}
      <line x1="65" y1="65" x2="50" y2="98" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* right circling arm */}
      <g className="sc-arm">
        <line x1="95" y1="65" x2="118" y2="88" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* hand */}
        <circle cx="120" cy="90" r="4" fill="#d4d4d4"/>
      </g>
      {/* shoulder line */}
      <line x1="65" y1="65" x2="95" y2="65" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  )
}

export function HipFlexorStretchAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .hf-hips { animation: none !important; }
        }
        .hf-hips {
          transform-box: fill-box;
          transform-origin: center top;
          animation: hf-sink 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes hf-sink {
          0%   { transform: translateY(0px); }
          100% { transform: translateY(8px); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* back knee on floor */}
      <line x1="112" y1="148" x2="130" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* front foot */}
      <line x1="40" y1="138" x2="40" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* front lower leg */}
      <line x1="40" y1="138" x2="52" y2="108" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* hips sinking group */}
      <g className="hf-hips">
        {/* hips */}
        <line x1="52" y1="108" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* back thigh */}
        <line x1="80" y1="108" x2="112" y2="148" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* torso */}
        <line x1="66" y1="108" x2="70" y2="52" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* shoulders */}
        <line x1="55" y1="68" x2="85" y2="68" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* arms raised for balance */}
        <line x1="55" y1="68" x2="42" y2="42" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <line x1="85" y1="68" x2="98" y2="42" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        {/* neck and head */}
        <line x1="70" y1="52" x2="70" y2="42" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="70" cy="29" r="13" fill="#d4d4d4"/>
      </g>
    </svg>
  )
}

export function LegSwingsAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .ls-leg { animation: none !important; }
        }
        .ls-leg {
          transform-box: fill-box;
          transform-origin: 80px 108px;
          animation: ls-swing 2s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes ls-swing {
          0%   { transform: rotate(-30deg); }
          100% { transform: rotate(20deg); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* standing right leg */}
      <line x1="85" y1="108" x2="88" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* torso */}
      <line x1="80" y1="35" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* hips */}
      <line x1="75" y1="108" x2="88" y2="108" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
      {/* shoulders */}
      <line x1="65" y1="62" x2="95" y2="62" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* arms for balance */}
      <line x1="65" y1="62" x2="48" y2="95" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="95" y1="62" x2="112" y2="95" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* swinging left leg */}
      <g className="ls-leg">
        <line x1="75" y1="108" x2="68" y2="158" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
        {/* foot */}
        <line x1="68" y1="158" x2="60" y2="165" stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

export function BandPullApartAnim({ paused = false }: { paused?: boolean }) {
  const ps = paused ? 'paused' : 'running'
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .bpa-left { animation: none !important; }
          .bpa-right { animation: none !important; }
          .bpa-band { animation: none !important; }
        }
        .bpa-left {
          transform-box: fill-box;
          transform-origin: right center;
          animation: bpa-pull-left 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .bpa-right {
          transform-box: fill-box;
          transform-origin: left center;
          animation: bpa-pull-right 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .bpa-band {
          transform-box: fill-box;
          transform-origin: center;
          animation: bpa-stretch 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        @keyframes bpa-pull-left {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(-45deg); }
        }
        @keyframes bpa-pull-right {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(45deg); }
        }
        @keyframes bpa-stretch {
          0%   { transform: scaleX(1); }
          100% { transform: scaleX(1.4); }
        }
      `}</style>
      {/* ground */}
      <line x1="10" y1="170" x2="150" y2="170" stroke="#2a2a2a" strokeWidth="1.5"/>
      {/* legs */}
      <line x1="72" y1="118" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="88" y1="118" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* hips */}
      <line x1="72" y1="118" x2="88" y2="118" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* torso */}
      <line x1="80" y1="35" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
      {/* shoulders */}
      <line x1="65" y1="62" x2="95" y2="62" stroke="#d4d4d4" strokeWidth="3.5" strokeLinecap="round"/>
      {/* left arm pulling apart */}
      <g className="bpa-left">
        <line x1="65" y1="88" x2="55" y2="88" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      </g>
      {/* right arm pulling apart */}
      <g className="bpa-right">
        <line x1="95" y1="88" x2="105" y2="88" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      </g>
      <g className="bpa-band">
        <line x1="55" y1="88" x2="105" y2="88" stroke="#d4d4d4" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 3"/>
      </g>
      <line x1="65" y1="62" x2="65" y2="88" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="95" y1="62" x2="95" y2="88" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}
