function GlideLoading() {
	var glide = new Glide(".glide", {
		type: "carousel",
        autoplay: 4000,
        hoverpause: true,
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

GlideLoading();