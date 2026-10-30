import {useState,useEffect,Fragment} from 'react'
import {LayoutDashboard,Compass,ListChecks,CalendarDays,Star,Search,LayoutGrid,List,X,Plus,ShieldAlert,ExternalLink,Bell,Sun,Moon,Menu} from 'lucide-react'
import raw from './data.json'
import mascot from './mascot.webp'
import {logoFor} from './logos'
import logo from './logo.webp'

const DAY=864e5,DEF=['Connect wallet','Complete testnet transactions','Bridge assets','Complete quests','Submit feedback']
const t0=()=>{const d=new Date();d.setHours(0,0,0,0);return d}
const at=n=>new Date(t0().getTime()+n*DAY)
const fmt=d=>d.toLocaleDateString('en-US',{day:'numeric',month:'short'})
const same=(a,b)=>a.toDateString()===b.toDateString()
const tone={Confirmed:'text-accent border-accent/30 bg-accent/10',Potential:'text-amber-300 border-amber-300/30 bg-amber-400/10',Unverified:'text-red-400 border-red-400/30 bg-red-400/10'}
const PR={High:0,Medium:1,Low:2}
const days=d=>Math.round((new Date(d+'T00:00:00')-t0())/DAY)
const safe=u=>/^https?:\/\//i.test(u||'')?u:'#'
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
const norm=p=>{const dl=/^\d{4}-\d{2}-\d{2}$/.test(p.deadline||'')?days(p.deadline):9999;return{...p,w:safe(p.w),x:safe(p.x),dl,ad:days(p.ad?p.added:p.added),v:-days(p.verified),s:dl<-7?'Ended':p.s}}
const ST=[['Active','bg-accent'],['Upcoming','bg-amber-400'],['Ended','bg-zinc-500']]
const PC={High:'text-red-400',Medium:'text-amber-400',Low:'text-zinc-400'}
const NAV=[['dash','Dashboard',LayoutDashboard],['explore','Explore',Compass],['tasks','Tasks',ListChecks],['cal','Calendar',CalendarDays],['watch','Watchlist',Star]]
const dlText=p=>p.s==='Ended'?'Ended':p.dl>=9999?'TBA':p.dl<0?`Overdue ${-p.dl}d`:p.dl===0?'Today':`${p.dl} days left`

function useLS(k,init){
  const [v,s]=useState(()=>{try{return JSON.parse(localStorage.getItem(k))??init}catch{return init}})
  useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},[k,v])
  return [v,s]
}
const Badge=({i})=><span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${tone[i]}`}><span className="w-1.5 h-1.5 rounded-full bg-current"/>{i}</span>
const Bar=({v})=><div className="h-1.5 rounded bg-line"><div className="h-full rounded bg-accent grow" style={{width:v+'%'}}/></div>

function Count({to}){
  const [v,setV]=useState(0)
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setV(to);return}
    let r,s=null
    const f=t=>{if(s==null)s=t;const k=Math.min((t-s)/900,1);setV(Math.round(to*(1-Math.pow(1-k,3))));if(k<1)r=requestAnimationFrame(f)}
    r=requestAnimationFrame(f);return()=>cancelAnimationFrame(r)
  },[to])
  return v
}
function Mascot(){
  const [x,setX]=useState(15),[dir,setDir]=useState(1),[big,setBig]=useState(false)
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return
    const id=setInterval(()=>setX(p=>{const n=Math.max(6,Math.min(94,p+(Math.random()*44-22)));setDir(n>=p?1:-1);return n}),1600)
    return()=>clearInterval(id)
  },[])
  return(
    <button aria-label="Mascot" className="mascot" style={{left:x+'%'}} onClick={()=>{setBig(true);setTimeout(()=>setBig(false),700)}}>
      <span style={{display:'block',transform:`scaleX(${dir})`}}><img src={mascot} alt="" width="48" height="68" className={big?'hop-big':''}/></span>
    </button>)
}
const Sp=({s=16,style})=><svg aria-hidden="true" viewBox="0 0 24 24" width={s} height={s} className="spark" style={style}><path d="M12 0C12.8 7 17 11.2 24 12C17 12.8 12.8 17 12 24C11.2 17 7 12.8 0 12C7 11.2 11.2 7 12 0Z" fill="currentColor"/></svg>
const Av=({p,s=32})=>{const l=logoFor(p.n);return l?<img src={l} alt="" width={s} height={s} className="rounded-full object-cover shrink-0" style={{width:s,height:s}}/>:<span className="rounded-full border border-zinc-600 grid place-items-center font-bold text-accent shrink-0" style={{width:s,height:s}}>{p.n[0]}</span>}
export default function App(){
  const [view,setView]=useState('dash'),[open,setOpen]=useState(null),[mode,setMode]=useState('list'),[mo,setMo]=useState(0)
  const [menu,setMenu]=useState(false)
  const [tv,setTv]=useLS('at-tv','list'),[ex,setEx]=useState([])
  const [tab,setTab]=useState('all'),[vw,setVw]=useState('all'),[col,setCol]=useState('todo'),[pj,setPj]=useState(''),[pf,setPf]=useState(''),[tg,setTg]=useState(''),[tq,setTq]=useState(''),[nt,setNt]=useState(false),[sub,setSub]=useState(false),[hov,setHov]=useState(null)
  const [q,setQ]=useState(''),[chain,setChain]=useState('All'),[cat,setCat]=useState('All'),[sort,setSort]=useState('dl'),[tk,setTk]=useState(''),[st,setSt]=useState('All')
  const [tasks,setTasks]=useLS('at-tasks2',{}),[w,setW]=useLS('at-watch',{}),[log,setLog]=useLS('at-log',[]),[custom,setCustom]=useLS('at-custom',[])
  const data=[...raw,...custom].map(norm)
  const [theme,setTheme]=useLS('at-theme','dark')
  useEffect(()=>{document.documentElement.classList.toggle('light',theme==='light')},[theme])
  const getT=id=>tasks[id]||DEF.map(t=>({t,s:'todo'}))
  const pct=id=>{const a=getT(id);return Math.round(a.filter(x=>x.s==='done').length/a.length*100)}
  const note=(m,ty)=>setLog(l=>[{m,ty,t:Date.now()},...l].slice(0,30))
  const setT=(id,fn)=>setTasks(s=>({...s,[id]:fn(getT(id))}))
  const move=(p,i,s)=>{setT(p.id,a=>a.map((x,j)=>j===i?{...x,s}:x));note(`${getT(p.id)[i].t} → ${s} (${p.n})`,s==='done'?'done':'move')}
  const addT=(p,t)=>{if(!t.trim())return;setT(p.id,a=>[...a,{t:t.trim(),s:'todo'}]);note(`New task in ${p.n}: ${t.trim()}`,'add')}
  const setWp=(id,patch)=>setW(s=>({...s,[id]:{...(s[id]||{}),...patch}}))
  const prio=p=>w[p.id]?.prio||'Medium'
  const taskTypes=[...new Set(data.flatMap(p=>(p.task||'').split(', ').filter(Boolean)))]
  const chains=['All',...new Set(data.map(p=>p.c))],cats=['All',...new Set(data.map(p=>p.k))]

  const list=data.filter(p=>(p.n+' '+p.c+' '+p.k).toLowerCase().includes(q.toLowerCase())&&(chain==='All'||p.c===chain)&&(cat==='All'||(cat==='New'?p.ad>-7:cat==='Popular'?p.i==='Confirmed':p.k===cat))&&(!tk||(p.task||'').split(', ').includes(tk))&&(st==='All'||p.s===st))
    .sort((a,b)=>sort==='dl'?a.dl-b.dl:sort==='ad'?b.ad-a.ad:PR[prio(a)]-PR[prio(b)])
  const live=data.filter(p=>p.s!=='Ended').sort((a,b)=>a.dl-b.dl)
  const allT=data.flatMap(p=>getT(p.id)),done=allT.filter(x=>x.s==='done').length,total=allT.length?Math.round(done/allT.length*100):0
  const overdue=data.filter(p=>p.dl<0&&p.s!=='Ended'&&pct(p.id)<100)
  const board=data.flatMap(d=>getT(d.id).map((x,i)=>({...x,p:d,i}))).map(x=>({...x,id:'T-'+String(x.p.id).padStart(2,'0')+'-'+String(x.i+1).padStart(2,'0')}))
  const cnt=k=>board.filter(x=>x.p.s!=='Ended'&&(k==='all'||x.s===k)).length
  const tags=[...new Set(data.flatMap(d=>[d.c,d.k]))]
  const vis=board.filter(x=>(vw==='archived'?x.p.s==='Ended':x.p.s!=='Ended'&&(vw==='all'||x.s===vw))&&(!pf||prio(x.p)===pf)&&(!pj||x.p.id===+pj)&&(!tg||x.p.c===tg||x.p.k===tg)&&x.t.toLowerCase().includes(tq.toLowerCase()))
  const pts=live.map((d,i)=>[40+i*(520/Math.max(live.length-1,1)),170-pct(d.id)*1.4])
  const path=pts.map((a,i)=>(i?'L':'M')+a[0]+' '+a[1]).join(' ')
  const p=data.find(x=>x.id===open)

  const exportData=()=>{
    const a=document.createElement('a')
    a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'airdrop-tracker',v:1,tasks,watch:w,log,custom},null,2)],{type:'application/json'}))
    a.download='cubbie-airdrop-tracker-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
  }
  const importData=e=>{
    const f=e.target.files[0];e.target.value='';if(!f)return
    if(!confirm('Replace current data with this backup?'))return
    const rd=new FileReader()
    rd.onload=()=>{try{
      const d=JSON.parse(rd.result),obj=o=>o&&typeof o==='object'&&!Array.isArray(o),D=/^\d{4}-\d{2}-\d{2}$/
      if(d.app!=='airdrop-tracker')throw 0
      if(obj(d.tasks)&&Object.values(d.tasks).every(a=>Array.isArray(a)&&a.every(x=>x&&typeof x.t==='string'&&['todo','doing','done'].includes(x.s))))setTasks(d.tasks)
      if(obj(d.watch))setW(d.watch)
      if(Array.isArray(d.log))setLog(d.log.slice(0,30))
      if(Array.isArray(d.custom))setCustom(d.custom.filter(c=>c&&typeof c.id==='number'&&typeof c.n==='string'&&(!c.deadline||D.test(c.deadline))&&D.test(c.added)&&D.test(c.verified)))
      alert('Data imported.')
    }catch{alert('Invalid backup file.')}}
    rd.readAsText(f)
  }
  const remind=async()=>{
    if(!('Notification' in window))return alert('This browser does not support notifications.')
    if(await Notification.requestPermission()!=='granted')return
    const soon=live.filter(x=>x.dl>=0&&x.dl<=1)
    new Notification('CUBBIE Airdrop Tracker',{body:soon.length?soon.map(x=>`${x.n}: ${dlText(x)}`).join('\n'):'No deadlines within 1 day.'})
  }
  const Card=({p})=>(
    <div className="rounded-2xl border border-line bg-panel p-5 flex flex-col gap-3 min-h-44 card-lift">
      <div className="flex justify-between items-start"><button onClick={()=>setOpen(p.id)} className="flex items-center gap-3 text-left"><Av p={p} s={40}/><span className="font-semibold text-white tracking-tight">{p.n}</span></button>
        <button aria-label="Favorite" onClick={()=>setWp(p.id,{fav:!w[p.id]?.fav})}><Star size={18} className={w[p.id]?.fav?'fill-accent text-accent star-on':'text-zinc-500 hover:text-zinc-300'}/></button></div>
      <p className="text-sm text-zinc-400 flex-1" style={{display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.r}</p>
      <div className="flex items-center gap-2 flex-wrap"><Badge i={p.i}/><span className="text-xs text-zinc-500">{p.c} · {p.k} · {dlText(p)}</span></div>
      <div className="flex justify-between items-center"><div className="w-24"><Bar v={pct(p.id)}/></div><div className="flex gap-3 text-zinc-500 text-sm [&>a]:transition-colors [&>a:hover]:text-accent"><a href={p.x} target="_blank" rel="noreferrer" aria-label="X">𝕏</a><a href={p.w} target="_blank" rel="noreferrer" aria-label="Website">↗</a></div></div>
    </div>)
  const check=p=>(
    <div className="space-y-2">
      {getT(p.id).map((x,i)=><label key={i} className="flex gap-2 text-sm items-center"><input type="checkbox" className="accent-accent" checked={x.s==='done'} onChange={()=>move(p,i,x.s==='done'?'todo':'done')}/><span className={x.s==='done'?'line-through text-zinc-500':''}>{x.t}</span></label>)}
      <form className="flex gap-2" onSubmit={e=>{e.preventDefault();addT(p,e.target.t.value);e.target.reset()}}><input name="t" placeholder="Custom task" className="flex-1 min-w-0"/><button aria-label="Add task" className="bg-accent text-ink rounded-lg px-3"><Plus size={16}/></button></form>
    </div>)

  const first=new Date(t0().getFullYear(),t0().getMonth()+mo,1),pad=first.getDay(),dim=new Date(first.getFullYear(),first.getMonth()+1,0).getDate()
  return(
  <div className="min-h-screen md:flex md:flex-col overflow-x-clip">
    
    {/* (mobile only) */}
<header className="md:hidden sticky top-0 z-[5] flex items-center gap-3 border-b border-line bg-ink px-4 py-3">
  <button aria-label="Menu" onClick={()=>setMenu(true)} className="grid h-11 w-11 place-items-center rounded-xl border border-line"><Menu size={22}/></button>
  <img src={logo} alt="" className="brand-logo h-7 w-7 object-contain"/><h2 className="text-lg font-semibold">{NAV.find(n=>n[0]===view)[1]}</h2>
</header>

{/* Overlay */}
<div onClick={()=>setMenu(false)} className={`md:hidden fixed inset-0 z-40 bg-black/60 transition-opacity ${menu?'opacity-100':'pointer-events-none opacity-0'}`}/>

{/* Drawer on mobile */}
 <nav style={{gridTemplateColumns:'1fr auto 1fr'}} className={`fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs flex flex-col gap-1 p-3 bg-panel border-r border-line transition-transform duration-300 ${menu?'translate-x-0':'-translate-x-full'} md:sticky md:top-0 md:z-[5] md:w-full md:max-w-none md:grid md:items-center md:border-r-0 md:border-b md:translate-x-0 md:bg-ink`}>
  <div className="flex items-start justify-between px-3 py-2 md:justify-self-start">
    <div className="flex items-center gap-3"><img src={logo} alt="CUBBIE" className="brand-logo h-9 w-9 object-contain"/><div className="serif text-2xl leading-none">CUBBIE<span className="block mt-1 text-xs text-zinc-400 font-sans tracking-wide">Airdrop Tracker</span></div></div>
    <button aria-label="Close menu" onClick={()=>setMenu(false)} className="md:hidden text-zinc-400"><X size={20}/></button>
  </div>
  <div className="flex flex-col gap-1 md:flex-row md:justify-self-center">
  {NAV.map(([k,l,I])=><button key={k} onClick={()=>{setView(k);setMenu(false)}} className={`flex items-center gap-3 px-4 py-3 md:px-3 md:py-2 rounded-xl md:rounded-lg text-base md:text-sm whitespace-nowrap border ${view===k?'bg-accent/10 border-accent/25 text-accent font-semibold':'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}><I size={20}/>{l}</button>)}</div>
  <button role="switch" aria-checked={theme==='light'} aria-label="Toggle light mode" onClick={()=>setTheme(theme==='light'?'dark':'light')} className="mt-auto md:mt-0 md:justify-self-end flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap hover:bg-panel">{theme==='light'?<Sun size={16}/>:<Moon size={16}/>}<span>{theme==='light'?'Light':'Dark'}</span><span className="relative w-9 h-5 rounded-full border border-line bg-line shrink-0"><span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-accent transition-all ${theme==='light'?'left-[1.15rem]':'left-0.5'}`}/></span></button>
</nav>

    <main key={view} className="flex-1 min-w-0 p-4 md:p-6 space-y-4 max-w-[1800px] view-in">
      {view==='dash'&&<>
        <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="hidden md:block text-xl font-bold">Dashboard</h1><div className="flex gap-2 text-xs"><button onClick={exportData} className="border border-line rounded-full px-3 py-1.5 hover:border-accent/50 hover:bg-white/5">Export data</button><label className="border border-line rounded-full px-3 py-1.5 hover:border-accent/50 hover:bg-white/5 cursor-pointer">Import data<input type="file" accept="application/json,.json" className="hidden" onChange={importData}/></label></div></div>
        <div className="grid lg:grid-cols-[300px_1fr] gap-3 stagger">
          <section className="holo-card rounded-2xl p-5 space-y-3 glow">
            <div className="text-xs text-accent">Overview</div>
            <div className="flex justify-between items-end"><div><div className="text-5xl font-bold"><Count to={data.length}/></div><div className="text-sm text-zinc-300">Projects tracked</div></div><div className="rounded-xl bg-black/40 px-3 py-2 text-center"><div className="text-2xl font-bold"><Count to={new Set(data.map(d=>d.c)).size}/></div><div className="text-xs">Chains</div></div></div>
            <div><div className="text-xs text-zinc-400">Nearest deadline</div><div className="text-2xl font-bold">{live[0]?.n}</div><div className="text-sm text-zinc-300">{live[0]&&dlText(live[0])}</div></div>
            <button onClick={()=>setView('cal')} className="rounded-full bg-accent text-ink text-sm font-bold px-4 py-1.5">Open calendar</button>
          </section>
          <section className="rounded-2xl border border-line bg-panel p-5 space-y-4">
            <div className="flex justify-between"><h2 className="font-bold">My projects</h2><button onClick={()=>setView('explore')} className="text-xs border border-line rounded-full px-3 py-1">Go to Explore</button></div>
            <div className="grid grid-cols-3 gap-2">{live.slice(0,3).map(d=><button key={d.id} onClick={()=>setOpen(d.id)} className="text-left rounded-xl border border-line p-3 flex gap-2 items-center"><Av p={d} s={32}/><span className="truncate"><span className="block text-sm font-bold truncate">{d.n}</span><span className="text-xs text-zinc-400">{d.c}</span></span></button>)}</div>
            <div><div className="text-xs text-zinc-400 mb-1">Status distribution</div><div className="flex h-2 rounded overflow-hidden">{ST.map(([k,c])=><div key={k} className={c+' grow'} style={{width:data.filter(d=>d.s===k).length/data.length*100+'%'}}/>)}</div></div>
            <div className="grid grid-cols-3 text-sm">{ST.map(([k,c])=><div key={k} className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${c}`}/>{k} <b>{data.filter(d=>d.s===k).length}</b></div>)}</div>
          </section>
        </div>
        <div className="grid lg:grid-cols-[1fr_320px] gap-3 stagger late">
          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="font-bold mb-2">Task progress by project <span className="text-accent text-sm">· overall <Count to={total}/>%</span></h2>
            <svg viewBox="0 0 600 200" className="w-full text-accent"><defs><linearGradient id="hg" x1="0" x2="1"><stop offset="0" stopColor="currentColor"/><stop offset=".5" stopColor="currentColor"/><stop offset="1" stopColor="currentColor"/></linearGradient><linearGradient id="ha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".35"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs>
              {[0,50,100].map(v=><g key={v}><line x1="40" x2="580" y1={170-v*1.4} y2={170-v*1.4} stroke="#ffffff1c"/><text x="4" y={174-v*1.4} fill="#71717a" fontSize="11">{v}%</text></g>)}
              <path d={pts.length?path+` L${pts[pts.length-1][0]} 170 L${pts[0][0]} 170Z`:''} fill="url(#ha)" className="fade-in" style={{animationDelay:'1.1s'}}/>
              <path d={path} fill="none" stroke="url(#hg)" strokeWidth="2.5" pathLength="1" className="draw"/>
              {pts.map((a,i)=><g key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} onClick={()=>setHov(i)}><circle cx={a[0]} cy={a[1]} r={hov===i?6:4} fill="currentColor" className="dot"/><circle cx={a[0]} cy={a[1]} r="16" fill="transparent"/><text x={a[0]} y="192" fill="#a1a1aa" fontSize="11" textAnchor="middle">{live[i].n.slice(0,9)}</text></g>)}
            </svg>
            {hov!=null&&<div className="text-sm"><b>{live[hov].n}</b> · {pct(live[hov].id)}% complete · {dlText(live[hov])}</div>}
          </section>
          <section className="rounded-2xl border border-line bg-panel p-5 space-y-3">
            <div className="flex justify-between"><h2 className="font-bold">Activity</h2><div className="flex gap-2 text-xs">{[['all','ALL'],['done','DONE'],['add','ADDED']].map(([k,l])=><button key={k} onClick={()=>setTab(k)} className={tab===k?'text-accent':'text-zinc-500'}>{l}</button>)}</div></div>
            {log.filter(l=>tab==='all'||l.ty===tab).slice(0,6).map((l,i)=><div key={i} className="flex gap-2 text-sm border-b border-line pb-2"><span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${l.ty==='done'?'bg-accent':l.ty==='add'?'bg-zinc-400':'bg-amber-400'}`}/><span>{l.m}<span className="block text-xs text-zinc-500">{new Date(l.t).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span></span></div>)}
            {!log.some(l=>tab==='all'||l.ty===tab)&&<p className="text-sm text-zinc-500">No activity yet. Move a task on the Tasks board to start.</p>}
            <button onClick={()=>setView('tasks')} className="w-full rounded-full border border-line py-2 text-sm">Go to task board</button>
          </section>
        </div>
      </>}

      {view==='explore'&&<>
        <section className="hero relative overflow-hidden rounded-3xl border border-line p-6 md:p-10">
          <div className="relative z-[1] max-w-md">
            <h1 className="serif text-4xl md:text-6xl leading-[1.05]">All airdrops<br/>in one place</h1>
            <p className="mt-3 text-sm text-zinc-400">Track deadlines, tasks and rewards for every project, with clear verification status. No promises, just the facts.</p>
          </div>
          <img src={logo} alt="" className="hero-logo"/>
          <Sp s={22} style={{right:'38%',top:'18%
