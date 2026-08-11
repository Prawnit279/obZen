import { OneRmCard } from './OneRmCard'
import { WilksDotsCard } from './WilksDotsCard'
import { FiveThreeOneCard } from './FiveThreeOneCard'

/** Stateless calculators — no reads or writes to Dexie or any store, and they
 *  never change the user's logged program. */
export function StrengthTools() {
  return (
    <div className="space-y-4">
      <OneRmCard />
      <WilksDotsCard />
      <FiveThreeOneCard />
    </div>
  )
}
