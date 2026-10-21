import shutil
P='src/App.jsx'
t=open(P).read()
shutil.copy(P,P+'.bak2')
NEW=r'''{view==='tasks'&&(()=>{
        const groups=data.map(d=>({d,ts:vis.filter(x=>x.p.id===d.id)})).filter(g=>g.ts.length).sort((a,b)=>a.d.dl-b.d.dl)
        const chips=[['all','All'],['todo','Todo'],['doing','Doing'],['done','Done'],['archived','Archived']]
        return(
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-bold">Tasks <span className="text-sm text-zinc-500 font-normal">{vis.length} shown · {board.length} total</span></h1>
            <div className="flex gap-2 items-center">
              <div className="inline-flex rounded-lg border border-line overflow-hidden">{[['list','List'],['board','Board']].map(([k,l])=><button key={k} onClick={()=>setTv(k)} className={`px-3 py-1.5 text-sm ${tv===k?'bg-accent/10 text-accent':'text-zinc-500'}`}>{l}</button>)}</div>
              <button onClick={()=>setNt(!nt)} className="bg-accent text-ink font-bold rounded-lg px-3 py-1.5 text-sm whitespace-nowrap">+ New task</button>
            </div>
          </div>
          {nt&&<form className="flex gap-2" onSubmit={e=>{e.preventDefault();const d=data.find(x=>x.id===+e.target.pj.value);addT(d,e.target.t.value);e.target.reset();setNt(false)}}><select name="pj">{live.map(d=><option key={d.id} value={d.id}>{d.n}</option>)}</select><input name="t" placeholder="Task title" className="flex-1 min-w-0"/><button className="bg-accent text-ink rounded-lg px-3 text-sm">Add</button></form>}
          <div className="flex gap-2 overflow-x-auto noscroll items-center">
            <input placeholder="Search tasks" value={tq} onChange={e=>setTq(e.target.value)} className="w-36 shrink-0"/>
            {chips.map(([k,l])=><button key={k} onClick={()=>setVw(k)} className={`shrink-0 rounded-full border px-3 py-1 text-xs ${vw===k?'bg-accent text-ink border-transparent':'border-zinc-500 text-zinc-300'}`}>{l}{k==='archived'?'':' '+cnt(k)}</button>)}
            <select value={pj} onChange={e=>setPj(e.target.value)} className="shrink-0 w-36"><option value="">All projects</option>{data.map(d=><option key={d.id} value={d.id}>{d.n}</option>)}</select>
            <select value={pf} onChange={e=>setPf(e.target.value)} className="shrink-0 w-32"><option value="">Any priority</option>{Object.keys(PC).map(k=><option key={k} value={k}>{k}</option>)}</select>
          </div>
          {tv==='list'?(
            <div className="space-y-2">
              {groups.map(({d,ts})=>{const o=ex.includes(d.id)||tq||vw!=='all',dn=getT(d.id).filter(x=>x.s==='done').length
                return <section key={d.id} className="rounded-2xl border border-line bg-panel">
                  <button onClick={()=>setEx(e=>e.includes(d.id)?e.filter(i=>i!==d.id):[...e,d.id])} className="w-full flex items-center gap-3 p-3 text-left">
                    <span className="w-8 h-8 rounded-full bg-accent text-ink grid place-items-center font-bold shrink-0">{d.n[0]}</span>
                    <span className="min-w-0 flex-1"><span className="block font-bold truncate">{d.n}</span><span className="block text-xs text-zinc-400 truncate">{d.c} · {dlText(d)}</span></span>
                    <span className="w-20 shrink-0"><span className="block text-xs text-zinc-400 text-right mb-1">{dn}/{getT(d.id).length}</span><Bar v={pct(d.id)}/></span>
                    <span className="text-zinc-500">{o?'▾':'▸'}</span>
                  </button>
                  {o&&<div className="border-t border-line p-3 space-y-2">
                    {ts.map(x=><div key={x.id} className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-accent" checked={x.s==='done'} onChange={()=>move(d,x.i,x.s==='done'?'todo':'done')}/><span className={`flex-1 min-w-0 ${x.s==='done'?'line-through text-zinc-500':''}`}>{x.t}</span><select value={x.s} onChange={e=>move(d,x.i,e.target.value)} className="!py-0.5 !px-1 text-xs">{['todo','doing','done'].map(s=><option key={s}>{s}</option>)}</select></div>)}
                    <form className="flex gap-2" onSubmit={e=>{e.preventDefault();addT(d,e.target.t.value);e.target.reset()}}><input name="t" placeholder="Add task" className="flex-1 min-w-0"/><button aria-label="Add task" className="bg-accent text-ink rounded-lg px-3"><Plus size={16}/></button></form>
                  </div>}
                </section>})}
              {!groups.length&&<p className="text-sm text-zinc-500">No tasks match. Change the search or filters.</p>}
            </div>
          ):(
            <>
              <div className="flex md:hidden gap-2">{['todo','doing','done'].map(k=><button key={k} onClick={()=>setCol(k)} className={`flex-1 rounded-lg border py-2 text-sm ${col===k?'bg-accent text-ink font-bold border-transparent':'border-line text-zinc-400'}`}>{k} {vis.filter(x=>x.s===k).length}</button>)}</div>
              <div className="grid md:grid-cols-3 gap-3">{['todo','doing','done'].map(k=>
                <div key={k} onDragOver={e=>e.preventDefault()} onDrop={e=>{const [pid,i]=e.dataTransfer.getData('t').split(':');move(data.find(x=>x.id===+pid),+i,k)}} className={`min-w-0 space-y-2 min-h-24 max-h-[70vh] overflow-y-auto pr-1 ${k===col?'':'hidden md:block'}`}>
                  <div className="text-sm py-1 hidden md:block sticky top-0 bg-ink z-[1]"><span className={`inline-block w-2 h-2 rounded-full mr-2 ${k==='todo'?'bg-zinc-400':k==='doing'?'bg-amber-400':'bg-accent'}`}/>{k} <span className="text-zinc-500">{vis.filter(x=>x.s===k).length}</span></div>
                  {vis.filter(x=>x.s===k).map(x=><div key={x.id} draggable onDragStart={e=>e.dataTransfer.setData('t',x.p.id+':'+x.i)} className="rounded-lg border border-line bg-panel p-2 space-y-1 cursor-grab pop">
                    <button onClick={()=>setOpen(x.p.id)} className="text-left text-sm leading-snug"><span className={`${PC[prio(x.p)]} mr-1`}>●</span>{x.t}</button>
                    <div className="flex justify-between items-center gap-2 text-xs text-zinc-500"><span className="truncate">{x.p.n}</span><select value={x.s} onChange={e=>move(x.p,x.i,e.target.value)} className="!py-0.5 !px-1 text-xs shrink-0">{['todo','doing','done'].map(s=><option key={s}>{s}</option>)}</select></div>
                  </div>)}
                  {!vis.some(x=>x.s===k)&&<p className="text-xs text-zinc-600 px-1">Empty</p>}
                </div>)}</div>
            </>
          )}
        </div>)})()}

      '''
a="const [menu,setMenu]=useState(false)"
s=t.find("{view==='tasks'&&");e=t.find("{view==='cal'&&<>")
if a not in t or s<0 or e<0:
    print('SKIP: anchors not found. Nothing changed.');raise SystemExit
t=t[:s]+NEW+t[e:]
t=t.replace(a,a+"\n  const [tv,setTv]=useLS('at-tv','list'),[ex,setEx]=useState([])",1)
open(P,'w').write(t)
print('OK: Tasks page updated (backup: src/App.jsx.bak2)')
