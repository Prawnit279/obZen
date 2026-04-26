import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function Meetings() {
  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-noir-muted">Notes</div>
          <div className="text-[18px] uppercase tracking-wide text-noir-white">Meetings</div>
        </div>
        <Button variant="primary">New Meeting</Button>
      </div>

      <Card>
        <div className="text-center py-8">
          <div className="text-[13px] text-noir-accent">No Meetings</div>
          <div className="text-[12px] text-noir-muted mt-1">Log meetings, agendas, and action items here.</div>
        </div>
      </Card>
    </div>
  )
}
