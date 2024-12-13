window.addEventListener("DOMContentLoaded", () => {
	var glide = new Glide("#showcase", {
		type: "carousel",
		startAt: 0,
		perView: 5,
		breakpoints: {
			1024: {
				perView: 4,
			},
			800: {
				perView: 3,
			},
			500: {
				perView: 2,
			},
		},
	});

	glide.mount();
});
