window.addEventListener("DOMContentLoaded", () => {
  const gallery_row = document.querySelector(".gallery_row");
  for (let index = 0; index < 31; index++) {
    gallery_row.innerHTML += `
    <div class="col-md-4 col-xl-3 col-sm-6  mb-3">
        <div class="gallery_img_item" style="background-image: url(./images/gallery/${
          index + 1
        }.jpeg);"></div>
    </div>`;
  }
});
