import React,{useEffect,useRef,useState} from 'react'
import {createRoot} from 'react-dom/client'
import ClickSpark from './ClickSpark'
import StarBorder from './StarBorder'
import Game,{sprite} from './Game'
import {games,product} from './config'
import {unlock,ping,setVolume} from './audio'
import './style.css'
const scenes=['타이틀','게임 선택',...games.map(g=>g.title),'게임 소개']
const names=['TITLE','ARCADE',...games.map(g=>g.english),'STORE']
const src=name=>'/assets/'+name+'.webp'
function Icon({name,size=18}){
 const paths={prev:'m15 5-7 7 7 7',next:'m9 5 7 7-7 7',full:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',sliders:'M3 6h6m4 0h8M3 12h12m4 0h2M3 18h3m4 0h11M9 3v6m6 0v6m-9 0v6',up:'m6 14 6-6 6 6',volume:'M4 9h4l5-4v14l-5-4H4zM16 8q5 4 0 8',replay:'M4 5v5h5M4 10a8 8 0 1 1 0 5',play:'m7 4 13 8-13 8z'}
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>
}
function Logo(){return <img className="logo" src={product.logo} alt={product.title}/>}
function SceneCard({game,index,go}){
 return <StarBorder className="gamecard" color={game.color} thickness={2} radius={21} duration={6} onClick={()=>go(index+2)} aria-label={game.title+' 선택'}>
 <div className="card-art" style={{backgroundImage:'url('+src(game.id)+')'}}><img src={src(['rocket','girl-run','note'][index])} alt=""/></div>
 <div className="card-info"><small>{game.english}</small><h2>{game.title}</h2><b>↗</b></div></StarBorder>
}
function Store({shots,go}){
 const [details,setDetails]=useState(false)
 return <div className={'store '+(details?'details':'')}><div className="store-main"><div className="store-art"><div className="disc"/><img src={src('girl-heart')} alt="노란 하트를 안은 주인공"/></div><div className="store-copy"><Logo/><h2>작은 우주, 세 가지 모험</h2><p>{product.description}</p><strong>{product.release}　·　{product.price}</strong>{product.provisional&&<small>판매 정보는 임시입니다</small>}<div className="store-actions">{product.storeUrl?<a href={product.storeUrl}>스토어로 이동 ↗</a>:<button disabled>스토어 준비 중</button>}<button className="asset more" onClick={()=>setDetails(!details)} aria-label={details?'소개 닫기':'더 알아보기'}>{details?'소개 닫기':<img src={src('more')} alt="더 알아보기"/>}</button></div></div></div>
 {details&&<div className="gallery">{games.map((g,i)=><button key={g.id} onClick={()=>go(2+i)}><img src={shots[i]||src(g.id+'-shot')} alt={g.title+' 게임 화면'}/><strong>{g.title}</strong><span>{g.action}</span></button>)}</div>}</div>
}
function App(){
 const [scene,S]=useState(0),[rev,R]=useState(0),[transition,T]=useState(null),[hidden,H]=useState(false),[expanded,E]=useState(false),[visual,V]=useState(true),[music,M]=useState(.18),[effects,F]=useState(.42),[soundOn,A]=useState(true),[notice,N]=useState('')
 const controls=useRef({scene:0,to:0,token:0,timers:[],sequence:'',last:0}),mouse=useRef(null),shots=useRef({})
 const game=scene>=2&&scene<=4
 function clear(){controls.current.timers.forEach(clearTimeout);controls.current.timers=[]}
 function go(target,animate=true){target=Math.max(0,Math.min(5,target));clear()
  const c=controls.current;c.to=target;const token=++c.token;E(false);ping()
  const enter=()=>{c.scene=target;S(target);R(v=>v+1)}
  if(!animate){T(null);enter();return}
  T({target,token});c.timers=[setTimeout(enter,360),setTimeout(()=>T(null),1040)]
 }
 function fullscreen(){(document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>N('브라우저의 전체화면 기능을 사용해 주세요.'))}
 useEffect(()=>{if(notice){const t=setTimeout(()=>N(''),2500);return()=>clearTimeout(t)}},[notice])
 useEffect(()=>{function key(e){
  const writing=e.target.closest?.('textarea,select,[contenteditable]:not([contenteditable="false"]),input:not([type="range"]):not([type="checkbox"])')
  const c=controls.current;if(writing||e.isComposing){c.sequence='';return}if(e.repeat)return
  if(!e.altKey&&!e.ctrlKey&&!e.metaKey){
   const s=performance.now();if(s-c.last>2200)c.sequence='';c.last=s
   c.sequence=(c.sequence+e.key).slice(-4)
   if(c.sequence==='1234'){H(h=>!h);E(false);c.sequence='';document.activeElement?.blur();return}
   const shortcuts={BracketLeft:()=>go((c.to+5)%6),BracketRight:()=>go((c.to+1)%6),KeyL:()=>go(0,false),KeyG:()=>go(1),KeyR:()=>go(c.to,false),KeyT:()=>go(c.to),KeyS:()=>go(5)}
   if(shortcuts[e.code]){e.preventDefault();unlock();shortcuts[e.code]()}
  }
 }
 window.addEventListener('keydown',key);document.addEventListener('pointerdown',unlock);document.addEventListener('keydown',unlock)
 const advance=e=>{if(!mouse.current)return;mouse.current.style.transform='translate3d('+e.clientX+'px,'+e.clientY+'px,0)';mouse.current.style.opacity=e.pointerType==='touch'?0:1;mouse.current.classList.toggle('hot',!!e.target.closest?.('button,a,input,select,canvas'))}
 const leave=()=>{if(mouse.current)mouse.current.style.opacity=0}
 document.addEventListener('pointermove',advance);document.addEventListener('pointerleave',leave);window.addEventListener('blur',leave)
 ;['hero','flight','catch','beat','rocket','coin','girl-run','berry','stars','start-yellow','note','heart','more','girl-heart'].forEach(sprite)
 return()=>{clear();window.removeEventListener('keydown',key);document.removeEventListener('pointerdown',unlock);document.removeEventListener('keydown',unlock);document.removeEventListener('pointermove',advance);document.removeEventListener('pointerleave',leave);window.removeEventListener('blur',leave)}
 },[])
 useEffect(()=>{setVolume('music',soundOn?music:0);setVolume('effects',soundOn?effects:0)},[music,effects,soundOn])
 function saveShot(i,canvas){const bg=sprite(games[i].id);if(!bg.naturalWidth)return;const out=document.createElement('canvas');out.width=600;out.height=270;const ctx=out.getContext('2d');ctx.drawImage(bg,0,0,600,270);ctx.drawImage(canvas,0,0,600,270);shots.current[i]=out.toDataURL('image/webp',.78)}
 const inc=n=>go((controls.current.to+n+6)%6)
 return <div className={'app '+(visual?'custom ':'')+(hidden?'clean':'')}><ClickSpark disabled={!visual} sparkColor={['#fff3ab','#ff80ca','#6be4d5']} ring sparkCount={6} sparkSize={5} sparkRadius={18} duration={270} shape="star" style={{display:'flex',flexDirection:'column'}}>
 <main className={'stage scene-'+scene}>
 <header><button className="arcade-brand" aria-label="타이틀로 이동" onClick={()=>go(0)}><img src="/assets/carton.svg" alt=""/><span>BANANA MILK<b>ARCADE</b></span></button><div className="wordmark"><i/> {product.title}</div></header>
 {scene===0&&<section key={'title'+rev} className="hero"><div className="twinkles">{[[18,38],[34,20],[66,23],[47,73],[80,14],[26,71]].map(([x,y],i)=><i key={x} style={{left:x+'%',top:y+'%',animationDelay:i*-.8+'s'}}>✦</i>)}</div><div className="hero-body"><div className="collection"><span/> MINI GAME COLLECTION <span/></div><Logo/><button className="asset hero-start" onClick={()=>go(1)}><img src={src('start-yellow')} alt="시작하기"/></button></div></section>}
 {scene===1&&<section className="selection"><div className="collection"><span/> GAME SELECT <span/></div><h1>미니게임 선택</h1><div className="cards">{games.map((g,i)=><SceneCard key={g.id} game={g} index={i} go={go}/>)}</div></section>}
 {game&&<Game key={scene+'-'+rev} index={scene-2} restart={()=>go(scene,false)} home={()=>go(1)} next={()=>inc(1)} saveShot={saveShot}/>}
 {scene===5&&<Store shots={shots.current} go={go}/>}
 {transition&&<div className="wipe" key={transition.token}><div><small>{names[transition.target]}</small><strong>{scenes[transition.target]}</strong><span>✦</span></div></div>}
 </main>
 {!hidden&&<footer><div className="director-left"><button className={'director-toggle '+(expanded?'active':'')} onClick={()=>E(v=>!v)} aria-expanded={expanded}><Icon name="sliders"/> Director <Icon name="up" size={14}/></button><span className="divider"/><span className="scene-num">{String(scene+1).padStart(2,'0')} <em>/ 06</em></span><span className="current-label">{scenes[scene]}</span></div>
 <nav className="scene-nav" aria-label="장면 이동"><button onClick={()=>inc(-1)} aria-label="이전 장면"><Icon name="prev" size={15}/></button>{scenes.map((s,i)=><button key={s} className={'scene-dot '+(scene===i?'on':'')} title={s} aria-label={s} aria-current={scene===i?'step':undefined} onClick={()=>go(i)}><i/></button>)}<button onClick={()=>inc(1)} aria-label="다음 장면"><Icon name="next" size={15}/></button></nav>
 <div className="director-right"><button title="음향 켜기 또는 끄기" aria-label="음향 켜기 또는 끄기" aria-pressed={soundOn} onClick={()=>A(!soundOn)}><Icon name="volume"/><span>{soundOn?'Sound on':'Sound off'}</span></button><span className="divider"/><button title="전체화면" aria-label="전체화면" onClick={fullscreen}><Icon name="full"/></button></div>
 {expanded&&<aside className="panel"><div className="panel-title"><strong>Director</strong><button onClick={()=>E(false)} aria-label="닫기">×</button></div><label>장면 바로 이동<select value={scene} onChange={e=>go(+e.target.value)}>{scenes.map((s,i)=><option key={s} value={i}>{s}</option>)}</select></label><div className="panel-grid">{[['이전 장면','[',()=>inc(-1)],['다음 장면',']',()=>inc(1)],['로고 재생','L',()=>go(0,false)],['게임 선택','G',()=>go(1)],['현재 장면 재시작','R',()=>go(scene,false)],['전환 재생','T',()=>go(scene)],['판매 · 소개','S',()=>go(5)],['전체화면','⛶',fullscreen]].map(([l,k,fn])=><button key={l} onClick={fn}>{l}<kbd>{k}</kbd></button>)}</div><label>마우스 시각화<input type="checkbox" checked={visual} onChange={e=>V(e.target.checked)}/></label><label>배경음<input type="range" min="0" max="1" step=".01" value={music} onChange={e=>{A(true);M(+e.target.value)}}/></label><label>효과음<input type="range" min="0" max="1" step=".01" value={effects} onChange={e=>{A(true);F(+e.target.value)}}/></label><div className="hide-tip">메뉴 숨기기 · 표시 <kbd>1 → 2 → 3 → 4</kbd></div></aside>}</footer>}
 {notice&&!hidden&&<div className="notice">{notice}</div>}
 </ClickSpark><div className="cursor" ref={mouse} hidden={!visual}><svg width="22" height="27" viewBox="0 0 22 27"><path d="M1 1 19 12 11 14 14 22 10 24 6 16 1 21Z" stroke="#3e165c" strokeWidth="2" strokeLinejoin="round" fill="var(--cursor,#fff1a0)"/></svg></div></div>
}
createRoot(document.getElementById('root')).render(<App/>)
