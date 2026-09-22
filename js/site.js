import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, getDocs }
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const grid = document.getElementById("cat-grid");

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
