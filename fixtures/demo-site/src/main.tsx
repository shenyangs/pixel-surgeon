import React from 'react';
import {createRoot} from 'react-dom/client';
import './base.css';
function Demo(){return <main><nav><b>◒ orbit</b><span>开启下一篇章</span></nav><div className="orb">✳</div><small>专注创作，从这里开始</small><h1>少些阻碍。<br/>多些可能。</h1><p>为你的下一个好想法，留一处安静空间。<br/>创作真正属于自己的作品。</p><button className="hero-cta" onClick={()=>window.parent.postMessage({type:'select',selector:'.hero-cta'},window.location.origin)}>开始创作 ↗</button><footer>本地 React 示例 · 点击按钮以选择</footer></main>}
createRoot(document.getElementById('root')!).render(<Demo/>);
