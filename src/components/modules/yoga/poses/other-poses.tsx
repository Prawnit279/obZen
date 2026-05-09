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
          transform-origin: 80px 55px;
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
      <line x1="68" y1="148" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      <line x1="92" y1="148" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* torso */}
      <g className="us-torso">
        {/* torso spine */}
        <line x1="80" y1="55" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* hips */}
        <line x1="68" y1="108" x2="92" y2="108" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* hip joint dots */}
        <circle cx="68" cy="108" r="4" fill="#d4d4d4"/>
        <circle cx="92" cy="108" r="4" fill="#d4d4d4"/>
        {/* upper legs */}
        <line x1="68" y1="108" x2="68" y2="148" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        <line x1="92" y1="108" x2="92" y2="148" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      </g>
      {/* arms raised */}
      <g className="us-arms">
        {/* shoulder joint dots */}
        <circle cx="68" cy="62" r="4" fill="#d4d4d4"/>
        <circle cx="92" cy="62" r="4" fill="#d4d4d4"/>
        <line x1="80" y1="55" x2="63" y2="16" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="80" y1="55" x2="97" y2="16" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* palms */}
        <line x1="63" y1="16" x2="97" y2="16" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      </g>
      {/* shoulder bar */}
      <line x1="68" y1="62" x2="92" y2="62" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* head */}
      <circle cx="80" cy="42" r="13" fill="#d4d4d4"/>
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
        <circle cx="25" cy="116" r="11" fill="#d4d4d4"/>
        {/* neck */}
        <line x1="36" y1="116" x2="44" y2="120" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* body horizontal */}
        <line x1="44" y1="120" x2="132" y2="120" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* left elbow joint dot */}
        <circle cx="52" cy="120" r="4" fill="#d4d4d4"/>
        {/* left upper arm (elbow bent) */}
        <line x1="52" y1="120" x2="52" y2="134" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* left forearm on floor */}
        <line x1="38" y1="134" x2="66" y2="134" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* right elbow joint dot */}
        <circle cx="110" cy="120" r="4" fill="#d4d4d4"/>
        {/* right upper arm */}
        <line x1="110" y1="120" x2="110" y2="134" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* right forearm on floor */}
        <line x1="96" y1="134" x2="124" y2="134" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* hip joint dot */}
        <circle cx="128" cy="120" r="4" fill="#d4d4d4"/>
        {/* hips to feet */}
        <line x1="128" y1="120" x2="134" y2="128" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* feet */}
        <line x1="134" y1="128" x2="140" y2="136" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="136" y1="128" x2="144" y2="136" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
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
      <line x1="88" y1="148" x2="138" y2="160" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="80" y1="148" x2="130" y2="160" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* arms extended */}
      <line x1="40" y1="148" x2="55" y2="112" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="120" y1="148" x2="105" y2="112" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* wrist joint dots */}
      <circle cx="40" cy="148" r="4" fill="#d4d4d4"/>
      <circle cx="120" cy="148" r="4" fill="#d4d4d4"/>
      {/* lifted chest group */}
      <g className="ud-chest">
        {/* shoulder joint dots */}
        <circle cx="55" cy="112" r="4" fill="#d4d4d4"/>
        <circle cx="105" cy="112" r="4" fill="#d4d4d4"/>
        {/* torso left */}
        <line x1="55" y1="112" x2="80" y2="93" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* torso right */}
        <line x1="105" y1="112" x2="80" y2="93" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* shoulder line */}
        <line x1="55" y1="112" x2="105" y2="112" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* neck and head */}
        <line x1="80" y1="93" x2="80" y2="80" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="80" cy="69" r="11" fill="#d4d4d4"/>
        {/* hip joint dot */}
        <circle cx="80" cy="140" r="4" fill="#d4d4d4"/>
        {/* lower torso */}
        <line x1="55" y1="112" x2="80" y2="140" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        <line x1="105" y1="112" x2="80" y2="140" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* hips to top of legs */}
        <line x1="80" y1="140" x2="88" y2="148" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        <line x1="80" y1="140" x2="72" y2="148" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
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
          transform-origin: center bottom;
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
      {/* head (lying, left side) */}
      <circle cx="35" cy="160" r="11" fill="#d4d4d4"/>
      {/* torso horizontal (lying) */}
      <line x1="35" y1="150" x2="35" y2="100" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* shoulder joint dots */}
      <circle cx="28" cy="132" r="4" fill="#d4d4d4"/>
      <circle cx="48" cy="128" r="4" fill="#d4d4d4"/>
      {/* arms at sides */}
      <line x1="35" y1="130" x2="16" y2="150" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="35" y1="130" x2="58" y2="148" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hips */}
      <line x1="25" y1="100" x2="48" y2="100" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hip joint dots */}
      <circle cx="32" cy="100" r="4" fill="#d4d4d4"/>
      <circle cx="42" cy="100" r="4" fill="#d4d4d4"/>
      {/* legs up against wall */}
      <g className="luw-legs">
        <line x1="32" y1="100" x2="82" y2="38" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        <line x1="42" y1="100" x2="92" y2="38" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* feet touching wall */}
        <line x1="82" y1="38" x2="92" y2="38" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="87" y1="38" x2="148" y2="38" stroke="#d4d4d4" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4"/>
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
          transform-origin: 80px 108px;
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
      <line x1="80" y1="35" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* shoulder joint dots */}
      <circle cx="20" cy="57" r="4" fill="#d4d4d4"/>
      <circle cx="140" cy="57" r="4" fill="#d4d4d4"/>
      {/* arms in T */}
      <line x1="80" y1="57" x2="20" y2="57" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="80" y1="57" x2="140" y2="57" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hips */}
      <line x1="68" y1="108" x2="92" y2="108" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hip joint dots */}
      <circle cx="68" cy="108" r="4" fill="#d4d4d4"/>
      <circle cx="92" cy="108" r="4" fill="#d4d4d4"/>
      {/* knees falling left */}
      <g className="st-knees">
        {/* upper legs */}
        <line x1="80" y1="108" x2="52" y2="128" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        <line x1="80" y1="108" x2="58" y2="130" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* knee joint dots */}
        <circle cx="52" cy="128" r="4" fill="#d4d4d4"/>
        <circle cx="58" cy="130" r="4" fill="#d4d4d4"/>
        {/* lower legs */}
        <line x1="52" y1="128" x2="48" y2="154" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="58" y1="130" x2="54" y2="156" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
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
      <line x1="68" y1="118" x2="64" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="92" y1="118" x2="96" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* elbow joint dots */}
      <circle cx="50" cy="90" r="4" fill="#d4d4d4"/>
      <circle cx="110" cy="90" r="4" fill="#d4d4d4"/>
      {/* arms at sides */}
      <line x1="65" y1="60" x2="42" y2="95" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="95" y1="60" x2="118" y2="95" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* lower arms */}
      <line x1="42" y1="95" x2="32" y2="118" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      <line x1="118" y1="95" x2="128" y2="118" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* torso group with breath */}
      <g className="sa-torso">
        {/* torso spine */}
        <line x1="80" y1="45" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* shoulders */}
        <line x1="65" y1="60" x2="95" y2="60" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* shoulder joint dots */}
        <circle cx="65" cy="60" r="4" fill="#d4d4d4"/>
        <circle cx="95" cy="60" r="4" fill="#d4d4d4"/>
        {/* hips */}
        <line x1="68" y1="118" x2="92" y2="118" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* hip joint dots */}
        <circle cx="68" cy="118" r="4" fill="#d4d4d4"/>
        <circle cx="92" cy="118" r="4" fill="#d4d4d4"/>
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
        <circle cx="20" cy="118" r="11" fill="#d4d4d4"/>
        {/* neck */}
        <line x1="31" y1="118" x2="40" y2="123" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* body straight */}
        <line x1="40" y1="123" x2="132" y2="123" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* left elbow joint dot */}
        <circle cx="45" cy="123" r="4" fill="#d4d4d4"/>
        {/* left upper arm */}
        <line x1="45" y1="123" x2="45" y2="137" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* left forearm flat */}
        <line x1="30" y1="137" x2="60" y2="137" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* right elbow joint dot */}
        <circle cx="120" cy="123" r="4" fill="#d4d4d4"/>
        {/* right upper arm */}
        <line x1="120" y1="123" x2="120" y2="137" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* right forearm flat */}
        <line x1="105" y1="137" x2="135" y2="137" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* hip joint dot */}
        <circle cx="128" cy="121" r="4" fill="#d4d4d4"/>
        {/* hips slight up */}
        <line x1="128" y1="121" x2="135" y2="130" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* feet */}
        <line x1="135" y1="130" x2="142" y2="137" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="137" y1="130" x2="146" y2="136" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
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
          transform-origin: 80px 62px;
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
      <line x1="33" y1="146" x2="57" y2="146" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="108" y1="146" x2="128" y2="146" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* wrist joint dots */}
      <circle cx="45" cy="146" r="4" fill="#d4d4d4"/>
      <circle cx="118" cy="146" r="4" fill="#d4d4d4"/>
      {/* arms to apex */}
      <line x1="45" y1="146" x2="80" y2="62" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="118" y1="146" x2="80" y2="62" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* apex/shoulder dot */}
      <circle cx="80" cy="62" r="4" fill="#d4d4d4"/>
      {/* head between arms */}
      <circle cx="80" cy="106" r="11" fill="#d4d4d4"/>
      {/* grounded foot */}
      <line x1="80" y1="62" x2="60" y2="163" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* lifted leg */}
      <g className="tdd-lift">
        <line x1="80" y1="62" x2="146" y2="26" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* foot */}
        <line x1="146" y1="26" x2="152" y2="19" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
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
          transform-origin: 112px 120px;
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
      <line x1="36" y1="140" x2="57" y2="140" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="108" y1="140" x2="128" y2="140" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* wrist joint dots */}
      <circle cx="46" cy="140" r="4" fill="#d4d4d4"/>
      <circle cx="118" cy="140" r="4" fill="#d4d4d4"/>
      {/* arms bent */}
      <line x1="46" y1="140" x2="52" y2="120" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="118" y1="140" x2="112" y2="120" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* elbow/shoulder joint dots */}
      <circle cx="52" cy="120" r="4" fill="#d4d4d4"/>
      <circle cx="112" cy="120" r="4" fill="#d4d4d4"/>
      {/* body low */}
      <line x1="52" y1="120" x2="112" y2="120" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* head */}
      <circle cx="36" cy="110" r="11" fill="#d4d4d4"/>
      {/* right knee on upper arm */}
      <line x1="52" y1="120" x2="52" y2="132" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* knee joint dot */}
      <circle cx="52" cy="132" r="4" fill="#d4d4d4"/>
      <line x1="52" y1="132" x2="62" y2="140" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* left leg extended sideways */}
      <g className="abs-ext">
        <line x1="112" y1="120" x2="151" y2="118" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* foot */}
        <line x1="151" y1="118" x2="156" y2="123" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
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
      <line x1="60" y1="163" x2="74" y2="163" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      <line x1="86" y1="163" x2="100" y2="163" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      {/* wrist joint dots */}
      <circle cx="68" cy="163" r="4" fill="#d4d4d4"/>
      <circle cx="92" cy="163" r="4" fill="#d4d4d4"/>
      {/* arms straight up */}
      <line x1="68" y1="163" x2="72" y2="128" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="92" y1="163" x2="88" y2="128" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* shoulder joint dots */}
      <circle cx="72" cy="128" r="4" fill="#d4d4d4"/>
      <circle cx="88" cy="128" r="4" fill="#d4d4d4"/>
      {/* shoulders */}
      <line x1="72" y1="128" x2="88" y2="128" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* torso inverted */}
      <line x1="80" y1="128" x2="80" y2="68" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* hip joint dots */}
      <circle cx="72" cy="68" r="4" fill="#d4d4d4"/>
      <circle cx="88" cy="68" r="4" fill="#d4d4d4"/>
      {/* hips */}
      <line x1="72" y1="68" x2="88" y2="68" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* legs up */}
      <g className="hs-feet">
        <line x1="75" y1="68" x2="75" y2="16" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        <line x1="85" y1="68" x2="85" y2="16" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* feet at wall */}
        <line x1="75" y1="16" x2="85" y2="16" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      </g>
      {/* head (inverted, near hands) */}
      <circle cx="80" cy="146" r="11" fill="#d4d4d4"/>
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
          transform-origin: 118px 80px;
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
      <line x1="72" y1="118" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="88" y1="118" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hip joint dots */}
      <circle cx="72" cy="118" r="4" fill="#d4d4d4"/>
      <circle cx="88" cy="118" r="4" fill="#d4d4d4"/>
      {/* torso */}
      <line x1="80" y1="35" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
      {/* shoulder joint dots */}
      <circle cx="65" cy="58" r="4" fill="#d4d4d4"/>
      <circle cx="95" cy="58" r="4" fill="#d4d4d4"/>
      {/* shoulder line */}
      <line x1="65" y1="58" x2="95" y2="58" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* elbow joint dots */}
      <circle cx="88" cy="80" r="4" fill="#d4d4d4"/>
      <circle cx="118" cy="80" r="4" fill="#d4d4d4"/>
      {/* left arm (pressing hand) */}
      <line x1="65" y1="58" x2="88" y2="80" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* right arm extended forward */}
      <line x1="95" y1="58" x2="118" y2="80" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* right wrist/hand with flex animation */}
      <g className="wf-hand">
        <line x1="118" y1="80" x2="130" y2="68" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="130" y1="68" x2="134" y2="58" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
      </g>
      {/* left hand pressing right wrist */}
      <line x1="88" y1="80" x2="110" y2="74" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
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
          transform-origin: 80px 48px;
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
      <line x1="72" y1="118" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="88" y1="118" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hip joint dots */}
      <circle cx="72" cy="118" r="4" fill="#d4d4d4"/>
      <circle cx="88" cy="118" r="4" fill="#d4d4d4"/>
      {/* torso */}
      <line x1="80" y1="48" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* hips */}
      <line x1="72" y1="118" x2="88" y2="118" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* shoulder joint dots */}
      <circle cx="62" cy="65" r="4" fill="#d4d4d4"/>
      <circle cx="98" cy="65" r="4" fill="#d4d4d4"/>
      {/* shoulders */}
      <line x1="62" y1="65" x2="98" y2="65" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* elbow joint dots */}
      <circle cx="55" cy="105" r="4" fill="#d4d4d4"/>
      <circle cx="105" cy="105" r="4" fill="#d4d4d4"/>
      {/* arms */}
      <line x1="62" y1="65" x2="55" y2="105" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="98" y1="65" x2="105" y2="105" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* rolling head */}
      <g className="nr-head">
        <line x1="80" y1="48" x2="80" y2="36" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="80" cy="23" r="13" fill="#d4d4d4"/>
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
          transform-origin: 80px 112px;
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
      <line x1="62" y1="138" x2="62" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="98" y1="138" x2="98" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* knee joint dots */}
      <circle cx="62" cy="138" r="4" fill="#d4d4d4"/>
      <circle cx="98" cy="138" r="4" fill="#d4d4d4"/>
      {/* thighs */}
      <line x1="62" y1="138" x2="72" y2="112" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="98" y1="138" x2="88" y2="112" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hip joint dots */}
      <circle cx="72" cy="112" r="4" fill="#d4d4d4"/>
      <circle cx="88" cy="112" r="4" fill="#d4d4d4"/>
      {/* hips */}
      <line x1="72" y1="112" x2="88" y2="112" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* rotating upper torso */}
      <g className="tr-upper">
        <line x1="80" y1="112" x2="80" y2="58" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* shoulder joint dots */}
        <circle cx="60" cy="75" r="4" fill="#d4d4d4"/>
        <circle cx="100" cy="75" r="4" fill="#d4d4d4"/>
        {/* shoulders */}
        <line x1="60" y1="75" x2="100" y2="75" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* elbow joint dots */}
        <circle cx="45" cy="105" r="4" fill="#d4d4d4"/>
        <circle cx="115" cy="105" r="4" fill="#d4d4d4"/>
        {/* arms */}
        <line x1="60" y1="75" x2="45" y2="105" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        <line x1="100" y1="75" x2="115" y2="105" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* neck and head */}
        <line x1="80" y1="58" x2="80" y2="46" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="80" cy="33" r="13" fill="#d4d4d4"/>
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
      <line x1="72" y1="118" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="88" y1="118" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hip joint dots */}
      <circle cx="72" cy="118" r="4" fill="#d4d4d4"/>
      <circle cx="88" cy="118" r="4" fill="#d4d4d4"/>
      {/* hips */}
      <line x1="72" y1="118" x2="88" y2="118" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* torso */}
      <line x1="80" y1="35" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
      {/* shoulder joint dots */}
      <circle cx="65" cy="65" r="4" fill="#d4d4d4"/>
      <circle cx="95" cy="65" r="4" fill="#d4d4d4"/>
      {/* shoulder line */}
      <line x1="65" y1="65" x2="95" y2="65" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* left arm static */}
      <line x1="65" y1="65" x2="48" y2="100" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* right circling arm */}
      <g className="sc-arm">
        <line x1="95" y1="65" x2="120" y2="90" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* hand dot */}
        <circle cx="122" cy="92" r="4" fill="#d4d4d4"/>
      </g>
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
      <circle cx="112" cy="148" r="4" fill="#d4d4d4"/>
      <line x1="112" y1="148" x2="130" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* front foot + shin */}
      <line x1="40" y1="138" x2="40" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="40" cy="138" r="4" fill="#d4d4d4"/>
      <line x1="40" y1="138" x2="52" y2="108" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hips sinking group */}
      <g className="hf-hips">
        {/* hip joint dots */}
        <circle cx="52" cy="108" r="4" fill="#d4d4d4"/>
        <circle cx="80" cy="108" r="4" fill="#d4d4d4"/>
        {/* hips */}
        <line x1="52" y1="108" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* back thigh */}
        <line x1="80" y1="108" x2="112" y2="148" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* torso */}
        <line x1="66" y1="108" x2="70" y2="52" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
        {/* shoulder joint dots */}
        <circle cx="55" cy="68" r="4" fill="#d4d4d4"/>
        <circle cx="85" cy="68" r="4" fill="#d4d4d4"/>
        {/* shoulders */}
        <line x1="55" y1="68" x2="85" y2="68" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* arms raised for balance */}
        <line x1="55" y1="68" x2="42" y2="42" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        <line x1="85" y1="68" x2="98" y2="42" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
        {/* neck and head */}
        <line x1="70" y1="52" x2="70" y2="42" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
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
      <line x1="85" y1="108" x2="88" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* torso */}
      <line x1="80" y1="35" x2="80" y2="108" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* hip joint dots */}
      <circle cx="75" cy="108" r="4" fill="#d4d4d4"/>
      <circle cx="88" cy="108" r="4" fill="#d4d4d4"/>
      {/* hips */}
      <line x1="75" y1="108" x2="88" y2="108" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
      {/* shoulder joint dots */}
      <circle cx="65" cy="62" r="4" fill="#d4d4d4"/>
      <circle cx="95" cy="62" r="4" fill="#d4d4d4"/>
      {/* shoulders */}
      <line x1="65" y1="62" x2="95" y2="62" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* arms for balance */}
      <line x1="65" y1="62" x2="48" y2="95" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      <line x1="95" y1="62" x2="112" y2="95" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      {/* swinging left leg */}
      <g className="ls-leg">
        <line x1="75" y1="108" x2="68" y2="158" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
        {/* foot */}
        <line x1="68" y1="158" x2="60" y2="165" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round"/>
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
          transform-origin: 65px 88px;
          animation: bpa-pull-left 3s ease-in-out infinite alternate;
          animation-play-state: ${ps};
        }
        .bpa-right {
          transform-origin: 95px 88px;
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
      <line x1="72" y1="118" x2="68" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="88" y1="118" x2="92" y2="168" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* hip joint dots */}
      <circle cx="72" cy="118" r="4" fill="#d4d4d4"/>
      <circle cx="88" cy="118" r="4" fill="#d4d4d4"/>
      {/* hips */}
      <line x1="72" y1="118" x2="88" y2="118" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* torso */}
      <line x1="80" y1="35" x2="80" y2="118" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round"/>
      {/* head */}
      <circle cx="80" cy="22" r="13" fill="#d4d4d4"/>
      {/* shoulder joint dots */}
      <circle cx="65" cy="62" r="4" fill="#d4d4d4"/>
      <circle cx="95" cy="62" r="4" fill="#d4d4d4"/>
      {/* shoulders */}
      <line x1="65" y1="62" x2="95" y2="62" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* upper arms down to elbows */}
      <line x1="65" y1="62" x2="65" y2="88" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      <line x1="95" y1="62" x2="95" y2="88" stroke="#d4d4d4" strokeWidth="5" strokeLinecap="round"/>
      {/* elbow joint dots */}
      <circle cx="65" cy="88" r="4" fill="#d4d4d4"/>
      <circle cx="95" cy="88" r="4" fill="#d4d4d4"/>
      {/* left forearm pulling apart */}
      <g className="bpa-left">
        <line x1="65" y1="88" x2="48" y2="88" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      </g>
      {/* right forearm pulling apart */}
      <g className="bpa-right">
        <line x1="95" y1="88" x2="112" y2="88" stroke="#d4d4d4" strokeWidth="4" strokeLinecap="round"/>
      </g>
      {/* resistance band */}
      <g className="bpa-band">
        <line x1="48" y1="88" x2="112" y2="88" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 3"/>
      </g>
    </svg>
  )
}
