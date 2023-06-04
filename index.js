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
    const see_my_work_btn = `
    <button class="btn btn-outline-primary mt-3">See my work.</button>`;

    const about_me_description = `My name is Louis Donaldson and I'm a Computer Science student studying a Masters Degree at the University of Hull. I'm an aspiring Web Developer and have relevant experience in the field, including extensive knowledge in JS, CSS and HTML. I am proficient in back-end technologies such as Node.JS and ASP.NET.
      <br><br> I'm laid-back in nature. However, I am an extremely hard-working individual who is very driven and dedicated. Alongside my University Studies I was working 3 jobs concurrently. I also have great time management skills as well as good interpersonal skills. I work very well in a team environment as well as having a high motivation to learn new skills.`;

    const additional_about_me_description = `
    At the moment I tutor Computer Science to an individual with SEN 
    which has given me an insight into the diversity of individuals. 
    This has allowed me to develop skills such as adaptability and 
    unique communication abilities. As well as this I currently work at the 
    Press Association developing countless web-tools to pull data from their 
    extensive Sports Data API which has given me great insight into how data 
    is handled withing a multi-national company.<br><br>
    In my spare time I enjoy programming, playing guitar, riding motorbikes 
    and being with friends.<br>
    ${see_my_work_btn}`;
    element.innerHTML = `
    <div class="title h1">
        About me.
    </div>
    <div class="about_me_text h6">
    </div>`;
    setTimeout(() => {
      const about_me_section = element.querySelector(".about_me_text");
      about_me_section.innerHTML = `
      <span class="about_me_description">${about_me_description}<br>
      <button class="btn btn-outline-primary mt-3 d-sm-none more_btn">More</button>
      <span class="d-none d-sm-block"><br>${additional_about_me_description}</span>
      </span>`;

      const about_me_span = about_me_section.querySelector(
        ".about_me_description"
      );
      const more_btn = about_me_section.querySelector(".more_btn");
      more_btn.addEventListener("click", () => {
        about_me_span.innerHTML = `<span class="tracking-in-expand">${additional_about_me_description}</span>`;
        setTimeout(() => {
          element.scrollIntoView();
        }, 700);
        // element.scrollIntoView();
      });

      element.scrollIntoView();
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
