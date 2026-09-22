# Castherlures — cómo dejarlo funcionando

Tienes dos paquetes separados:

- **castherlures-web/** → la tienda pública (lo que ve el cliente final)
- **castherlures-admin/** → el panel de control (solo para ti, con usuario y contraseña)

Los dos se conectan a la misma base de datos de Firebase, pero se suben como **dos sitios distintos**, así que el panel nunca aparece enlazado desde la web pública.

## 1. Crear el proyecto de Firebase (gratis)

1. Ve a https://console.firebase.google.com → **Crear proyecto** → nómbralo `castherlures` (o como prefieras).
2. En el menú lateral entra en **Authentication** → pestaña **Sign-in method** → activa **Correo electrónico/contraseña**.
3. Dentro de Authentication, pestaña **Users** → **Add user** → crea tu propio usuario (el correo y contraseña con los que entrarás al panel).
4. Entra en **Firestore Database** → **Crear base de datos** → modo producción → región **eur3 (Europa)**.
5. Entra en **Storage** → **Comenzar** → misma región.

## 2. Reglas de seguridad

- En **Firestore Database → Reglas**, pega el contenido de `firestore.rules` (incluido en esta entrega) y publica.
- En **Storage → Reglas**, pega el contenido de `storage.rules` y publica.

Esto hace que cualquiera pueda *ver* el catálogo (necesario para que la web pública funcione) pero solo tú, con sesión iniciada, puedas *escribir* cambios.

## 3. Conectar el código con tu proyecto

1. En Firebase Console, icono de engranaje → **Configuración del proyecto** → baja hasta "Tus apps" → **Añadir app → Web (`</>`)** → dale un nombre, no hace falta hosting de Firebase.
2. Copia el objeto `firebaseConfig` que te muestra.
3. Pégalo en **dos sitios**, sustituyendo los valores de ejemplo:
   - `castherlures-web/js/firebase-config.js`
   - `castherlures-admin/js/firebase-config.js`
   (deben quedar idénticos en ambos)

## 4. Subir a GitHub Pages (como dos repos separados)

**Sitio público:**
1. Crea un repo nuevo, ej. `castherlures-web`.
2. Sube todo el contenido de la carpeta `castherlures-web/` a la raíz del repo.
3. Settings → Pages → Source: rama `main`, carpeta `/root` → Save.
4. Tu web quedará en `https://tu-usuario.github.io/castherlures-web/`.

**Panel de control:**
1. Crea otro repo, ej. `castherlures-admin`.
2. Sube todo el contenido de la carpeta `castherlures-admin/` a la raíz de ese repo.
3. Activa GitHub Pages igual que arriba (puedes dejar el repo en privado si tu plan de GitHub lo permite, así ni siquiera es indexable).
4. El panel quedará en `https://tu-usuario.github.io/castherlures-admin/`.

Cuando el cliente apruebe el diseño y tengáis el dominio definitivo, simplemente apuntas `www.tudominio.com` al repo de la web pública y algo como `panel.tudominio.com` (subdominio) al del admin, vía Cloudflare — como haces en tus otros proyectos.

## 5. Cómo se usa el panel

1. Entra en tu URL de `castherlures-admin`, inicia sesión con el usuario que creaste en el paso 1.3.
2. Pestaña **Categorías**: crea las familias de producto (ej. "Sedales", "Cañas", "Señuelos", "Anzuelos"), con foto de portada. La primera categoría por orden se muestra grande en la portada.
3. Pestaña **Artículos**: crea cada producto, asignándolo a una categoría, con foto, tipo/variante, precio y descripción.
4. Los cambios se reflejan en la web pública al momento, sin tocar código ni volver a subir nada a GitHub.
5. Puedes ocultar una categoría o artículo sin borrarlo (checkbox "Visible en la web") — útil para productos agotados o temporada baja.

## Notas

- Las imágenes se guardan en Firebase Storage; el plan gratuito (Spark) incluye margen de sobra para una tienda de este tamaño.
- Si en el futuro quieres subcategorías (ej. "Sedales → Trenzado / Monofilamento"), se puede añadir un campo extra sin rehacer nada — dímelo cuando llegue el momento.
