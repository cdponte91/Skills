---
name: dashboard
description: Use when Carli pide un dashboard, tablero o informe web a partir de uno o varios Excel/TXT (BNA Córdoba Norte u otro), "hacé un dashboard de X", "armame el tablero de este archivo", o cuando hay que corregir/regenerar uno de los repos cdponte91 de tableros (813, 0023, 2401, PymeUso, Pellegrini, CCVal, Listado501…).
---

# Dashboard — tablero HTM autocontenido desde Excel/TXT

Es **rutina, no proyecto**: sin spec, sin plan de superpowers, sin `.claude/agents/`, sin branches ni PRs. Un agente opus construye con esta receta, yo verifico con cifras y hago **un** commit. Código y patrones listos para copiar: `patrones.md` (mismo directorio). Referencia viva: `~/Downloads/Desarrollo/813/`; modal: `Pellegrini/`; print/selftest: `PersonalRelevado/`.

## Regla de oro: dos estados, no tres

El `.htm` tiene un `data-modo` en `<html>`:

| Modo | Qué ve el usuario | Botones |
|---|---|---|
| `carga` (herramienta, lo que genera `build.py`) | **Pantalla inicial** a pantalla completa para importar el/los archivos (drag&drop + selector). El tablero está oculto hasta que se importa. | Tras importar: 🖨️ Imprimir/PDF · 📊 Exportar Excel · 💾 Exportar HTM · 📦 Exportar por sucursal · 📁 Cambiar archivos |
| `lectura` (lo que produce 💾 Exportar HTM y 📦 por sucursal) | El tablero con los datos embebidos, directo, sin pantalla de importación. | **Solo 🖨️ Imprimir / PDF.** Nada de importar, ni exportar HTM, ni exportar Excel (agregar Excel solo si Carli lo pide para ese tablero). |

- El exportado es **final**: no se re-importa ni se re-exporta. Para el mes siguiente se abre la herramienta (`<Nombre>_Dashboard.htm`) y se importa de nuevo.
- Esto **reemplaza** el viejo "export encadenable" que conservaba el importador.
- Si el tablero necesita varios archivos, la pantalla inicial tiene **un casillero por archivo esperado**, se clasifican por encabezados (no por nombre), cada uno muestra ✓/✗ y el tablero se arma cuando están los obligatorios.

## Ámbito: 3 estados de zonal

Todo tablero BNA se puede ver en tres ámbitos, según el código de sucursal (tabla oficial en `sucursales.js`, se pega en el template):

| Ámbito | Sucursales |
|---|---|
| **Zonal Córdoba** (completa) | 33 |
| **Córdoba Norte** | 23 |
| **Córdoba Este** | 10 |

- Selector de ámbito en el header de la herramienta (`<select id="fAmbito">`, default según lo que traiga el archivo; si hay 33 códigos, Zonal). Filtra KPIs, gráficos, tablas y exportaciones. El filtro de sucursal queda limitado a las del ámbito.
- Sucursales del ámbito ausentes en el archivo → fila con ceros. Las que no están en la tabla oficial → grupo "Sin identificar" fuera de %/totales, avisando en `#msgs`.
- Regla de siempre: la Gerencia Zonal es una unidad; los Equipos Zonales no son dimensión de filtro.
- Los códigos y nombres salen **siempre** de `sucursales.js`; nunca reescribir la lista a mano.

## Exportaciones (solo en la herramienta, modo `carga`)

| Botón | Qué genera |
|---|---|
| 💾 **Exportar HTM** | Un `.htm` en modo lectura con el ámbito elegido completo (33, 23 o 10 sucursales). |
| 📦 **Exportar por sucursal** | Un `.htm` en modo lectura **por cada sucursal del ámbito** (33, 23 o 10 archivos), cada uno con **solo los datos de esa sucursal**, empaquetados en un `.zip` (`<Nombre>_<ámbito>_por_sucursal_<fecha>.zip`). |

- Cada archivo por sucursal: título "… — <Sucursal>", sin selector de ámbito ni de sucursal, solo 🖨️ Imprimir/PDF, nombre `<Nombre>_<cod>_<Sucursal>.htm`.
- ZIP y no 33 descargas sueltas: Chrome/Safari bloquean descargas múltiples. `zip.js` (en esta carpeta) es un escritor ZIP sin librerías, ya probado con `unzip -t`.
- Cada tablero implementa `filtrarPorSucursal(datos, cod)` (función pura); todo lo demás es común (ver `patrones.md`, secciones 7 y 8).
- Control obligatorio: la suma de las sucursales exportadas = el total del ámbito (filas e importes). Va en `test_parser.js`.

## Receta

1. **Repo** `cdponte91/<Nombre>`, `main`. Se pushea solo al terminar (ver "Cierre"). Un solo commit: título "Dashboard <X> — <Zonal>", cuerpo con decisiones de parseo + cifras de regresión + tests, y la línea Co-Authored-By vigente.
2. **Carpeta**: `template.html`, `build.py` (python3.11), `extract.js`, `bake.js`, `libs/chart.umd.min.js`, `libs/xlsx.full.min.js`, Excel fuente, `<Nombre>_Dashboard.htm`, `test_parser.js`, `test_build.js`, `README.md`, `.gitignore` (`.DS_Store __pycache__/ *.pyc .data.json ~$*.xlsx`).
3. **Parser solo en JS dentro del template** entre marcadores `PARSER — INICIO/FIN`. `extract.js` lo corta, `bake.js` lo corre en Node con SheetJS. `build.py` inyecta libs (`safe_js`) y datos en `/*__DATA__*/null/*__END_DATA__*/`, aborta si falta un marcador, imprime cifras. **Nunca** duplicar el parser en Python.
4. **Salida `.htm`**, un archivo, **sin CDN**, todo inline, offline en Outlook/webmail. `build.py` sin argumentos → herramienta vacía (pantalla inicial). Con `--hornear <archivo>` → copia en modo lectura con ese Excel (para tests y envío directo).
5. **Estilo** (familia 813): tokens `--bg:#f4f6fa --panel:#fff --panel2:#eef1f7 --line:#d8dee9 --tx:#1b2436 --tx2:#5a6782 --tx3:#8492ad --ac:#1668c4 --ok:#12855a --warn:#a76a06 --bad:#c62f34`, `"Segoe UI",system-ui` 14px, `.card` radius 12, `.kpi` (`.l/.v/.s`, `::before` 3px), `.tabs[aria-selected]`, `th` sticky uppercase, `td.num` tabular-nums, `#msgs` con `.msg.ok/.warn/.bad`. Sin modo oscuro, sin localStorage.
6. **Contenido**: KPIs 5-8 · filtros `<select>` nativos + `input[type=search]` + "Limpiar filtros" (nunca combobox custom) · tabs con emoji · Chart.js con `mkChart` y **redibujo al mostrar la pestaña** · tabla ordenable `th[data-k]` ▲▼, 50 por página, `tfoot` TOTAL sticky · formatos `es-AR`.
7. **Labels**: nombres completos ("Zonal Córdoba Norte"), códigos solo en columnas "Cód". Sucursales conocidas ausentes → fila con ceros. Gerencia Zonal = una unidad consolidada; nunca los Equipos como filtro.
8. **Imprimir/PDF**: `@media print` A4 apaisado (oculta toolbar, filtros, paginadores; muestra todas las filas del resumen), `window.print()`; el PDF sale de "Guardar como PDF". Charts con `animation:false` y redibujo en `beforeprint`.

## Cierre: commit y push automáticos

Cuando el tablero está terminado y verificado (tests en verde, capturas de ambos estados revisadas, README escrito), **hacer commit y push a `origin/main` sin esperar a que Carli lo pida**. Está autorizado de forma permanente para los repos de tableros `cdponte91/<Nombre>`.

1. Si la carpeta no es un repo: `git init -b main`, `gh repo create cdponte91/<Nombre> --private --source=. --push` (privado por defecto).
2. Si ya es un repo: `git add` de los archivos del tablero (nunca `.data.json`, `~$*.xlsx` ni `.DS_Store`; respetar `.gitignore`), un solo commit, `git push origin main`.
3. Commit único: título "Dashboard <X> — <Zonal>", cuerpo con decisiones de parseo, cifras de regresión y tests, más la línea Co-Authored-By vigente.
4. Informar a Carli el link del repo y el hash del commit, junto con las cifras de control.

Alcance de la autorización: solo crear/pushear el tablero recién terminado. **No** hacer force-push, no tocar otras ramas ni otros repos, y si el push falla (credenciales, rama protegida, conflicto) frenar y avisar en vez de improvisar. Si los tests no están en verde, no se pushea: se informa el rojo.

**Esta skill también se sincroniza sola:** cada vez que se modifique `~/.claude/skills/dashboard/`, copiarla a `~/Downloads/Desarrollo/Skills/dashboard/`, commit y `git push origin main` en el repo `cdponte91/Skills`, sin esperar a que Carli lo pida.

## Piezas opcionales (solo si aplican)

- **Modal por cliente** (`tr.clickable` → `#modal`) cuando la fila tiene un veredicto que explicar.
- **Filtro "Motivo" + Pareto** si hay condiciones evaluadas por cliente.
- **Pestaña normativa** si el tablero aplica una reglamentación.
- **Importar Word embebido** (Pellegrini) para normativas que se actualizan; solo en modo `carga`.
- **`#selftest` headless** si se verifica sin ojos.

## Verificación (todo número con su comando)

1. `node test_parser.js` — cifras de control contra el Excel real (conteos, cruces, top/bottom, paridad con el original).
2. `node test_build.js` — roundtrip (incluye el control de suma por sucursal y que el ZIP pase `unzip -t`): herramienta vacía tiene `data-modo="carga"` y DATA `null`; exportado tiene `data-modo="lectura"`, datos y **ningún** `#inicio` visible.
3. Captura headless 1280 de **ambos** estados: `"$CH" --headless=new --screenshot=... --virtual-time-budget=4000 "file://..."`; la herramienta debe mostrar la pantalla inicial, no un tablero vacío; el lectura debe mostrar solo el botón de imprimir (`--dump-dom` y revisar que `#bHtm`/`#bImp` estén ocultos o ausentes).
4. Cifras en README y en el commit. `README.md`: Qué mide / Regenerar / Árbol / Tests / Gotchas.

## Errores comunes

| Error | Corrección |
|---|---|
| Tablero vacío con KPIs en "—" al abrir la herramienta | Mostrar `#inicio` y ocultar `#app` hasta tener datos |
| Exportado conserva 📁 Importar / 💾 Exportar HTM | Sacar la clase `solo-carga` del DOM serializado: `data-modo="lectura"` + `#inicio` removido del string |
| `PRISTINE` capturado después de renderizar | Capturar `outerHTML` en la primera línea de `boot()` |
| Gráfico en blanco en pestaña oculta | Redibujar al activar la pestaña |
| Parser duplicado en Python | Un solo parser JS; Python solo orquesta |
| `</script>` dentro de lib o JSON | `safe_js` en build; `.replace(/<\/script/gi,"<\\/script")` en export |
| Clasificar archivos por nombre | Clasificar por encabezados (`detect(wb)`) |
