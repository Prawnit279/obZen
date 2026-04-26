interface PoseSVGProps {
  poseId: string
  size?: number
  drummerRecovery?: boolean
}

const B = { stroke: '#d4d4d4', strokeWidth: 12, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }
const H = { fill: '#d4d4d4' }
const GND = { x1: 5, y1: 165, x2: 155, y2: 165, stroke: '#2a2a2a', strokeWidth: 1.5 }
const A = { stroke: '#555555', strokeWidth: 2, strokeDasharray: '4,3', fill: 'none' }
const AP = { fill: '#555555' }

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const dx = x2 - x1; const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / len; const uy = dy / len
  const px = -uy; const py = ux
  const ax = x2 - ux * 8 + px * 4; const ay = y2 - uy * 8 + py * 4
  const bx = x2 - ux * 8 - px * 4; const by = y2 - uy * 8 - py * 4
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} {...A} />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} {...AP} />
    </>
  )
}

function DownwardDog() {
  return (
    <>
      <line {...GND} />
      {/* Left arm: hand → shoulder */}
      <line x1={28} y1={162} x2={62} y2={80} {...B} />
      {/* Back from shoulder to hip apex */}
      <line x1={62} y1={80} x2={82} y2={36} {...B} />
      {/* Right leg: hip → foot */}
      <line x1={82} y1={36} x2={130} y2={162} {...B} />
      {/* Head hanging near hands */}
      <circle cx={40} cy={106} r={10} {...H} />
      {/* Cue: lift hips up */}
      <Arrow x1={82} y1={46} x2={82} y2={18} />
    </>
  )
}

function WarriorI() {
  return (
    <>
      <line {...GND} />
      {/* Back leg */}
      <line x1={125} y1={162} x2={88} y2={108} {...B} />
      {/* Front leg bent */}
      <line x1={55} y1={162} x2={78} y2={108} {...B} />
      {/* Torso */}
      <line x1={82} y1={108} x2={82} y2={55} {...B} />
      {/* Left arm overhead */}
      <line x1={82} y1={55} x2={68} y2={24} {...B} />
      {/* Right arm overhead */}
      <line x1={82} y1={55} x2={96} y2={24} {...B} />
      {/* Head */}
      <circle cx={82} cy={44} r={10} {...H} />
      {/* Cue: press back heel down */}
      <Arrow x1={125} y1={155} x2={125} y2={172} />
    </>
  )
}

function WarriorII() {
  return (
    <>
      <line {...GND} />
      {/* Front leg bent */}
      <line x1={38} y1={162} x2={62} y2={112} {...B} />
      {/* Back leg straight */}
      <line x1={125} y1={162} x2={95} y2={112} {...B} />
      {/* Torso */}
      <line x1={78} y1={112} x2={78} y2={60} {...B} />
      {/* Front arm */}
      <line x1={78} y1={72} x2={22} y2={72} {...B} />
      {/* Back arm */}
      <line x1={78} y1={72} x2={135} y2={72} {...B} />
      {/* Head (turned toward front hand) */}
      <circle cx={62} cy={52} r={10} {...H} />
      {/* Cue: reach front arm forward */}
      <Arrow x1={22} y1={72} x2={8} y2={72} />
    </>
  )
}

function ChildsPose() {
  return (
    <>
      <line {...GND} />
      {/* Hips/glutes on heels */}
      <ellipse cx={105} cy={150} rx={18} ry={12} fill="#d4d4d4" />
      {/* Torso folded forward, low */}
      <line x1={92} y1={146} x2={45} y2={146} {...B} />
      {/* Arms extended forward along ground */}
      <line x1={50} y1={155} x2={18} y2={155} {...B} />
      {/* Head resting */}
      <circle cx={35} cy={142} r={10} {...H} />
      {/* Cue: breathe into back body */}
      <Arrow x1={65} y1={140} x2={65} y2={125} />
    </>
  )
}

function BridgePose() {
  return (
    <>
      <line {...GND} />
      {/* Head on ground */}
      <circle cx={18} cy={145} r={10} {...H} />
      {/* Shoulders on ground */}
      <line x1={28} y1={150} x2={48} y2={150} {...B} />
      {/* Back arching up */}
      <line x1={42} y1={148} x2={90} y2={88} {...B} />
      {/* Hips at top */}
      <line x1={90} y1={88} x2={110} y2={125} {...B} />
      {/* Shins down to feet */}
      <line x1={110} y1={125} x2={108} y2={160} {...B} />
      {/* Arms along ground */}
      <line x1={38} y1={155} x2={68} y2={158} {...B} />
      {/* Cue: lift hips */}
      <Arrow x1={88} y1={98} x2={88} y2={68} />
    </>
  )
}

function PigeonPose() {
  return (
    <>
      <line {...GND} />
      {/* Front shin horizontal across */}
      <line x1={28} y1={145} x2={82} y2={130} {...B} />
      {/* Front knee */}
      <ellipse cx={28} cy={145} rx={8} ry={8} fill="#d4d4d4" />
      {/* Back leg extended behind */}
      <line x1={72} y1={128} x2={140} y2={158} {...B} />
      {/* Torso upright */}
      <line x1={72} y1={128} x2={68} y2={75} {...B} />
      {/* Head */}
      <circle cx={68} cy={63} r={10} {...H} />
      {/* Arms resting on ground near front shin */}
      <line x1={60} y1={130} x2={32} y2={155} {...B} />
      {/* Cue: square hips forward */}
      <Arrow x1={68} y1={128} x2={55} y2={128} />
    </>
  )
}

function CatCow() {
  return (
    <>
      <line {...GND} />
      {/* Hands */}
      <line x1={28} y1={148} x2={28} y2={162} {...B} strokeWidth={10} />
      {/* Knees */}
      <line x1={118} y1={148} x2={118} y2={162} {...B} strokeWidth={10} />
      {/* Forearms */}
      <line x1={28} y1={148} x2={42} y2={132} {...B} />
      {/* Thighs */}
      <line x1={118} y1={148} x2={100} y2={130} {...B} />
      {/* COW: spine arched (concave, solid) */}
      <path d="M 42 132 Q 70 148 100 130" stroke="#d4d4d4" strokeWidth={12} strokeLinecap="round" fill="none" />
      {/* CAT: spine rounded (convex, dashed) */}
      <path d="M 42 132 Q 70 105 100 130" stroke="#d4d4d4" strokeWidth={8} strokeLinecap="round" strokeDasharray="6,4" fill="none" />
      {/* Cow head (up) */}
      <circle cx={28} cy={118} r={10} {...H} />
      {/* Cat head ghost (down, dim) */}
      <circle cx={28} cy={138} r={8} fill="#555555" />
      {/* Cue: alternate with breath */}
      <Arrow x1={70} y1={100} x2={70} y2={82} />
    </>
  )
}

function LegsUpTheWall() {
  return (
    <>
      <line {...GND} />
      {/* Wall on right */}
      <rect x={140} y={10} width={16} height={155} fill="#2a2a2a" />
      {/* Head on ground */}
      <circle cx={18} cy={145} r={10} {...H} />
      {/* Torso horizontal */}
      <line x1={28} y1={150} x2={95} y2={150} {...B} />
      {/* Legs vertical up wall */}
      <line x1={88} y1={150} x2={88} y2={22} {...B} />
      <line x1={105} y1={150} x2={105} y2={22} {...B} />
      {/* Arms relaxed at sides */}
      <line x1={38} y1={154} x2={60} y2={158} {...B} strokeWidth={8} />
      {/* Cue: legs press gently toward wall */}
      <Arrow x1={96} y1={80} x2={138} y2={80} />
    </>
  )
}

function LowLunge() {
  return (
    <>
      <line {...GND} />
      {/* Back knee on ground */}
      <line x1={130} y1={148} x2={130} y2={162} {...B} strokeWidth={10} />
      {/* Back shin on ground */}
      <line x1={130} y1={162} x2={150} y2={162} {...B} strokeWidth={10} />
      {/* Back thigh */}
      <line x1={130} y1={148} x2={90} y2={115} {...B} />
      {/* Front foot */}
      <line x1={48} y1={158} x2={32} y2={162} {...B} strokeWidth={10} />
      {/* Front shin */}
      <line x1={48} y1={158} x2={55} y2={120} {...B} />
      {/* Torso */}
      <line x1={82} y1={115} x2={80} y2={58} {...B} />
      {/* Head */}
      <circle cx={80} cy={47} r={10} {...H} />
      {/* Left arm down/resting */}
      <line x1={80} y1={75} x2={58} y2={112} {...B} strokeWidth={8} />
      {/* Right arm down/resting */}
      <line x1={80} y1={75} x2={102} y2={112} {...B} strokeWidth={8} />
      {/* Cue: sink hips forward + down */}
      <Arrow x1={82} y1={118} x2={68} y2={135} />
    </>
  )
}

function Cobra() {
  return (
    <>
      <line {...GND} />
      {/* Legs/hips on ground */}
      <line x1={70} y1={158} x2={148} y2={155} {...B} />
      <line x1={85} y1={156} x2={148} y2={162} {...B} strokeWidth={8} />
      {/* Torso lifting */}
      <line x1={68} y1={155} x2={42} y2={112} {...B} />
      {/* Upper back to shoulders */}
      <line x1={42} y1={112} x2={52} y2={96} {...B} />
      {/* Arms bent: elbows to hands on ground */}
      <line x1={42} y1={112} x2={22} y2={128} {...B} />
      <line x1={22} y1={128} x2={18} y2={148} {...B} />
      {/* Head up, lifted */}
      <circle cx={42} cy={84} r={10} {...H} />
      {/* Cue: chest lifts, open heart */}
      <Arrow x1={48} y1={106} x2={32} y2={88} />
    </>
  )
}

function MountainPose() {
  return (
    <>
      <line {...GND} />
      <circle cx={80} cy={22} r={14} {...H} />
      <line x1={80} y1={36} x2={80} y2={108} {...B} />
      <line x1={80} y1={60} x2={56} y2={108} {...B} />
      <line x1={80} y1={60} x2={104} y2={108} {...B} />
      <line x1={76} y1={108} x2={73} y2={162} {...B} />
      <line x1={84} y1={108} x2={87} y2={162} {...B} />
      <Arrow x1={80} y1={18} x2={80} y2={4} />
    </>
  )
}

function PlankPose() {
  return (
    <>
      <line {...GND} />
      <line x1={28} y1={148} x2={28} y2={162} {...B} strokeWidth={10} />
      <line x1={28} y1={148} x2={42} y2={128} {...B} />
      <line x1={42} y1={128} x2={128} y2={125} {...B} />
      <line x1={128} y1={125} x2={146} y2={160} {...B} strokeWidth={10} />
      <circle cx={22} cy={118} r={10} {...H} />
      <Arrow x1={80} y1={128} x2={80} y2={112} />
    </>
  )
}

function HighLunge() {
  return (
    <>
      <line {...GND} />
      <line x1={132} y1={156} x2={148} y2={162} {...B} strokeWidth={10} />
      <line x1={130} y1={154} x2={94} y2={115} {...B} />
      <line x1={46} y1={162} x2={28} y2={162} {...B} strokeWidth={10} />
      <line x1={48} y1={160} x2={54} y2={118} {...B} />
      <line x1={84} y1={115} x2={80} y2={58} {...B} />
      <line x1={80} y1={62} x2={66} y2={22} {...B} />
      <line x1={80} y1={62} x2={94} y2={22} {...B} />
      <circle cx={80} cy={46} r={10} {...H} />
      <Arrow x1={80} y1={54} x2={80} y2={36} />
    </>
  )
}

function ChairPose() {
  return (
    <>
      <line {...GND} />
      <line x1={64} y1={162} x2={46} y2={162} {...B} strokeWidth={10} />
      <line x1={96} y1={162} x2={114} y2={162} {...B} strokeWidth={10} />
      <line x1={64} y1={162} x2={56} y2={128} {...B} />
      <line x1={96} y1={162} x2={104} y2={128} {...B} />
      <line x1={56} y1={128} x2={80} y2={110} {...B} />
      <line x1={104} y1={128} x2={80} y2={110} {...B} />
      <line x1={80} y1={110} x2={74} y2={62} {...B} />
      <line x1={74} y1={70} x2={60} y2={28} {...B} />
      <line x1={74} y1={70} x2={88} y2={28} {...B} />
      <circle cx={74} cy={46} r={10} {...H} />
      <Arrow x1={80} y1={110} x2={80} y2={126} />
    </>
  )
}

function TrianglePose() {
  return (
    <>
      <line {...GND} />
      <line x1={28} y1={158} x2={12} y2={162} {...B} strokeWidth={10} />
      <line x1={30} y1={156} x2={56} y2={118} {...B} />
      <line x1={130} y1={158} x2={148} y2={162} {...B} strokeWidth={10} />
      <line x1={128} y1={156} x2={95} y2={118} {...B} />
      <line x1={76} y1={118} x2={42} y2={96} {...B} />
      <line x1={50} y1={107} x2={32} y2={140} {...B} />
      <line x1={50} y1={107} x2={72} y2={66} {...B} />
      <circle cx={38} cy={84} r={10} {...H} />
      <Arrow x1={72} y1={66} x2={82} y2={46} />
    </>
  )
}

function BoatPose() {
  return (
    <>
      <circle cx={80} cy={148} r={5} fill="#2a2a2a" />
      <line x1={80} y1={145} x2={60} y2={85} {...B} />
      <line x1={80} y1={145} x2={140} y2={100} {...B} />
      <line x1={66} y1={112} x2={128} y2={110} {...B} />
      <line x1={70} y1={118} x2={132} y2={116} {...B} />
      <circle cx={54} cy={74} r={10} {...H} />
      <Arrow x1={60} y1={88} x2={50} y2={70} />
    </>
  )
}

function SupermanPose() {
  return (
    <>
      <line {...GND} />
      <ellipse cx={80} cy={157} rx={20} ry={7} fill="#181818" />
      <line x1={62} y1={148} x2={100} y2={148} {...B} />
      <line x1={62} y1={148} x2={24} y2={136} {...B} />
      <line x1={100} y1={148} x2={142} y2={136} {...B} />
      <circle cx={18} cy={130} r={10} {...H} />
      <Arrow x1={24} y1={136} x2={8} y2={128} />
    </>
  )
}

function SupineTwist() {
  return (
    <>
      <line {...GND} />
      <circle cx={18} cy={145} r={10} {...H} />
      <line x1={28} y1={150} x2={108} y2={150} {...B} />
      <line x1={52} y1={150} x2={30} y2={134} {...B} />
      <line x1={52} y1={150} x2={74} y2={134} {...B} />
      <line x1={106} y1={150} x2={148} y2={155} {...B} />
      <line x1={102} y1={146} x2={78} y2={122} {...B} />
      <Arrow x1={78} y1={122} x2={58} y2={110} />
    </>
  )
}

function CorpsePose() {
  return (
    <>
      <line {...GND} />
      <circle cx={18} cy={147} r={10} {...H} />
      <line x1={28} y1={152} x2={112} y2={150} {...B} />
      <line x1={52} y1={150} x2={38} y2={162} {...B} />
      <line x1={56} y1={150} x2={70} y2={162} {...B} />
      <line x1={110} y1={150} x2={132} y2={162} {...B} />
      <line x1={114} y1={152} x2={148} y2={158} {...B} />
    </>
  )
}

function Chaturanga() {
  return (
    <>
      <line {...GND} />
      <line x1={32} y1={148} x2={32} y2={162} {...B} strokeWidth={10} />
      <line x1={32} y1={148} x2={46} y2={136} {...B} />
      <line x1={46} y1={136} x2={42} y2={150} {...B} />
      <line x1={40} y1={140} x2={128} y2={136} {...B} />
      <line x1={128} y1={136} x2={148} y2={156} {...B} strokeWidth={10} />
      <circle cx={24} cy={136} r={10} {...H} />
      <Arrow x1={46} y1={140} x2={52} y2={130} />
    </>
  )
}

function UpwardDog() {
  return (
    <>
      <line {...GND} />
      <line x1={125} y1={162} x2={148} y2={162} {...B} strokeWidth={10} />
      <line x1={70} y1={154} x2={130} y2={160} {...B} />
      <line x1={66} y1={150} x2={38} y2={100} {...B} />
      <line x1={38} y1={100} x2={22} y2={148} {...B} />
      <line x1={22} y1={148} x2={20} y2={162} {...B} strokeWidth={10} />
      <circle cx={30} cy={88} r={10} {...H} />
      <Arrow x1={38} y1={100} x2={22} y2={80} />
    </>
  )
}

function UpwardSalute() {
  return (
    <>
      <line {...GND} />
      <line x1={74} y1={162} x2={58} y2={162} {...B} strokeWidth={10} />
      <line x1={86} y1={162} x2={102} y2={162} {...B} strokeWidth={10} />
      <line x1={76} y1={162} x2={77} y2={108} {...B} />
      <line x1={84} y1={162} x2={83} y2={108} {...B} />
      <line x1={80} y1={108} x2={80} y2={60} {...B} />
      <line x1={80} y1={66} x2={64} y2={20} {...B} />
      <line x1={80} y1={66} x2={96} y2={20} {...B} />
      <circle cx={80} cy={46} r={10} {...H} />
      <Arrow x1={80} y1={56} x2={80} y2={38} />
    </>
  )
}

const POSE_SVG_MAP: Record<string, () => JSX.Element> = {
  'downward-dog': DownwardDog,
  'warrior-i': WarriorI,
  'warrior-1': WarriorI,
  'warrior-ii': WarriorII,
  'warrior-2': WarriorII,
  'childs-pose': ChildsPose,
  'child-pose': ChildsPose,
  'bridge-pose': BridgePose,
  'pigeon-pose': PigeonPose,
  'cat-cow': CatCow,
  'legs-up-wall': LegsUpTheWall,
  'legs-up-the-wall': LegsUpTheWall,
  'low-lunge': LowLunge,
  'cobra': Cobra,
  'cobra-pose': Cobra,
  'mountain-pose': MountainPose,
  'plank': PlankPose,
  'plank-pose': PlankPose,
  'high-lunge': HighLunge,
  'chair-pose': ChairPose,
  'extended-triangle': TrianglePose,
  'triangle-pose': TrianglePose,
  'boat-pose': BoatPose,
  'superman-pose': SupermanPose,
  'supine-twist': SupineTwist,
  'corpse-pose': CorpsePose,
  'sun-salutation-chaturanga': Chaturanga,
  'chaturanga': Chaturanga,
  'upward-dog': UpwardDog,
  'upward-facing-dog': UpwardDog,
  'upward-salute': UpwardSalute,
}

export function PoseSVG({ poseId, size = 120, drummerRecovery }: PoseSVGProps) {
  const PoseContent = POSE_SVG_MAP[poseId]
  if (!PoseContent) return null

  const scale = size / 160

  return (
    <div className="relative inline-block">
      <svg
        width={size}
        height={Math.round(size * 180 / 160)}
        viewBox="0 0 160 180"
        style={{ display: 'block' }}
      >
        <PoseContent />
      </svg>
      {drummerRecovery && (
        <div
          className="absolute top-0 right-0 w-4 h-4 bg-yellow-700/60 rounded-full flex items-center justify-center"
          title="Drumming recovery pose"
          style={{ transform: `scale(${Math.max(0.7, scale)})`, transformOrigin: 'top right' }}
        >
          <span style={{ fontSize: 8, color: '#f5c842' }}>♩</span>
        </div>
      )}
    </div>
  )
}

export function hasPoseSVG(poseId: string): boolean {
  return poseId in POSE_SVG_MAP
}
