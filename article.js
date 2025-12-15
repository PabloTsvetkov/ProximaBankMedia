const $ = (sel, root=document) => root.querySelector(sel);
const DATA = window.PROXIMA_DATA || [];

function getParam(name){
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

function renderBody(blocks){
  if(!blocks || !blocks.length) return "<p>Скоро будет текст. Пока — интрига и дизайн.</p>";
  return blocks.map(b => {
    if(typeof b === "string"){
      return `<p>${b}</p>`;
    }
    if(b && typeof b === "object" && Array.isArray(b.ul)){
      return `<ul>` + b.ul.map(li => `<li>${li}</li>`).join("") + `</ul>`;
    }
    return "";
  }).join("");
}

function render(){
  const id = getParam("id");
  const item = DATA.find(x => x.id === id) || DATA[0];

  $("#title").textContent = item ? item.title : "Материал";
  $("#desc").textContent = item ? item.desc : "Скоро будет текст. Пока — интрига и дизайн.";
  $("#badgeCat").textContent = item ? item.cat : "Проксима";
  $("#badgeTone").textContent = item ? item.tone : "материал";
  $("#cover").style.backgroundImage = `url('${item ? item.cover : "assets/hero.svg"}')`;

  $("#body").innerHTML = renderBody(item && item.body);

  // "tag" pill instead of fake button
  const tag = $("#safetyTag");
  if(tag){
    tag.textContent = "Безопасность — наш пунктик";
  }
}

document.addEventListener("DOMContentLoaded", render);
