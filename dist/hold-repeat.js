(function(root){
  'use strict';
  function createRepeater(options){
    const now=options.now||(()=>performance.now()),setTimer=options.setTimer||setTimeout,clearTimer=options.clearTimer||clearTimeout;
    let timer=null,started=0,active=false;
    function stop(){const wasActive=active;active=false;if(timer!==null)clearTimer(timer);timer=null;if(wasActive)options.onStop?.();}
    function repeat(){if(!active)return;const increment=now()-started>=5000?10:1;if(options.step(increment)===false){stop();return;}timer=setTimer(repeat,70);}
    function start(){stop();started=now();active=true;if(options.step(1)===false){stop();return;}timer=setTimer(repeat,320);}
    return {start,stop,isActive:()=>active};
  }
  function bindHold(button,options){
    const host=options.host||window,doc=options.document||document,repeat=createRepeater(options);let pointer=null,key=null;
    const listeners=[];
    function listen(target,event,handler){target.addEventListener(event,handler);listeners.push(()=>target.removeEventListener(event,handler));}
    function stop(){repeat.stop();pointer=null;key=null;}
    listen(button,'pointerdown',e=>{if(e.button!==0||button.disabled||pointer!==null||e.isPrimary===false)return;e.preventDefault();stop();pointer=e.pointerId;button.focus({preventScroll:true});button.setPointerCapture?.(e.pointerId);repeat.start();});
    listen(button,'pointerup',e=>{if(e.pointerId===pointer)stop();});
    listen(button,'pointercancel',e=>{if(e.pointerId===pointer)stop();});listen(button,'lostpointercapture',e=>{if(e.pointerId===pointer)stop();});
    listen(button,'keydown',e=>{if(![' ','Enter'].includes(e.key)||button.disabled)return;e.preventDefault();if(!e.repeat&&key===null){stop();key=e.key;repeat.start();}});
    listen(button,'keyup',e=>{if(e.key===key){e.preventDefault();stop();}});
    // Mouse/touch clicks are already handled by pointerdown; detail=0 supports assistive clicks.
    listen(button,'click',e=>{if(e.detail===0&&!repeat.isActive()&&!button.disabled)options.step(1);});
    listen(button,'contextmenu',e=>e.preventDefault());listen(button,'blur',stop);listen(host,'blur',stop);listen(host,'pagehide',stop);listen(doc,'visibilitychange',()=>{if(doc.hidden)stop();});
    return ()=>{stop();listeners.forEach(remove=>remove());};
  }
  const api={createRepeater,bindHold};if(typeof module==='object'&&module.exports)module.exports=api;else root.HoldRepeat=api;
})(typeof window!=='undefined'?window:this);
