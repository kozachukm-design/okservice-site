/* OK Service — стрічка брендів із фільтром каталогу.
   Самодостатній файл: сам додає стилі, сам будує стрічку
   з тих марок, що є в наявності, і сам керує кнопкою «Завантажити ще». */
(function(){
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
function init(){
var SVG={"hp":"M12.0069 24h-.3572l2.459-6.7453h3.3796c.5907 0 1.2364-.4533 1.4424-1.0166l2.6652-7.3085c.4396-1.1952-.2473-2.1706-1.525-2.1706h-4.6983l-3.929 10.798-2.2255 6.127C3.929 22.434 0 17.6806 0 12.007 0 6.498 3.7092 1.8546 8.7647.4396L6.4705 6.759 2.6514 17.2547h2.5415L8.4488 8.339h1.9095l-3.2558 8.9158H9.644l3.0223-8.3251c.4396-1.1952-.2473-2.1706-1.525-2.1706h-2.143l2.459-6.7453C11.636 0 11.8145 0 11.9931 0 18.6285 0 24 5.3715 24 12.007c.0137 6.6216-5.3578 11.993-11.9931 11.993zM19.2742 8.325h-1.9096l-2.6789 7.336h1.9096l2.6789-7.336z","dell":"M17.963 14.6V9.324h1.222v4.204h2.14v1.07h-3.362zm-9.784-3.288l2.98-2.292c.281.228.56.458.841.687l-2.827 2.14.611.535 2.827-2.216c.281.228.56.458.841.688a295.83 295.83 0 0 1-2.827 2.216l.61.536 2.83-2.295-.001-1.986h1.223v4.204h2.216v1.07h-3.362v-1.987c-.995.763-1.987 1.529-2.981 2.292l-2.981-2.292c-.144.729-.653 1.36-1.312 1.694-.285.147-.597.24-.915.276-.183.022-.367.017-.551.017H3.516V9.325H5.69a2.544 2.544 0 0 1 1.563.557c.454.36.778.872.927 1.43m-3.516-.917v3.21l.953-.001a1.377 1.377 0 0 0 1.036-.523 1.74 1.74 0 0 0 .182-1.889 1.494 1.494 0 0 0-.976-.766c-.166-.04-.338-.03-.507-.032h-.688zM11.82 0h.337a11.94 11.94 0 0 1 5.405 1.373 12.101 12.101 0 0 1 4.126 3.557A11.93 11.93 0 0 1 24 11.82v.36a11.963 11.963 0 0 1-3.236 8.033A11.967 11.967 0 0 1 12.182 24h-.361a11.993 11.993 0 0 1-4.145-.806 12.04 12.04 0 0 1-4.274-2.836A12.057 12.057 0 0 1 .576 15.67 12.006 12.006 0 0 1 0 12.181v-.361a11.924 11.924 0 0 1 1.992-6.396 12.211 12.211 0 0 1 4.71-4.172A11.875 11.875 0 0 1 11.82 0m-.153 1.23a10.724 10.724 0 0 0-6.43 2.375 10.78 10.78 0 0 0-3.319 4.573 10.858 10.858 0 0 0 .193 8.12 10.788 10.788 0 0 0 3.546 4.421 10.698 10.698 0 0 0 4.786 1.946c1.456.209 2.955.124 4.376-.26a10.756 10.756 0 0 0 5.075-3.062 10.742 10.742 0 0 0 2.686-5.28 10.915 10.915 0 0 0-.122-4.682 10.77 10.77 0 0 0-7.098-7.626 10.78 10.78 0 0 0-3.693-.525z","lenovo":"M21.044 12.288c0 .5-.343.867-.815.867-.464 0-.827-.38-.827-.867 0-.51.343-.868.815-.868.464 0 .827.381.827.868zm-14.305-.92a.787.787 0 0 0-.651.307.991.991 0 0 0-.172.738l1.479-.614a.708.708 0 0 0-.656-.43zm6.963.052c-.472 0-.816.358-.816.868 0 .486.364.867.828.867.472 0 .815-.368.815-.867 0-.487-.363-.868-.827-.868zM24 7.997v8.006H0V7.997h24zM5.01 13.05H3.088V9.825H2.23v4.003h2.78v-.777zm1.137-.094l2.163-.897a1.667 1.667 0 0 0-.37-.86c-.284-.33-.704-.505-1.216-.505-.931 0-1.633.686-1.633 1.593 0 .93.704 1.593 1.726 1.593.572 0 1.158-.272 1.432-.589l-.535-.411c-.357.264-.56.326-.885.326-.292 0-.52-.09-.682-.25zm5.57-1.039c0-.709-.507-1.223-1.252-1.223a1.28 1.28 0 0 0-1.005.494v-.442h-.846v3.081h.846v-1.753c0-.316.245-.651.698-.651.35 0 .712.243.712.651v1.753h.847v-1.91zm3.647.37c0-.904-.725-1.593-1.65-1.593-.933 0-1.663.7-1.663 1.593 0 .903.726 1.592 1.651 1.592.932 0 1.662-.7 1.662-1.592zm2.066 1.54l1.268-3.081h-.967l-.765 2.099-.765-2.1h-.966l1.268 3.081h.927zm4.449-1.54c0-.904-.725-1.593-1.65-1.593-.932 0-1.662.7-1.662 1.593 0 .903.725 1.592 1.65 1.592.932 0 1.662-.7 1.662-1.592z","acer":"M23.943 9.364c-.085-.113-.17-.198-.595-.226-.113 0-.453-.029-1.048-.029-1.56 0-2.636.482-3.175 1.417.142-.935-.765-1.417-2.749-1.417-2.324 0-3.798.935-4.393 2.834-.226.709-.226 1.276-.056 1.73h-.567c-.425.027-.992.056-1.36.056-.85 0-1.39-.142-1.588-.425-.17-.255-.17-.737.057-1.446.368-1.162 1.247-1.672 2.664-1.672.737 0 1.445.085 1.445.085.085 0 .142-.113.142-.198l-.028-.085-.057-.397c-.028-.255-.227-.397-.567-.453-.311-.029-.567-.029-.907-.029h-.028c-1.842 0-3.146.624-3.854 1.814.255-1.219-.596-1.814-2.551-1.814-1.105 0-1.9.029-2.353.085-.368.057-.595.199-.68.454l-.17.51c-.028.085.029.142.142.142.085 0 .425-.057.992-.086a24.816 24.816 0 0 1 1.672-.085c1.077 0 1.559.284 1.389.822-.029.114-.114.199-.255.227-1.02.17-1.842.284-2.438.369-1.7.226-2.692.736-2.947 1.587-.369 1.162.538 1.728 2.72 1.728 1.078 0 2.013-.056 2.75-.198.425-.085.652-.17.737-.453l.396-1.304c-.028 1.304.85 1.955 2.721 1.955.794 0 1.559-.028 1.927-.085.369-.056.567-.141.652-.425l.085-.396c.397.623 1.276.935 2.608.935 1.417 0 2.239-.029 2.465-.114a.523.523 0 0 0 .369-.311l.028-.085.17-.539c.029-.085-.028-.142-.142-.142l-.906.057c-.596.029-1.077.057-1.418.057-.651 0-1.076-.057-1.332-.142-.368-.142-.538-.397-.51-.822l2.863-.368c1.275-.17 2.154-.567 2.579-1.19l-.992 3.315c-.028.057 0 .114.028.142.029.028.085.057.199.057h1.19c.198 0 .283-.114.312-.199l1.048-3.656c.142-.481.567-.708 1.36-.708.71 0 1.22 0 1.56.028h.028c.057 0 .17-.028.255-.17l.17-.51c0-.085 0-.17-.057-.227zM4.841 13.73c-.368.057-.907.085-1.587.085-1.219 0-1.729-.255-1.587-.737.113-.34.425-.567.935-.624l2.75-.368zm12.669-2.95c-.114.369-.652.624-1.616.766l-2.295.311.056-.198c.199-.624.454-1.02.794-1.247.34-.227.907-.34 1.7-.34 1.05.028 1.503.255 1.36.708Z","asus":"M23.904 10.788V9.522h-4.656c-.972 0-1.41.6-1.482 1.182v.018-1.2h-1.368v1.266h1.362zm-6.144.456l-1.368-.078v1.458c0 .456-.228.594-1.02.594H14.28c-.654 0-.93-.186-.93-.594v-1.596l-1.386-.102v1.812h-.03c-.078-.528-.276-1.14-1.596-1.23L6 11.22c0 .666.474 1.062 1.218 1.14l3.024.306c.24.018.414.09.414.288 0 .216-.18.24-.456.24H5.946V11.22l-1.386-.09v3.348h5.646c1.26 0 1.662-.654 1.722-1.2h.03c.156.864.912 1.2 2.19 1.2h1.41c1.494 0 2.202-.456 2.202-1.524zm4.398.258l-4.338-.258c0 .666.438 1.11 1.182 1.17l3.09.24c.24.018.384.078.384.276 0 .186-.168.258-.516.258h-4.212v1.29h4.302c1.356 0 1.95-.474 1.95-1.554 0-.972-.534-1.338-1.842-1.422zm-10.194-1.98h1.386v1.266h-1.386zM3.798 11.07l-1.506-.15L0 14.478h1.686zm7.914-1.548h-4.23c-.984 0-1.416.612-1.518 1.2v-1.2H3.618c-.33 0-.486.102-.642.33l-.648.936h9.384Z","fujitsu":"M16.56 3C14.15 3 12.04 4.24 10.68 5.97L10.68 9.76C12.5 4.71 16.56 5.08 16.56 5.08C19.5 5.08 21.84 7.38 21.84 10.2C21.84 13.04 19.5 15.33 16.56 15.33A5.32 5.32 0 0 1 12.84 13.83L10.28 11.03A6.06 6.06 0 0 0 6.03 9.32C2.7 9.32 0 11.93 0 15.16C0 18.4 2.7 21 6.03 21C7.9 21 9.58 20.19 10.68 18.89L10.68 15.86C8.88 19.29 6.03 18.92 6.03 18.92C3.9 18.92 2.17 17.24 2.17 15.16C2.17 13.1 3.9 11.42 6.03 11.42C7.09 11.42 8.05 11.84 8.75 12.5L11.31 15.31A7.5 7.5 0 0 0 16.56 17.43C20.67 17.43 24 14.19 24 10.2C24 6.21 20.67 3 16.56 3Z","apple":"M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"};
var RULES=[["hp","HP",["hp ","hewlett","elitebook","probook","pavilion","zbook"]],["dell","Dell",["dell","latitude","precision","vostro","inspiron"]],["lenovo","Lenovo",["lenovo","thinkpad","ideapad","yoga","legion"]],["acer","Acer",["acer","predator","nitro","aspire","swift"]],["asus","ASUS",["asus","zenbook","vivobook","rog"]],["fujitsu","Fujitsu",["fujitsu","lifebook"]],["apple","Apple",["apple","macbook"]]];
var CSS=".brands{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 26px}"
+".brand-chip{display:inline-flex;align-items:center;gap:9px;padding:9px 16px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--muted);font-family:inherit;font-size:.95rem;font-weight:600;line-height:1;cursor:pointer;transition:background .18s ease,border-color .18s ease,color .18s ease}"
+".brand-chip:hover{border-color:var(--steel);color:var(--ink)}"
+".brand-chip.is-on{background:var(--ink);border-color:var(--ink);color:#fff}"
+".brand-chip .brand-n{font-family:'IBM Plex Mono',monospace;font-style:normal;font-size:.78rem;opacity:.6}"
+"@media(max-width:560px){.brand-chip{padding:8px 13px;font-size:.9rem;gap:7px}}";
var st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);

var grid=document.querySelector('#catalog .lap-grid');
if(!grid){return;}
var cards=Array.prototype.slice.call(grid.querySelectorAll('.lap'));
if(!cards.length){return;}

var STEP=6, active='', shown=STEP;
var counts={}, labels={}, order=[];
cards.forEach(function(c){
  var h=c.querySelector('h3');
  var t=(h?h.textContent:'').toLowerCase()+' ';
  var key='';
  RULES.forEach(function(r){
    if(key){return;}
    r[2].forEach(function(w){ if(!key && t.indexOf(w)!==-1){ key=r[0]; labels[r[0]]=r[1]; } });
  });
  c.setAttribute('data-brand', key);
  if(key){ counts[key]=(counts[key]||0)+1; if(order.indexOf(key)===-1){ order.push(key); } }
});

var wrap=document.getElementById('loadmore');
var left=document.getElementById('loadmore-left');
var oldBtn=document.getElementById('loadmore-btn');
var btn=null;
if(oldBtn){ btn=oldBtn.cloneNode(true); oldBtn.parentNode.replaceChild(btn, oldBtn); }

var box=document.createElement('div');
box.className='brands'; box.id='brands';
box.setAttribute('role','group');
box.setAttribute('aria-label','Фільтр за брендом');
grid.parentNode.insertBefore(box, grid);

function visible(){
  return cards.filter(function(c){ return !active || c.getAttribute('data-brand')===active; });
}
function paint(){
  cards.forEach(function(c){ c.classList.add('is-hidden'); });
  var vis=visible();
  vis.forEach(function(c,i){ if(i>=shown){ return; } c.classList.remove('is-hidden'); });
  if(!wrap){ return; }
  if(shown>=vis.length){ wrap.hidden=true; }
  else { wrap.hidden=false; if(left){ left.textContent='показано '+shown+' з '+vis.length; } }
}
function icon(d){
  var NS='http://www.w3.org/2000/svg';
  var s=document.createElementNS(NS,'svg');
  s.setAttribute('viewBox','0 0 24 24'); s.setAttribute('width','22'); s.setAttribute('height','22');
  s.setAttribute('fill','currentColor'); s.setAttribute('aria-hidden','true');
  var p=document.createElementNS(NS,'path'); p.setAttribute('d',d); s.appendChild(p);
  return s;
}
function chip(key,label,n){
  var b=document.createElement('button');
  b.type='button'; b.className='brand-chip'; b.setAttribute('data-b',key);
  if(key && SVG[key]){ b.appendChild(icon(SVG[key])); }
  var sp=document.createElement('span'); sp.textContent=label; b.appendChild(sp);
  var i=document.createElement('i'); i.className='brand-n'; i.textContent=n; b.appendChild(i);
  b.addEventListener('click',function(){
    active=(active===key)?'':key;
    shown=STEP; paint(); mark();
    var sec=document.getElementById('catalog');
    if(sec){ sec.scrollIntoView({behavior:'smooth',block:'start'}); }
  });
  return b;
}
function mark(){
  Array.prototype.forEach.call(box.children,function(el){
    var on=el.getAttribute('data-b')===active;
    el.classList.toggle('is-on', on);
    el.setAttribute('aria-pressed', on?'true':'false');
  });
}
if(order.length>=2){
  box.appendChild(chip('','Усі',cards.length));
  order.forEach(function(k){ box.appendChild(chip(k,labels[k],counts[k])); });
  mark();
} else { box.style.display='none'; }

if(btn){
  btn.addEventListener('click',function(){
    shown=Math.min(shown+STEP, visible().length);
    paint();
    if(shown>=visible().length){ btn.blur(); }
  });
}
paint();
}
})();
