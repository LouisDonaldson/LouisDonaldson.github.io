window.addEventListener("DOMContentLoaded", () => {
  const gallery_grid = document.querySelector(".gallery_grid");
  let html = "";
  for (let index = 1; index <= 31; index++) {
    html += `
    <figure class="gallery_item">
        <img src="./images/gallery/${index}.jpeg" alt="MSM training photo ${index}" loading="lazy">
    </figure>`;
  }
  gallery_grid.innerHTML = html;
});
