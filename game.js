const POS={n:'noun',v:'verb',adj:'adjective',adv:'adverb',prep:'preposition',conj:'conjunction'};
const W=RAW.trim().split('\n').map(l=>{const[w,p,o,d]=l.split('|');return{w,p:POS[p]||p,o,d}});
const $=id=>document.getElementById(id),stage=$('stage'),card=$('card');
const sh=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
let q,score,streak,lives,missed,cur,n,best=+localStorage.getItem('beebest')||0,busy;
const hud=()=>$('hud').textContent=`Score ${score}  Streak ${streak}  ${'♥'.repeat(lives)}${'♡'.repeat(5-lives)}`;
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),1800)}
function home(){stage.innerHTML=`<h1>Spelling Bee Buzz</h1><p>${W.length} words. Catch the flying bee, match clues, and spell what you hear.</p><p class="tag">Best score: ${best}</p><button class="btn" id="go">Start buzzing</button>`;$('hud').textContent='';$('go').onclick=start}
function start(){q=sh(W.slice());score=0;streak=0;lives=5;missed=[];n=0;hud();next()}
function next(){card.hidden=true;if(!lives||!q.length)return end();cur=q.shift();n++;busy=false;
 const r=Math.random();(r<.4?fly:r<.7?match:listen)(cur)}
function end(){best=Math.max(best,score);localStorage.setItem('beebest',best);
 stage.innerHTML=`<h1>${lives?'You cleared the hive!':'The bee flew away!'}</h1><h2>Score ${score}</h2><p>Missed ${missed.length} word(s):</p><p>${[...new Set(missed)].join(', ')||'none, perfect!'}</p><button class="btn" id="again">Play again</button>`;$('again').onclick=start}
function info(w){return `<div class="tag">${w.p} · from ${w.o}</div><div class="def">${w.d}</div>`}
function result(ok,pts,w){if(busy)return;busy=true;
 if(ok){streak++;score+=pts+Math.min(streak,10);if(streak%5==0&&lives<5){lives++;toast('Honey jar! +1 life')}}
 else{streak=0;lives--;missed.push(w.w);q.splice(Math.min(5,q.length),0,w)}
 hud();card.hidden=false;
 card.innerHTML=`<div class="in"><h3 class="${ok?'good':'bad'}">${ok?'Sweet! +'+(pts+Math.min(streak,10)):'Not quite'}</h3><h2>${w.w}</h2>${info(w)}<button class="btn" id="nx" autofocus>Next</button></div>`;
 const b=$('nx');b.focus();b.onclick=next}
function fly(w){const gold=Math.random()<.12,dur=(10+w.w.length*1.1)*(gold?.7:1);
 const idx=[...w.w].map((c,i)=>/[a-z]/i.test(c)?i:-1).filter(i=>i>=0);
 const hide=new Set(sh(idx).slice(0,Math.max(2,Math.ceil(idx.length*.4))));
 stage.innerHTML=`<div class="tag">${gold?'GOLDEN BEE: double points!':'Fill in the missing letters before the bee escapes'}</div><div class="sky"><div class="flyer ${gold?'gold':''}" style="animation-duration:${dur}s"><svg><use href="#bee"/></svg><div class="sign">${[...w.w].map((c,i)=>hide.has(i)?'<input maxlength="1" autocomplete="off">':c==' '?'&nbsp;&nbsp;':c).join('')}</div></div></div>${info(w)}`;
 const ins=[...stage.querySelectorAll('input')],fl=stage.querySelector('.flyer');ins[0].focus();
 const check=()=>{const f=[...w.w].map((c,i)=>hide.has(i)?ins[[...hide].sort((a,b)=>a-b).indexOf(i)].value:c).join('');
  if(ins.every(i=>i.value)){ins.forEach(i=>i.disabled=true);result(f.toLowerCase()==w.w.toLowerCase(),gold?20:10,w)}};
 ins.forEach((el,i)=>{el.oninput=()=>{if(el.value&&ins[i+1])ins[i+1].focus();check()};
  el.onkeydown=e=>{if(e.key=='Backspace'&&!el.value&&ins[i-1])ins[i-1].focus()}});
 fl.onanimationend=()=>result(false,0,w)}
function match(w){let d=sh(W.filter(x=>x!==w)).slice(0,3);const o=sh([w,...d]);
 stage.innerHTML=`<h2>Which word fits the clue?</h2><div class="def">${w.d}</div><div class="tag">${w.p} · from ${w.o}</div><div id="os"></div>`;
 o.forEach(x=>{const b=document.createElement('button');b.className='opt';b.textContent=x.w;
  b.onclick=()=>{b.classList.add(x===w?'ok':'no');result(x===w,5,w)};$('os').append(b)})}
function say(t){if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.8;speechSynthesis.speak(u)}
function listen(w){let hint=0;
 stage.innerHTML=`<h2>Listen and spell it</h2><button class="btn" id="hr">Hear the word</button><button class="btn" id="hn">Hint (costs 5)</button><div id="hb"></div><input class="ans" id="in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type the word"><br><button class="btn" id="sb">Check</button>`;
 $('hr').onclick=()=>say(w.w);$('hn').onclick=()=>{hint=1;$('hb').innerHTML=info(w)};
 const go=()=>result($('in').value.trim().toLowerCase()==w.w.toLowerCase(),hint?10:15,w);
 $('sb').onclick=go;$('in').onkeydown=e=>{if(e.key=='Enter')go()};$('in').focus();setTimeout(()=>say(w.w),300)}
home();
