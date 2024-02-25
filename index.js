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
}

function Timeout(milsecs) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, milsecs);
  });
}
