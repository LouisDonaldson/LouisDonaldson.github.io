window.addEventListener("DOMContentLoaded", () => {
  const landing_call_to_action = document.querySelector(".call_to_action");
  landing_call_to_action.addEventListener("click", () => {
    const about_me = document.querySelector("#about_me");
    about_me.scrollIntoView();
  });

  LazyLoadingAboutMe(about_me);
});

function LazyLoadingAboutMe(parent) {
  let within_viewport = false;
  let loaded = false;
  setInterval(() => {
    if (isInViewport(parent)) {
      within_viewport = true;
      if (within_viewport) {
        if (!loaded) {
          loaded = true;
          parent.innerHTML = `
            <div class="title">
                About me.
            </div>`;
        }
      }
    } else {
      within_viewport = false;
      loaded = false;
      parent.innerHTML = ``;
    }
  }, 500);
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
