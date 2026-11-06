let context, music, effects, interval, step = 0
const levels = { music: 0.18, effects: 0.42 }
function tone(freq, length, output, volume, type='sine') {
  const oscillator = context.createOscillator(), env = context.createGain(), t = context.currentTime
  oscillator.type=type; oscillator.frequency.value=freq
  env.gain.setValueAtTime(0.001,t); env.gain.exponentialRampToValueAtTime(volume,t+0.012)
  env.gain.exponentialRampToValueAtTime(0.001,t+length)
  oscillator.connect(env).connect(output); oscillator.start(t); oscillator.stop(t+length+0.02)
}
export function unlock(){
  if(!window.AudioContext) return
  if(!context){
    context=new AudioContext(); music=context.createGain(); effects=context.createGain()
    music.connect(context.destination); effects.connect(context.destination)
    setVolume('music',levels.music);setVolume('effects',levels.effects)
    const melody=[392,0,523.25,659.25,587.33,0,493.88,0,440,523.25,0,659.25,587.33,523.25,0,0]
    interval=setInterval(()=>{if(document.hidden||!levels.music||context.state!=='running')return
      const n=step++%16;if(melody[n])tone(melody[n],0.33,music,0.15,'triangle')
      if(n%4===0)tone([130.81,98,110,98][n/4],0.65,music,0.17)
    },245)
  }
  if(context.state==='suspended')context.resume().catch(()=>{})
}
export function setVolume(kind,value){ levels[kind]=Number(value);if(context)(kind==='music'?music:effects).gain.setTargetAtTime(levels[kind],context.currentTime,0.025) }
export function ping(win=false){if(context&&levels.effects)tone(win?880:523.25,win?0.26:0.12,effects,0.18,'triangle')}
