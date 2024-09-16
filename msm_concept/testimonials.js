const testimonials = [
  {
    name: "Gavin (ADI Test Pass)",
    text: `I cannot thank Mike enough for what he has done for me,
            with the support and advice given by Mike I passed my part 2 and my part 3 ADI training.
            Not only did I pass but I got a grade A,
            Doing my ADI training with mike cost me around £1250
            compared to the £2,500 I was quoted from the bigger companies.
            These prices are not including test fees.
            this is not the first time Mike has helped me.
            About 5 years he helped me pass my mod 1 and mod 2 motorbike test.`,
    image_url: "./images/gallery/17.jpeg",
  },
  {
    name: "Galina (Driving Test Pass)",
    text: `Passed my test thanks Mike for patience. Highly professional instructor, I have learn a lot of things which help you to drive safely. Personal thanks for tips he gave me related to reversing and parking. I would recommend MSM to everyone who starts learning driving.`,
    image_url: "./images/gallery/32.jpg",
  },
  {
    name: "Lewis (Driving Test Pass)",
    text: `Passed my car driving test Friday with Mike from MSM highly recommended 5* service couldn't of asked for a better instructor.`,
    image_url: "./images/gallery/33.jpg",
  },
  {
    name: "Marigold (Pass Plus)",
    text: `Passed my driving test weeks ago and completed my pass plus training today, all with Mike's help! Extremely happy with how I went from knowing nothing to learning so much. Appreciate the patience - he explained things in a way that made it easy to learn. Gave honest feedback throughout the lessons and he always ensured mistakes were put right immediately. The pass plus helped me build my confidence more and taught me how to deal with motorway driving and above all else. Driving safely! Couldn't ask for a better driving instructor.`,
    image_url: "./images/gallery/16.jpeg",
  },
];

window.addEventListener("DOMContentLoaded", () => {
  const test_image_text_section = document.querySelector(
    "#test_image_text_section"
  );

  for (let i = 0; i < testimonials.length; i++) {
    const test_obj = testimonials[i];
    test_image_text_section.innerHTML += `
     <div class="row justify-content-center">
        <div class="col-md-6 mb-3">
            <div class="img_wrap">
                <img src="${test_obj.image_url}" alt="" srcset="">
            </div>
        </div>
        <div class="col-md-6 mb-3 text-md-start text-center d-flex flex-column justify-content-center">
            <h2>- ${test_obj.name}</h2>
            <p>${test_obj.text}</p>
        </div>
    </div>`;
  }
});
