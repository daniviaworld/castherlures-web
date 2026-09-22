import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, getDocs }
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  return `
    <article class="prod-card">
      <div class="prod-thumb"><img src="${img}" alt="${p.nombre}" loading="lazy"></div>
      <div class="prod-body">
        ${p.tipo ? `<span class="prod-tipo">${p.tipo}</span>` : ""}
        <span class="prod-name">${p.nombre}</span>
        ${p.descripcion ? `<span class="prod-desc">${p.descripcion}</span>` : ""}
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

    const prodQ = query(
      collection(db, "productos"),
      where("categoriaId", "==", catDoc.id),
      where("activo", "==", true),
      orderBy("orden", "asc")
    );
    const prodSnap = await getDocs(prodQ);

    if (prodSnap.empty) {
      countEl.textContent = "0 artículos";
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        Todavía no hay artículos en esta categoría.
      </div>`;
      return;
    }

    countEl.textContent = `${prodSnap.size} artículo${prodSnap.size === 1 ? "" : "s"}`;
    let html = "";
    prodSnap.forEach(doc => { html += prodCardHTML(doc.data()); });
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
