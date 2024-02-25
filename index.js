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
        <li class="li_nav_item">
            <a href="bywater.html">Bywater Concept Website</a>
        </li>
        <li class="li_nav_item">
            <a href="./pathfinding/pathfinding.html">Pathfinding Demonstration</a>
        </li>    </ul>`;
  });
}

function Timeout(milsecs) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, milsecs);
  });
}
