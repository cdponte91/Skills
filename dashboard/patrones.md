# Patrones de código — dashboard BNA

## 1. Esqueleto HTML (dos estados)

```html
<!DOCTYPE html>
<html lang="es" data-modo="carga" data-estado="inicio">
<head><meta charset="utf-8"><title>Dashboard X — Zonal Córdoba Norte</title>
<style>
.hide{display:none!important}
/* sin datos todavía: solo se ve la pantalla inicial */
html[data-estado="inicio"] .solo-datos,
html[data-estado="inicio"] #app{display:none!important}
html[data-estado="datos"]  #inicio{display:none!important}
/* exportado: nada de importar/exportar */
html[data-modo="lectura"] .solo-carga,
html[data-modo="lectura"] #inicio{display:none!important}
.inicio{min-height:70vh;display:grid;place-items:center}
.drop{border:2px dashed var(--line);border-radius:12px;background:var(--panel);
  padding:40px;max-width:720px;width:100%;text-align:center}
.drop.over{border-color:var(--ac);background:var(--panel2)}
.slot{display:flex;gap:10px;align-items:center;padding:8px 12px;border:1px solid var(--line);
  border-radius:8px;margin:8px 0;text-align:left}
.slot .st{margin-left:auto}.slot.ok{border-color:var(--ok)}.slot.bad{border-color:var(--bad)}
@media print{
  @page{size:A4 landscape;margin:10mm}
  header #tools,.filters,.tabs,.pager,#msgs,.solo-carga{display:none!important}
  body{background:#fff}.card,.kpi{break-inside:avoid;box-shadow:none}
  .scroll{max-height:none!important;overflow:visible!important}
}
</style></head>
<body><div class="wrap">
<header>
  <div class="t"><h1>Título <span class="mut">—</span> Zonal Córdoba Norte</h1>
    <p id="sub">Importá el archivo para comenzar</p></div>
  <div class="sp"></div>
  <div id="tools">
    <button class="btn pri solo-datos" id="bPdf">🖨️ Imprimir / PDF</button>
    <button class="btn solo-datos solo-carga" id="bXls">📊 Exportar Excel</button>
    <button class="btn solo-datos solo-carga" id="bHtm">💾 Exportar HTM</button>
    <button class="btn solo-datos solo-carga" id="bCambiar">📁 Cambiar archivos</button>
  </div>
</header>
<div id="msgs"></div>

<!-- PANTALLA INICIAL -->
<section id="inicio" class="inicio"><div class="drop" id="drop">
  <div class="big">📁</div>
  <h2>Importá los archivos</h2>
  <p>Arrastrá acá el/los archivos o usá el botón.</p>
  <div id="slots"></div>
  <input type="file" id="fi" multiple accept=".xlsx,.xls,.xlsm,.txt" class="hide">
  <button class="btn pri" id="bImp">📁 Elegir archivos</button>
</div></section>

<main id="app" class="hide"><!-- KPIs, filtros, tabs, tablas --></main>
</div>
<script>/*__LIBS__*/</script>
<script>
var PRISTINE = document.documentElement.outerHTML;   // PRIMERA línea: antes de renderizar
var DATA = /*__DATA__*/null/*__END_DATA__*/;
...
</script></body></html>
```

## 2. Casilleros por archivo (1 o N archivos)

```js
/* Un casillero por archivo esperado; se clasifican por ENCABEZADOS, no por nombre. */
var FUENTES = [
  {id:"tablero", label:"Tablero de gestión", req:true,  detect:function(wb){ return hasHdr(wb, ["CUIT","Saldo"]); }, parse:parseTablero},
  {id:"oport",   label:"Oportunidades",      req:false, detect:function(wb){ return hasHdr(wb, ["Oportunidad"]); }, parse:parseOport}
];
var CARGADOS = {};                       // id -> resultado parseado

function pintarSlots(){
  $("#slots").innerHTML = FUENTES.map(function(f){
    var ok = CARGADOS[f.id];
    return '<div class="slot '+(ok?"ok":"")+'"><span>'+f.label+(f.req?" *":"")+'</span>'+
           '<span class="st">'+(ok? "✓ "+ok.meta.archivo : "pendiente")+'</span></div>';
  }).join("");
}
function recibir(files){
  Array.prototype.forEach.call(files, function(file){
    leerLibro(file, function(wb){
      var f = FUENTES.filter(function(x){ return x.detect(wb); })[0];
      if(!f){ msg("❌ <strong>"+file.name+"</strong>: no reconozco el formato.", "bad"); return; }
      CARGADOS[f.id] = f.parse(wb, file.name);       // dedup/validaciones dentro del parser
      pintarSlots();
      if(FUENTES.every(function(x){ return !x.req || CARGADOS[x.id]; })) armar();
    });
  });
}
function armar(){
  DATA = combinar(CARGADOS);
  document.documentElement.setAttribute("data-estado", "datos");
  render();
}
$("#drop").ondragover = function(e){ e.preventDefault(); this.classList.add("over"); };
$("#drop").ondragleave = function(){ this.classList.remove("over"); };
$("#drop").ondrop = function(e){ e.preventDefault(); this.classList.remove("over"); recibir(e.dataTransfer.files); };
$("#bImp").onclick = function(){ $("#fi").click(); };
$("#fi").onchange = function(e){ recibir(e.target.files); e.target.value = ""; };
$("#bCambiar").onclick = function(){
  CARGADOS = {}; DATA = null; pintarSlots();
  document.documentElement.setAttribute("data-estado", "inicio");
};
```

Un solo archivo: una única entrada en `FUENTES` con `req:true` → arma al soltarlo.

## 3. Arranque

```js
function boot(){
  ...                                      // listeners de filtros, tabs, tablas
  pintarSlots();
  $("#bPdf").onclick = function(){ window.print(); };
  window.addEventListener("beforeprint", redibujarCharts);
  if(DATA){                                // exportado u horneado
    document.documentElement.setAttribute("data-estado", "datos");
    render();
  }                                        // si no: queda la pantalla inicial
}
```

## 4. Exportar HTM (modo lectura, final)

```js
function exportHtm(){
  var html = PRISTINE, faltan = [];
  function bake(src, key, value){
    var re = new RegExp("\\/\\*__"+key+"__\\*\\/[\\s\\S]*?\\/\\*__END_"+key+"__\\*\\/");
    if(!re.test(src)){ faltan.push(key); return src; }
    var json = JSON.stringify(value).replace(/<\/script/gi,"<\\/script").replace(/<!--/g,"<\\!--");
    return src.replace(re, function(){ return "/*__"+key+"__*/"+json+"/*__END_"+key+"__*/"; });
  }
  html = bake(html, "DATA", DATA);
  if(faltan.length){ msg("❌ Faltan marcadores: "+faltan.join(", "), "bad"); return; }
  // lectura: sin importador ni exportadores
  html = html.replace('data-modo="carga"', 'data-modo="lectura"')
             .replace('data-estado="inicio"', 'data-estado="datos"')
             .replace(/<section id="inicio"[\s\S]*?<\/section>/, "");
  var a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["<!DOCTYPE html>\n"+html], {type:"text/html;charset=utf-8"}));
  a.download = "<Nombre>_Dashboard_"+new Date().toISOString().slice(0,10)+".htm";
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  msg("💾 HTM de consulta generado: lleva los datos embebidos; solo permite imprimir o guardar PDF.", "ok");
}
```

Ojo: `<section id="inicio">` no debe contener otro `</section>` anidado (usar `<div>` adentro).

## 5. build.py (esqueleto)

```python
def bake(html, key, value):
    tok = "/*__%s__*/null/*__END_%s__*/" % (key, key)
    if tok not in html: sys.exit("ERROR: falta el marcador __%s__" % key)
    js = safe_js(json.dumps(value, ensure_ascii=False, separators=(",", ":")))
    return html.replace(tok, "/*__%s__*/%s/*__END_%s__*/" % (key, js, key), 1)

# sin args  -> herramienta: DATA queda en null, data-modo="carga"  -> <Nombre>_Dashboard.htm
# --hornear -> corre `node bake.js <xlsx> .data.json`, bake(html,"DATA",...) y cambia a lectura
#              -> <Nombre>_Consulta.htm
```

## 6. test_build.js (asserts mínimos)

```js
const h = fs.readFileSync("<Nombre>_Dashboard.htm", "utf8");
assert(h.includes('data-modo="carga"') && h.includes("/*__DATA__*/null/*__END_DATA__*/"));
assert(h.includes('id="inicio"'));                       // pantalla inicial presente
const c = fs.readFileSync("<Nombre>_Consulta.htm", "utf8");
assert(c.includes('data-modo="lectura"') && !c.includes('id="inicio"'));
assert(!/\/\*__DATA__\*\/null/.test(c));                 // datos embebidos
// el exportado desde el navegador debe pasar los mismos asserts (roundtrip con jsdom/headless)
```
