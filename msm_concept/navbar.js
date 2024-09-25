window.addEventListener("DOMContentLoaded", () => {
  const nav_el = document.querySelector("#nav");
  nav_el.innerHTML = `
    <div class="logo_div">
        <a class="nav-link" href="./index.html" role="button">
            <img src="./images/new_logo.png" alt="MSM Logo" class="logo">
        </a>
    </div>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapsibleNavbar">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse justify-content-end" id="collapsibleNavbar">
        <ul class="navbar-nav justify-content-center align-items-center">
            <li class="nav-item">
                <a class="nav-link" href="./index.html#about_us" role="button">About us</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Training</a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="./index.html#what_we_provide">Overview</a></li>
                    <li><a class="dropdown-item" href="./training.html#rider">Rider</a></li>
                    <li><a class="dropdown-item" href="./training.html#driver">Driver</a></li>
                    <li><a class="dropdown-item" href="./training.html#instructor">Instructor</a></li>

                </ul>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="./index.html#locations" role="button">Our Locations</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="./gallery.html" role="button">Gallery</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="./testimonials.html" role="button">Testimonials</a>
            </li>
            <li class="nav-item">
                <a class="nav-link btn btn-outline-primary btn_outline_primary d-none d-lg-block  px-2"
                    href="./index.html#get_in_touch" role="button">Get in touch</a>
            </li>
            <li class="nav-item d-lg-none">
                <a class="nav-link" href="./index.html#get_in_touch" role="button">Get
                    in touch</a>
            </li>
        </ul>
    </div>
    `;
});
