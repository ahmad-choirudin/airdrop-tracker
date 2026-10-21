import re,shutil
P='src/App.jsx'
shutil.copy(P,P+'.bak')
t=open(P).read()
ok=0;bad=0
def rep(a,b):
    global t,ok,bad
    if a in t:
        t=t.replace(a,b);ok+=1;print('OK  ',a[:50])
    else:
        bad+=1;print('SKIP',a[:50])
rep("import mascot from './mascot.webp'","import mascot from './mascot.webp'\nimport logo from './logo.webp'\nimport './theme-mono.css'")
rep('''<div className="serif holo-text text-2xl">CUBBIE<span className="block text-sm text-zinc-400 font-sans tracking-normal">Airdrop Tracker</span></div>''','''<div className="flex items-center gap-3"><img src={logo} alt="CUBBIE" className="h-9 w-9 object-contain"/><div className="serif text-2xl leading-none">CUBBIE<span className="block mt-1 text-xs text-zinc-400 font-sans tracking-wide">Airdrop Tracker</span></div></div>''')
rep('''<h2 className="text-lg font-semibold">{NAV.find(n=>n[0]===view)[1]}</h2>''','''<img src={logo} alt="" className="h-7 w-7 object-contain"/><h2 className="text-lg font-semibold">{NAV.find(n=>n[0]===view)[1]}</h2>''')
rep("'bg-accent/10 border-accent/40 text-accent font-bold md:bg-accent md:border-transparent md:text-ink'","'bg-accent/10 border-accent/30 text-accent font-semibold'")
rep('<svg viewBox="0 0 600 200" className="w-full">','<svg viewBox="0 0 600 200" className="w-full text-accent">')
rep('stopColor="#39ff88"','stopColor="currentColor"')
rep('stroke="#1a2e1f"','stroke="#ffffff1c"')
rep('fill="#fff" className="dot"','fill="currentColor" className="dot"')
rep('''<h1 className="text-4xl md:text-6xl mt-3 holo-text">Explore the ecosystem</h1>''','''<h2 className="text-2xl md:text-3xl mt-3 holo-text">Explore the ecosystem</h2>''')
rep("export default function App(){",'''const Sp=({s=16,style})=><svg aria-hidden="true" viewBox="0 0 24 24" width={s} height={s} className="spark" style={style}><path d="M12 0C12.8 7 17 11.2 24 12C17 12.8 12.8 17 12 24C11.2 17 7 12.8 0 12C7 11.2 11.2 7 12 0Z" fill="currentColor"/></svg>
export default function App(){''')
rep("{view==='explore'&&<>",'''{view==='explore'&&<>
        <section className="hero relative overflow-hidden rounded-3xl border border-line p-6 md:p-10">
          <div className="relative z-[1] max-w-md">
            <h1 className="serif text-4xl md:text-6xl leading-[1.05]">All airdrops<br/>in one place</h1>
            <p className="mt-3 text-sm text-zinc-400">Track deadlines, tasks and rewards for every project, with clear verification status. No promises, just the facts.</p>
          </div>
          <img src={logo} alt="" className="hero-logo"/>
          <Sp s={22} style={{right:'38%',top:'18%'}}/><Sp s={14} style={{right:'14%',top:'12%',animationDelay:'1s'}}/><Sp s={18} style={{right:'8%',bottom:'16%',animationDelay:'2s'}}/>
        </section>
        <div className="flex gap-2 text-sm">{[['Active','Active'],['Upcoming','Upcoming'],['Ended','Closed'],['All','All']].map(([k,l])=><button key={k} onClick={()=>setSt(k)} className={`rounded-lg px-4 py-1.5 border ${st===k?'bg-accent/10 border-accent/40 text-accent':'border-transparent text-zinc-500'}`}>{l}</button>)}</div>''')
open(P,'w').write(t)
h=open('index.html').read()
h=re.sub(r'<link rel="icon"[^>]*>','',h)
if 'favicon.png' not in h:
    h=h.replace('</head>','<link rel="icon" type="image/png" href="/favicon.png"/></head>',1)
open('index.html','w').write(h)
print('done:',ok,'ok,',bad,'skipped (App.jsx backup: src/App.jsx.bak)')
