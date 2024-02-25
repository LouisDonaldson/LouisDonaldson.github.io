const links = [
  {
    name: "Pathfinding Demonstration",
    href: "./pathfinding/pathfinding.html",
  },
  {
    name: "Bywater Concept Website",
    href: "bywater.html",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  init();
});

async function init() {
  const text = document.querySelector(".title");
  await Timeout(1000);
  text.innerHTML = `
  <div class="text">
    Welcome!
  </div>`;

  text.addEventListener("click", () => {
    const main_body = document.querySelector(".main_body");
    main_body.innerHTML = `
    <ul class="ul_nav">    
    </ul>`;

    const ul = main_body.querySelector(".ul_nav");

    for (const { name, href } of links) {
      const li = document.createElement("li");
      li.classList.add("li_nav_item");
      li.innerHTML = `
      <a href="${href}">${name}</a>`;

      ul.append(li);
    }
  });
}

function Timeout(milsecs) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, milsecs);
  });
}
