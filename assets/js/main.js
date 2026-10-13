/* =============================================================
   Mattia Crapanzano · interazioni del sito
   Nessuna libreria esterna: tutto vanilla JS.
   ============================================================= */
(() => {
  'use strict';

  const d = document;
  const root = d.documentElement;
  const body = d.body;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const BASE = body.dataset.base || '';          // percorso verso la radice del sito (per assets)
  const HOME = body.dataset.home ?? BASE;        // percorso verso la home della lingua attuale
  const PAGE = body.dataset.sector || 'home';
  const EN = (root.lang || 'it').startsWith('en');
  const ICONS = BASE + 'assets/img/icons.svg';
  const BIRTH = new Date(1996, 7, 12);           // 12 agosto 1996

  const CONTACT = {
    wa: '393514658810',
    tel: '+393514658810',
    telLabel: '+39 351 465 8810',
    mail: 'crapanzano.work@gmail.com',
    site: 'https://crapanzanowork.github.io/mattia-crapanzano/'
  };

  const T = EN ? {
    labels: { quota: 'At height', luce: 'In focus', cura: 'In care', home: 'Mattia Crapanzano' },
    copied: 'Copied', saved: 'Saved',
    chatTitle: 'Message Mattia', chatSub: 'I reply on WhatsApp, usually the same day', close: 'Close',
    today: 'Today', placeholder: 'Write a message…', send: 'Send', msgLabel: 'Your message',
    call: 'Call', email: 'Email', privacy: 'WhatsApp opens: no data goes through this site',
    typing: 'Mattia is typing', hello: 'Hi! 👋 I’m Mattia.', ask: 'What are you writing about?',
    other: 'Something else', otherAsk: 'No problem: what would you like to talk about?',
    opened: 'I’ve opened WhatsApp with your message ready: just hit send there and it reaches me. 🚀',
    fallback: 'Didn’t open? Tap here',
    prefix: label => `Hi Mattia! I’m writing from your website (${label}).`,
    topics: {
      quota: { label: 'Rope access', emoji: '🧗', reply: 'Great! Tell me about the job: where, when and what kind of work.', sugg: ['I’m looking for an IRATA technician', 'We need a standby rescue operator', 'Can you send me your full CV?'] },
      luce: { label: 'Photo & video', emoji: '📸', reply: 'Nice! What do you have in mind? An event, a video, photos for your brand… tell me everything.', sugg: ['I’d like a quote for an event', 'I need a video for social media', 'I need photos for my company'] },
      cura: { label: 'Care work (OSS)', emoji: '🤝', reply: 'Sure. Who needs care, where, and at what times?', sugg: ['I’m looking for home care', 'We are a care home looking for an OSS', 'We need urgent cover'] },
      altro: { label: 'Other', emoji: '💬', reply: 'Go ahead, I’m listening.', sugg: ['I’d like to get to know you for a collaboration'] }
    }
  } : {
    labels: { quota: 'In quota', luce: 'In luce', cura: 'In cura', home: 'Mattia Crapanzano' },
    copied: 'Copiato', saved: 'Salvato',
    chatTitle: 'Scrivi a Mattia', chatSub: 'Ti rispondo su WhatsApp, di solito in giornata', close: 'Chiudi',
    today: 'Oggi', placeholder: 'Scrivi un messaggio…', send: 'Invia', msgLabel: 'Il tuo messaggio',
    call: 'Chiama', email: 'Email', privacy: 'Si apre WhatsApp: nessun dato passa da questo sito',
    typing: 'Mattia sta scrivendo', hello: 'Ciao! 👋 Sono Mattia.', ask: 'Per cosa mi scrivi?',
    other: 'Altro argomento', otherAsk: 'Nessun problema: di cosa vuoi parlarmi?',
    opened: 'Ti ho aperto WhatsApp con il messaggio già pronto: premi invio lì e mi arriva subito. 🚀',
    fallback: 'Non si è aperto? Tocca qui',
    prefix: label => `Ciao Mattia! Ti scrivo dal tuo sito (${label}).`,
    topics: {
      quota: { label: 'Lavori in quota', emoji: '🧗', reply: 'Perfetto! Raccontami il lavoro: dove, quando e che tipo di intervento.', sugg: ['Cerco un tecnico IRATA per un cantiere', 'Ci serve un soccorritore su fune (standby rescue)', 'Mi mandi il tuo CV completo?'] },
      luce: { label: 'Foto & video', emoji: '📸', reply: 'Bello! Che progetto hai in mente? Evento, video, foto per il tuo brand… dimmi tutto.', sugg: ['Vorrei un preventivo per un evento', 'Mi serve un video per i social', 'Cerco foto per la mia azienda'] },
      cura: { label: 'Assistenza OSS', emoji: '🤝', reply: 'Certo. Per chi serve l’assistenza, in che zona e con quali orari?', sugg: ['Cerco assistenza a domicilio', 'Siamo una struttura e cerchiamo un OSS', 'Ci serve una copertura urgente'] },
      altro: { label: 'Altro', emoji: '💬', reply: 'Dimmi pure, ti leggo volentieri.', sugg: ['Vorrei conoscerti per una collaborazione'] }
    }
  };

  const COLORS = { quota: '#ff5b1f', luce: 'linear-gradient(120deg,#8f5bff,#c45cff 45%,#ff4fd8)', cura: '#2fe3c0' };
  const icon = id => `<svg aria-hidden="true"><use href="${ICONS}#${id}"/></svg>`;

  /* ---------- età calcolata ---------- */
  const now = new Date();
  let age = now.getFullYear() - BIRTH.getFullYear();
  if (now < new Date(now.getFullYear(), BIRTH.getMonth(), BIRTH.getDate())) age--;
  $$('[data-age]').forEach(el => { el.textContent = age; });

  /* ---------- intro (solo la prima volta, in home) ---------- */
  const intro = $('.intro');
  const wipe = $('.wipe');
  const arriving = !!wipe && root.classList.contains('arriving');
  const ready = () => root.classList.add('is-ready');
  if (intro && root.classList.contains('show-intro')) {
    setTimeout(() => { intro.classList.add('is-done'); ready(); setTimeout(() => intro.remove(), 1100); }, 1700);
  } else {
    intro && intro.remove();
    if (!arriving) requestAnimationFrame(ready);
  }

  /* ---------- transizioni di pagina: nome del settore (o logo) + linea di caricamento ---------- */
  const META = EN
    ? { quota: '01 / 03 · CV', luce: '02 / 03 · CV', cura: '03 / 03 · CV', home: 'CV · 2026' }
    : { quota: '01 / 03 · Curriculum', luce: '02 / 03 · Curriculum', cura: '03 / 03 · Curriculum', home: 'Curriculum · 2026' };
  const labelInto = (el, text) => {
    el.textContent = '';
    if (!text) return;
    const [first, ...rest] = text.split(' ');
    const em = d.createElement('em');
    em.textContent = first;
    el.append(em, rest.length ? ' ' + rest.join(' ') : '');
  };
  if (wipe) {
    wipe.innerHTML = `<div class="wipe__in"><svg class="wipe__mark" aria-hidden="true"><use href="${ICONS}#i-m"/></svg><span class="wipe__label"></span><span class="wipe__bar"><i></i></span><span class="wipe__meta mono"></span></div>`;
  }
  const fillWipe = k => {
    const home = !COLORS[k];
    wipe.classList.toggle('is-home', home);
    const label = $('.wipe__label', wipe);
    if (home) label.textContent = T.labels.home; else labelInto(label, T.labels[k]);
    $('.wipe__meta', wipe).textContent = META[home ? 'home' : k];
  };
  const setBar = (v, ms) => {
    const i = $('.wipe__bar i', wipe);
    i.style.transitionDuration = (ms || 0) + 'ms';
    i.style.scale = v + ' 1';
  };

  /* arrivo: la linea si completa quando la pagina ha finito di caricare */
  if (arriving) {
    fillWipe(root.dataset.wipeK);
    setBar(.7, 0);
    const t0 = performance.now();
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setTimeout(() => {
        setBar(1, 380);
        setTimeout(() => {
          ready();
          wipe.classList.add('go');
          setTimeout(() => { root.classList.remove('arriving'); wipe.classList.remove('go'); setBar(0, 0); }, 1150);
        }, 400);
      }, Math.max(0, 300 - (performance.now() - t0)));
    };
    if (d.readyState === 'complete') reveal(); else addEventListener('load', reveal, { once: true });
    setTimeout(reveal, 1800); // non aspetta mai più di così
  }
  addEventListener('pageshow', e => { if (e.persisted && wipe) { wipe.classList.remove('is-on'); setBar(0, 0); } });

  /* partenza: cerchio dal punto cliccato, nome del settore e linea che avanza */
  const go = (href, k, x, y) => {
    if (reduce || !wipe) { location.href = href; return; }
    const color = COLORS[k] || '#ece8e1';
    wipe.style.setProperty('--wipe', color);
    wipe.style.setProperty('--wx', (x ?? innerWidth / 2) + 'px');
    wipe.style.setProperty('--wy', (y ?? innerHeight / 2) + 'px');
    fillWipe(k);
    setBar(0, 0);
    void wipe.offsetWidth; // il cerchio parte dal punto cliccato, non dal centro
    wipe.classList.add('is-on');
    requestAnimationFrame(() => setBar(.7, 720));
    try { sessionStorage.setItem('wipe', JSON.stringify({ c: color, k: COLORS[k] ? k : 'home' })); } catch (e) { /* storage non disponibile */ }
    setTimeout(() => { location.href = href; }, 780);
  };
  d.addEventListener('click', e => {
    const a = e.target.closest('a[data-go]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(a.href, a.dataset.k, e.clientX || undefined, e.clientY || undefined);
  });

  /* ---------- testo diviso in parole ---------- */
  $$('[data-split]').forEach(el => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(d.createTextNode(part)); return; }
            const w = d.createElement('span');
            w.className = 'w';
            const i = d.createElement('span');
            i.textContent = part;
            w.append(i);
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) {
          walk(n);
        }
      });
    };
    walk(el);
    $$('.w > span', el).forEach((s, i) => { s.style.transitionDelay = (i * 40) + 'ms'; });
  });

  /* ---------- comparsa allo scroll e contatori ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      if (en.target.dataset.count !== undefined) countUp(en.target);
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .1 });
  $$('.rv, [data-split], [data-count]').forEach(el => io.observe(el));

  function countUp(el) {
    const to = parseFloat(el.dataset.count);
    if (reduce || isNaN(to)) return;
    const t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / 1500);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  /* ---------- puntatore: luce e cursore ---------- */
  let mx = innerWidth / 2, my = innerHeight * .4, praf = 0;
  const paint = () => {
    praf = 0;
    root.style.setProperty('--mx', mx + 'px');
    root.style.setProperty('--my', my + 'px');
    root.style.setProperty('--mxn', (mx / innerWidth * 2 - 1).toFixed(3));
  };
  if (fine) addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; if (!praf) praf = requestAnimationFrame(paint); }, { passive: true });

  if (fine && !reduce) {
    root.classList.add('has-cursor');
    const cur = d.createElement('div');
    cur.className = 'cursor is-out';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<span class="cursor__ring"><span class="cursor__label"></span></span><span class="cursor__dot"></span>';
    body.append(cur);
    const dot = $('.cursor__dot', cur), ring = $('.cursor__ring', cur), lab = $('.cursor__label', cur);
    let rx = mx, ry = my;
    const loop = () => {
      rx += (mx - rx) * .2;
      ry += (my - ry) * .2;
      // "translate" (non "transform"): così il pallino resta sempre sotto al mouse
      dot.style.translate = `${mx}px ${my}px`;
      ring.style.translate = `${rx}px ${ry}px`;
      requestAnimationFrame(loop);
    };
    loop();
    d.addEventListener('pointerover', e => {
      cur.classList.remove('is-out');
      const t = e.target.closest('a, button, [data-cursor], textarea, input, label');
      const isText = !!(t && /TEXTAREA|INPUT/.test(t.tagName));
      const text = t && !isText ? (t.dataset.cursor || '') : '';
      cur.classList.toggle('is-hover', !!t && !isText);
      cur.classList.toggle('is-text', isText);
      cur.classList.toggle('is-label', !!text);
      lab.textContent = text;
      const c = t ? getComputedStyle(t).getPropertyValue('--c').trim() : '';
      cur.style.setProperty('--cur', c || 'var(--accent)');
    });
    d.addEventListener('pointerleave', () => cur.classList.add('is-out'));
    d.addEventListener('pointerenter', () => cur.classList.remove('is-out'));
  }

  /* luce dentro le superfici lucide e di vetro */
  $$('[data-light]').forEach(el => {
    if (!el.querySelector(':scope > .glow')) {
      const g = d.createElement('span');
      g.className = 'glow';
      g.setAttribute('aria-hidden', 'true');
      el.prepend(g);
    }
    if (!fine) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--lx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--ly', (e.clientY - r.top) + 'px');
    }, { passive: true });
  });

  if (fine && !reduce) {
    /* inclinazione 3D: cartellino e card LinkedIn */
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((px - .5) * 12).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - py) * 10).toFixed(2) + 'deg');
        el.style.setProperty('--gx2', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--gy2', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
    /* pulsanti magnetici */
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${(x * .22).toFixed(1)}px, ${(y * .3).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- HOME: settori, indice laterale, tasti 1-2-3 ---------- */
  const idx = $$('.idx a');
  const setWorld = k => {
    const col = { quota: '#ff5b1f', luce: '#c45cff', cura: '#2fe3c0' }[k] || '#ece8e1';
    root.style.setProperty('--spot', col);
    idx.forEach(a => a.classList.toggle('is-on', a.dataset.k === k));
  };
  $$('.world').forEach(w => {
    w.addEventListener('pointerenter', () => setWorld(w.dataset.world));
    w.addEventListener('focus', () => setWorld(w.dataset.world));
  });
  $('.worlds')?.addEventListener('pointerleave', () => setWorld(null));

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/INPUT|TEXTAREA|SELECT/.test(d.activeElement?.tagName || '')) return;
    if (root.classList.contains('chat-open') || $('.lb.is-open')) return;
    const k = { 1: 'quota', 2: 'luce', 3: 'cura' }[e.key];
    if (k && k !== PAGE) go(HOME + k + '/', k);
    if ((e.key === '0' || e.key === 'h') && PAGE !== 'home') go(HOME || './', null);
  });

  /* ---------- orologio di Verona ---------- */
  const clocks = $$('[data-clock]');
  if (clocks.length) {
    const f = new Intl.DateTimeFormat(EN ? 'en-GB' : 'it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });
    const upd = () => clocks.forEach(c => { c.textContent = f.format(new Date()); });
    upd();
    setInterval(upd, 15000);
  }

  /* ---------- scroll: avanzamento, misuratore, parallasse ---------- */
  const meterRead = $('[data-meter-read]');
  const mega = $('.s-hero__mega');
  const pad2 = n => String(n).padStart(2, '0');
  let sraf = 0;
  const onScroll = () => {
    sraf = 0;
    const h = root.scrollHeight - innerHeight;
    const p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
    root.style.setProperty('--prog', p.toFixed(4));
    if (mega && !reduce) mega.style.setProperty('--par', (scrollY * .28).toFixed(1) + 'px');
    if (meterRead) {
      if (PAGE === 'quota') meterRead.textContent = 'ALT ' + (120 * (1 - p)).toFixed(1) + ' m';
      if (PAGE === 'luce') {
        const fr = Math.floor(p * 96 * 25), s = Math.floor(fr / 25);
        meterRead.textContent = 'TC 00:' + pad2(Math.floor(s / 60)) + ':' + pad2(s % 60) + ':' + pad2(fr % 25);
      }
    }
  };
  addEventListener('scroll', () => { if (!sraf) sraf = requestAnimationFrame(onScroll); }, { passive: true });
  addEventListener('resize', () => { if (!sraf) sraf = requestAnimationFrame(onScroll); });
  onScroll();
  if (PAGE === 'cura' && meterRead) {
    const beat = () => { meterRead.textContent = '♥ ' + (68 + Math.round(Math.random() * 7)) + ' BPM'; };
    beat();
    setInterval(beat, 1800);
  }

  const whenVisible = (el, cb) => {
    let on = false;
    new IntersectionObserver(([en]) => { on = en.isIntersecting; if (on) cb(); }).observe(el);
    return () => on;
  };

  /* ---------- QUOTA: tecnico che scende sulla doppia fune ---------- */
  const tech = $('.hud__tech');
  if (tech) {
    const alt = $('[data-alt]');
    const t0 = performance.now();
    let running = false;
    const visible = whenVisible(tech.closest('.hud'), () => { if (!running) { running = true; requestAnimationFrame(frame); } });
    function frame(t) {
      const p = reduce ? .35 : (Math.sin((t - t0) / 1000 * .32 - Math.PI / 2) + 1) / 2;
      tech.setAttribute('transform', `translate(0 ${(p * 318).toFixed(1)})`);
      if (alt) alt.textContent = 'ALT ' + Math.max(0, 110 - (42 + p * 318) * 110 / 360).toFixed(1) + ' m';
      if (visible() && !reduce) requestAnimationFrame(frame); else running = false;
    }
  }

  /* ---------- LUCE: mirino con scatto ---------- */
  const vf = $('[data-vf]');
  if (vf) {
    const imgs = $$('.vf__frames img', vf);
    const cap = $('[data-vf-cap]', vf);
    const tc = $('[data-tc]', vf);
    const focus = $('.vf__focus', vf);
    let i = 0, timer = 0;
    const show = n => {
      imgs[i].classList.remove('is-on');
      i = (n + imgs.length) % imgs.length;
      imgs[i].classList.add('is-on');
      if (cap) cap.textContent = imgs[i].dataset.cap || '';
    };
    const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(i + 1), 3800); };
    const shoot = () => { vf.classList.remove('flash'); void vf.offsetWidth; vf.classList.add('flash'); show(i + 1); auto(); };
    vf.addEventListener('click', shoot);
    vf.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shoot(); } });
    if (fine) {
      vf.addEventListener('pointermove', e => {
        const r = vf.getBoundingClientRect();
        focus.style.left = (e.clientX - r.left) + 'px';
        focus.style.top = (e.clientY - r.top) + 'px';
        vf.classList.add('is-aim');
      });
      vf.addEventListener('pointerleave', () => { vf.classList.remove('is-aim'); focus.style.left = ''; focus.style.top = ''; });
    }
    auto();
    const f0 = performance.now();
    const visible = whenVisible(vf, () => requestAnimationFrame(tick));
    function tick(t) {
      const fr = Math.floor((t - f0) / 40), s = Math.floor(fr / 25);
      if (tc) tc.textContent = pad2(Math.floor(s / 3600)) + ':' + pad2(Math.floor(s / 60) % 60) + ':' + pad2(s % 60) + ':' + pad2(fr % 25);
      if (visible()) requestAnimationFrame(tick);
    }
  }

  /* ---------- LUCE: galleria orizzontale guidata dallo scroll ---------- */
  const hs = $('[data-hs]');
  if (hs) {
    const track = $('.hs__track', hs);
    const count = $('[data-hs-count]', hs);
    const shots = $$('.shot', track);
    const mq = matchMedia('(min-width: 900px) and (hover: hover) and (min-height: 560px)');
    let on = false;
    const setCount = p => { if (count) count.textContent = pad2(Math.min(shots.length, 1 + Math.round(p * (shots.length - 1)))); };
    const update = () => {
      if (!on) return;
      const dist = Math.max(0, track.scrollWidth - innerWidth);
      const total = hs.offsetHeight - innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -hs.getBoundingClientRect().top / total)) : 0;
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      hs.style.setProperty('--hp', p.toFixed(4));
      setCount(p);
    };
    const setup = () => {
      on = mq.matches && !reduce;
      hs.classList.toggle('hs--on', on);
      if (on) hs.style.height = (innerHeight + Math.max(0, track.scrollWidth - innerWidth)) + 'px';
      else { hs.style.height = ''; track.style.transform = ''; }
      update();
    };
    track.addEventListener('scroll', () => {
      if (on) return;
      const p = track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth);
      hs.style.setProperty('--hp', p.toFixed(4));
      setCount(p);
    }, { passive: true });
    addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    addEventListener('resize', setup);
    addEventListener('load', setup);
    setup();
  }

  /* ---------- lightbox per video e foto ---------- */
  let lb, lbStage, lbLast, lbGroup = [], lbIndex = 0;
  const buildLB = () => {
    lb = d.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = `<div class="lb__stage"></div>
      <button class="lb__btn lb__close" type="button" aria-label="${T.close}">${icon('i-close')}</button>
      <button class="lb__btn lb__prev" type="button" aria-label="←">${icon('i-chev-l')}</button>
      <button class="lb__btn lb__next" type="button" aria-label="→">${icon('i-chev-r')}</button>`;
    body.append(lb);
    lbStage = $('.lb__stage', lb);
    $('.lb__close', lb).addEventListener('click', closeLB);
    $('.lb__prev', lb).addEventListener('click', () => showImg(lbIndex - 1));
    $('.lb__next', lb).addEventListener('click', () => showImg(lbIndex + 1));
    lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  };
  const openLB = () => {
    lbLast = d.activeElement;
    lb.classList.add('is-open');
    body.style.overflow = 'hidden';
    setTimeout(() => $('.lb__close', lb).focus(), 50);
  };
  function closeLB() {
    if (!lb) return;
    lb.classList.remove('is-open');
    body.style.overflow = '';
    setTimeout(() => { lbStage.innerHTML = ''; }, 400);
    lbLast && lbLast.focus && lbLast.focus();
  }
  function showImg(n) {
    lbIndex = (n + lbGroup.length) % lbGroup.length;
    const src = lbGroup[lbIndex];
    lbStage.className = 'lb__stage is-img';
    lbStage.innerHTML = '';
    const img = d.createElement('img');
    img.src = src.getAttribute('href');
    img.alt = $('img', src)?.alt || '';
    lbStage.append(img);
  }
  $$('[data-video]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    if (!lb) buildLB();
    const [p, id, h] = b.dataset.video.split(':');
    const src = p === 'yt'
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
      : `https://player.vimeo.com/video/${id}?h=${h}&autoplay=1&dnt=1&title=0&byline=0`;
    lbStage.className = 'lb__stage';
    lbStage.innerHTML = '';
    const f = d.createElement('iframe');
    f.src = src;
    f.title = b.dataset.title || 'Video';
    f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    f.allowFullscreen = true;
    lbStage.append(f);
    lb.classList.remove('has-nav');
    openLB();
  }));
  const zooms = $$('[data-zoom]');
  zooms.forEach((a, n) => a.addEventListener('click', e => {
    e.preventDefault();
    if (!lb) buildLB();
    lbGroup = zooms;
    lb.classList.toggle('has-nav', zooms.length > 1);
    showImg(n);
    openLB();
  }));

  /* ---------- copia negli appunti ({eta} diventa l'età) ---------- */
  const flash = (b, text) => {
    const old = b.innerHTML;
    b.classList.add('is-done');
    if (b.classList.contains('copy')) b.innerHTML = icon('i-check'); else b.textContent = text + ' ✓';
    setTimeout(() => { b.classList.remove('is-done'); b.innerHTML = old; }, 1600);
  };
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy.replace(/\{eta\}/g, age));
      flash(b, T.copied);
    } catch (e) { /* appunti non disponibili */ }
  }));

  /* ---------- salva contatto (vCard per la rubrica) ---------- */
  $$('[data-vcard]').forEach(b => b.addEventListener('click', () => {
    const vcf = [
      'BEGIN:VCARD', 'VERSION:3.0',
      'N:Crapanzano;Mattia;;;', 'FN:Mattia Crapanzano',
      'TITLE:' + (EN ? 'IRATA L1 rope access technician · Photographer & videomaker · Care worker (OSS)' : 'Tecnico su fune IRATA L1 · Fotografo e videomaker · OSS'),
      'TEL;TYPE=CELL:' + CONTACT.tel,
      'EMAIL;TYPE=INTERNET:' + CONTACT.mail,
      'ADR;TYPE=HOME:;;;Legnago;VR;;Italia',
      'URL:' + CONTACT.site + (EN ? 'en/' : ''),
      'NOTE:P.IVA 05209460236',
      'END:VCARD'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
    const a = Object.assign(d.createElement('a'), { href: url, download: 'Mattia-Crapanzano.vcf' });
    body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    flash(b, T.saved);
  }));

  /* ---------- stampa CV ---------- */
  $$('[data-print]').forEach(b => b.addEventListener('click', () => {
    $$('.rv, [data-split]').forEach(el => el.classList.add('is-in'));
    setTimeout(() => print(), 60);
  }));

  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* =============================================================
     CHAT → WhatsApp: la conversazione si costruisce qui; all'invio
     si apre WhatsApp con il messaggio già scritto.
     ============================================================= */
  const TOPICS = T.topics;
  const TOPIC_C = { quota: '#ff5b1f', luce: '#c45cff', cura: '#2fe3c0', altro: '#ece8e1' };

  const chatWrap = d.createElement('div');
  chatWrap.innerHTML = `
    <div class="chat-scrim" data-chat-close></div>
    <section class="chat" id="chat" role="dialog" aria-modal="false" aria-labelledby="chat-title">
      <header class="chat__head">
        <span class="chat__avatar"><img src="${BASE}assets/foto/home/avatar.jpg" alt="" width="44" height="44"></span>
        <span class="chat__who"><b id="chat-title">${T.chatTitle}</b><small>${T.chatSub}</small></span>
        <button class="chat__close" type="button" data-chat-close>${T.close}</button>
      </header>
      <div class="chat__body" aria-live="polite"><span class="chat__day mono">${T.today}</span></div>
      <footer class="chat__foot">
        <form class="composer" novalidate>
          <label class="sr-only" for="chat-msg">${T.msgLabel}</label>
          <textarea id="chat-msg" rows="1" placeholder="${T.placeholder}" enterkeyhint="send" maxlength="1200"></textarea>
          <button type="submit" disabled>${T.send}</button>
        </form>
        <p class="chat__alt"><a href="tel:${CONTACT.tel}">${T.call}</a><a href="mailto:${CONTACT.mail}">${T.email}</a><span>${T.privacy}</span></p>
      </footer>
    </section>`;
  body.append(...chatWrap.children);

  const chat = $('#chat');
  const cBody = $('.chat__body', chat);
  const form = $('.composer', chat);
  const ta = $('textarea', chat);
  const send = $('button[type="submit"]', chat);
  let topic = TOPICS[PAGE] ? PAGE : null;
  let started = false, lastTrigger = null, busy = Promise.resolve();

  const add = node => { cBody.append(node); cBody.scrollTop = cBody.scrollHeight; return node; };
  const bubble = (text, who = 'in') => add(Object.assign(d.createElement('div'), { className: 'bubble bubble--' + who, textContent: text }));
  const say = text => (busy = busy.then(() => new Promise(res => {
    const t = add(Object.assign(d.createElement('div'), { className: 'bubble bubble--in bubble--typing', innerHTML: '<i></i><i></i><i></i>' }));
    t.setAttribute('aria-label', T.typing);
    setTimeout(() => { t.remove(); bubble(text, 'in'); res(); }, reduce ? 60 : 450 + Math.min(1100, text.length * 16));
  })));
  const chips = (items, cls, onPick) => {
    const box = d.createElement('div');
    box.className = 'qr ' + (cls || '');
    items.forEach(it => {
      const b = d.createElement('button');
      b.type = 'button';
      b.textContent = it.text;
      if (it.c) b.style.setProperty('--c', it.c);
      b.addEventListener('click', () => onPick(it, box));
      box.append(b);
    });
    return add(box);
  };
  const askTopic = () => busy.then(() => chips(
    Object.entries(TOPICS).map(([k, t]) => ({ k, text: t.emoji + ' ' + t.label, c: TOPIC_C[k] })), '',
    (it, box) => { box.remove(); bubble(it.text, 'out'); topic = it.k; say(TOPICS[topic].reply); suggest(); }
  ));
  const suggest = () => busy.then(() => {
    const box = chips(TOPICS[topic].sugg.map(s => ({ text: s })), 'qr--sugg', it => {
      ta.value = it.text + (it.text.endsWith('?') ? '' : ': ');
      grow();
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    });
    const more = Object.assign(d.createElement('button'), { type: 'button', className: 'qr__more', textContent: T.other });
    more.addEventListener('click', () => { box.remove(); say(T.otherAsk); askTopic(); });
    box.append(more);
  });
  const greet = () => {
    say(T.hello);
    if (topic) { say(TOPICS[topic].reply); suggest(); } else { say(T.ask); askTopic(); }
  };
  const grow = () => {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 132) + 'px';
    send.disabled = !ta.value.trim();
  };
  ta.addEventListener('input', grow);
  ta.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = ta.value.trim();
    if (!text) return;
    const label = topic ? TOPICS[topic].label : (EN ? 'contact' : 'contatto');
    const url = `https://wa.me/${CONTACT.wa}?text=${encodeURIComponent(T.prefix(label) + '\n\n' + text)}`;
    window.open(url, '_blank', 'noopener');
    $$('.qr', cBody).forEach(q => q.remove());
    bubble(text, 'out');
    ta.value = '';
    grow();
    say(T.opened);
    busy.then(() => add(Object.assign(d.createElement('a'), { className: 'wa-open', href: url, target: '_blank', rel: 'noopener', textContent: T.fallback })));
  });

  const openChat = (k, trigger) => {
    if (k && TOPICS[k] && !started) topic = k;
    lastTrigger = trigger || d.activeElement;
    root.classList.add('chat-open');
    body.classList.remove('has-badge');
    $('.dock__teaser')?.classList.remove('is-on');
    if (!started) { started = true; greet(); }
    else if (k && TOPICS[k] && k !== topic) { topic = k; say(TOPICS[k].reply); suggest(); }
    if (fine) setTimeout(() => ta.focus({ preventScroll: true }), 380);
    try { sessionStorage.setItem('chatSeen', '1'); } catch (e) { /* */ }
  };
  const closeChat = () => {
    root.classList.remove('chat-open');
    lastTrigger && lastTrigger.focus && lastTrigger.focus({ preventScroll: true });
  };
  d.addEventListener('click', e => {
    const t = e.target.closest('[data-chat]');
    if (t) { e.preventDefault(); root.classList.contains('chat-open') && t.classList.contains('dock__chat') ? closeChat() : openChat(t.dataset.chat, t); return; }
    if (e.target.closest('[data-chat-close]')) closeChat();
  });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (lb && lb.classList.contains('is-open')) { closeLB(); return; }
    if (root.classList.contains('chat-open')) closeChat();
  });

  /* invito discreto a scrivere: una volta per visita */
  let seen = false;
  try { seen = !!sessionStorage.getItem('chatSeen'); } catch (e) { /* */ }
  const teaser = $('.dock__teaser');
  if (!seen && teaser) {
    setTimeout(() => {
      if (root.classList.contains('chat-open')) return;
      body.classList.add('has-badge');
      teaser.hidden = false;
      requestAnimationFrame(() => teaser.classList.add('is-on'));
      setTimeout(() => teaser.classList.remove('is-on'), 7000);
      try { sessionStorage.setItem('chatSeen', '1'); } catch (e) { /* */ }
    }, 6500);
  }
})();
