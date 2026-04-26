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

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/drum" element={<DrumStudio />} />
        <Route path="/yoga" element={<Yoga />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/ayurveda" element={<Ayurveda />} />
        <Route path="/vedic" element={<VedicRemedies />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/more" element={<More />} />
      </Routes>
    </AppShell>
  )
}
