import React from 'react';
import {createRoot} from 'react-dom/client';
import './base.css';
function Demo(){return <main><nav><b>◒ orbit</b><span>YOUR NEXT CHAPTER</span></nav><div className="orb">✳</div><small>SPACE TO DO YOUR BEST WORK</small><h1>Less friction.<br/>More possibility.</h1><p>One calm place for your next big idea.<br/>Build something that feels like you.</p><button className="hero-cta" onClick={()=>window.parent.postMessage({type:'select',selector:'.hero-cta'},window.location.origin)}>Start creating ↗</button><footer>LOCAL REACT FIXTURE · CLICK CTA TO SELECT</footer></main>}
createRoot(document.getElementById('root')!).render(<Demo/>);
