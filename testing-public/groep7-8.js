/* ========= Subpagina Groep 7/8 – JS =========
   Vereist: je bestaande main.js staat al op de pagina
   (smooth scroll, header shrink, reveal). Dit script voegt
   alleen modal + quiz + lokale opslag toe.
================================================ */

/* ---------- Helpers ---------- */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];

/* ---------- Modal open/close (Blockly demo) ---------- */
$$('[data-open]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const id = btn.getAttribute('data-open');
    const modal = document.getElementById(id);
    if(!modal) return;
    modal.classList.add('open');
    // focus trap: zet focus op close knop
    const closeBtn = modal.querySelector('[data-close]');
    closeBtn?.focus();
    // analytics
    window.plausible?.('blockly-demo-open');
  });
});

$$('[data-close]').forEach(btn=>{
  btn.addEventListener('click', ()=> btn.closest('.modal')?.classList.remove('open'));
});

$('#blocklyModal')?.addEventListener('click', (e)=>{
  if(e.target.id==='blocklyModal') e.currentTarget.classList.remove('open');
});

/* ---------- Mock “voltooid” (tot echte demo staat) ---------- */
const mockBtn = document.getElementById('mockComplete');
if (mockBtn){
  mockBtn.addEventListener('click', ()=>{
    localStorage.setItem('demoBlocklyDone','true');
    window.plausible?.('blockly-demo-voltooid');
    alert('Top! (Demo gemarkeerd als voltooid — vervangen we straks door het echte finish-event).');
  });
}

/* ---------- Mini-quiz (Mediawijsheid) ---------- */
const quizEl = document.getElementById('quiz');
const resultEl = document.getElementById('quizResult');
const finishBtn = document.getElementById('quizFinish');
const answers = {}; // { '1': true/false, ... }

quizEl?.addEventListener('click', e=>{
  const btn = e.target.closest('button[data-q]');
  if(!btn) return;
  const { q, a } = btn.dataset;

  // aria-pressed toggle
  $$('.choices button', btn.parentElement).forEach(b=>b.setAttribute('aria-pressed','false'));
  btn.setAttribute('aria-pressed','true');

  answers[q] = (a === 'right');
});

finishBtn?.addEventListener('click', ()=>{
  const total = ['1','2','3'].filter(k => answers[k]).length;

  // resultaat tonen
  resultEl.style.display = 'block';
  resultEl.textContent = `Score: ${total}/3 — ${total===3 ? 'Geweldig! ✅' : 'Check de uitleg bij de keuzes en probeer nog eens.'}`;

  // lokaal opslaan
  localStorage.setItem('demoMediaDone', String(total));

  // analytics
  window.plausible?.('mediawijsheid-quiz-afgerond', { props: { score: total } });
});

/* ---------- Kleine quality-of-life ---------- */
// Als user alles goed had, badge tonen op kaart (optioneel)
(function showBadgesFromStorage(){
  try{
    const bl = localStorage.getItem('demoBlocklyDone') === 'true';
    const mq = parseInt(localStorage.getItem('demoMediaDone')||'0', 10);
    if (bl) {
      const target = document.querySelector('.content-card:nth-of-type(2) .card-content');
      if (target && !target.querySelector('.badge[data-badge="done"]')){
        const span = document.createElement('span');
        span.className = 'badge';
        span.dataset.badge = 'done';
        span.textContent = '✔ Demo voltooid';
        target.querySelector('.meta')?.appendChild(span);
      }
    }
    if (mq >= 3) {
      const target = document.querySelector('.content-card:nth-of-type(1) .card-content');
      if (target && !target.querySelector('.badge[data-badge="quiz"]')){
        const span = document.createElement('span');
        span.className = 'badge';
        span.dataset.badge = 'quiz';
        span.textContent = '🏅 Quiz 3/3';
        target.querySelector('.meta')?.appendChild(span);
      }
    }
  } catch {}
})();
