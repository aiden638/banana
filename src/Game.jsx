import React,{useEffect,useRef,useState} from 'react'
import {games} from './config'
import {ping} from './audio'
const loaded = new Map()
export function sprite(name){if(!loaded.has(name)){const im=new Image();im.src='/assets/'+name+(name==='berry'?'.svg':'.webp');loaded.set(name,im)}return loaded.get(name)}
function painted(ctx,name,x,y,w,h){const im=sprite(name);if(!im.naturalWidth)return
  const ratio=Math.min(w/im.naturalWidth,h/im.naturalHeight),dw=im.naturalWidth*ratio,dh=im.naturalHeight*ratio
  ctx.drawImage(im,x-dw/2,y-dh/2,dw,dh)}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n))
export default function Game({index,restart,home,next,saveShot}){
 const game=games[index], canvas=useRef(null),[phase,setPhase]=useState('ready'),[score,setScore]=useState(0),[time,setTime]=useState(30),[feedback,setFeedback]=useState('')
 const controls=useRef({left:false,right:false,target:null,tap:null})
 useEffect(()=>{
  const board=canvas.current,ctx=board.getContext('2d'),c=controls.current, W=1200,H=540
  let facingLeft=false,previousX=600,lastPulse=-1
  let id,elapsed=0,last=0,points=0,spawn=0,cycle=0,judged=-1,items=[],bursts=[],px=index===0?240:600,py=H*.6,alive=true,flash=0
  function scoreHit(x,y){points++;setScore(points);ping(true);bursts.push({x,y,t:0});flash=.35;setFeedback(index===2?'PERFECT!':'+1')}
  function tap(){if(index!==2||phase!=='playing')return
   const beat=Math.floor(elapsed/1.65),pos=(elapsed%1.65)/1.65
   if(judged===beat)return
   judged=beat
   if(Math.abs(pos-.77)<.12)scoreHit(W*.3,H*.57);else{setFeedback('MISS');flash=.4;ping()}
  }
  c.tap=tap
  function key(e,down){if(e.target.closest('input,textarea,select,[contenteditable="true"]')||e.altKey||e.metaKey||e.ctrlKey||phase!=='playing')return
   if(index===1&&['ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();c[e.code==='ArrowLeft'?'left':'right']=down}
   if(index===2&&e.code==='Space'){e.preventDefault();if(down&&!e.repeat)tap()}
  }
  const kd=e=>key(e,true),ku=e=>key(e,false),blur=()=>{c.left=false;c.right=false;last=0}
  window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);window.addEventListener('blur',blur)
  function frame(now){const tick=last&&!document.hidden?Math.max(0,(now-last)/1000):0,dt=Math.min(tick,.12);last=now
   const live=phase==='playing'; if(live)elapsed+=tick
   ctx.clearRect(0,0,W,H)
   if(index===0||index===1){
    const flight=index===0
    if(live){
     if(flight&&c.target){px=c.target.x;py=c.target.y}
     if(!flight){if(c.left||c.right){px+=(Number(c.right)-Number(c.left))*dt*650;c.target=null}else if(c.target)px=c.target.x;py=H-72}
     px=clamp(px,48,W-48);py=clamp(py,55,H-55)
     spawn-=dt;if(spawn<=0){cycle++;items.push({x:flight?W+25:100+((cycle*233)%1000),y:flight?105+((cycle*89)%330):-28});spawn=flight?.96:1.12}
     for(const o of items){if(flight)o.x-=dt*255;else o.y+=dt*185
      if(Math.abs(o.x-px)<(flight?64:76)&&Math.abs(o.y-py)<62){o.hit=true;scoreHit(o.x,o.y)}}
     items=items.filter(o=>!o.hit&&o.x>-40&&o.y<H+40)
    }
    for(const o of items)painted(ctx,flight?'coin':'berry',o.x,o.y,56,56)
    ctx.save()
    if(flight&&live){
     for(let i=1;i<7;i++){ctx.fillStyle=i%2?'#ffe48a':'#fb83c5';ctx.globalAlpha=(1-i/7)*.7;ctx.beginPath();ctx.arc(px-24-i*8,py+27+i*3+Math.sin(elapsed*8+i)*4,7-i*.7,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1
    }
    if(!flight&&Math.abs(px-previousX)>1)facingLeft=px<previousX
    previousX=px;ctx.translate(px,py+(live?Math.sin(elapsed*(flight?3:7))*2:0))
    if(!flight&&facingLeft)ctx.scale(-1,1)
    painted(ctx,flight?'rocket':'girl-run',0,0,flight?110:133,flight?110:133)
    ctx.restore()
   }else{
    const y=H*.57,tx=W*.3
    const pulse=Math.floor((elapsed+1.65*.23)/1.65)
    if(live&&pulse>0&&pulse!==lastPulse){ping();lastPulse=pulse}
    ctx.fillStyle='rgba(24,9,50,.79)';ctx.beginPath();ctx.roundRect(120,y-40,960,80,40);ctx.fill()
    ctx.strokeStyle='#fff0be';ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle='#65eedc';ctx.lineWidth=6;ctx.beginPath();ctx.arc(tx,y,35,0,Math.PI*2);ctx.stroke()
    for(let i=0;i<3;i++){const x=tx+(.77-(elapsed%1.65)/1.65+i)*720;if(x<1038&&x>150)painted(ctx,'coin',x,y,55,55)}
   }
   for(const b of bursts){b.t+=dt;ctx.globalAlpha=Math.max(0,1-b.t*1.8);painted(ctx,'stars',b.x,b.y-b.t*100,85,85)}ctx.globalAlpha=1;bursts=bursts.filter(b=>b.t<.56)
   if(flash>0&&(flash-=dt)<=0)setFeedback('')
   if(live){setTime(Math.max(0,30-Math.floor(elapsed)))
    if(points>=5||elapsed>=30){saveShot(index,board);setPhase(points>=5?'won':'lost');alive=false}
   }
   if(alive)id=requestAnimationFrame(frame)
  }
  if(phase==='playing'||phase==='ready')id=requestAnimationFrame(frame)
  return ()=>{cancelAnimationFrame(id);window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);window.removeEventListener('blur',blur);c.tap=null;c.left=c.right=false}
 },[index,phase])
 function aim(e){const rect=canvas.current.getBoundingClientRect();controls.current.target={x:(e.clientX-rect.left)/rect.width*1200,y:(e.clientY-rect.top)/rect.height*540}}
 return <div className={'game-world '+game.id} style={{backgroundImage:'url(/assets/'+game.id+'.webp)'}}>
 <div className="play-heading"><button className="asset square" onClick={home} aria-label="게임 선택"><img src="/assets/back.webp" alt=""/></button><div><small>{game.english}</small><strong>{game.title}</strong></div></div>
 <div className="hud"><span>★ {score} / 5</span><span>◷ {time}s</span></div>
 <canvas ref={canvas} width="1200" height="540" aria-label={game.action} onPointerMove={aim} onPointerDown={e=>{aim(e);controls.current.tap?.()}}/>
 {feedback&&phase==='playing'&&<b className="feedback">{feedback}</b>}
 {phase!=='playing'&&<div className="veil"><div className="game-modal"><img className="modal-sticker" src={'/assets/'+(phase==='ready'?game.icon:phase==='won'?'treasure':'moon')+'.webp'} alt=""/><small>{phase==='ready'?game.english:'RESULT'}</small><h2>{phase==='ready'?game.title:phase==='won'?'미션 성공!':'시간 종료'}</h2><p>{phase==='ready'?game.action:'획득한 별 '+score+' / 5'}</p>{phase==='ready'?<button className="asset start" onClick={()=>setPhase('playing')}><img src="/assets/start-yellow.webp" alt="시작하기"/></button>:<div className="result-actions"><button onClick={restart}>다시 도전</button><button onClick={next}>다음 장면 →</button></div>}</div></div>}
 <div className="game-actions"><button onClick={restart}>↻ 다시 시작</button><button onClick={home}>게임 선택</button></div></div>
}
