window.addEventListener("DOMContentLoaded", () => {
  const footer_el = document.querySelector("#site-footer");
  if (!footer_el) return;

  const year = new Date().getFullYear();

  footer_el.innerHTML = `
    <div class="footer_main">
        <div class="container footer_grid">
            <div class="footer_brand">
                <a class="footer_logo" href="./index.html">
                    <img src="./images/new_logo.png" alt="MSM Logo">
                </a>
                <p>Family-owned motorbike and car training school serving Kingston upon Hull and Lincoln for over 20 years.</p>
                <div class="footer_social">
                    <a href="https://www.facebook.com/hullmsm/?locale=en_GB" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <img src="./images/facebook.svg" alt="">
                    </a>
                </div>
            </div>
            <div class="footer_col">
                <h3>Quick links</h3>
                <ul>
                    <li><a href="./index.html#about_us">About us</a></li>
                    <li><a href="./index.html#what_we_provide">Training overview</a></li>
                    <li><a href="./index.html#locations">Our locations</a></li>
                    <li><a href="./gallery.html">Gallery</a></li>
                    <li><a href="./testimonials.html">Testimonials</a></li>
                </ul>
            </div>
            <div class="footer_col">
                <h3>Training</h3>
                <ul>
                    <li><a href="./training-cbt.html">CBT</a></li>
                    <li><a href="./training-licenses.html">Motorcycle licences</a></li>
                    <li><a href="./training-driver.html">Driver training</a></li>
                    <li><a href="./training-instructor.html">Instructor training</a></li>
                    <li><a href="https://msmhull.theorytestpro.co.uk/students/new" target="_blank" rel="noopener noreferrer">Free online theory test</a></li>
                </ul>
            </div>
            <div class="footer_col">
                <h3>Get in touch</h3>
                <ul class="footer_contact">
                    <li><a href="mailto:mikemoon40@hotmail.com">mikemoon40@hotmail.com</a></li>
                    <li><a href="tel:+447792547278">07792 547278</a></li>
                    <li>MSM Hull Karting, Poorhouse Ln, Preston Rd, Hull, HU9 5HE</li>
                </ul>
                <p class="footer_hours"><strong>Open 8am&ndash;8pm</strong>, 7 days a week</p>
            </div>
        </div>
    </div>
    <div class="footer_bottom">
        <div class="container footer_bottom_inner">
            <p>&copy; ${year} MSM Rider &amp; Driver Training. All rights reserved.</p>
            <a href="./terms_conditions.html" class="terms_link">Terms and Conditions</a>
        </div>
    </div>
    `;
});
