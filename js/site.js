import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, query, where, orderBy, getDocs }
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const grid = document.getElementById("cat-grid");

// ---------- Textos editables (desde el panel de control) ----------
async function loadContenido() {
  try {
    const snap = await getDoc(doc(db, "sitio", "home"));
    if (!snap.exists()) return;
    const c = snap.data();

    const heroTitulo = document.getElementById("hero-titulo");
    if (c.heroLinea1 || c.heroLinea2) {
      heroTitulo.innerHTML = "";
      heroTitulo.appendChild(document.createTextNode(c.heroLinea1 || ""));
      heroTitulo.appendChild(document.createElement("br"));
      const em = document.createElement("em");
      em.textContent = c.heroLinea2 || "";
      heroTitulo.appendChild(em);
    }

    if (c.heroDescripcion) document.getElementById("hero-desc").textContent = c.heroDescripcion;
    if (c.heroBoton) document.getElementById("hero-boton").textContent = c.heroBoton + " ↓";
    if (c.catTitulo) document.getElementById("cat-titulo").textContent = c.catTitulo;
    if (c.catSubtitulo) document.getElementById("cat-subtitulo").textContent = c.catSubtitulo;
    if (c.footerIzquierda) document.getElementById("footer-izq").textContent = c.footerIzquierda;
    if (c.footerDerecha) document.getElementById("footer-der").textContent = c.footerDerecha;

    renderContacto(c);
  } catch (err) {
    console.error("No se pudo cargar el contenido editable:", err);
  }
}

function renderContacto(c) {
  const box = document.getElementById("contact-box");
  const links = document.getElementById("contact-links");
  const items = [];

  if (c.contactoTelefono) items.push({
    href: `tel:${c.contactoTelefono.replace(/\s+/g, "")}`,
    label: c.contactoTelefono,
    icon: `<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.68 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0122 16.92z"/>`
  });
  if (c.contactoWhatsapp) items.push({
    href: `https://wa.me/${c.contactoWhatsapp.replace(/\D/g, "")}`,
    label: "WhatsApp",
    icon: `<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>`
  });
  if (c.contactoEmail) items.push({
    href: `mailto:${c.contactoEmail}`,
    label: c.contactoEmail,
    icon: `<path d="M4 4h16v16H4z" style="display:none"/><path d="M22 6l-10 7L2 6"/><rect x="2" y="4" width="20" height="16" rx="2"/>`
  });
  if (c.contactoInstagram) items.push({
    href: `https://instagram.com/${c.contactoInstagram.replace("@", "")}`,
    label: "@" + c.contactoInstagram.replace("@", ""),
    icon: `<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>`
  });

  if (items.length === 0) { box.style.display = "none"; return; }
  box.style.display = "flex";

  links.innerHTML = items.map(i => `
    <a class="contact-link" href="${i.href}" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6">${i.icon}</svg>
      ${i.label}
    </a>`).join("");
}
loadContenido();

function catCardHTML(cat, index) {
  const big = index === 0 ? " big" : "";
  const img = cat.imagen || "assets/logo.jpg";
  return `
    <a class="cat-card${big}" href="categoria.html?cat=${encodeURIComponent(cat.slug)}">
      <img src="${img}" alt="${cat.nombre}" loading="lazy">
      <div class="cat-label">
        <h3>${cat.nombre}</h3>
        <span class="arrow">→</span>
      </div>
    </a>`;
}

async function loadCategorias() {
  try {
    const q = query(
      collection(db, "categorias"),
      where("activo", "==", true),
      orderBy("orden", "asc")
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        Todavía no hay categorías publicadas. Añádelas desde el panel de control.
      </div>`;
      return;
    }

    let html = "";
    let i = 0;
    snap.forEach(doc => {
      html += catCardHTML(doc.data(), i);
      i++;
    });
    grid.innerHTML = html;
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      No se pudieron cargar las categorías. Revisa la configuración de Firebase en js/firebase-config.js.
    </div>`;
  }
}

loadCategorias();
