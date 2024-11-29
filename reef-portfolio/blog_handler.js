// temp
const json_blog_file = `{
    "articles": 
        [{
        "title": "How I Created My Portfolio Website: From Figma to Code",
        "tags": [
            "programming",
            "figma",
            "html",
            "css",
            "javascript"
        ],
        "text": "<p>Creating my portfolio website was an exciting journey of turning ideas into reality. I began by sketching the layout in Figma, starting with basic wireframes and refining them into a cohesive design. This step allowed me to visualize the structure, colors, and typography, ensuring everything was well-organized before coding.<br>Once the design was finalized, I moved to Visual Studio Code to build the site using HTML and CSS. My tutor guided me through the coding process, helping me understand how to implement responsive layouts and replicate the design's details in code. It was both challenging and rewarding to see my website come together step by step.</p><img src='./images/blog_images/preview_ss.png'><p>This project not only helped me create a professional portfolio but also strengthened my skills in design and development. Seeing my vision live online has been incredibly fulfilling!</p>",
        "images_href": [
            "desktop_ss.jpg",
            "figma_ss.png",
            "html_ss.png",
            "preview_ss.png"
        ],
        "hero_image": "desktop_ss.jpg",
        "date": "25/11/2024"
        },
		{
        "title": "This is my first blog post!",
        "tags": [
            "very",
            "first",
            "blog",
            "post"
        ],
        "text": "Creating my portfolio website was an exciting journey of turning ideas into reality. I began by sketching the layout in Figma, starting with basic wireframes and refining them into a cohesive design. This step allowed me to visualize the structure, colors, and typography, ensuring everything was well-organized before coding.<br>Once the design was finalized, I moved to Visual Studio Code to build the site using HTML and CSS. My tutor guided me through the coding process, helping me understand how to implement responsive layouts and replicate the design’s details in code. It was both challenging and rewarding to see my website come together step by step.<br>This project not only helped me create a professional portfolio but also strengthened my skills in design and development. Seeing my vision live online has been incredibly fulfilling!",
        "images_href": [
            "desktop_ss.jpg",
            "figma_ss.png",
            "html_ss.png",
            "preview_ss.png"
        ],
        "hero_image": "blog_placeholder.jpg",
        "date": "24/11/2024"
        }
    ]
}
`;

class BlogHandler {
	/**
	 * This is going to handle all of the loading of blog articles
	 */
	constructor(current_id) {
		// Currently won't work due to CORS issues. Should work once the website is up.
		// const blog_json = fetch("blog_json.json").then(async (json_file) => {
		// 	this.articles = await JSON.parse(json_file);
		// 	console.log(this.articles);
		// });
		this.active_article_id = current_id;
		this.articles = JSON.parse(json_blog_file);
		this.articles = this.FormatArticles(this.articles);
	}

	FormatArticles(articles) {
		for (let x in articles.articles) {
			let article = articles.articles[x];
			article.id = x;
		}

		return articles;
	}

	AddArticleShowcasesToDom(chronological = true, blog_ul) {
		let articles = this.articles.articles;

		if (chronological) {
			// Order articles by date
			articles = articles.sort((a, b) => {
				const a_date = new Date(a.date);
				const b_date = new Date(b.date);

				if (a_date < b_date) {
					return 1;
				} else {
					return -1;
				}
			});
		}

		articles.forEach((article, index) => {
			if (article.id == this.active_article_id) {
				return;
			}
			const li = document.createElement("li");
			li.classList.add("blog_article");

			li.innerHTML = `
			<div class="inner px-3" style="background-image: url(./images/blog_images/${article.hero_image});">
				<p class="datetime_tag fw-light">${article.date}</p>
				<div class="title h3">${article.title}</div>
				<div class="tags"></div>
			</div>`;

			let tags = li.querySelector(".tags");
			this.AddTags(article, tags);

			// for (let tag of article.tags) {
			// 	let tag_el = document.createElement("div");
			// 	tag_el.classList.add("article_tag");
			// 	tag_el.textContent = tag;
			// 	tags.appendChild(tag_el);
			// }

			li.addEventListener("click", () => {
				console.log(`${article.id} is clicked`);
				this.Redirect(article.id);
			});

			blog_ul.appendChild(li);
		});
	}
	AddTags(article, parent) {
		for (let tag of article.tags) {
			let tag_el = document.createElement("div");
			tag_el.classList.add("article_tag");
			tag_el.textContent = tag;
			parent.appendChild(tag_el);
		}
	}
	Redirect(article_id) {
		const a = document.createElement("a");
		a.href = `./article.html?article_id=${article_id}`;
		// a.target = "_blank";
		a.click();
	}
	LoadMainArticle(article, parent) {
		parent.innerHTML = `
        <div
            class="hero_img"
            style="
                background-image: url(./images/blog_images/${article.hero_image});
            ">
            <div class="article_date">${article.date}</div>
            <h1 class="article_title h1 fw-bold">${article.title}</h1>
            <div class="article_tags d-flex flex-wrap"></div>
        </div>
        <div class="d-flex w-100 border_top mb-3"></div>
        <div class="content px-4">
            <div class="text">
                ${article.text}
            </div>
        </div>`;

		const tags = parent.querySelector(".article_tags");
		this.AddTags(article, tags);
	}

	RetrieveArticle(id) {
		let article;

		this.articles.articles.forEach((_article) => {
			if (_article.id == id) {
				article = _article;
			}
		});

		return article;
	}
}
