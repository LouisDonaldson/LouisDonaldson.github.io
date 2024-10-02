const links = [
  {
    name: "Pathfinding Demonstration",
    href: "./pathfinding/pathfinding.html",
  },
  {
    name: "Bywater Concept Website",
    href: "bywater.html",
  },
  {
    name: "Alzheimers Clock (phone layout not optimised)",
    href: "clock.html",
  },
  {
    name: "PhD Explainable Reinforcement Learning in the Offshore Wind Industry",
    href: "Poster-Link/PosterReferences.html",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const body = document.querySelector("body");

  // loads landing page //
  // LandingPageLoad(body);
});

async function LandingPageLoad(parent) {
  parent.innerHTML = `
  <div class="top h-100 d-flex flex-column justify-content-center align-items-center">
    <div class="animated px-3">
        <h1 class="title fs-3 ">LOUIS DONALDSON</h1>
        <p class="tag fs-6 tag-animation text-muted">- PHD PGR -<br>COMPUTER SCIENCE</p>
        
    </div>
    
   </div>
   <div class="bottom">
        <div class="bounce-top about_me_button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down more_btn"
                viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
            </svg>
            <!-- <img src="./images/arrow-down.svg" alt="See More Arrow"> -->
            
        </div>
   </div>`;

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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down more_btn"
                viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
            </svg>
        </div>
    </div>
    
        <div class="content d-flex justify-content-center align-items-center flex-column text-center">
            <div class="about_me_img_div mb-3">
              <img src="./linkedin.jpg" alt="Image of Louis">
            </div>
            <h2 class="title">About me</h2>
            <div class="px-5 container">
                <div class="row justify-content-center align-items-center my-2">
                    <div class="col-md-8 ">
                        <p class="text-muted">
                            I have a BSc in Computer Science and I'm currently a post-graduate researcher at the University of Hull, undertaking a PhD focused on optimisation of maintenance scheduling in the Offshore Wind Industry.
                        </p>
                        <div class="links text-muted px-3 d-flex justify-content-center align-items-center ">
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
            <h2 class="title">my Projects</h2>
            <div class="px-5 container">
                <div class="justify-content-center align-items-center my-2 w-100 flex-wrap">
                    <div class="m-2 d-inline-flex flex-column justify-content-center align-items-center">
                        <a href="./Poster-Link/reinforcement-learning/index.html" target="_blank">
                            <p class="title no-letter-spacing m-0 text-muted link">Reinforcement Learning Showcase</p>
                        </a>
                    </div>
                    <div class="m-2 d-inline-flex flex-column justify-content-center align-items-center">
                        <a href="./pathfinding/pathfinding.html" target="_blank">
                            <p class="title no-letter-spacing m-0 text-muted link">Pathfinding Showcase</p>
                        </a>
                        
                    </div>
                    <div class="m-2 d-inline-flex flex-column justify-content-center align-items-center">
                        <a href=".//bywater.html" target="_blank">
                            <p class="title no-letter-spacing m-0 text-muted link">Bywater Concept Website</p>
                        </a>
                    </div>
                </div>
                
            </div>
        </div>
   </div>
  `;

  parent.querySelector(".arrow_up").addEventListener("click", () => {
    AboutMeLoad(parent);
  });
}

async function ResearchLoad(parent) {
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
                <div class="justify-content-center align-items-center my-2 w-100 flex-wrap">
                    <div class="m-3 d-inline-flex flex-column justify-content-center align-items-center">
                        <a href="./Poster-Link/PosterReferences.html" target="_blank">
                            <p class="title no-letter-spacing m-0 text-muted link">2024 Website for conference</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
   </div>
  `;

  parent.querySelector(".arrow_up").addEventListener("click", () => {
    AboutMeLoad(parent);
  });
}
