// Tabla oficial de las 33 sucursales de la Gerencia Zonal Córdoba (fuente: PersonalRelevado/template.html).
// Córdoba Norte = 23 · Córdoba Este = 10. Se pega tal cual en el template de cada tablero.
var SUCURSALES = [
  {cod:1046, oficial:'ALTA CORDOBA',        nombre:'Alta Córdoba',              zonal:'Córdoba Norte', alias:['alta cordoba','alta cba']},
  {cod:1047, oficial:'ALTA GRACIA',         nombre:'Alta Gracia',               zonal:'Córdoba Norte', alias:['alta gracia']},
  {cod:1098, oficial:'AVDA. HUMBERTO I',    nombre:'Avenida Humberto Primo',    zonal:'Córdoba Norte', alias:['humberto']},
  {cod:1183, oficial:'BARR.LOS NARANJOS',   nombre:'Barrio Los Naranjos',       zonal:'Córdoba Norte', alias:['naranjos']},
  {cod:1192, oficial:'BARRIO SAN VICENTE',  nombre:'Barrio San Vicente',        zonal:'Córdoba Norte', alias:['san vicente']},
  {cod:1300, oficial:'CAPILLA DEL MONTE',   nombre:'Capilla del Monte',         zonal:'Córdoba Norte', alias:['capilla del monte','capilla']},
  {cod:1570, oficial:'CORDOBA',             nombre:'Córdoba',                   zonal:'Córdoba Norte', alias:['casa central']},
  {cod:1635, oficial:'COSQUIN',             nombre:'Cosquín',                   zonal:'Córdoba Norte', alias:['cosquin']},
  {cod:1640, oficial:'CRUZ DEL EJE',        nombre:'Cruz del Eje',              zonal:'Córdoba Norte', alias:['cruz del eje']},
  {cod:1660, oficial:'DEAN FUNES',          nombre:'Deán Funes',                zonal:'Córdoba Norte', alias:['dean funes','deán funes']},
  {cod:2070, oficial:'JESUS MARIA',         nombre:'Jesús María',               zonal:'Córdoba Norte', alias:['jesus maria']},
  {cod:2143, oficial:'LA CUMBRE',           nombre:'La Cumbre',                 zonal:'Córdoba Norte', alias:['la cumbre']},
  {cod:2145, oficial:'LA FALDA',            nombre:'La Falda',                  zonal:'Córdoba Norte', alias:['la falda']},
  {cod:2218, oficial:'LAS PEÑAS',           nombre:'Las Peñas',                 zonal:'Córdoba Norte', alias:['las peñas','peñas','penas']},
  {cod:2472, oficial:'MONTE CRISTO',        nombre:'Monte Cristo',              zonal:'Córdoba Norte', alias:['monte cristo','montecristo']},
  {cod:3601, oficial:'UNQUILLO',            nombre:'Unquillo',                  zonal:'Córdoba Norte', alias:['unquillo']},
  {cod:3722, oficial:'VILLA CARLOS PAZ',    nombre:'Villa Carlos Paz',          zonal:'Córdoba Norte', alias:['villa carlos paz','carlos paz']},
  {cod:9201, oficial:'BARR.C.DE L/ROSAS',   nombre:'Barrio Cerro de las Rosas', zonal:'Córdoba Norte', alias:['cerro de las rosas','cerro','rosas']},
  {cod:9202, oficial:'BARRIO SAN MARTIN',   nombre:'Barrio San Martín',         zonal:'Córdoba Norte', alias:['san martin']},
  {cod:9204, oficial:'AV.SABATTINI',        nombre:'Avenida Sabattini',         zonal:'Córdoba Norte', alias:['sabattini','sabatini']},
  {cod:9205, oficial:'AV.JUAN B.JUSTO',     nombre:'Avenida Juan B. Justo',     zonal:'Córdoba Norte', alias:['juan b. justo','juan b justo','juan b','justo']},
  {cod:9226, oficial:'BARR.ALTO ALBERDI',   nombre:'Barrio Alto Alberdi',       zonal:'Córdoba Norte', alias:['alto alberdi','alberdi']},
  {cod:9261, oficial:'AV.VELEZ SARSFIELD',  nombre:'Avenida Vélez Sarsfield',   zonal:'Córdoba Norte', alias:['velez sarsfield','velez']},
  {cod:1095, oficial:'ARROYITO',            nombre:'Arroyito',                  zonal:'Córdoba Este',  alias:['arroyito']},
  {cod:1150, oficial:'BALNEARIA',           nombre:'Balnearia',                 zonal:'Córdoba Este',  alias:['balnearia']},
  {cod:1243, oficial:'BRINKMANN',           nombre:'Brinkmann',                 zonal:'Córdoba Este',  alias:['brinkmann','brinkman']},
  {cod:1264, oficial:'CALCHIN',             nombre:'Calchín',                   zonal:'Córdoba Este',  alias:['calchin']},
  {cod:1710, oficial:'EL TIO',              nombre:'El Tío',                    zonal:'Córdoba Este',  alias:['el tio']},
  {cod:2186, oficial:'LA PUERTA',           nombre:'La Puerta',                 zonal:'Córdoba Este',  alias:['la puerta']},
  {cod:2504, oficial:'MORTEROS',            nombre:'Morteros',                  zonal:'Córdoba Este',  alias:['morteros']},
  {cod:3160, oficial:'SAN FRANCISCO',       nombre:'San Francisco',             zonal:'Córdoba Este',  alias:['san francisco']},
  {cod:3353, oficial:'STA.ROSA R.PRIMERO',  nombre:'Santa Rosa de Río Primero', zonal:'Córdoba Este',  alias:['santa rosa','rio primero']},
  {cod:3740, oficial:'VILLA DEL ROSARIO',   nombre:'Villa del Rosario',         zonal:'Córdoba Este',  alias:['villa del rosario']}
];
var AMBITOS = [
  {id:'zonal', nombre:'Zonal Córdoba (33 sucursales)', filtra:function(s){ return true; }},
  {id:'norte', nombre:'Córdoba Norte (23 sucursales)', filtra:function(s){ return s.zonal==='Córdoba Norte'; }},
  {id:'este',  nombre:'Córdoba Este (10 sucursales)',  filtra:function(s){ return s.zonal==='Córdoba Este'; }}
];
function sucursalesDe(ambitoId){ var a=AMBITOS.filter(function(x){return x.id===ambitoId})[0]; return SUCURSALES.filter(a.filtra); }
var SUC_POR_COD = {}; SUCURSALES.forEach(function(s){ SUC_POR_COD[s.cod] = s; });
