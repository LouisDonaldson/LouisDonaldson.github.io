// const links = [
//   {
//     name: "Pathfinding Demonstration",
//     href: "./pathfinding/pathfinding.html",
//   },
//   {
//     name: "Bywater Concept Website",
//     href: "bywater.html",
//   },
//   {
//     name: "Alzheimers Clock (phone layout not optimised)",
//     href: "clock.html",
//   },
//   {
//     name: "PhD Explainable Reinforcement Learning in the Offshore Wind Industry",
//     href: "Poster-Link/PosterReferences.html",
//   },
// ];

document.addEventListener("DOMContentLoaded", () => {
  const body = document.querySelector("body");

  // loads landing page //
  LandingPageLoad(body);
});

async function LandingPageLoad(parent) {
  // parent.innerHTML = `
  // <div class="top h-100 d-flex flex-column justify-content-center align-items-center">
  //   <div class="animated px-3">
  //       <h1 class="title fs-3 ">LOUIS DONALDSON</h1>
  //       <p class="tag fs-6 tag-animation text-muted">- PHD PGR -<br>COMPUTER SCIENCE</p>

  //   </div>

  //  </div>
  //  <div class="bottom">
  //       <div class="bounce-top about_me_button">
  //           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down more_btn"
  //               viewBox="0 0 16 16">
  //               <path fill-rule="evenodd"
  //                   d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
  //           </svg>
  //           <!-- <img src="./images/arrow-down.svg" alt="See More Arrow"> -->

  //       </div>
  //  </div>`;

  parent.innerHTML = `
   <div class="top h-100 d-flex flex-column justify-content-center align-items-center">
        <div class="d-flex flex-wrap">
            <div class="right gradient_border px-3 mx-3 d-flex flex-column justify-content-center align-items-start">
                <div class="text text-white d-flex flex-column mb-2">
                    <h1 class="animated">Louis Donaldson</h1>
    
                    <h2 class="fw-light tag-animation">PhD PGR with AuraCDT</h2>
                    <p class="fw-lighter tag-animation text-light">School of Computer Science</p>
                    <p class="fw-lighter tag-animation text-light">University of Hull</p>
                </div>
                <div class="links d-flex tag-animation">
                    <a href="https://www.linkedin.com/in/louis-donaldson-162822207/" target="_blank">
                        <div class="icon_link mx-2 ms-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-linkedin" viewBox="0 0 16 16">
                                <defs>
                                    <linearGradient id="SVG_grad" gradientTransform="rotate(90)">
                                        <stop offset="0%" stop-color="var(--light-1)" />
                                        <stop offset="100%" stop-color="var(--light-2)" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
                            </svg>
                        </div>
                    </a>
                    <a href="https://teams.microsoft.com/l/chat/0/0?users=l.donaldson-2020@hull.ac.uk" target="_blank">
                        <div class="icon_link mx-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-microsoft-teams" viewBox="0 0 16 16">
                                <path
                                    d="M9.186 4.797a2.42 2.42 0 1 0-2.86-2.448h1.178c.929 0 1.682.753 1.682 1.682zm-4.295 7.738h2.613c.929 0 1.682-.753 1.682-1.682V5.58h2.783a.7.7 0 0 1 .682.716v4.294a4.197 4.197 0 0 1-4.093 4.293c-1.618-.04-3-.99-3.667-2.35Zm10.737-9.372a1.674 1.674 0 1 1-3.349 0 1.674 1.674 0 0 1 3.349 0m-2.238 9.488-.12-.002a5.2 5.2 0 0 0 .381-2.07V6.306a1.7 1.7 0 0 0-.15-.725h1.792c.39 0 .707.317.707.707v3.765a2.6 2.6 0 0 1-2.598 2.598z" />
                                <path
                                    d="M.682 3.349h6.822c.377 0 .682.305.682.682v6.822a.68.68 0 0 1-.682.682H.682A.68.68 0 0 1 0 10.853V4.03c0-.377.305-.682.682-.682Zm5.206 2.596v-.72h-3.59v.72h1.357V9.66h.87V5.945z" />
                            </svg>
                        </div>
                    </a>
                    <a href="https://auracdt.hull.ac.uk/louis-donaldson/" target="_blank">
                    <div class="icon_link mx-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            class="bi bi-browser-chrome" viewBox="0 0 16 16">
                            <path fill-rule="evenodd"
                                d="M16 8a8 8 0 0 1-7.022 7.94l1.902-7.098a3 3 0 0 0 .05-1.492A3 3 0 0 0 10.237 6h5.511A8 8 0 0 1 16 8M0 8a8 8 0 0 0 7.927 8l1.426-5.321a3 3 0 0 1-.723.255 3 3 0 0 1-1.743-.147 3 3 0 0 1-1.043-.7L.633 4.876A8 8 0 0 0 0 8m5.004-.167L1.108 3.936A8.003 8.003 0 0 1 15.418 5H8.066a3 3 0 0 0-1.252.243 2.99 2.99 0 0 0-1.81 2.59M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
                        </svg>
                    </div>
                    </a>
                </div>
            </div>
    
        </div>
    
    </div>
    <div class="bottom">
        <div class="bounce-top about_me_button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-arrow-down more_btn" viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
            </svg>
            <!-- <img src="./images/arrow-down.svg" alt="See More Arrow"> -->
    
        </div>
    </div>
  `;

  parent.querySelector(".about_me_button").addEventListener("click", () => {
    const top = parent.querySelector(".top");
    top.classList.add("exit-zoom");
    const bottom = parent.querySelector(".bottom");
    bottom.classList.add("exit-zoom");
    setTimeout(() => {
      AboutMeLoad(parent);
    }, 250);
  });
}

async function AboutMeLoad(parent) {
  const html = `
 <div class="slide-up animated">
        <div class="d-flex justify-content-center arrow_div">
            <div class="arrow_up">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-arrow-down more_btn" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                        d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
                </svg>
            </div>
        </div>
    
        <div class="content text-white d-flex justify-content-center align-items-center flex-column text-center">
            <div class="about_me_img_div mb-3">
                <img src="./linkedin.jpg" alt="Image of Louis">
            </div>
            <h2 class="title">About me</h2>
            <div class="px-5 container">
                <div class="row justify-content-center align-items-center my-2">
                    <div class="col-md-8 ">
                        <p class="fw-lighter">
                            I have a BSc in Computer Science and I'm currently a post-graduate researcher at the University
                            of Hull, undertaking a PhD focused on optimisation of maintenance scheduling in the Offshore
                            Wind Industry.
                        </p>
                        <div class="links px-3 d-flex justify-content-center align-items-center ">
                            <div class="button" id="projects">Projects</div>
                            <div class="button" id="research">Research</div>
                        </div>
    
                    </div>
                </div>
    
            </div>
        </div>
    </div>
  `;
  parent.innerHTML = html;
  parent.querySelector(".arrow_up").addEventListener("click", () => {
    LandingPageLoad(parent);
  });

  parent.querySelector("#projects").addEventListener("click", () => {
    ProjectsLoad(parent);
  });

  parent.querySelector("#research").addEventListener("click", () => {
    ResearchLoad(parent);
  });
}

async function ProjectsLoad(parent) {
  const project_links = [
    {
      title: "Reinforcement Learning Showcase",
      tag: "RL TSP Sandbox - Offshore Wind Turbines",
      href: "./Poster-Link/reinforcement-learning/index.html",
    },
    {
      title: "Pathfinding Showcase",
      tag: "Simple Pathfinding Sandbox",
      href: "./pathfinding/pathfinding.html",
    },
  ];

  parent.innerHTML = `
   <div class="slide-up animated">
    <div class="d-flex justify-content-center arrow_div">
        <div class="arrow_up">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down more_btn"
                viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
            </svg>
        </div>
    </div>
    
        <div class="content d-flex justify-content-center align-items-center flex-column text-center">
            <h2 class="title">My Projects</h2>
            <div class="px-5 container">
                <div class="justify-content-center align-items-center my-2 w-100 flex-wrap" id="links_div">
                    
                </div>
            </div>
        </div>
   </div>
  `;

  const links_parent = parent.querySelector("#links_div");
  for (const i in project_links) {
    const { title, tag, href } = project_links[i];

    links_parent.innerHTML += `
    <div class="title link-div m-3 d-inline-flex flex-column justify-content-center align-items-center text-start" id="${i}">
        <a href="${href}" target="_blank" class="link_a">
            <p class="no-letter-spacing m-0 link-title fs-6">${title}</p>
            <p class="link-tag m-0 fs-6">${tag}</p>
        </a>
    </div>`;
  }

  parent.querySelector(".arrow_up").addEventListener("click", () => {
    AboutMeLoad(parent);
  });
}

async function ResearchLoad(parent) {
  const research_links = [
    {
      title: "AuraCDT PGR Profile",
      tag: "About me and my research",
      href: "https://auracdt.hull.ac.uk/louis-donaldson/",
    },
    {
      title: "2024 Website for conference",
      tag: "Further information regarding my PhD",
      href: "./Poster-Link/PosterReferences.html",
    },
  ];

  parent.innerHTML = `
  <div class="slide-up animated">
    <div class="d-flex justify-content-center arrow_div">
        <div class="arrow_up">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down more_btn"
                viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
            </svg>
        </div>
    </div>
    
        <div class="content d-flex justify-content-center align-items-center flex-column text-center">
            <h2 class="title">My Research</h2>
            <div class="px-5 container">
                <div class="justify-content-center align-items-center my-2 w-100 flex-wrap" id="links_div">
                    
                </div>
            </div>
        </div>
   </div>
  `;

  const links_parent = parent.querySelector("#links_div");
  for (const i in research_links) {
    const { title, tag, href } = research_links[i];

    links_parent.innerHTML += `
    <div class="title link-div m-3 d-inline-flex flex-column justify-content-center align-items-center text-start" id="${i}">
        <a href="${href}" target="_blank" class="link_a">
            <p class="no-letter-spacing m-0 link-title fs-6">${title}</p>
            <p class="link-tag m-0 fs-6">${tag}</p>
        </a>
    </div>`;
  }

  parent.querySelector(".arrow_up").addEventListener("click", () => {
    AboutMeLoad(parent);
  });
}
