import shutil
P='src/App.jsx'
t=open(P).read()
shutil.copy(P,P+'.bak3')
ok=bad=0
def rep(a,b):
    global t,ok,bad
    if a in t:
        t=t.replace(a,b);ok+=1;print('OK  ',a[:55])
    else:
        bad+=1;print('SKIP',a[:55])
rep("import mascot from './mascot.webp'","import mascot from './mascot.webp'\nimport {logoFor} from './logos'")
rep("export default function App(){",'''const Av=({p,s=32})=>{const l=logoFor(p.n);return l?<img src={l} alt="" width={s} height={s} className="rounded-full object-cover shrink-0" style={{width:s,height:s}}/>:<span className="rounded-full border border-zinc-600 grid place-items-center font-bold text-accent shrink-0" style={{width:s,height:s}}>{p.n[0]}</span>}
export default function App(){''')
rep('<span className="w-10 h-10 rounded-full border border-zinc-500 grid place-items-center font-bold text-accent">{p.n[0]}</span>','<Av p={p} s={40}/>')
rep('<span className="w-8 h-8 rounded-full bg-accent text-ink grid place-items-center font-bold shrink-0">{d.n[0]}</span>','<Av p={d} s={32}/>')
rep('<span className="w-8 h-8 rounded-full border border-zinc-600 grid place-items-center font-bold text-accent shrink-0">{h.n[0]}</span>','<Av p={h} s={32}/>')
rep('<span className="w-8 h-8 rounded-full border border-zinc-600 grid place-items-center font-bold text-accent shrink-0">{d.n[0]}</span>','<Av p={d} s={32}/>')
rep('<div><h2 className="text-2xl font-bold">{p.n}</h2><div className="text-sm text-zinc-400">{p.c} · {p.k} · {p.s}</div></div>','<div className="flex items-center gap-3"><Av p={p} s={44}/><div><h2 className="text-2xl font-bold">{p.n}</h2><div className="text-sm text-zinc-400">{p.c} · {p.k} · {p.s}</div></div></div>')
rep('<h3 className="text-lg font-bold">{d.n}</h3>','<div className="flex items-center gap-2"><Av p={d} s={28}/><h3 className="text-lg font-bold">{d.n}</h3></div>')
open(P,'w').write(t)
print('done:',ok,'ok,',bad,'skipped (backup: src/App.jsx.bak3)')
