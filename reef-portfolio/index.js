let anim_timeout = 1000;

window.addEventListener("DOMContentLoaded", () => {
	setTimeout(() => {
		const loading_div = document.querySelector(".loading");
		loading_div.classList.add("fade");
	}, anim_timeout);

	GlideLoading();
	const blog_ul = document.querySelector(".articles");

	const blog_handler = new BlogHandler();
	setTimeout(() => {
		blog_handler.AddArticleShowcasesToDom(true, blog_ul);
	}, anim_timeout);
});

function GlideLoading() {
	var glide = new Glide(".glide", {
		type: "carousel",
		startAt: 0,
		perView: 3,
		breakpoints: {
			1024: {
				perView: 2,
			},
			800: {
				perView: 1,
			},
			400: {
				perView: 1,
			},
		},
	});

	glide.mount();
}

// Don't touch
function css(element, style) {
	for (const property in style) element.style[property] = style[property];
}
