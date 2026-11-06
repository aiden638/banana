import React from 'react'

// Both planes share the backplate's image and registration. Soft masks anchor
// the edges while each subject moves around its own pivot.
export default function LivingArt({name}){
 return <div className={'paint-planes planes-'+name} aria-hidden="true" style={{'--drawing':'url(/assets/'+name+'.webp)'}}>
  <div className="paint-plane plane-far"/><div className="paint-plane plane-near"/>
 </div>
}
