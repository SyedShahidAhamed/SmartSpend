import { Plus } from 'lucide-react'
import { PageHeading, CategoryCard } from '../components/common/Shared'
import { money } from '../utils/currency'

export default function Budgets(p){return <><PageHeading eyebrow="YOUR MONEY, ORGANIZED" title="My budgets" subtitle="A closer look at all your spending categories." action={<button className="btn btn-primary" onClick={()=>p.openCategoryModal(null)}><Plus size={17}/> New category</button>}/><div className="budget-summary-strip"><div><span>Monthly income</span><strong>{money(p.salary)}</strong></div><div><span>Allocated</span><strong>{money(p.allocated)}</strong></div><div><span>Spent</span><strong>{money(p.spent)}</strong></div><div><span>Unallocated</span><strong>{money(p.salary-p.allocated)}</strong></div></div><div className="category-grid budget-categories">{p.categories.map(c=><CategoryCard key={c.id} category={c}/>)}</div></>}
