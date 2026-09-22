import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, increment, query, where, getDocs }
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

getDoc(doc(db, "sitio", "home")).then(snap => {
  if (snap.exists() && snap.data().footerIzquierda) {
    document.getElementById("footer-izq").textContent = snap.data().footerIzquierda;
  }
}).catch(() => {});

const params = new URLSearchParams(location.search);
const slug = params.get("cat");

const titleEl = document.getElementById("cat-title");
const crumbEl = document.getElementById("crumb-cat");
const pageTitleEl = document.getElementById("page-title");
const countEl = document.getElementById("cat-count");
const grid = document.getElementById("prod-grid");

function money(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return n;
  return num.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function prodCardHTML(p) {
  const img = p.imagen || "assets/logo.jpg";
  const specs = [];
  if (p.gramos != null) specs.push(`${p.gramos} g`);
  if (p.caida) specs.push(`Caída ${p.caida}`);
  if (p.glow) specs.push("Glow");
  if (p.sonajero) specs.push("Sonajero");

  return `
    <article class="prod-card">
      <div class="prod-thumb"><img src="${img}" alt="${p.nombre}" loading="lazy"></div>
      <div class="prod-body">
        ${p.tipo ? `<span class="prod-tipo">${p.tipo}</span>` : ""}
        <span class="prod-name">${p.nombre}</span>
        ${p.descripcion ? `<span class="prod-desc">${p.descripcion}</span>` : ""}
        ${specs.length ? `<div class="prod-specs">${specs.map(s => `<span class="spec-chip">${s}</span>`).join("")}</div>` : ""}
        <span class="prod-price">${money(p.precio)}</span>
      </div>
    </article>`;
}

async function loadCategoria() {
  if (!slug) {
    titleEl.textContent = "Categoría no encontrada";
    return;
  }

  try {
    const catQ = query(collection(db, "categorias"), where("slug", "==", slug));
    const catSnap = await getDocs(catQ);

    if (catSnap.empty) {
      titleEl.textContent = "Categoría no encontrada";
      crumbEl.textContent = "—";
      return;
    }

    const catDoc = catSnap.docs[0];
    const cat = catDoc.data();

    titleEl.textContent = cat.nombre;
    crumbEl.textContent = cat.nombre;
    pageTitleEl.textContent = `Castherlures — ${cat.nombre}`;

    // Registrar visita a esta categoría (para "Categorías más vistas" en el panel)
    setDoc(doc(db, "categoria_vistas", catDoc.id), { vistas: increment(1) }, { merge: true }).catch(() => {});

    const prodQ = query(
      collection(db, "productos"),
      where("categoriaId", "==", catDoc.id),
      where("activo", "==", true)
    );
    const prodSnap = await getDocs(prodQ);

    if (prodSnap.empty) {
      countEl.textContent = "0 artículos";
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        Todavía no hay artículos en esta categoría.
      </div>`;
      return;
    }

    const productos = [];
    prodSnap.forEach(doc => productos.push(doc.data()));
    productos.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

    countEl.textContent = `${productos.length} artículo${productos.length === 1 ? "" : "s"}`;
    let html = "";
    productos.forEach(p => { html += prodCardHTML(p); });
    grid.innerHTML = html;

  } catch (err) {
    console.error(err);
    titleEl.textContent = "Error al cargar";
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      No se pudo conectar con Firebase. Revisa js/firebase-config.js.
    </div>`;
  }
}

loadCategoria();
