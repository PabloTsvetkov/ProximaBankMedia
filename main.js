const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const state = {
  category: "Все",
  query: "",
  shown: 0,
  step: 12
};

// Articles dataset injected by script tag.
let DATA = window.PROXIMA_DATA || [];

function norm(s){ return (s || "").toLowerCase().replaceAll("ё","е"); }

function matches(item){
  const q = norm(state.query);
  const okCat = state.category === "Все" || item.cat === state.category;
  if(!okCat) return false;
  if(!q) return true;
  const hay = norm([item.title, item.desc, item.cat, item.tone].join(" "));
  return hay.includes(q);
}

function badgeDotClass(item){
  return item.accent === "cyan" ? "badge blue" : "badge";
}

function renderCards(reset=false){
  const grid = $("#cards");
  const empty = $("#empty");
  const btn = $("#loadMoreBtn");

  const filtered = DATA.filter(matches);

  if(reset){
    state.shown = 0;
    grid.innerHTML = "";
  }

  const slice = filtered.slice(state.shown, state.shown + state.step);
  slice.forEach(item => {
    const a = document.createElement("a");
    a.className = "card reveal";
    a.href = `article.html?id=${encodeURIComponent(item.id)}`;
    a.setAttribute("data-id", item.id);
    a.innerHTML = `
      <div class="cover" style="background-image:url('${item.cover}')"></div>
      <div class="content">
        <h3 class="title">${item.title}</h3>
        <p class="desc">${item.desc}</p>
        <div class="meta">
          <span class="${badgeDotClass(item)}"><span class="dot"></span>${item.cat}</span>
          <span class="badge"><span class="dot" style="background: var(--cyan); box-shadow: 0 0 0 3px rgba(0,229,255,.12)"></span>${item.tone}</span>
        </div>
      </div>
    `;
    grid.appendChild(a);
    requestAnimationFrame(() => a.classList.add("in"));
  });

  state.shown += slice.length;

  const any = filtered.length > 0;
  empty.style.display = any ? "none" : "block";
  btn.style.display = state.shown < filtered.length ? "inline-flex" : "none";
  $("#count").textContent = `${filtered.length} материалов`;
}

function toast(msg){
  const t = $("#toast");
  $("#toastMsg").textContent = msg;
  t.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => t.classList.remove("show"), 2200);
}

function setCategory(cat){
  state.category = cat;
  $$(".pill").forEach(p => p.setAttribute("aria-pressed", String(p.dataset.cat === cat)));
  renderCards(true);
  scrollToCards();
  toast(cat === "Все" ? "Показываю всё, что не скучно" : `Фильтр: ${cat}`);
}

function setupPills(){
  $$(".pill").forEach(p => {
    p.addEventListener("click", () => setCategory(p.dataset.cat));
  });
}

function setupSearch(){
  const input = $("#search");
  input.addEventListener("input", () => {
    state.query = input.value.trim();
    renderCards(true);
  });

  // Cmd/Ctrl + K focus
  window.addEventListener("keydown", (e) => {
    const isK = (e.key || "").toLowerCase() === "k";
    if((e.ctrlKey || e.metaKey) && isK){
      e.preventDefault();
      input.focus();
    }
    if(e.key === "Escape"){
      input.blur();
    }
  });
}

function setupLoadMore(){
  $("#loadMoreBtn").addEventListener("click", () => renderCards(false));
}

function setupReveal(){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  $$(".reveal").forEach(el => io.observe(el));

  // For dynamically added cards, we re-observe via mutation
  const mo = new MutationObserver((muts) => {
    muts.forEach(m => {
      m.addedNodes.forEach(n => {
        if(n.nodeType === 1 && n.classList.contains("reveal")){
          io.observe(n);
        }
      });
    });
  });
  mo.observe($("#cards"), { childList: true });
}

function setupProgress(){
  const bar = $("#progress");
  const onScroll = () => {
    const h = document.documentElement;
    const max = (h.scrollHeight - h.clientHeight) || 1;
    const p = (h.scrollTop / max) * 100;
    bar.style.width = `${p.toFixed(2)}%`;
  };
  window.addEventListener("scroll", onScroll, { passive:true });
  onScroll();
}

function scrollToCards(){
  $("#cardsAnchor").scrollIntoView({ behavior: "smooth", block: "start" });
}

function setupCTA(){
  $("#ctaAll").addEventListener("click", (e) => { e.preventDefault(); setCategory("Все"); scrollToCards(); });
  $("#ctaSafety").addEventListener("click", (e) => { e.preventDefault(); setCategory("Безопасность"); scrollToCards(); });
  $("#ctaMortgage").addEventListener("click", (e) => { e.preventDefault(); setCategory("Ипотека"); scrollToCards(); });
}

function boot(){
  setupPills();
  setupSearch();
  setupLoadMore();
  setupReveal();
  setupProgress();
  setupCTA();
  renderCards(true);
}
document.addEventListener("DOMContentLoaded", boot);
