import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, Wallet, ArrowLeftRight, ChartNoAxesCombined, Settings, LogOut, Menu, Bell, Search, Plus, ArrowUpRight, ChevronRight, CheckCircle2, X, CircleHelp, ReceiptText } from 'lucide-react'
import CategoryModal from './components/modals/CategoryModal'
import HelpModal from './components/modals/HelpModal'
import { auth } from './firebase'
import { loadUserData, saveUserData } from './services/firestoreService'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Dashboard from './pages/Dashboard'
import Budgets from './pages/Budgets'
import CategoryDetails from './pages/CategoryDetails'
import Transactions from './pages/Transactions'
import Analytics from './pages/Analytics'
import Receipts from './pages/Receipts'
import SettingsPage from './pages/SettingsPage'
import Login from './pages/Login'

const nav = [
  {label:'Overview',to:'/',icon:LayoutDashboard},
  {label:'My budgets',to:'/budgets',icon:Wallet},
  {label:'Transactions',to:'/transactions',icon:ArrowLeftRight},
  {label:'Analytics',to:'/analytics',icon:ChartNoAxesCombined},
  {label:'Daily receipts',to:'/receipts',icon:ReceiptText},
  {label:'Settings',to:'/settings',icon:Settings},
]

function App(){
const [categories,setCategories]=useState([])
  const [transactions,setTransactions]=useState([])
  const [salary,setSalary]=useState(0)
  const [user,setUser]=useState(null)
  const [authLoading,setAuthLoading]=useState(true)
  const [dataReady,setDataReady]=useState(false)
  const [dataError,setDataError]=useState('')
  const [mobileOpen,setMobileOpen]=useState(false)
  const [toast,setToast]=useState('')
  const [categoryModal,setCategoryModal]=useState(null)
  const [helpOpen,setHelpOpen]=useState(false)
  useEffect(() => {
    let active = true
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (!active) return
      setDataError('')
      if (!firebaseUser) {
        setUser(null)
        setDataReady(false)
        setCategories([])
        setTransactions([])
        setSalary(0)
        setAuthLoading(false)
        return
      }

      setAuthLoading(true)
      setDataReady(false)
      const currentUser = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || ''
      }
      try {
        const data = await loadUserData(firebaseUser)
        if (!active) return
        setUser(currentUser)
        setCategories(data.categories)
        setTransactions(data.transactions)
        setSalary(data.salary)
        setDataReady(true)
      } catch (error) {
        console.error('Failed to load SmartSpend data:', error)
        if (active) {
          setUser(currentUser)
          setCategories([])
          setTransactions([])
          setSalary(0)
          setDataError('We could not load your saved data. Check your Firestore rules and internet connection, then refresh.')
        }
      } finally {
        if (active) setAuthLoading(false)
      }
    })
    return () => { active = false; unsubscribe() }
  }, [])
  const location=useLocation(), navigate=useNavigate()
  const spent=categories.reduce((s,c)=>s+c.spent,0)
  const allocated=categories.reduce((s,c)=>s+c.budget,0)
  const remaining=salary-spent
  const notify=msg=>{setToast(msg);setTimeout(()=>setToast(''),2600)}
  useEffect(() => {
    if (!user?.uid || !dataReady) return
    const timer = setTimeout(async () => {
      try {
        await saveUserData({ user, categories, transactions, salary })
        setDataError('')
      } catch (error) {
        console.error('Failed to save SmartSpend data:', error)
        setDataError('Your latest changes could not be saved. Check your Firestore rules and connection.')
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [user?.uid, categories, transactions, salary, dataReady])
  const openCategoryModal = category => setCategoryModal(category ? {...category} : {id:'',name:'',budget:'',spent:0,icon:'🧾',color:'#E8F7F0',desc:''})
  const saveCategory = data => {
    const name=data.name.trim(), budget=Number(data.budget)
    if(!name || !Number.isFinite(budget) || budget < 0){ notify('Enter a valid category name and budget.'); return }
    const existing=categories.find(c=>c.id===data.id)
    const nextTotal=categories.reduce((sum,c)=>sum+(c.id===data.id?budget:c.budget),0)+(existing?0:budget)
    const currentTotal=allocated
    if(nextTotal>salary && nextTotal>currentTotal){ notify('This change exceeds your available monthly income.'); return }
    if(existing){
      setCategories(cs=>cs.map(c=>c.id===data.id?{...c,...data,name,budget}:c))
      notify('Category updated successfully.')
    } else {
      const id=(name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''))+'-'+Date.now().toString(36)
      setCategories(cs=>[...cs,{...data,id,name,budget,spent:0}])
      notify('New category added successfully.')
    }
    setCategoryModal(null)
  }
  const deleteCategory = id => {
    const item=categories.find(c=>c.id===id)
    if(!item)return
    setCategories(cs=>cs.filter(c=>c.id!==id))
    notify('Category removed. Existing transaction records are retained in history.')
    setCategoryModal(null)
  }
  const value={categories,setCategories,transactions,setTransactions,salary,setSalary,user,setUser,spent,allocated,remaining,notify,openCategoryModal}
  const active=nav.find(n=>n.to===location.pathname)?.label || (location.pathname.startsWith('/category')?'My budgets':'Settings')
  if (authLoading) return <div className="login-preview"><p>Loading your SmartSpend data...</p></div>
  if (!user) return <Login />
  const sidebar=<aside className={`sidebar ${mobileOpen?'sidebar-open':''}`}>
    <div className="brand"><div className="brand-mark"><Wallet size={21}/></div><span>smart<span className="brand-green">spend</span></span><button className="mobile-close" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
    <div className="workspace-label">WORKSPACE</div>
    <nav className="nav-list">{nav.map(item=><Link onClick={()=>setMobileOpen(false)} className={`nav-item ${location.pathname===item.to?'nav-active':''}`} to={item.to} key={item.to}><item.icon size={19}/><span>{item.label}</span>{item.label==='Daily receipts'&&<span className="nav-dot"/>}</Link>)}</nav>
    <div className="sidebar-bottom">
      <div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><strong>Need a hand?</strong><p>We're here to help you stay on track.</p><button onClick={()=>setHelpOpen(true)}>Visit help centre <ArrowUpRight size={13}/></button></div>
      <div className="profile-row"><div className="avatar">S</div><div className="profile-meta"><strong>{user.name}</strong><small>{user.email}</small></div><button className="icon-btn tiny" title="Sign out" onClick={async()=>{try{await signOut(auth);navigate('/login')}catch(e){notify(e.message)}}}><LogOut size={18}/></button></div>
    </div>
  </aside>
  return <div className="app-shell">{sidebar}{mobileOpen&&<div className="scrim" onClick={()=>setMobileOpen(false)}/>}<main className="main-area"><header className="topbar"><button className="mobile-menu icon-btn" onClick={()=>setMobileOpen(true)}><Menu/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/><strong>{active}</strong></div><div className="top-actions"><div className="searchbox"><Search size={16}/><input placeholder="Search anything..."/></div><button className="icon-btn notification" onClick={()=>notify('You are all caught up')}><Bell size={19}/><i/></button><div className="top-avatar">S</div></div></header><div className="page-wrap">{dataError&&<div role="alert" className="integration-note" style={{marginBottom:16}}>{dataError}</div>}<Routes><Route path="/" element={<Dashboard {...value}/>}/><Route path="/budgets" element={<Budgets {...value}/>}/><Route path="/category/:id" element={<CategoryDetails {...value}/>}/><Route path="/transactions" element={<Transactions {...value}/>}/><Route path="/analytics" element={<Analytics {...value}/>}/><Route path="/receipts" element={<Receipts {...value}/>}/><Route path="/settings" element={<SettingsPage {...value}/>}/><Route path="/login" element={<Navigate to="/" replace/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></div></main>{categoryModal&&<CategoryModal category={categoryModal} onClose={()=>setCategoryModal(null)} onSave={saveCategory} onDelete={deleteCategory}/>}{helpOpen&&<HelpModal onClose={()=>setHelpOpen(false)}/>}{toast&&<div className="toast"><CheckCircle2 size={18}/>{toast}</div>}</div>
}
export default App