window.addEventListener("DOMContentLoaded", () => {
  LoadPortfolioCarousel();
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
    <a href="#portfolio"><button class="btn btn-outline-primary mt-3 work_btn">See my work.</button></a>`;

    const about_me_description = `My name is Louis Donaldson and I'm a Computer Science student studying a Masters Degree at the University of Hull. I'm an aspiring Web Developer and have relevant experience in the field, including extensive knowledge in JS, CSS and HTML. I am proficient in back-end technologies such as Node.JS and ASP.NET.
      <br><br> I'm laid-back in nature. However, I am an extremely hard-working individual who is very driven and dedicated. Alongside my University Studies I was working 3 jobs concurrently. I also have great time management skills as well as good interpersonal skills. I work very well in a team environment as well as having a high motivation to learn new skills.`;

    const additional_about_me_description = `
    At the moment I tutor Computer Science to an individual with SEN 
    which has given me an insight into the diversity of individuals. 
    This has allowed me to develop skills such as adaptability and 
    unique communication abilities. As well as this I currently work at the 
    Press Association developing countless web-tools to pull data from their 
    extensive Sports Data API which has given me great insight into how data 
    is handled within a multi-national company.<br><br>
    As an individual I value other people's opinions and can work well as part of a team.
    I also have the ability to work independently if neccessary with the flexibility
    to adapt to requirements.<br><br>
    In my spare time I enjoy programming, playing video-games, playing guitar, 
    riding motorbikes and being with friends and family.
    <br>
    ${see_my_work_btn}`;
    element.innerHTML = `
    <div class="_title h1">
        About me.
    </div>
    <div class="about_me_text h6">
    </div>`;
    setTimeout(() => {
      const about_me_section = element.querySelector(".about_me_text");
      about_me_section.innerHTML = `
      <span class="about_me_description">${about_me_description}<br>
      <button class="btn btn-outline-primary mt-3 d-sm-none more_btn">More</button>
      <span class="d-none d-sm-inline-flex flex-column"><br>${additional_about_me_description}</span>
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

async function LoadPortfolioCarousel() {
  function AddItem(array_of_image_names, title, description) {
    const item = document.createElement("div");
    item.innerHTML = `
    <div class="portfolio_item h-100">
      <div class="portfolio_images mb-4">
      </div>
      <div class="portfolio_text px-3">
        <div class="item_title h1">
          ${title}
        </div>
        <div class="item_description">
          ${description}
        </div>
      </div>
      
    </div>`;

    const images_section = item.querySelector(".portfolio_images");

    for (const url of array_of_image_names) {
      images_section.innerHTML += `
      <div class="portfolio_image">
          <img src="${url}" class="img">
        </div>`;
    }

    return item.innerHTML;
  }

  const portfolio_carousel_inner = document.querySelector(
    ".portfolio_carousel"
  );
  // ensure first one is active
  {
    // temp carousel item
    const item = document.createElement("div");
    item.classList.add("carousel-item");

    item.classList.add("active");

    const item_description = `
    For my third year Honours Stage Project I designed and developed a 
    lightweight cloud storage solution aimed at businesses for the secure storage
    of company documentation.<br><br>
    The solution utilises complex encryption which makes use of both AES and RSA 
    encryption, allowing the safe storage of the symmetric and asymmetric keys within the 
    database attached alongside each user's data.<br><br>
    The solution was developed using the Node.JS framework and consists of 3, a minimum of
    3 servers, 2 of which are used for repeat dynamic deployments, each configured from a JSON file.
    One of the servers also uses an SQLite database which holds all of the data related to
    the deployment of a single company.<br><br>
    Integration support has been put in to integrate blockchain technology to track the
    transactions over each company deployment. The idea was to ensure maximum transparency
    of a company's documentation, which would be achieved with the blockchains.`;

    item.innerHTML = AddItem(
      [
        "./images/portfolio_images/honours_project_img.png",
        "./images/portfolio_images/honours_project_img(1).png",
      ],
      "Flexible and Lightweight Cloud Storage Solution",
      item_description
    );

    portfolio_carousel_inner.appendChild(item);
  }

  // {
  //   // temp carousel item
  //   const item = document.createElement("div");
  //   item.classList.add("carousel-item");

  //   item.classList.add("active");

  //   const item_description = `
  //   For my third year Honours Stage Project I designed and developed a
  //   lightweight cloud storage solution aimed at businesses for the secure storage
  //   of company documentation.<br><br>
  //   The solution utilises complex encryption which makes use of both AES and RSA
  //   encryption, allowing the storage of the symmetric and asymmetric keys within the
  //   database attached alongside each user's data.<br><br>
  //   The solution was developed using the Node.JS framework and consists of 3 a minimum of
  //   3 servers, 2 of which are used for repeat dynamic deployment configured from a JSON file.
  //   One of these servers also uses an SQLite database which holds all of the data related to
  //   the deployment of a single company.<br><br>
  //   Integration support has been put in to integrate blockchain technology to track the
  //   transactions over each company deployment. The idea was to ensure maximum transparency
  //   of a company's documentation, which would be achieved with blockchains.`;

  //   item.innerHTML = AddItem(
  //     [
  //       "./images/portfolio_images/honours_project_img.png",
  //       "./images/portfolio_images/honours_project_img(1).png",
  //     ],
  //     "Flexible and Lightweight Cloud Storage Solution",
  //     item_description
  //   );

  //   portfolio_carousel_inner.appendChild(item);
  // }
}
