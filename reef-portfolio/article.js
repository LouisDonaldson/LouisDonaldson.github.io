let chosen_article;

let anim_timeout = 1000;

window.addEventListener("DOMContentLoaded", () => {
	setTimeout(() => {
		const loading_div = document.querySelector(".loading");
		loading_div.classList.add("fade");
	}, anim_timeout);

	let id = GetChosenArticle();
	const blog_handler = new BlogHandler(id);

	const blog_ul = document.querySelector(".other_articles");

	setTimeout(() => {
		let parent = document.querySelector(".main_article");
		chosen_article = blog_handler.RetrieveArticle(id);
		blog_handler.LoadMainArticle(chosen_article, parent);
		blog_handler.AddArticleShowcasesToDom(true, blog_ul);
	}, anim_timeout);
});

function GetChosenArticle() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const id = urlParams.get("article_id");
	return id;
}
