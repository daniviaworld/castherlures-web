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
  } catch (err) {
    console.error("No se pudo cargar el contenido editable:", err);
  }
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
