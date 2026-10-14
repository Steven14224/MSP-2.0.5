/* =========================================================
   Sermaínca — interacciones del sitio
   Sin dependencias. Edite CONFIG para ajustar datos de la empresa.
   ========================================================= */

const CONFIG = {
  // Número de WhatsApp en formato internacional, sin "+" ni espacios.
  whatsapp: '593962928062',
  emailContacto: 'contacto@sermainca.com',
  emailProyectos: 'proyectos@sermainca.com',

  // Opcional: URL de un servicio de formularios (Formspree, Getform, backend propio…).
  // Si se deja vacío, el formulario se envía por WhatsApp y ofrece la alternativa por correo.
  formEndpoint: '',

  // Horario de atención (hora de Ecuador). 1 = lunes … 5 = viernes.
  horario: { dias: [1, 2, 3, 4, 5], desde: 8, hasta: 18 },

  // Redes sociales: deje vacío lo que no exista y no se mostrará el ícono.
  redes: {
    linkedin: '',
    facebook: '',
    instagram: '',
  },

  // Sectores con cobertura in situ.
  zonas: [
    'Quito Norte', 'Quito Centro', 'Quito Sur', 'Carcelén', 'Calderón', 'Cotocollao',
    'La Carolina', 'Iñaquito', 'El Batán', 'Quicentro', 'La Mariscal', 'Chillogallo',
    'Quitumbe', 'Solanda', 'Cumbayá', 'Tumbaco', 'Puembo', 'Pifo', 'Tababela',
    'Valle de los Chillos', 'Sangolquí', 'Conocoto', 'San Rafael', 'Pomasqui',
    'San Antonio de Pichincha', 'Nayón', 'Parque Industrial Quito',
  ],
};

document.documentElement.classList.remove('no-js');
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* almacenamiento no disponible */ }
  },
};

/* ---------- Avisos ---------- */
const toastEl = $('#toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}

function waLink(text) {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}

/* ---------- Tema claro / oscuro ---------- */
$('#theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('sm-theme', next); } catch (e) {}
  $('meta[name="theme-color"]').setAttribute('content', next === 'light' ? '#ffffff' : '#070f1a');
});

/* ---------- Menú móvil ---------- */
const header = $('.site-header');
const menuBtn = $('#menu-btn');
function setMenu(open) {
  header.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}
menuBtn.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
$$('#main-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Progreso de lectura, botón arriba, sección activa ---------- */
const progress = $('#scroll-progress');
const fabTop = $('#fab-top');
fabTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    fabTop.classList.toggle('show', scrollY > 700);
    ticking = false;
  });
}, { passive: true });

const navLinks = $$('.nav-link');
// Secciones que no tienen enlace propio se asocian a la entrada más cercana del menú.
const navFor = { inicio: 'inicio', servicios: 'servicios', proceso: 'servicios', ahorro: 'servicios', clientes: 'clientes', nosotros: 'nosotros', planes: 'soporte', soporte: 'soporte', faq: 'soporte', contacto: 'contacto' };
const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = navFor[entry.target.id];
    navLinks.forEach(l => {
      const active = l.getAttribute('href') === `#${target}`;
      l.classList.toggle('is-active', active);
      if (active) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main > section').forEach(s => spy.observe(s));

/* ---------- Aparición al hacer scroll + contadores ---------- */
function animateCounter(el) {
  const target = Number(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  if (reduceMotion) { el.textContent = prefix + target; return; }
  const start = performance.now();
  const dur = 1600;
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const revealer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    $$('.counter', entry.target).forEach(animateCounter);
    revealer.unobserve(entry.target);
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => revealer.observe(el));
// Respaldo: si se salta con un ancla, muestra todo lo que ya quedó por encima de la vista.
window.addEventListener('scroll', () => {
  $$('.reveal:not(.is-visible)').forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight) { el.classList.add('is-visible'); $$('.counter', el).forEach(animateCounter); revealer.unobserve(el); }
  });
}, { passive: true });

/* ---------- Pestañas de servicios ---------- */
const tabs = $$('[role="tab"]');
function selectTab(tab, focus = false) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    panel.hidden = !on;
    if (on) {
      // Reinicia la animación de las barras del panel visible
      $$('.bar i', panel).forEach(i => { i.classList.remove('go'); void i.offsetWidth; requestAnimationFrame(() => i.classList.add('go')); });
    }
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', e => {
    const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (dir) { e.preventDefault(); selectTab(tabs[(i + dir + tabs.length) % tabs.length], true); }
    if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
    if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
  });
});
selectTab(tabs[0]);
$$('[data-service]').forEach(link => {
  link.addEventListener('click', () => selectTab($(`#tab-${link.dataset.service}`)));
});

/* ---------- Preselección del servicio en el formulario ---------- */
const servicioSelect = $('#c-servicio');
const detalle = $('#c-detalle');
$$('[data-preselect]').forEach(link => {
  link.addEventListener('click', () => {
    servicioSelect.value = link.dataset.preselect;
    clearError(servicioSelect);
    if (link.dataset.plan && !detalle.value.trim()) {
      detalle.value = `Me interesa la póliza de soporte "${link.dataset.plan}". Número aproximado de equipos/usuarios: `;
    }
    if (link.id === 'calc-cta' && !detalle.value.trim()) {
      detalle.value = `Tengo ${calc.equipos.value} impresoras y gasto aproximadamente $${calc.gasto.value} al mes en impresión. Quisiera una propuesta de alquiler HP.`;
    }
    updateCount();
  });
});

/* ---------- Calculadora de ahorro ---------- */
const calc = {
  equipos: $('#calc-equipos'), equiposOut: $('#calc-equipos-out'),
  gasto: $('#calc-gasto'),
  pct: $('#calc-pct'), pctOut: $('#calc-pct-out'),
  mes: $('#calc-mes'), anio: $('#calc-anio'),
};
const usd = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
function runCalc() {
  const gasto = Math.max(0, Number(calc.gasto.value) || 0);
  const pct = Number(calc.pct.value) / 100;
  calc.equiposOut.textContent = calc.equipos.value;
  calc.pctOut.textContent = `${calc.pct.value}%`;
  calc.mes.textContent = usd.format(gasto * pct);
  calc.anio.textContent = usd.format(gasto * pct * 12);
}
['input', 'change'].forEach(ev => $('#calc-form').addEventListener(ev, runCalc));
$('#calc-form').addEventListener('submit', e => e.preventDefault());
runCalc();

/* ---------- Filtro de casos de éxito ---------- */
$$('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    $$('.chip').forEach(c => { c.classList.toggle('is-active', c === chip); c.setAttribute('aria-pressed', String(c === chip)); });
    const f = chip.dataset.filter;
    $$('.case').forEach(c => c.classList.toggle('is-hidden', f !== 'todos' && c.dataset.cat !== f));
  });
});

/* ---------- Verificador de cobertura ---------- */
const normalize = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
$('#coverage-list').innerHTML = CONFIG.zonas.map(z => `<option value="${z}">`).join('');
$('#zones').innerHTML = CONFIG.zonas.map(z => `<li>${z}</li>`).join('');
$('#coverage-form').addEventListener('submit', e => {
  e.preventDefault();
  const q = normalize($('#coverage-input').value);
  const msg = $('#coverage-msg');
  const items = $$('#zones li');
  items.forEach(li => li.classList.remove('hit'));
  if (!q) { msg.textContent = 'Escriba su sector o barrio.'; msg.className = 'coverage-msg no'; return; }
  const hits = items.filter(li => normalize(li.textContent).includes(q) || q.includes(normalize(li.textContent)));
  if (hits.length) {
    hits.forEach(li => li.classList.add('hit'));
    msg.textContent = '✓ ¡Sí! Tenemos atención in situ en su sector.';
    msg.className = 'coverage-msg ok';
  } else {
    msg.innerHTML = `No encontramos ese sector en la lista, pero podemos evaluarlo. <a href="${waLink(`Hola Sermaínca, ¿tienen cobertura en ${$('#coverage-input').value}?`)}" target="_blank" rel="noopener">Consúltenos por WhatsApp</a>.`;
    msg.className = 'coverage-msg no';
  }
});

/* ---------- Estado de atención (abierto / cerrado) ---------- */
function updateStatus() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guayaquil', weekday: 'short', hour: 'numeric', hour12: false,
  }).formatToParts(new Date()).map(p => [p.type, p.value]));
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const hour = Number(parts.hour) % 24;
  const { dias, desde, hasta } = CONFIG.horario;
  const open = dias.includes(day) && hour >= desde && hour < hasta;
  $('#status-dot').classList.toggle('open', open);
  $('#status-text').textContent = open ? 'Atendiendo ahora en Quito' : 'Atención corporativa en Quito';
}
updateStatus();
setInterval(updateStatus, 60000);

/* ---------- Validación compartida ---------- */
const messages = {
  valueMissing: 'Este campo es obligatorio.',
  typeMismatch: 'Ingrese un correo válido.',
  phone: 'Ingrese un teléfono válido (mínimo 7 dígitos).',
  short: 'Cuéntenos un poco más (mínimo 10 caracteres).',
};
function setError(field, msg) {
  const wrap = field.closest('.field');
  wrap.classList.add('invalid');
  field.setAttribute('aria-invalid', 'true');
  const err = $('.error', wrap);
  if (err) err.textContent = msg;
}
function clearError(field) {
  const wrap = field.closest('.field');
  if (!wrap) return;
  wrap.classList.remove('invalid');
  field.removeAttribute('aria-invalid');
  const err = $('.error', wrap);
  if (err) err.textContent = '';
}
function validateField(field) {
  clearError(field);
  if (field.validity.valueMissing || (field.required && !field.value.trim())) return setError(field, messages.valueMissing), false;
  if (field.validity.typeMismatch) return setError(field, messages.typeMismatch), false;
  if (field.type === 'tel' && field.value.replace(/\D/g, '').length < 7) return setError(field, messages.phone), false;
  if (field.tagName === 'TEXTAREA' && field.required && field.value.trim().length < 10) return setError(field, messages.short), false;
  return true;
}
function validateForm(form) {
  const fields = $$('input[required], select[required], textarea[required]', form);
  const results = fields.map(validateField);
  const firstBad = fields[results.indexOf(false)];
  if (firstBad) firstBad.focus();
  return !firstBad;
}
$$('#contact-form, #ticket-form').forEach(form => {
  form.addEventListener('blur', e => { if (e.target.matches('[required]') && e.target.value) validateField(e.target); }, true);
  form.addEventListener('input', e => { if (e.target.closest('.field.invalid')) validateField(e.target); });
});

/* ---------- Formulario de contacto ---------- */
const contactForm = $('#contact-form');
const success = $('#form-success');
const countEl = $('#c-count');
function updateCount() { countEl.textContent = `${detalle.value.length} / ${detalle.maxLength}`; }
detalle.addEventListener('input', updateCount);
$('#send-channel').textContent = CONFIG.formEndpoint ? 'nuestro sistema de solicitudes' : 'WhatsApp, con opción de correo';

contactForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (contactForm.website.value) return; // bot
  if (!validateForm(contactForm)) { toast('Revise los campos marcados.'); return; }

  const d = Object.fromEntries(new FormData(contactForm));
  delete d.website;
  const text = [
    '*Nueva solicitud desde sermainca.com*',
    `Nombre: ${d.nombre}`,
    d.empresa && `Empresa: ${d.empresa}`,
    `Correo: ${d.email}`,
    `Teléfono: ${d.telefono}`,
    `Servicio: ${d.servicio}`,
    `Detalle: ${d.detalle}`,
  ].filter(Boolean).join('\n');
  const mailto = `mailto:${CONFIG.emailProyectos}?cc=${CONFIG.emailContacto}&subject=${encodeURIComponent(`Solicitud: ${d.servicio} – ${d.nombre}`)}&body=${encodeURIComponent(text.replace(/\*/g, ''))}`;

  const btn = $('#contact-submit');
  btn.disabled = true;
  btn.textContent = 'Enviando…';

  try {
    if (CONFIG.formEndpoint) {
      const res = await fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(d),
      });
      if (!res.ok) throw new Error(res.status);
      $('#success-alt').textContent = '';
    } else {
      window.open(waLink(text), '_blank', 'noopener');
      $('#success-alt').innerHTML = `¿No se abrió WhatsApp? <a href="${mailto}">Envíe su solicitud por correo</a>.`;
    }
    contactForm.hidden = true;
    success.hidden = false;
    success.focus();
  } catch (err) {
    toast('No se pudo enviar. Le abrimos su correo para enviarlo desde allí.');
    location.href = mailto;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar Solicitud';
  }
});

$('#form-reset').addEventListener('click', () => {
  contactForm.reset();
  $$('.field', contactForm).forEach(f => f.classList.remove('invalid'));
  updateCount();
  success.hidden = true;
  contactForm.hidden = false;
  $('#c-nombre').focus();
});

/* ---------- Mesa de ayuda (tickets) ---------- */
const ticketForm = $('#ticket-form');
function renderTickets() {
  const list = store.get('sm-tickets', []);
  $('#ticket-history').hidden = list.length === 0;
  $('#ticket-list').innerHTML = list.slice(0, 5).map(t =>
    `<li><span><code>${t.id}</code> · ${escapeHtml(t.tipo)}</span><span class="muted">${new Date(t.fecha).toLocaleDateString('es-EC')}</span></li>`
  ).join('');
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function ticketId() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SM-${ymd}-${rnd}`;
}
ticketForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm(ticketForm)) { toast('Revise los campos marcados.'); return; }
  const d = Object.fromEntries(new FormData(ticketForm));
  const id = ticketId();
  const text = [
    `*Ticket de soporte ${id}*`,
    `Empresa: ${d.empresa}`,
    `Contacto: ${d.contacto}`,
    `Tipo: ${d.tipo}`,
    `Prioridad: ${d.prioridad}`,
    `Descripción: ${d.descripcion}`,
  ].join('\n');
  window.open(waLink(text), '_blank', 'noopener');
  const list = store.get('sm-tickets', []);
  list.unshift({ id, tipo: d.tipo, fecha: Date.now() });
  store.set('sm-tickets', list.slice(0, 20));
  renderTickets();
  ticketForm.reset();
  toast(`Ticket ${id} generado. Envíelo en WhatsApp para confirmarlo.`);
});
$('#ticket-clear').addEventListener('click', () => { store.set('sm-tickets', []); renderTickets(); });
renderTickets();

/* ---------- Copiar correo ---------- */
$$('.copy-btn').forEach(btn => btn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(btn.dataset.copy);
    toast('Correo copiado al portapapeles.');
  } catch (e) {
    toast(btn.dataset.copy);
  }
}));

/* ---------- Redes sociales y año ---------- */
const socialIcons = {
  linkedin: '<path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9z"/>',
  facebook: '<path fill="currentColor" d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z"/>',
  instagram: '<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></g>',
};
const socialsHtml = Object.entries(CONFIG.redes)
  .filter(([, url]) => url)
  .map(([net, url]) => `<a class="icon-btn" href="${url}" target="_blank" rel="noopener" aria-label="Sermaínca en ${net}"><svg class="ico" viewBox="0 0 24 24">${socialIcons[net]}</svg></a>`);
socialsHtml.push(`<a class="icon-btn" href="${waLink('Hola Sermaínca, quisiera información.')}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg class="ico"><use href="#i-whatsapp"/></svg></a>`);
$('#socials').innerHTML = socialsHtml.join('');
$('#fab-wa').href = waLink('Hola Sermaínca, quisiera información sobre sus servicios.');
$('#year').textContent = new Date().getFullYear();
