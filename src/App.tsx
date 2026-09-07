import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Workout from '@/pages/Workout'
import DrumStudio from '@/pages/DrumStudio'
import Yoga from '@/pages/Yoga'
import Calendar from '@/pages/Calendar'
import Nutrition from '@/pages/Nutrition'
import Projects from '@/pages/Projects'
import Meetings from '@/pages/Meetings'
import Ayurveda from '@/pages/Ayurveda'
import VedicRemedies from '@/pages/VedicRemedies'
import Settings from '@/pages/Settings'
import More from '@/pages/More'
import SessionDetail from '@/pages/SessionDetail'
import Progress from '@/pages/Progress'
import Tools from '@/pages/Tools'
import FiveThreeOneGuide from '@/pages/FiveThreeOneGuide'
import { SHOW_NUTRITION, SHOW_VEDIC, SHOW_YOGA } from '@/config/features'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/workout/progress" element={<Progress />} />
        <Route path="/workout/tools" element={<Tools />} />
        <Route path="/workout/tools/guide" element={<FiveThreeOneGuide />} />
        <Route path="/workout/session/:id" element={<SessionDetail />} />
        <Route path="/drum" element={<DrumStudio />} />
        {SHOW_YOGA && <Route path="/yoga" element={<Yoga />} />}
        <Route path="/calendar" element={<Calendar />} />
        {SHOW_NUTRITION && <Route path="/nutrition" element={<Nutrition />} />}
        <Route path="/projects" element={<Projects />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/ayurveda" element={<Ayurveda />} />
        {SHOW_VEDIC && <Route path="/vedic" element={<VedicRemedies />} />}
        <Route path="/settings" element={<Settings />} />
        <Route path="/more" element={<More />} />
      </Routes>
    </AppShell>
  )
}
