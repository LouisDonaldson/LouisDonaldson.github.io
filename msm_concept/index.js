window.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".location_tab");
  const panels = document.querySelectorAll(".location_panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-target");

      tabs.forEach((t) => t.classList.remove("is-active"));
      panels.forEach((p) => p.classList.remove("is-active"));

      tab.classList.add("is-active");
      document.getElementById(target).classList.add("is-active");
    });
  });
});
