/* Round 8 shared — the comparison's volume + presets. */
window.GRT8=(()=>{
const{NebVol}=GRT7;
const KC={s0:.038,sv:.014,lsMin:-4.0,lsMax:-1.8,sMul:.88,relocLs:Math.log(.048)};
const EYE=[-2.05,.42,1.3];
let _vol=null;
function vol(){if(!_vol){_vol=new NebVol('crab',33);_vol.light=[1.3*Math.cos(.9),1.05,1.3*Math.sin(.9)];_vol.rebuild()}return _vol}
return{KC,EYE,vol};})();
