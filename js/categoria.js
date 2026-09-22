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

function prodCardHTML(p, index) {
  const img = (p.imagenes && p.imagenes[0]) || p.imagen || "assets/logo.jpg";
  const specs = [];
  if (p.gramos != null) specs.push(`${p.gramos} g`);
  if (p.caida) specs.push(`Caída ${p.caida}`);
  if (p.glow) specs.push("Glow");
  if (p.sonajero) specs.push("Sonajero");

  return `
    <article class="prod-card" data-index="${index}">
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
    productos.forEach((p, i) => { html += prodCardHTML(p, i); });
    grid.innerHTML = html;

    productosActuales = productos;
    grid.querySelectorAll(".prod-card").forEach(card => {
      card.addEventListener("click", () => abrirLightbox(Number(card.dataset.index)));
    });

  } catch (err) {
    console.error(err);
    titleEl.textContent = "Error al cargar";
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      No se pudo conectar con Firebase. Revisa js/firebase-config.js.
    </div>`;
  }
}

loadCategoria();

// ==================================================
// FICHA AMPLIADA DE ARTÍCULO (lightbox)
// ==================================================
let productosActuales = [];
let lightboxFotos = [];
let lightboxIndiceFoto = 0;

const lightbox = document.getElementById("lightbox");

function abrirLightbox(indexProducto) {
  const p = productosActuales[indexProducto];
  if (!p) return;

  lightboxFotos = (p.imagenes && p.imagenes.length) ? p.imagenes : [p.imagen || "assets/logo.jpg"];
  lightboxIndiceFoto = 0;

  document.getElementById("lightbox-tipo").textContent = p.tipo || "";
  document.getElementById("lightbox-tipo").style.display = p.tipo ? "" : "none";
  document.getElementById("lightbox-nombre").textContent = p.nombre;
  document.getElementById("lightbox-desc").textContent = p.descripcion || "";
  document.getElementById("lightbox-desc").style.display = p.descripcion ? "" : "none";
  document.getElementById("lightbox-price").textContent = money(p.precio);

  const specs = [];
  if (p.gramos != null) specs.push(`${p.gramos} g`);
  if (p.caida) specs.push(`Caída ${p.caida}`);
  if (p.glow) specs.push("Glow");
  if (p.sonajero) specs.push("Sonajero");
  document.getElementById("lightbox-specs").innerHTML = specs.map(s => `<span class="spec-chip">${s}</span>`).join("");

  pintarFotoLightbox();
  lightbox.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function pintarFotoLightbox() {
  document.getElementById("lightbox-img").src = lightboxFotos[lightboxIndiceFoto];

  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  const multiple = lightboxFotos.length > 1;
  prevBtn.hidden = !multiple;
  nextBtn.hidden = !multiple;

  const dots = document.getElementById("lightbox-dots");
  dots.innerHTML = multiple
    ? lightboxFotos.map((_, i) => `<span class="${i === lightboxIndiceFoto ? "active" : ""}" data-i="${i}"></span>`).join("")
    : "";
  dots.querySelectorAll("span").forEach(dot => {
    dot.addEventListener("click", () => { lightboxIndiceFoto = Number(dot.dataset.i); pintarFotoLightbox(); });
  });
}

function cerrarLightbox() {
  lightbox.style.display = "none";
  document.body.style.overflow = "";
}

document.getElementById("lightbox-close").addEventListener("click", cerrarLightbox);
document.getElementById("lightbox-prev").addEventListener("click", () => {
  lightboxIndiceFoto = (lightboxIndiceFoto - 1 + lightboxFotos.length) % lightboxFotos.length;
  pintarFotoLightbox();
});
document.getElementById("lightbox-next").addEventListener("click", () => {
  lightboxIndiceFoto = (lightboxIndiceFoto + 1) % lightboxFotos.length;
  pintarFotoLightbox();
});
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) cerrarLightbox(); });
document.addEventListener("keydown", (e) => {
  if (lightbox.style.display !== "flex") return;
  if (e.key === "Escape") cerrarLightbox();
  if (e.key === "ArrowLeft") document.getElementById("lightbox-prev").click();
  if (e.key === "ArrowRight") document.getElementById("lightbox-next").click();
});
