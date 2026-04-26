import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function Projects() {
  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-noir-muted">Kanban</div>
          <div className="text-[18px] uppercase tracking-wide text-noir-white">Projects</div>
        </div>
        <Button variant="primary">New Board</Button>
      </div>

      <Card>
        <div className="text-center py-8 space-y-2">
          <div className="text-[13px] text-noir-accent">No Boards Yet</div>
          <div className="text-[12px] text-noir-muted">Create boards for Work, Creative, Personal, or Courses.</div>
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {['Work', 'Creative', 'Personal', 'Courses'].map(cat => (
              <Badge key={cat} variant="dim">{cat}</Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
