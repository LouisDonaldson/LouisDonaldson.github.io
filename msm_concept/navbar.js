window.addEventListener("DOMContentLoaded", () => {
  const nav_el = document.querySelector("#nav");
  if (!nav_el) return;

  nav_el.innerHTML = `
    <div class="nav_inner">
        <a class="nav_logo" href="./index.html">
            <img src="./images/new_logo.png" alt="MSM Logo">
        </a>
        <button class="nav_toggle" id="nav_toggle" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
        <div class="nav_links" id="nav_links">
            <a class="nav_link" href="./index.html#about_us">About us</a>
            <div class="nav_dropdown" id="nav_dropdown">
                <a class="nav_link nav_dropdown_toggle" href="#" id="nav_dropdown_toggle">Training</a>
                <div class="nav_dropdown_panel">
                    <a href="./training.html">Overview</a>
                    <a href="./training-cbt.html">CBT</a>
                    <a href="./training-licenses.html">Licences</a>
                    <a href="./training-driver.html">Driver</a>
                    <a href="./training-instructor.html">Instructor</a>
                </div>
            </div>
            <a class="nav_link" href="./index.html#locations">Our Locations</a>
            <a class="nav_link" href="./gallery.html">Gallery</a>
            <a class="nav_link" href="./testimonials.html">Testimonials</a>
            <a class="nav_link nav_cta btn btn-primary btn-sm" href="./index.html#get_in_touch">Get in touch</a>
        </div>
    </div>
    `;

  const toggle = document.getElementById("nav_toggle");
  const links = document.getElementById("nav_links");
  const dropdown = document.getElementById("nav_dropdown");
  const dropdownToggle = document.getElementById("nav_dropdown_toggle");

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    nav_el.classList.toggle("menu-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  dropdownToggle.addEventListener("click", (e) => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      e.preventDefault();
      dropdown.classList.toggle("is-open");
    }
  });

  links.querySelectorAll("a").forEach((a) => {
    if (a === dropdownToggle) return;
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      dropdown.classList.remove("is-open");
      nav_el.classList.remove("menu-open");
      document.body.style.overflow = "";
    });
  });

  const toggleScrolled = () => {
    nav_el.classList.toggle("scrolled", window.scrollY > 40);
  };
  toggleScrolled();
  window.addEventListener("scroll", toggleScrolled, { passive: true });

  // reveal-on-scroll for any element flagged with .reveal
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }
});
