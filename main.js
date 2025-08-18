// main.js – animaties + 3D cube + GA4

/* ====================
   Smooth scroll
==================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ====================
   Header shrink on scroll
==================== */
const header = document.querySelector('.site-header');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 80 && y > lastY) {
    header.classList.add('header--shrink');
  } else if (y < 80 || y < lastY) {
    header.classList.remove('header--shrink');
  }
  lastY = y;
});

/* ====================
   Reveal-on-scroll
==================== */
const animatedEls = document.querySelectorAll('.content-card, .split-container > *');
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
animatedEls.forEach(el => io.observe(el));

/* ====================
   Typewriter hero effect
==================== */
const heroTitle = document.querySelector('.hero-section h1');
if (heroTitle) {
  const original = heroTitle.innerHTML;
  heroTitle.innerHTML = '';
  [...original].forEach((ch, i) => {
    setTimeout(() => (heroTitle.innerHTML += ch), i * 45);
  });
}

/* ====================
   3D rotating cube logo using Three.js (module)
==================== */
(async () => {
  const canvas = document.getElementById('logoCube');
  if (!canvas) return;

  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
  const { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshStandardMaterial, Mesh, AmbientLight, DirectionalLight, Color } = THREE;

  const scene = new Scene();
  scene.background = new Color(0x000000); // transparent with css overlay
  const camera = new PerspectiveCamera(40, 1, 0.1, 10);
  camera.position.z = 2.8;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshStandardMaterial({ color: 0x7355ff, roughness: 0.3, metalness: 0.5 });
  const cube = new Mesh(geometry, material);
  scene.add(cube);

  scene.add(new AmbientLight(0xffffff, 0.6));
  const dirLight = new DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(2, 3, 4);
  scene.add(dirLight);

  function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.015;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ====================
   GA4 via Firebase (dynamic import)
==================== */
(async () => {
  try {
    const [{ initializeApp, getApps }, { getAnalytics, isSupported, logEvent }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js"),
    ]);

    const firebaseConfig = {
      apiKey: "AIzaSyA0LcMrF62nVwXMtJFpDcPB7bviEZl7Vuk",
      authDomain: "codeblocks-app.firebaseapp.com",
      projectId: "codeblocks-app",
      storageBucket: "codeblocks-app.firebasestorage.app",
      messagingSenderId: "341679011888",
      appId: "1:341679011888:web:125666a5a4b0ff9701d5f5",
      measurementId: "G-EMWEQFN77C",
    };

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

    if (!(await isSupported())) return; // bv. Safari/SSR fallback
    const analytics = getAnalytics(app);

    // standaard page view loggen
    logEvent(analytics, "page_view", {
      page_title: document.title,
      page_location: location.href,
      page_path: location.pathname,
    });

    // custom hooks voor bv. je formulier
    window.cbDemoStart = () => logEvent(analytics, "demo_request_start");
    window.cbDemoSuccess = () => logEvent(analytics, "demo_request_success");

  } catch (e) {
    console.warn("Analytics init skipped:", e?.message || e);
  }
})();

