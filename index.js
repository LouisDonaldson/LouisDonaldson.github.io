window.addEventListener("DOMContentLoaded", () => {
  const landing_call_to_action = document.querySelector(".call_to_action");
  landing_call_to_action.addEventListener("click", () => {
    const about_me = document.querySelector("#about_me");
    about_me.scrollIntoView();
  });

  LazyLoadingAboutMe(about_me);
});

function LazyLoadingAboutMe(parent) {
  const LoadAboutMeUI = (element) => {
    const about_me_description =
      "My name is Louis Donaldson and I'm a Computer Science student studying a Masters Degree at the University of Hull. I'm an aspiring Web Developer and have relevant experience in the field, including extensive knowledge in JS, CSS and HTML. As well as this I am proficient in back-end technologies such as Node.JS and ASP.NET.";
    element.innerHTML = `
            <div class="title h1">
                About me.
            </div>
            <div class="about_me_text p">
            </div>`;
    setTimeout(() => {
      const about_me_section = element.querySelector(".about_me_text");
      about_me_section.innerHTML = `
      <span>${about_me_description}</span>`;
    }, 1000);
  };
  let within_viewport = false;
  let loaded = false;
  window.addEventListener("scroll", () => {
    var position = parent.getBoundingClientRect();
    // if (position.top >= 0 && position.bottom <= window.innerHeight) {
    //   console.log("Element is fully visible in screen");
    // }
    if (position.top < window.innerHeight && position.bottom >= 0) {
      //   console.log("Element is partially visible in screen");
      within_viewport = true;
      if (within_viewport) {
        if (!loaded) {
          loaded = true;
          LoadAboutMeUI(parent);
          // parent.innerHTML = `
          //   <div class="title">
          //       About me.
          //   </div>`;
        }
      }
    } else {
      within_viewport = false;
      loaded = false;
      parent.innerHTML = ``;
    }
  });
  //   setInterval(() => {
  //     if (isInViewport(parent)) {
  //       within_viewport = true;
  //       if (within_viewport) {
  //         if (!loaded) {
  //           loaded = true;
  //           parent.innerHTML = `
  //             <div class="title">
  //                 About me.
  //             </div>`;
  //         }
  //       }
  //     } else {
  //       within_viewport = false;
  //       loaded = false;
  //       parent.innerHTML = ``;
  //     }
  //   }, 500);
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  const innerHeight = window.innerHeight;
  const clientHeight = document.documentElement.clientHeight;

  rect;

  //   element.innerHTML = `${JSON.stringify(rect)} + ${
  //     document.documentElement.clientHeight
  //   }`;
  //   return (
  //     rect.top >= 0 &&
  //     rect.left >= 0 &&
  //     rect.bottom <=
  //       (window.innerHeight || document.documentElement.clientHeight) &&
  //     rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  //   );
}
