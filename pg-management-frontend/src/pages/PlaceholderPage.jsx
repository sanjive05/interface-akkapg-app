import { Construction } from 'lucide-react'
export default function PlaceholderPage({ title, description, phase }) {
  return <section className="placeholder-page"><div className="placeholder-icon"><Construction size={25} /></div><span className="eyebrow">COMING IN PHASE {phase}</span><h1>{title}</h1><p>{description}</p><div className="placeholder-tag">This section will be connected to Excel-backed APIs as we build the next phase.</div></section>
}
