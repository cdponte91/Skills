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
| `carga` (herramienta, lo que genera `build.py`) | **Pantalla inicial** a pantalla completa para importar el/los archivos (drag&drop + selector). El tablero está oculto hasta que se importa. | Tras importar: 🖨️ Imprimir/PDF · 📊 Exportar Excel · 💾 Exportar HTM · 📁 Cambiar archivos |
| `lectura` (lo que produce 💾 Exportar HTM) | El tablero con los datos embebidos, directo, sin pantalla de importación. | **Solo 🖨️ Imprimir / PDF.** Nada de importar, ni exportar HTM, ni exportar Excel (agregar Excel solo si Carli lo pide para ese tablero). |

- El exportado es **final**: no se re-importa ni se re-exporta. Para el mes siguiente se abre la herramienta (`<Nombre>_Dashboard.htm`) y se importa de nuevo.
- Esto **reemplaza** el viejo "export encadenable" que conservaba el importador.
- Si el tablero necesita varios archivos, la pantalla inicial tiene **un casillero por archivo esperado**, se clasifican por encabezados (no por nombre), cada uno muestra ✓/✗ y el tablero se arma cuando están los obligatorios.

## Receta

1. **Repo** `cdponte91/<Nombre>`, `main`. Un solo commit: título "Dashboard <X> — <Zonal>", cuerpo con decisiones de parseo + cifras de regresión + tests, y la línea Co-Authored-By vigente.
2. **Carpeta**: `template.html`, `build.py` (python3.11), `extract.js`, `bake.js`, `libs/chart.umd.min.js`, `libs/xlsx.full.min.js`, Excel fuente, `<Nombre>_Dashboard.htm`, `test_parser.js`, `test_build.js`, `README.md`, `.gitignore` (`.DS_Store __pycache__/ *.pyc .data.json ~$*.xlsx`).
3. **Parser solo en JS dentro del template** entre marcadores `PARSER — INICIO/FIN`. `extract.js` lo corta, `bake.js` lo corre en Node con SheetJS. `build.py` inyecta libs (`safe_js`) y datos en `/*__DATA__*/null/*__END_DATA__*/`, aborta si falta un marcador, imprime cifras. **Nunca** duplicar el parser en Python.
4. **Salida `.htm`**, un archivo, **sin CDN**, todo inline, offline en Outlook/webmail. `build.py` sin argumentos → herramienta vacía (pantalla inicial). Con `--hornear <archivo>` → copia en modo lectura con ese Excel (para tests y envío directo).
5. **Estilo** (familia 813): tokens `--bg:#f4f6fa --panel:#fff --panel2:#eef1f7 --line:#d8dee9 --tx:#1b2436 --tx2:#5a6782 --tx3:#8492ad --ac:#1668c4 --ok:#12855a --warn:#a76a06 --bad:#c62f34`, `"Segoe UI",system-ui` 14px, `.card` radius 12, `.kpi` (`.l/.v/.s`, `::before` 3px), `.tabs[aria-selected]`, `th` sticky uppercase, `td.num` tabular-nums, `#msgs` con `.msg.ok/.warn/.bad`. Sin modo oscuro, sin localStorage.
6. **Contenido**: KPIs 5-8 · filtros `<select>` nativos + `input[type=search]` + "Limpiar filtros" (nunca combobox custom) · tabs con emoji · Chart.js con `mkChart` y **redibujo al mostrar la pestaña** · tabla ordenable `th[data-k]` ▲▼, 50 por página, `tfoot` TOTAL sticky · formatos `es-AR`.
7. **Labels**: nombres completos ("Zonal Córdoba Norte"), códigos solo en columnas "Cód". Sucursales conocidas ausentes → fila con ceros. Gerencia Zonal = una unidad consolidada; nunca los Equipos como filtro.
8. **Imprimir/PDF**: `@media print` A4 apaisado (oculta toolbar, filtros, paginadores; muestra todas las filas del resumen), `window.print()`; el PDF sale de "Guardar como PDF". Charts con `animation:false` y redibujo en `beforeprint`.

## Piezas opcionales (solo si aplican)

- **Modal por cliente** (`tr.clickable` → `#modal`) cuando la fila tiene un veredicto que explicar.
- **Filtro "Motivo" + Pareto** si hay condiciones evaluadas por cliente.
- **Pestaña normativa** si el tablero aplica una reglamentación.
- **Importar Word embebido** (Pellegrini) para normativas que se actualizan; solo en modo `carga`.
- **`#selftest` headless** si se verifica sin ojos.

## Verificación (todo número con su comando)

1. `node test_parser.js` — cifras de control contra el Excel real (conteos, cruces, top/bottom, paridad con el original).
2. `node test_build.js` — roundtrip: herramienta vacía tiene `data-modo="carga"` y DATA `null`; exportado tiene `data-modo="lectura"`, datos y **ningún** `#inicio` visible.
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
