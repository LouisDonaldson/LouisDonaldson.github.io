next_location = {
	when: "Dec 23",
	where: "Gilberdyke",
	location_link: "https://www.google.com/maps/place/Columbus,+OH/@39.9611755,-83.0007065,12z/data=!3m1!4b1!4m5!3m4!1s0x88388f2f6f2f7d7b:0x9a8a3e3f4e4e4e4e!8m2!3d39.9611755!4d-82.9987942",
	no_event: false,
}

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

function UpdateNextLocation() {
	div = document.getElementById("find_us");
	if(next_location.no_event) {
		div.innerHTML = ` <div class="where_next_div py-2">
            <div class="px-3">
			  <div class=" where_section px-3 py-2">
				<p class="focus h3">No Upcoming Events</p>
				<div class="divider my-2"></div>
				<p>Check back later for updates!</p>
			  </div>
			</div>
		  </div>`;

		return;
	}
	div.innerHTML = ` <div class="where_next_div py-2 pb-0">
            <div class="px-3 pb-0">
              <div class=" where_section px-3 py-2">
                <p>Where</p>
                <p class="focus h3">${next_location.where}</p>
              </div>
            </div>
            <div class="px-3 pb-2">
              <div class="middle where_section px-3 py-2">
                <p>When</p>
                <p class="focus h3">${next_location.when}</p>
              </div>
            </div>
            <div class="right where_section px-3 py-2" id="directions_link">Get Directions</div>
          </div>`;

	div.querySelector("#directions_link").addEventListener("click", function () {
		window.open(next_location.location_link, "_blank");
	});
}

window.addEventListener("DOMContentLoaded", function () {
	GlideLoading();
	UpdateNextLocation();
});

