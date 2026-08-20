/**
 * Tiny head script that publishes --liftag-stable-vh* and
 * data-liftag-short-viewport before first paint. The client plugin of the
 * same name keeps those values fresh on resize; this copy exists so a
 * 390px phone does not paint the tall hero and then jump when JS arrives.
 *
 * Keep the numbers in lockstep with plugins/stable-viewport.client.ts.
 */
export const VIEWPORT_BOOTSTRAP_MARK = 'liftag-vh-boot'

export const VIEWPORT_BOOTSTRAP_SCRIPT = `(function(){/*${VIEWPORT_BOOTSTRAP_MARK}*/var r=document.documentElement,w=window,vv=w.visualViewport,iw=Math.round((vv&&vv.width)||w.innerWidth||r.clientWidth||0),ih=Math.round(Math.max((vv&&vv.height)||0,w.innerHeight||0,r.clientHeight||0)),sw=(w.screen&&w.screen.width)||0,sh=(w.screen&&w.screen.height)||0,h=ih;if(!iw||!ih)return;if(iw<=768&&sw>0&&sw<=768&&sh>=ih&&sh<=1600)h=Math.max(ih,sh);r.style.setProperty('--liftag-stable-vh-px',h+'px');r.style.setProperty('--liftag-stable-vh-unit',(h/100)+'px');r.style.setProperty('--liftag-stable-vh',h+'px');r.style.setProperty('--liftag-stable-vh-39',(h*0.39)+'px');r.style.setProperty('--liftag-stable-vh-185',(h*1.85)+'px');r.style.setProperty('--liftag-stable-vh-220',(h*2.2)+'px');r.style.setProperty('--liftag-stable-vh-300',(h*3)+'px');r.style.setProperty('--liftag-stable-vh-340',(h*3.4)+'px');r.style.setProperty('--liftag-stable-vh-380',(h*3.8)+'px');r.style.setProperty('--liftag-stable-vh-470',(h*4.7)+'px');r.style.setProperty('--liftag-stable-vh-560',(h*5.6)+'px');r.dataset.liftagShortViewport=h<=740?'true':'false';})();`
