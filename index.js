document.addEventListener("DOMContentLoaded", () => {
  const random_text_section = document.querySelector(".random_fact");
  const random_fact_btn = document.querySelector(".random_fact_btn");
  random_fact_btn.addEventListener("click", async () => {
    const data = await fetch(
      "https://uselessfacts.jsph.pl/api/v2/facts/random"
    );
    text = await data.json();
    text;

    // text.text = the random fact

    random_text_section.textContent = text.text;
  });
});
