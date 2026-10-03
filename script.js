const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Carousels ----------
const chevron = id => `<svg class="ic" aria-hidden="true"><use href="#${id}"/></svg>`;

document.querySelectorAll('.carousel').forEach(c => {
  const track = c.querySelector('.track');
  const slides = [...track.children];
  if (!slides.length) return;

  const prev = document.createElement('button');
  prev.className = 'nav prev'; prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous photo'); prev.innerHTML = chevron('i-left');
  const next = document.createElement('button');
  next.className = 'nav next'; next.type = 'button';
  next.setAttribute('aria-label', 'Next photo'); next.innerHTML = chevron('i-right');

  const dots = document.createElement('div');
  dots.className = 'dots';
  const dotBtns = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', `Show photo ${i + 1} of ${slides.length}`);
    b.addEventListener('click', () => goTo(i));
    dots.appendChild(b);
    return b;
  });

  const count = document.createElement('span');
  count.className = 'count'; count.setAttribute('aria-live', 'polite');

  c.append(prev, next, dots, count);

  let index = 0;
  const goTo = i => {
    index = (i + slides.length) % slides.length;
    track.scrollTo({ left: index * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  };
  const update = () => {
    index = Math.round(track.scrollLeft / track.clientWidth);
    dotBtns.forEach((b, i) => b.classList.toggle('on', i === index));
    count.textContent = `${index + 1} / ${slides.length}`;
  };

  prev.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
  });
  window.addEventListener('resize', () => track.scrollTo({ left: index * track.clientWidth }));
  update();
});

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        // stagger siblings that arrive together
        const sibs = [...en.target.parentElement.children].filter(n => n.classList.contains('reveal'));
        en.target.style.transitionDelay = `${Math.max(0, sibs.indexOf(en.target)) * 90}ms`;
        en.target.classList.add('in');
        setTimeout(() => { en.target.style.transitionDelay = ''; }, 1400);
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// ---------- Header shadow + hero image drift + road car ----------
const header = document.getElementById('header');
const heroImg = document.querySelector('.hero-car img');
const road = document.querySelector('.road');
const drive = document.querySelector('.drive');
let ticking = false;
const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 8);
  if (!reduce) {
    if (heroImg && y < 900) heroImg.style.transform = `translateY(${y * 0.06}px) scale(1.02)`;
    if (road && drive) {
      const r = road.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - r.top / window.innerHeight));
      drive.style.transform = `translateX(${p * (road.clientWidth - 120)}px)`;
    }
  }
  ticking = false;
};
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

// ---------- Lead form -> WhatsApp ----------
const form = document.getElementById('lead');
form.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(form);
  const car = (d.get('car') || '').trim();
  const name = (d.get('name') || '').trim();
  const err = document.getElementById('err');
  err.hidden = !!(car && name);
  if (!car || !name) return;
  const msg = `Hello TET Embu Motors, I'm ${name}. I want to: ${d.get('intent').toLowerCase()}. Car: ${car}.`;
  window.open('https://wa.me/254715382923?text=' + encodeURIComponent(msg), '_blank', 'noopener');
});

document.getElementById('yr').textContent = new Date().getFullYear();
