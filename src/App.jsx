import {useState,useEffect} from 'react'
import {LayoutDashboard,Compass,ListChecks,CalendarDays,Star,Search,LayoutGrid,List,X,Plus,ShieldAlert,ExternalLink,Bell} from 'lucide-react'
import raw from './data.json'
import mascot from './mascot.webp'

const DAY=864e5,DEF=['Connect wallet','Complete testnet transactions','Bridge assets','Complete quests','Submit feedback']
const t0=()=>{const d=new Date();d.setHours(0,0,0,0);return d}
const at=n=>new Date(t0().getTime()+n*DAY)
const fmt=d=>d.toLocaleDateString('en-US',{day:'numeric',month:'short'})
const same=(a,b)=>a.toDateString()===b.toDateString()
const tone={Confirmed:'text-accent border-accent/40',Potential:'text-amber-300 border-amber-300/40',Unverified:'text-red-400 border-red-400/40'}
const PR={High:0,Medium:1,Low:2}
const days=d=>Math.round((new Date(d+'T00:00:00')-t0())/DAY)
const safe=u=>/^https?:\/\//i.test(u||'')?u:'#'
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
const norm=p=>{const dl=days(p.deadline);return{...p,w:safe(p.w),x:safe(p.x),dl,ad:days(p.ad?p.added:p.added),v:-days(p.verified),s:dl<-7?'Ended':p.s}}
const ST=[['Active','bg-accent'],['Upcoming','bg-amber-400'],['Ended','bg-zinc-500']]
const PC={High:'text-red-400',Medium:'text-amber-400',Low:'text-zinc-400'}
const NAV=[['dash','Dashboard',LayoutDashboard],['explore','Explore',Compass],['tasks','Tasks',ListChecks],['cal','Calendar',CalendarDays],['watch','Watchlist',Star]]
const dlText=p=>p.s==='Ended'?'Ended':p.dl<0?`Overdue ${-p.dl}d`:p.dl===0?'Today':`${p.dl} days left`

function useLS(k,init){
  const [v,s]=useState(()=>{try{return JSON.parse(localStorage.getItem(k))??init}catch{return init}})
  useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},[k,v])
  return [v,s]
}
const Badge=({i})=><span className={`text-xs px-2 py-0.5 rounded-full border ${tone[i]}`}>{i}</span>
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
export default function App(){
  const [view,setView]=useState('dash'),[open,setOpen]=useState(null),[mode,setMode]=useState('list'),[mo,setMo]=useState(0)
  const [tab,setTab]=useState('all'),[vw,setVw]=useState('all'),[col,setCol]=useState('todo'),[pj,setPj]=useState(''),[pf,setPf]=useState(''),[tg,setTg]=useState(''),[tq,setTq]=useState(''),[nt,setNt]=useState(false),[sub,setSub]=useState(false),[hov,setHov]=useState(null)
  const [q,setQ]=useState(''),[chain,setChain]=useState('All'),[cat,setCat]=useState('All'),[sort,setSort]=useState('dl'),[tk,setTk]=useState(''),[st,setSt]=useState('All')
  const [tasks,setTasks]=useLS('at-tasks2',{}),[w,setW]=useLS('at-watch',{}),[log,setLog]=useLS('at-log',[]),[custom,setCustom]=useLS('at-custom',[])
  const data=[...raw,...custom].map(norm)
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
      if(Array.isArray(d.custom))setCustom(d.custom.filter(c=>c&&typeof c.id==='number'&&typeof c.n==='string'&&D.test(c.deadline)&&D.test(c.added)&&D.test(c.verified)))
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
    <div className="rounded-2xl border border-zinc-600 bg-black p-5 flex flex-col gap-3 min-h-44 card-lift">
      <div className="flex justify-between items-start"><button onClick={()=>setOpen(p.id)} className="flex items-center gap-3 text-left"><span className="w-10 h-10 rounded-full border border-zinc-500 grid place-items-center font-bold text-accent">{p.n[0]}</span><span className="font-bold">{p.n}</span></button>
        <button aria-label="Favorite" onClick={()=>setWp(p.id,{fav:!w[p.id]?.fav})}><Star size={18} className={w[p.id]?.fav?'fill-accent text-accent star-on':'text-zinc-500'}/></button></div>
      <p className="text-sm text-zinc-300 flex-1">{p.r}</p>
      <div className="flex items-center gap-2 flex-wrap"><Badge i={p.i}/><span className="text-xs text-zinc-400">{p.c} · {p.k} · {dlText(p)}</span></div>
      <div className="flex justify-between items-center"><div className="w-24"><Bar v={pct(p.id)}/></div><div className="flex gap-3 text-zinc-400 text-sm"><a href={p.x} target="_blank" rel="noreferrer" aria-label="X">𝕏</a><a href={p.w} target="_blank" rel="noreferrer" aria-label="Website">↗</a></div></div>
    </div>)
  const check=p=>(
    <div className="space-y-2">
      {getT(p.id).map((x,i)=><label key={i} className="flex gap-2 text-sm items-center"><input type="checkbox" className="accent-accent" checked={x.s==='done'} onChange={()=>move(p,i,x.s==='done'?'todo':'done')}/><span className={x.s==='done'?'line-through text-zinc-500':''}>{x.t}</span></label>)}
      <form className="flex gap-2" onSubmit={e=>{e.preventDefault();addT(p,e.target.t.value);e.target.reset()}}><input name="t" placeholder="Custom task" className="flex-1 min-w-0"/><button aria-label="Add task" className="bg-accent text-ink rounded-lg px-3"><Plus size={16}/></button></form>
    </div>)

  const first=new Date(t0().getFullYear(),t0().getMonth()+mo,1),pad=first.getDay(),dim=new Date(first.getFullYear(),first.getMonth()+1,0).getDate()
  return(
  <div className="min-h-screen md:flex">
    
    <nav className="md:w-52 md:min-h-screen border-b md:border-b-0 md:border-r border-line p-3 flex md:flex-col gap-1 overflow-x-auto noscroll">
      <div className="serif holo-text px-3 py-2 hidden md:block text-2xl">CUBBIE<span className="block text-sm text-zinc-400 font-sans tracking-normal">Airdrop Tracker</span></div>
      {NAV.map(([k,l,I])=><button key={k} onClick={()=>setView(k)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${view===k?'bg-accent text-ink font-bold':'hover:bg-panel'}`}><I size={16}/>{l}</button>)}
    </nav>
    <main key={view} className="flex-1 min-w-0 p-4 md:p-6 space-y-4 max-w-6xl view-in">
      {view==='dash'&&<>
        <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-xl font-bold">Dashboard</h1><div className="flex gap-2 text-xs"><button onClick={exportData} className="border border-line rounded-full px-3 py-1.5">Export data</button><label className="border border-line rounded-full px-3 py-1.5 cursor-pointer">Import data<input type="file" accept="application/json,.json" className="hidden" onChange={importData}/></label></div></div>
        <div className="grid lg:grid-cols-[300px_1fr] gap-3 stagger">
          <section className="holo-card rounded-2xl p-5 space-y-3 glow">
            <div className="text-xs text-accent">Overview</div>
            <div className="flex justify-between items-end"><div><div className="text-5xl font-bold"><Count to={data.length}/></div><div className="text-sm text-zinc-300">Projects tracked</div></div><div className="rounded-xl bg-black/40 px-3 py-2 text-center"><div className="text-2xl font-bold"><Count to={new Set(data.map(d=>d.c)).size}/></div><div className="text-xs">Chains</div></div></div>
            <div><div className="text-xs text-zinc-400">Nearest deadline</div><div className="text-2xl font-bold">{live[0]?.n}</div><div className="text-sm text-zinc-300">{live[0]&&dlText(live[0])}</div></div>
            <button onClick={()=>setView('cal')} className="rounded-full bg-accent text-ink text-sm font-bold px-4 py-1.5">Open calendar</button>
          </section>
          <section className="rounded-2xl border border-line bg-panel p-5 space-y-4">
            <div className="flex justify-between"><h2 className="font-bold">My projects</h2><button onClick={()=>setView('explore')} className="text-xs border border-line rounded-full px-3 py-1">Go to Explore</button></div>
            <div className="grid grid-cols-3 gap-2">{live.slice(0,3).map(d=><button key={d.id} onClick={()=>setOpen(d.id)} className="text-left rounded-xl border border-line p-3 flex gap-2 items-center"><span className="w-8 h-8 rounded-full bg-accent text-ink grid place-items-center font-bold shrink-0">{d.n[0]}</span><span className="truncate"><span className="block text-sm font-bold truncate">{d.n}</span><span className="text-xs text-zinc-400">{d.c}</span></span></button>)}</div>
            <div><div className="text-xs text-zinc-400 mb-1">Status distribution</div><div className="flex h-2 rounded overflow-hidden">{ST.map(([k,c])=><div key={k} className={c+' grow'} style={{width:data.filter(d=>d.s===k).length/data.length*100+'%'}}/>)}</div></div>
            <div className="grid grid-cols-3 text-sm">{ST.map(([k,c])=><div key={k} className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${c}`}/>{k} <b>{data.filter(d=>d.s===k).length}</b></div>)}</div>
          </section>
        </div>
        <div className="grid lg:grid-cols-[1fr_320px] gap-3 stagger late">
          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="font-bold mb-2">Task progress by project <span className="text-accent text-sm">· overall <Count to={total}/>%</span></h2>
            <svg viewBox="0 0 600 200" className="w-full"><defs><linearGradient id="hg" x1="0" x2="1"><stop offset="0" stopColor="#39ff88"/><stop offset=".5" stopColor="#39ff88"/><stop offset="1" stopColor="#39ff88"/></linearGradient><linearGradient id="ha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#39ff88" stopOpacity=".35"/><stop offset="1" stopColor="#39ff88" stopOpacity="0"/></linearGradient></defs>
              {[0,50,100].map(v=><g key={v}><line x1="40" x2="580" y1={170-v*1.4} y2={170-v*1.4} stroke="#1a2e1f"/><text x="4" y={174-v*1.4} fill="#71717a" fontSize="11">{v}%</text></g>)}
              <path d={pts.length?path+` L${pts[pts.length-1][0]} 170 L${pts[0][0]} 170Z`:''} fill="url(#ha)" className="fade-in" style={{animationDelay:'1.1s'}}/>
              <path d={path} fill="none" stroke="url(#hg)" strokeWidth="2.5" pathLength="1" className="draw"/>
              {pts.map((a,i)=><g key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} onClick={()=>setHov(i)}><circle cx={a[0]} cy={a[1]} r={hov===i?6:4} fill="#fff" className="dot"/><circle cx={a[0]} cy={a[1]} r="16" fill="transparent"/><text x={a[0]} y="192" fill="#a1a1aa" fontSize="11" textAnchor="middle">{live[i].n.slice(0,9)}</text></g>)}
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
        <div className="flex flex-wrap justify-between gap-4 items-end">
          <div><span className="text-xs bg-accent text-ink rounded-full px-3 py-0.5 font-bold">02. Airdrops</span><h1 className="text-4xl md:text-6xl mt-3 holo-text">Explore the ecosystem</h1></div>
          <div className="flex items-center gap-4 max-w-sm text-xs text-zinc-400"><span>Don’t see your project listed? Add it to your own tracker (saved in this browser only).</span><button onClick={()=>setSub(!sub)} className="rounded-full border border-zinc-300 text-zinc-100 px-5 py-2 text-sm whitespace-nowrap">Add Project</button></div>
        </div>
        {sub&&<form className="rounded-2xl border border-line bg-panel p-4 grid sm:grid-cols-2 gap-2 text-sm" onSubmit={e=>{e.preventDefault()
          const f=e.target.elements,v=n=>f[n].value.trim()
          const id=Math.max(100,...custom.map(c=>c.id))+1,t=iso(new Date())
          setCustom(c=>[...c,{id,n:v('pn'),c:v('pc')||'Other',k:v('pk')||'Other',s:v('ps'),i:v('pi'),deadline:v('pd'),added:t,verified:t,task:v('pt').split(',').map(x=>x.trim()).filter(Boolean).join(', '),reward:v('prw'),w:v('pw'),x:v('px'),r:v('pnote')}])
          note('Added project: '+v('pn'),'add');e.target.reset();setSub(false)}}>
          <input name="pn" required placeholder="Project name"/>
          <input name="pc" placeholder="Chain (e.g. Ethereum)"/>
          <input name="pk" placeholder="Category (e.g. DeFi)"/>
          <input name="pd" type="date" required className="[color-scheme:dark]"/>
          <select name="ps"><option>Active</option><option>Upcoming</option></select>
          <select name="pi"><option>Unverified</option><option>Potential</option><option>Confirmed</option></select>
          <input name="pt" placeholder="Task types (comma separated)"/>
          <select name="prw"><option>Airdrop</option><option>Points</option></select>
          <input name="pw" placeholder="Official website (https://...)"/>
          <input name="px" placeholder="X link (https://...)"/>
          <input name="pnote" className="sm:col-span-2" placeholder="Short note"/>
          <button className="sm:col-span-2 bg-accent text-ink font-bold rounded-lg py-2">Save project</button>
        </form>}
        {(()=>{
          const act=live.filter(x=>x.dl>=0),nxt=act[0]
          const hot=[...act.filter(x=>x.ad>-7),...act.filter(x=>x.ad<=-7)].filter(x=>!nxt||x.id!==nxt.id).slice(0,2)
          const stat=[['Upcoming',data.filter(x=>x.s==='Upcoming').length,'border-accent'],['Confirmed',data.filter(x=>x.i==='Confirmed'&&x.s!=='Ended').length,'border-accent'],['Due in 3 days',act.filter(x=>x.dl<=3).length,'border-amber-400'],['Overdue',live.filter(x=>x.dl<0).length,'border-red-400']]
          return(
          <div className="grid md:grid-cols-3 gap-3 stagger">
            <section className="rounded-2xl border border-line bg-panel p-4">
              <h2 className="text-sm font-bold mb-3">Current Activity Overview</h2>
              <div className="grid grid-cols-2 gap-3">{stat.map(([l,n,c])=><div key={l} className={`border-l-2 ${c} pl-3`}><div className="text-2xl font-bold">{n}</div><div className="text-xs text-zinc-400">{l}</div></div>)}</div>
            </section>
            <section className="rounded-2xl border border-line bg-panel p-4 flex flex-col">
              <h2 className="text-sm font-bold mb-3">Next Reward</h2>
              {nxt?<>
                <div className="flex-1"><div className="text-xs text-zinc-400">Nearest deadline</div><div className="text-2xl font-bold">{nxt.n}</div><div className="text-sm text-zinc-300">{dlText(nxt)} · {fmt(at(nxt.dl))}</div></div>
                <button onClick={()=>setOpen(nxt.id)} className="mt-3 self-start text-xs rounded-full border border-accent text-accent px-3 py-1">Open details</button>
              </>:<p className="text-sm text-zinc-500">No upcoming deadlines.</p>}
            </section>
            <section className="rounded-2xl border border-line bg-panel p-4">
              <h2 className="text-sm font-bold mb-3">Hot events</h2>
              <div className="space-y-2">{hot.map(h=><button key={h.id} onClick={()=>setOpen(h.id)} className="w-full text-left rounded-xl border border-line p-2.5 flex items-center gap-3 hover:bg-white/5"><span className="w-8 h-8 rounded-full border border-zinc-600 grid place-items-center font-bold text-accent shrink-0">{h.n[0]}</span><span className="min-w-0"><span className="block text-sm font-bold truncate">{h.n}</span><span className="block text-xs text-zinc-400 truncate">{h.c} · {dlText(h)}</span></span></button>)}
                {!hot.length&&<p className="text-sm text-zinc-500">Nothing hot right now.</p>}</div>
            </section>
          </div>)
        })()}
        <div className="flex flex-wrap gap-2 items-center">
          {['All','New','Popular',...cats.slice(1)].map(c=><button key={c} onClick={()=>setCat(c)} className={`rounded-full border px-4 py-1 text-xs ${cat===c?'bg-accent text-ink border-transparent':'border-zinc-500'}`}>{c}</button>)}
          <div className="ml-auto flex items-center rounded-full bg-white/10 border border-white/15 pl-4 pr-1 py-1"><input className="!bg-transparent !border-0 !text-white text-sm w-40 !p-1" placeholder="Search projects" value={q} onChange={e=>setQ(e.target.value)}/><Search size={16} className="mx-2 text-zinc-400"/></div>
        </div>
        <div className="flex gap-2 items-center">
          <select value={chain} onChange={e=>setChain(e.target.value)}>{chains.map(c=><option key={c}>{c}</option>)}</select>
          <select value={tk} onChange={e=>setTk(e.target.value)}><option value="">Task Type</option>{taskTypes.map(c=><option key={c}>{c}</option>)}</select>
          <select value={st} onChange={e=>setSt(e.target.value)}>{['All','Active','Upcoming','Ended'].map(c=><option key={c} value={c}>{c==='All'?'Status':c}</option>)}</select>
          <select value={sort} onChange={e=>setSort(e.target.value)}><option value="dl">Sort: Deadline</option><option value="ad">Sort: Date added</option><option value="pr">Sort: Priority</option></select>
          <button aria-label="Grid" onClick={()=>setMode('grid')} className={mode==='grid'?'text-accent':'text-zinc-500'}><LayoutGrid size={20}/></button>
          <button aria-label="List" onClick={()=>setMode('list')} className={mode==='list'?'text-accent':'text-zinc-500'}><List size={20}/></button>
        </div>
        {mode==='grid'
  ?<div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 stagger">{list.map(d=><Card key={d.id} p={d}/>)}</div>
  :<div className="rounded-2xl border border-line bg-panel overflow-x-auto">
    <table className="w-full min-w-[900px] text-sm">
      <thead><tr className="text-left text-xs text-zinc-500 border-b border-line">
        <th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Chain · Category</th><th className="p-3 font-medium">Task Type</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Reward</th><th className="p-3 font-medium">Deadline</th><th className="p-3 font-medium">Progress</th><th className="p-3 w-10"></th>
      </tr></thead>
      <tbody>{list.map(d=>(
        <tr key={d.id} onClick={()=>setOpen(d.id)} className="border-b border-line last:border-0 hover:bg-white/5 cursor-pointer">
          <td className="p-3"><div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full border border-zinc-600 grid place-items-center font-bold text-accent shrink-0">{d.n[0]}</span><span className="font-bold">{d.n}</span></div></td>
          <td className="p-3 whitespace-nowrap"><span className="rounded bg-white/10 text-zinc-300 px-2 py-0.5 text-xs">{d.c}</span> <span className="rounded bg-accent/15 text-accent px-2 py-0.5 text-xs">{d.k}</span></td>
          <td className="p-3"><div className="flex gap-1 flex-wrap">{(d.task||'').split(', ').filter(Boolean).map(t=><span key={t} className="rounded bg-white/10 text-zinc-300 px-2 py-0.5 text-xs">{t}</span>)}</div></td>
          <td className="p-3"><Badge i={d.i}/><div className="text-xs text-zinc-500 mt-1">{d.s}</div></td>
          <td className="p-3 whitespace-nowrap">{d.reward}</td>
          <td className="p-3 whitespace-nowrap">{dlText(d)}<div className="text-xs text-zinc-500">{d.s!=='Ended'&&fmt(at(d.dl))}</div></td>
          <td className="p-3 w-32"><Bar v={pct(d.id)}/><div className="text-xs text-zinc-500 mt-1">{pct(d.id)}%</div></td>
          <td className="p-3" onClick={e=>e.stopPropagation()}><button aria-label="Favorite" onClick={()=>setWp(d.id,{fav:!w[d.id]?.fav})}><Star size={18} className={w[d.id]?.fav?'fill-accent text-accent':'text-zinc-500'}/></button></td>
        </tr>))}</tbody>
    </table>
  </div>}
        {!list.length&&<p className="text-zinc-500">No projects match. Change the search or filters.</p>}
      </>}

      {view==='tasks'&&<div className="md:flex gap-4">
        <aside className="md:w-44 shrink-0 text-sm space-y-1 md:space-y-4 mb-3 min-w-0">
          <div className="flex md:block gap-1 overflow-x-auto items-center noscroll"><div className="text-xs text-zinc-500 md:mb-1 shrink-0 w-14 md:w-auto">Views</div>{[['all','All tasks'],['todo','todo'],['doing','doing'],['done','done'],['archived','archived']].map(([k,l])=><button key={k} onClick={()=>setVw(k)} className={`inline-flex md:flex gap-2 justify-between md:w-full px-2 py-1 rounded whitespace-nowrap shrink-0 ${vw===k?'bg-white/10 text-white':'text-zinc-400'}`}><span>{l}</span><span>{k==='archived'?board.filter(x=>x.p.s==='Ended').length:cnt(k)}</span></button>)}</div>
          <div className="flex md:block gap-1 overflow-x-auto items-center noscroll"><div className="text-xs text-zinc-500 md:mb-1 shrink-0 w-14 md:w-auto">Priority</div>{Object.keys(PC).map(k=><button key={k} onClick={()=>setPf(pf===k?'':k)} className={`inline-flex md:flex gap-2 items-center md:w-full px-2 py-1 rounded whitespace-nowrap shrink-0 ${pf===k?'bg-panel text-white':'text-zinc-400'}`}><span className={PC[k]}>●</span>{k.toLowerCase()}</button>)}</div>
          <div className="flex md:block gap-2 items-center"><div className="text-xs text-zinc-500 md:mb-1 shrink-0 w-14 md:w-auto">Project</div><select value={pj} onChange={e=>setPj(e.target.value)} className="flex-1 md:w-full min-w-0"><option value="">All projects</option>{data.map(d=><option key={d.id} value={d.id}>{d.n}</option>)}</select></div>
          <div className="flex md:block gap-2 items-center"><div className="text-xs text-zinc-500 md:mb-1 shrink-0 w-14 md:w-auto">Tags</div><select value={tg} onChange={e=>setTg(e.target.value)} className="flex-1 md:w-full min-w-0"><option value="">All tags</option>{tags.map(k=><option key={k} value={k}>{k}</option>)}</select></div>
        </aside>
        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex flex-wrap gap-2 items-center justify-between"><h1 className="text-xl font-bold">{vw==='all'?'All tasks':vw} <span className="text-sm text-zinc-500 font-normal">{vis.length} visible · {board.length} total</span></h1>
            <div className="flex gap-2"><input placeholder="Search tasks" value={tq} onChange={e=>setTq(e.target.value)}/><button onClick={()=>setNt(!nt)} className="bg-accent text-ink font-bold rounded-lg px-3 text-sm whitespace-nowrap">+ New task</button></div></div>
          {nt&&<form className="flex gap-2" onSubmit={e=>{e.preventDefault();const d=data.find(x=>x.id===+e.target.pj.value);addT(d,e.target.t.value);e.target.reset();setNt(false)}}><select name="pj">{live.map(d=><option key={d.id} value={d.id}>{d.n}</option>)}</select><input name="t" placeholder="Task title" className="flex-1 min-w-0"/><button className="bg-accent text-ink rounded-lg px-3 text-sm">Add</button></form>}
          <div className="flex md:hidden gap-2">{['todo','doing','done'].map(k=><button key={k} onClick={()=>setCol(k)} className={`flex-1 rounded-lg border py-2 text-sm ${col===k?'bg-accent text-ink font-bold border-transparent':'border-line text-zinc-400'}`}>{k} {vis.filter(x=>x.s===k).length}</button>)}</div>
          <div className="grid md:grid-cols-3 gap-3 pb-2">{['todo','doing','done'].map(k=>
            <div key={k} onDragOver={e=>e.preventDefault()} onDrop={e=>{const [pid,i]=e.dataTransfer.getData('t').split(':');move(data.find(x=>x.id===+pid),+i,k)}} className={`min-w-0 space-y-2 min-h-24 md:max-h-[75vh] md:overflow-y-auto md:pr-1 ${k===col?'':'hidden md:block'}`}>
              <div className="text-sm py-1 hidden md:block sticky top-0 bg-ink z-[1]"><span className={`inline-block w-2 h-2 rounded-full mr-2 ${k==='todo'?'bg-zinc-400':k==='doing'?'bg-amber-400':'bg-accent'}`}/>{k} <span className="text-zinc-500">{vis.filter(x=>x.s===k).length}</span></div>
              {vis.filter(x=>x.s===k).map(x=><div key={x.id} draggable onDragStart={e=>e.dataTransfer.setData('t',x.p.id+':'+x.i)} className="rounded-xl border border-line bg-panel p-2.5 space-y-1.5 cursor-grab pop">
                <div className="flex justify-between text-xs text-zinc-500"><span>{x.id}</span><span className={PC[prio(x.p)]}>● {prio(x.p)}</span></div>
                <button onClick={()=>setOpen(x.p.id)} className="text-left text-sm font-medium">{x.t}</button>
                <div className="flex gap-1 flex-wrap text-xs"><span className="rounded bg-white/10 text-zinc-300 px-1.5">#{x.p.c}</span><span className="rounded bg-accent/15 text-accent px-1.5">#{x.p.k}</span></div>
                <div className="flex justify-between items-center text-xs text-zinc-400"><span>{x.p.n}</span><select value={x.s} onChange={e=>move(x.p,x.i,e.target.value)} className="!py-0.5 !px-1 text-xs">{['todo','doing','done'].map(o=><option key={o}>{o}</option>)}</select></div>
              </div>)}
            </div>)}</div>
        </div>
      </div>}

      {view==='cal'&&<>
        <div className="flex items-center justify-between flex-wrap gap-2"><h1 className="text-2xl font-bold">Deadline Calendar</h1>
          <button onClick={remind} className="flex gap-2 items-center text-sm border border-line rounded-lg px-3 py-2"><Bell size={14}/>Enable reminders</button></div>
        <div className="flex items-center gap-3"><button onClick={()=>setMo(mo-1)}>←</button><b>{first.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</b><button onClick={()=>setMo(mo+1)}>→</button></div>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="text-zinc-500 text-center">{d}</div>)}
          {Array.from({length:pad}).map((_,i)=><div key={'p'+i}/>)}
          {Array.from({length:dim},(_,i)=>{const d=new Date(first.getFullYear(),first.getMonth(),i+1),ps=data.filter(p=>same(at(p.dl),d)),wk=d>=t0()&&d<at(7)
            return <div key={i} className={`min-h-16 rounded-lg p-1 border ${same(d,t0())?'border-accent':'border-line'} ${wk?'bg-panel':''}`}><div>{i+1}</div>{ps.map(p=><button key={p.id} onClick={()=>setOpen(p.id)} className={`block w-full truncate text-left rounded px-1 mt-0.5 ${p.dl<0?'bg-red-400/20 text-red-300':'bg-accent/20 text-accent'}`}>{p.n}</button>)}</div>})}
        </div>
        <section className="bg-panel border border-line rounded-xl p-4 space-y-1"><h2 className="font-bold">This week</h2>
          {live.filter(p=>p.dl>=0&&p.dl<7).map(p=><div key={p.id} className="text-sm flex justify-between"><span>{p.n}</span><span>{p.dl===0?'Today':fmt(at(p.dl))}</span></div>)}</section>
        <section className="bg-panel border border-line rounded-xl p-4 space-y-1"><h2 className="font-bold text-red-400">Overdue</h2>
          {overdue.length?overdue.map(p=><div key={p.id} className="text-sm">{p.n}: {dlText(p)}, tasks unfinished</div>):<div className="text-sm text-zinc-500">No overdue tasks.</div>}</section>
      </>}

      {view==='watch'&&<>
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">{data.filter(p=>w[p.id]?.fav).map(p=><div key={p.id}><Card p={p}/><div className="text-xs text-zinc-400 mt-1 px-1">Priority {prio(p)}{w[p.id]?.note?' · '+w[p.id].note.slice(0,60):''}{w[p.id]?.wallet?' · Wallet: '+w[p.id].wallet:''}</div></div>)}</div>
        {!data.some(p=>w[p.id]?.fav)&&<p className="text-zinc-500">Your watchlist is empty. Star a project in Explore to save it.</p>}
      </>}
    </main>

    {p&&<div className="fixed inset-0 bg-black/60 z-10 flex justify-end fade-in" onClick={()=>setOpen(null)}>
      <aside className="w-full max-w-md bg-panel border-l border-line p-5 overflow-y-auto space-y-4 slide-in" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-between items-start"><div><h2 className="text-2xl font-bold">{p.n}</h2><div className="text-sm text-zinc-400">{p.c} · {p.k} · {p.s}</div></div><button aria-label="Close" onClick={()=>setOpen(null)}><X/></button></div>
        <div className="flex items-center gap-2 flex-wrap"><Badge i={p.i}/><span className="text-xs text-zinc-400">Last verified {fmt(at(-p.v))}</span></div>
        <p className="text-sm">{p.r}</p>
        <p className="text-xs text-zinc-400">There is no guarantee this project will give an airdrop.</p>
        {p.f&&<div className="flex gap-2 text-sm text-red-300 bg-red-400/10 rounded-lg p-3"><ShieldAlert size={18} className="shrink-0"/>{p.f}</div>}
        <div className="flex gap-4 text-sm text-accent"><a href={p.w} target="_blank" rel="noreferrer" className="flex gap-1 items-center">Website <ExternalLink size={12}/></a><a href={p.x} target="_blank" rel="noreferrer" className="flex gap-1 items-center">X account <ExternalLink size={12}/></a></div>
        <h3 className="font-bold">Checklist · {pct(p.id)}%</h3>{check(p)}
        <h3 className="font-bold">Personal notes</h3>
        <div className="flex gap-2 items-center"><button onClick={()=>setWp(p.id,{fav:!w[p.id]?.fav})} className="flex gap-1 items-center text-sm"><Star size={16} className={w[p.id]?.fav?'fill-accent text-accent star-on':''}/>Favorite</button>
          <select value={prio(p)} onChange={e=>setWp(p.id,{prio:e.target.value})}>{Object.keys(PR).map(x=><option key={x}>{x}</option>)}</select></div>
        <textarea className="w-full" rows={3} placeholder="Notes" value={w[p.id]?.note||''} onChange={e=>setWp(p.id,{note:e.target.value})}/>
        <input className="w-full" placeholder="Wallet label (e.g. Main wallet)" value={w[p.id]?.wallet||''} onChange={e=>setWp(p.id,{wallet:e.target.value})}/>
        <p className="text-xs text-amber-300">Label only. Never enter a seed phrase, private key, or full address.</p>
        {p.id>=100&&<button onClick={()=>{if(confirm('Delete this project?')){setCustom(c=>c.filter(x=>x.id!==p.id));setOpen(null)}}} className="text-xs text-red-400 border border-red-400/40 rounded-lg px-3 py-1.5">Delete project</button>}
      </aside>
    </div>}
  </div>)
}
