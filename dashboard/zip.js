var CRC_T=(function(){var t=[],c,n,k;for(n=0;n<256;n++){c=n;for(k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(b){var c=-1;for(var i=0;i<b.length;i++)c=CRC_T[(c^b[i])&255]^(c>>>8);return(c^-1)>>>0}
/* ZIP "stored" (sin compresión), sin librerías. files: [{name, data: Uint8Array}] -> Blob */
function zipBlob(files){
  var enc=new TextEncoder(), parts=[], cen=[], off=0;
  files.forEach(function(f){
    var n=enc.encode(f.name), crc=crc32(f.data), len=f.data.length;
    var h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(6,0x0800,true);
    h.setUint32(14,crc,true); h.setUint32(18,len,true); h.setUint32(22,len,true); h.setUint16(26,n.length,true);
    parts.push(new Uint8Array(h.buffer), n, f.data);
    var c=new DataView(new ArrayBuffer(46));
    c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true); c.setUint16(8,0x0800,true);
    c.setUint32(16,crc,true); c.setUint32(20,len,true); c.setUint32(24,len,true);
    c.setUint16(28,n.length,true); c.setUint32(42,off,true);
    cen.push(new Uint8Array(c.buffer), n);
    off+=30+n.length+len;
  });
  var cs=0; cen.forEach(function(x){cs+=x.length});
  var e=new DataView(new ArrayBuffer(22));
  e.setUint32(0,0x06054b50,true); e.setUint16(8,files.length,true); e.setUint16(10,files.length,true);
  e.setUint32(12,cs,true); e.setUint32(16,off,true);
  return new Blob(parts.concat(cen,[new Uint8Array(e.buffer)]),{type:"application/zip"});
}
