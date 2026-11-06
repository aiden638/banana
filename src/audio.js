const levels={music:.18,effects:.42}
// Each phrase has 32 eighth notes, with its own bass movement and arrangement.
const scores={
 menu:{bpm:122,voice:'triangle',length:.27,bass:[48,43,45,43],notes:[67,0,72,76,74,0,71,0,69,72,0,76,74,72,0,0,67,0,72,79,76,74,72,0,69,71,74,0,72,0,0,0]},
 flight:{bpm:108,voice:'sine',length:.64,bass:[45,41,48,43],notes:[69,76,81,0,79,76,72,0,69,72,77,81,0,79,77,72,72,76,79,84,0,83,79,76,71,74,79,83,81,79,74,0]},
 catch:{bpm:136,voice:'triangle',length:.14,bass:[53,58,55,48],notes:[77,0,81,79,77,0,72,0,74,77,0,82,81,0,77,0,79,0,74,77,79,81,0,79,76,0,72,74,76,0,77,0]},
 beat:{bpm:60*4/1.65,voice:'square',length:.105,bass:[42,45,40,47],notes:[0,66,0,69,73,0,69,0,0,69,73,0,76,0,73,69,0,64,0,68,71,0,68,0,0,71,74,0,78,0,74,71]}
}
let context,music,effects,track='menu',step=0,nextNote=0
const hz=note=>440*2**((note-69)/12)
function tone(freq,length,output,volume,type='sine',when=context.currentTime,endFreq){
 const oscillator=context.createOscillator(),env=context.createGain()
 oscillator.type=type;oscillator.frequency.setValueAtTime(freq,when)
 if(endFreq)oscillator.frequency.exponentialRampToValueAtTime(endFreq,when+length)
 env.gain.setValueAtTime(.0001,when);env.gain.exponentialRampToValueAtTime(volume,when+.009);env.gain.exponentialRampToValueAtTime(.0001,when+length)
 oscillator.connect(env).connect(output);oscillator.start(when);oscillator.stop(when+length+.015)
}
function schedule(){
 if(document.hidden||context.state!=='running')return
 const s=scores[track],now=context.currentTime
 if(nextNote<now)nextNote=now+.025
 while(nextNote<now+.12){
  const i=step%32,n=s.notes[i],root=s.bass[Math.floor(i/8)],when=nextNote
  if(n)tone(hz(n),s.length,music,track==='beat'?.046:.14,s.voice,when)
  if(track==='flight'&&i%8===0)for(const interval of [12,19])tone(hz(root+interval),1.5,music,.053,'sine',when)
  if(track==='catch'&&i%4===2)tone(hz(root+19),.10,music,.10,'sine',when)
  if(i%4===0||(track==='beat'&&i%8===5))tone(hz(root),track==='flight'?.92:.26,music,.21,'triangle',when)
  if(track==='beat'){
   if(i%2===0)tone(125,.13,music,.27,'sine',when,43)
   if(i%4===2)tone(1480,.055,music,.045,'triangle',when,220)
   else if(i%2===1)tone(5100,.042,music,.024,'square',when,1500)
  }
  step++;nextNote+=30/s.bpm
 }
}
export function setTrack(name,restart=false){
 if(!scores[name]||(track===name&&!restart))return
 track=name;step=0
 if(context){const old=music;old.gain.cancelScheduledValues(context.currentTime);old.gain.setTargetAtTime(.0001,context.currentTime,.045)
  setTimeout(()=>old.disconnect(),320);music=context.createGain();music.connect(context.destination);music.gain.value=levels.music
  nextNote=context.currentTime+(restart&&name==='beat'?.77*1.65%(.5*1.65):.055);schedule()}
}
export function unlock(){
 if(!window.AudioContext)return
 if(!context){context=new AudioContext();music=context.createGain();effects=context.createGain();music.connect(context.destination);effects.connect(context.destination)
  setVolume('music',levels.music);setVolume('effects',levels.effects);setInterval(schedule,55)}
 if(context.state==='suspended')context.resume().catch(()=>{})
}
export function setVolume(kind,value){levels[kind]=Number(value);if(context)(kind==='music'?music:effects).gain.setTargetAtTime(levels[kind],context.currentTime,.025)}
export function ping(win=false){if(context&&levels.effects)tone(win?880:523.25,win?.26:.12,effects,.18,'triangle')}
