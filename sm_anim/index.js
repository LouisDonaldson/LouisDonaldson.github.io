window.addEventListener("DOMContentLoaded", () => {
  // When the user scrolls the page, execute myFunction
  window.onscroll = function () {
    addSticky();
  };
  // Get the navbar
  var navbar = document.getElementById("navbar");
  // Get the offset position of the navbar
  var sticky = navbar.offsetTop;
  // Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
  function addSticky() {
    if (window.scrollY >= sticky) {
      navbar.classList.add("sticky");
    } else {
      navbar.classList.remove("sticky");
    }
  }
});

window.addEventListener(
  "scroll",
  () => {
    document.body.style.setProperty(
      "--scroll",
      window.pageYOffset / (document.body.offsetHeight - window.innerHeight)
    );

    console.log("Scrolling");

    const add_animation_when_in_viewport = (
      id_name,
      animation_class_name,
      pixel_offset = 0
    ) => {
      const element = document.querySelector(`#${id_name}`);
      const result = isElementInViewport(element, pixel_offset);
      if (result) {
        console.log(result.pixels_from_el_top);
        element.classList.add(animation_class_name);
      }
    };

    add_animation_when_in_viewport("services_container", "slide-down");
    add_animation_when_in_viewport("prices_container", "slide-down");
    add_animation_when_in_viewport("test_container", "slide-down");
    add_animation_when_in_viewport("contact_container", "slide-down");
  },
  false
);

function isElementInViewport(el, pixel_offset) {
  // console.log(window.visualViewport.height);
  // console.log(el.getBoundingClientRect().y);
  el_bounds = el.getBoundingClientRect();
  const pixels_from_el_top = window.visualViewport.height - el_bounds.y;

  // console.log();
  if (pixels_from_el_top >= 0 + pixel_offset) {
    // if (pixels_from_el_top >= window.visualViewport.height + el_bounds.height) {
    //   return false;
    // }
    return { bounds: el_bounds, pixels_from_el_top: pixels_from_el_top };
    // console.log(pixels_from_el_top);
    // has visited element
    // return pixels_from_el;
  } else {
    return false;
  }
}
