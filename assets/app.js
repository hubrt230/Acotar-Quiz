(()=>{'use strict';
const root=document.getElementById('quiz');if(!root)return;
const quiz=JSON.parse(document.getElementById('quiz-data').textContent),key='acotar-v1-'+quiz.id;
let answers=[],step=0,preference='all';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>{try{sessionStorage.setItem(key,JSON.stringify({answers,step,preference}))}catch{}};
const allowed=()=>preference==='men'?['rhysand','cassian','azriel','lucien']:preference==='women'?['feyre','nesta','mor']:null;
const focus=()=>{root.focus({preventScroll:true});root.scrollIntoView({behavior:'auto',block:'start'})};
try{const saved=JSON.parse(sessionStorage.getItem(key));if(saved&&Array.isArray(saved.answers)&&saved.answers.length<=quiz.questions.length&&saved.answers.every((a,i)=>Number.isInteger(a)&&a>=0&&a<quiz.questions[i].answers.length)&&Number.isInteger(saved.step)&&saved.step>=0&&saved.step<=Math.min(saved.answers.length,quiz.questions.length)){answers=saved.answers;step=saved.step;preference=['all','men','women'].includes(saved.preference)?saved.preference:'all'}}catch{}
function start(){
root.innerHTML=`<span class="eyebrow">Your story starts here</span><h2>Go with your first instinct.</h2><p>12 questions. No right answers. Just some suspiciously revealing choices.</p>${quiz.id==='mate'?'<label for="preference">Who would you like to match with?</label><select id="preference"><option value="all">All characters</option><option value="men">Men</option><option value="women">Women</option></select><p class="micro">This changes the result pool only. These are imagined fan matches, independent of canon pairings.</p>':''}<button class="btn" id="start">${answers.length?'Continue your quiz':'Begin the quiz'} <span aria-hidden="true">↗</span></button>${answers.length?'<button class="quiet" id="fresh">Start fresh</button>':''}<p class="micro">No signup · Answers stay in this browser tab</p>`;
const select=document.getElementById('preference');if(select){select.value=preference;select.onchange=()=>{preference=select.value;save()}};
document.getElementById('start').onclick=()=>{if(step===quiz.questions.length)showResult();else render();focus()};
const fresh=document.getElementById('fresh');if(fresh)fresh.onclick=()=>{answers=[];step=0;save();render();focus()};
}
function render(){
const q=quiz.questions[step];
root.innerHTML=`<div class="quiz-top"><span>QUESTION ${String(step+1).padStart(2,'0')} / ${quiz.questions.length}</span><span>${escape(quiz.short)}</span></div><progress value="${step}" max="${quiz.questions.length}" aria-label="Questions completed">${step}/${quiz.questions.length}</progress><fieldset><legend>${escape(q.text)}</legend><div class="answers">${q.answers.map((a,i)=>`<label class="answer"><input type="radio" name="answer" value="${i}" ${answers[step]===i?'checked':''}><span>${escape(a.text)}</span></label>`).join('')}</div></fieldset><div class="controls"><button class="quiet" id="back">${step?'← Back':'← Introduction'}</button><button class="btn" id="next" ${answers[step]===undefined?'disabled':''}>${step===quiz.questions.length-1?'Reveal my result':'Next question'} <span aria-hidden="true">→</span></button></div>`;
root.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{answers[step]=Number(input.value);save();document.getElementById('next').disabled=false}));
document.getElementById('back').onclick=()=>{if(step){step--;save();render()}else start();focus()};
document.getElementById('next').onclick=()=>{if(answers[step]===undefined)return;step++;save();if(step===quiz.questions.length)showResult();else render();focus()};
}
function showResult(){
const ranked=AcotarScoring.rank(quiz,answers,quiz.id==='mate'?allowed():null),winner=ranked[0],r=quiz.results[winner.key],second=quiz.results[ranked[1].key];
const url=new URL(`results/${winner.key}/`,location.href);url.search='';url.hash='';
root.innerHTML=`<div class="result"><span class="eyebrow">The stars have an opinion</span><div class="crest" aria-hidden="true">✧</div><h2>${escape(r.name)}</h2><p class="tagline">${escape(r.tagline)}</p><p>${escape(r.text)}</p><div class="traits"><div><h3>${quiz.id==='mate'?'Why it fits':'Your strength'}</h3><p>${escape(r.strength)}</p></div><div><h3>Your gentle reminder</h3><p>${escape(r.growth)}</p></div></div><p><strong>${quiz.id==='mate'?'Your dream date':'Your little ritual'}:</strong> ${escape(r.ritual)}</p><p class="micro">${Math.abs(winner.score-ranked[1].score)<1e-10?'A close call! You also tied with':'Your runner-up'}: ${escape(second.name)}. This is a playful fan interpretation, not a personality assessment.</p><div class="result-actions"><button class="btn" id="share">Share my result ↗</button><a class="btn secondary" href="${escape(url.pathname)}">Read my result</a><button class="quiet" id="retake">Retake quiz</button></div><p class="status" id="status" role="status"></p><label class="hidden" id="copy-label">Copy your result link<input id="copy-link" readonly></label><a class="card-link" href="../#quizzes">Try another quiz <span>→</span></a></div>`;
document.getElementById('retake').onclick=()=>{answers=[];step=0;save();start();focus()};
document.getElementById('share').onclick=async()=>{const text=`I got ${r.name} on Acotar Court Quiz. ${r.tagline}`;try{if(navigator.share){await navigator.share({title:'My ACOTAR result',text,url:url.href})}else if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(`${text} ${url.href}`);document.getElementById('status').textContent='Result link copied. Send it to your Inner Circle.'}else{throw new Error('clipboard unavailable')}}catch(e){if(e.name==='AbortError')return;document.getElementById('status').textContent='Copy the link below to share your result.';document.getElementById('copy-label').classList.remove('hidden');const input=document.getElementById('copy-link');input.value=url.href;input.focus();input.select()}};
}
start();
})();
