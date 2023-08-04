// https://rapidapi.com/apidojo/api/tasty

const testEndpoint = async () => {
  const url = `https://tasty.p.rapidapi.com/recipes/auto-complete?prefix=${"carbonara"}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "53ce3638a9mshb0c4fe33d0cfca9p1100ffjsnf7abe9c081b3",
      "X-RapidAPI-Host": "tasty.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

const testEndpointTwo = async (value) => {
  const url = `https://tasty.p.rapidapi.com/recipes/list?from=0&size=20&q=${value}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "53ce3638a9mshb0c4fe33d0cfca9p1100ffjsnf7abe9c081b3",
      "X-RapidAPI-Host": "tasty.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};
try {
  let storageHandler;
  let ui_handler;
  let api_handler;
  window.addEventListener("DOMContentLoaded", () => {
    api_handler = new ApiHandler(true);
    storageHandler = new StorageHandler();
    if (!storageHandler.DataStored()) {
      storageHandler.CreateNewInstance(
        //   window.prompt("Enter desired daily calorie intake.")
        0
      );
    }
    ui_handler = new UiHandler();
  });

  //#region Storage Handler
  class StorageHandler {
    constructor() {
      this.stored_data_json = localStorage.getItem("data");
      this.stored_data = JSON.parse(this.stored_data_json);
    }
    Save() {
      const data_to_save = JSON.stringify(this.stored_data);
      localStorage.setItem("data", data_to_save);
    }
    DataStored() {
      if (!this.stored_data_json) {
        return false;
      } else {
        return true;
      }
    }
    CreateNewInstance(calorie_intake) {
      localStorage.setItem(
        "data",
        JSON.stringify({
          desired_calorie_intake: calorie_intake,
          days: [
            {
              date: new Date().toLocaleDateString(),
              macros: {
                calories: 0,
                fats: 0,
                carbs: 0,
                protein: 0,
              },
              meals: [],
              allergy_attack: false,
            },
          ],
        })
      );
      this.stored_data_json = localStorage.getItem("data");
      this.stored_data = JSON.parse(this.stored_data_json);
    }
    AddNewDay(day) {
      this.stored_data.days.push(day);
      this.Save();
      return day;
    }
    GetDayData(date_wanted) {
      // const today = new Date().toLocaleDateString();
      for (const day of this.stored_data.days) {
        if (day.date == date_wanted.toLocaleDateString()) {
          return day;
        }
      }
      return this.AddNewDay(new Day(date_wanted.toLocaleDateString()));
      // this.stored_data.days.push(new Day());
    }
    AddNewMeal(day, meal) {
      day.meals.push(meal);
      this.Save();
    }
  }

  class Day {
    constructor(date = new Date().toLocaleDateString()) {
      this.date = date;
      this.macros = {
        calories: 0,
        fats: 0,
        carbs: 0,
        protein: 0,
      };
      this.meals = [];
      this.allergy_attack = false;
    }
  }

  class Meal {
    constructor(title, ingredients = []) {
      this.title = title;
      this.ingredients = ingredients;
      this.custom = true;
    }

    ConfigureMealFromTemplate(existing_recipe) {
      const AddIngredients = () => {
        let ingredients = [];
        for (const section of existing_recipe?.sections) {
          for (const component of section?.components) {
            ingredients.push(component?.ingredient?.display_singular);
          }
        }
        this.ingredients = ingredients;
      };
      this.title = existing_recipe?.name ?? title;

      AddIngredients();

      // add picture if there is one
      this.thumbnail = existing_recipe.thumbnail_url;

      this.custom = false;
    }
  }
  //#endregion

  //#region ui_handler
  class UiHandler {
    constructor() {
      const today = storageHandler.GetDayData(new Date());
      this.DisplayDay(today);
    }

    DisplayDay(day) {
      // markup for header bar
      // dynamic date selection

      this.startingMarkup = document.createElement("div");
      this.startingMarkup.innerHTML = `
        <div class="header">
        </div>
        <div class="main">
        </div>
        <div class="footer">
            <div class="tabs">
                <div class="plus">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="white" class="" viewBox="0 0 16 16">
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                    </svg>
                </div>
                <div class="flag">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="white" class="" viewBox="0 0 16 16">
                        <path d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0L7.005 3.1ZM7 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/>
                    </svg>
                </div>
            </div>
        </div>
        `;

      // edit markup in here from this point
      this.body_tag = document.querySelector("#body");
      this.body_tag.innerHTML = this.startingMarkup.innerHTML;

      const RefreshDay = () => {
        this.DisplayDay(day);
      };

      const header_markup = async (parent) => {
        // formatting date for display
        const split_date = day.date.split("/");
        const display_date = `${split_date[1]}/${split_date[0]}/${split_date[2]}`;

        parent.innerHTML = `
        <div class="arrow_left">
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" class="bi bi-chevron-left" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
        </div>
        <div class="date">${display_date}</div>
        <div class="arrow_right">
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" class="bi bi-chevron-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
        </div>`;

        const left_arrow = parent.querySelector(".arrow_left");
        left_arrow.addEventListener("click", () => {
          let selected_date = new Date(day.date);
          selected_date.setDate(selected_date.getDate() - 1);
          this.DisplayDay(storageHandler.GetDayData(selected_date));
        });
        const right_arrow = parent.querySelector(".arrow_right");
        right_arrow.addEventListener("click", () => {
          let selected_date = new Date(day.date);
          selected_date.setDate(selected_date.getDate() + 1);
          this.DisplayDay(storageHandler.GetDayData(selected_date));
        });
      };

      const main_markup = async (parent) => {
        parent.innerHTML = `
        <div class="meals_section">
            <div class="meals_header">Meals</div>
            <div class="meals_list">
                <div class="meal_placeholder">To get started click the + button at the bottom of the screen.</div>
                <div class="meal_placeholder">If you have any allergies on specific days, flag them with the ! button on the bottom of the screen.</div>
            </div>
        </div>`;

        const meal_list = parent.querySelector(".meals_list");
        if (day.meals.length > 0) {
          meal_list.innerHTML = ``;
        }
        for (const meal of day.meals) {
          const GetIngredientsHTML = () => {
            const div = document.createElement("ul");
            for (const component of meal?.ingredients) {
              div.innerHTML += `
                <li class="additional_info_li">${component}</li>`;
            }

            return div.innerHTML;
          };
          const meal_div = document.createElement("div");

          meal_div.innerHTML = `
          <div class="intial_recipe_view_divs">
            <div class="recipe_img">
              <img src="${meal?.thumbnail ?? "./images/food-placeholder.jpg"}">
            </div>
            <div class="recipe_name">
              ${meal.title}
              ${
                meal.custom
                  ? `<br><span class="accent_help">Custom Meal</span>`
                  : ""
              }
            </div>
          </div>
          <div class="recipe_additional_info d-none mt-2">
            <div data-bs-toggle="collapse" data-bs-target="#ingredients_list" class="collapsible_recipe_info">Ingredients</div>
            <ul id="ingredients_list" class="collapse">
              ${GetIngredientsHTML()}
            </ul>
            <div class="add_to_your_day_btn">
              Edit
            </div>
          </div>
          `;

          const clickable_div = meal_div.querySelector(
            ".intial_recipe_view_divs"
          );

          const recipe_additional_info = meal_div.querySelector(
            ".recipe_additional_info"
          );

          let active = false;
          clickable_div.addEventListener("click", () => {
            switch (active) {
              case true:
                // additional info displayed

                recipe_additional_info.classList.add("d-none");
                active = !active;
                break;
              case false:
                // additional info not displayed
                recipe_additional_info.classList.remove("d-none");
                active = !active;
                break;
            }
          });

          const add_to_your_day_btn = meal_div.querySelector(
            ".add_to_your_day_btn"
          );

          add_to_your_day_btn.addEventListener("click", () => {
            // const new_meal = new Meal();
            // new_meal.ConfigureMealFromTemplate(result);
            // storageHandler.AddNewMeal(day, new_meal);
            // ui_handler.DisplayDay(day);
          });

          meal_list.appendChild(meal_div);
        }
      };

      const footerButtonEventListeners = (add_btn, flag_btn) => {
        add_btn.addEventListener("click", () => {
          ui_handler.DisplayMealSelection(day, this.body_tag);
        });
      };

      header_markup(this.body_tag.querySelector(".header"));
      main_markup(this.body_tag.querySelector(".main"));
      footerButtonEventListeners(
        this.body_tag.querySelector(".plus"),
        this.body_tag.querySelector(".flag")
      );
    }
    DisplayMealSelection(day, body) {
      const PopulateResultsSection = (results, parent, intial_search) => {
        parent.innerHTML = `<div class="recipe_template">Results</div>`;
        const results_section_list = document.createElement("div");
        results_section_list.classList.add("results_section_list");

        parent.appendChild(results_section_list);

        const AddCustomRecipeDiv = () => {
          const result_div = document.createElement("div");
          result_div.classList.add("recipe_template");
          result_div.innerHTML = `
          <div class="intial_recipe_view_divs">
          <div class="recipe_img">
              <img src="./images/food-placeholder.jpg">
            </div>
            <div class="recipe_name">
              <div class="d-flex flex-column">
                <div>${intial_search}</div>
                <div class="accent_help">Custom meal template.</div>
              </div>
            </div>
          </div>
          <div class="recipe_additional_info d-none mt-2">
            <div class="add_to_your_day_btn">
              Add to your day
            </div>
          </div>
          `;

          const clickable_div = result_div.querySelector(
            ".intial_recipe_view_divs"
          );

          const recipe_additional_info = result_div.querySelector(
            ".recipe_additional_info"
          );

          let active = false;
          clickable_div.addEventListener("click", () => {
            switch (active) {
              case true:
                // additional info displayed

                recipe_additional_info.classList.add("d-none");
                active = !active;
                break;
              case false:
                // additional info not displayed
                recipe_additional_info.classList.remove("d-none");
                active = !active;
                break;
            }
          });

          const add_to_your_day_btn = result_div.querySelector(
            ".add_to_your_day_btn"
          );

          add_to_your_day_btn.addEventListener("click", () => {
            const new_meal = new Meal(intial_search);
            // new_meal.ConfigureMealFromTemplate(result);
            storageHandler.AddNewMeal(day, new_meal);
            ui_handler.DisplayDay(day);
          });

          results_section_list.appendChild(result_div);
        };
        AddCustomRecipeDiv();
        for (const result of results?.results) {
          const GetIngredientsHTML = () => {
            const div = document.createElement("ul");
            for (const section of result?.sections) {
              for (const component of section?.components) {
                component;
                div.innerHTML += `
                <li class="additional_info_li">${component.raw_text}</li>`;
              }
            }
            return div.innerHTML;
          };

          const GetRecipeHTML = () => {
            const div = document.createElement("ul");
            for (const instruction of result?.instructions) {
              div.innerHTML += `
              <li class="additional_info_li">${instruction.display_text}</li>`;
            }
            return div.innerHTML;
          };

          const result_div = document.createElement("div");
          result_div.classList.add("recipe_template");
          result_div.innerHTML = `
          <div class="intial_recipe_view_divs">
            <div class="recipe_img">
              <img src="${result.thumbnail_url}">
            </div>
            <div class="recipe_name">
              ${result.name}
            </div>
          </div>
          <div class="recipe_additional_info d-none mt-2">
            <div data-bs-toggle="collapse" data-bs-target="#ingredients_list" class="collapsible_recipe_info">Ingredients</div>
            <ul id="ingredients_list" class="collapse">
              ${GetIngredientsHTML()}
            </ul>
             <div data-bs-toggle="collapse" data-bs-target="#recipe_list" class="collapsible_recipe_info">Recipe</div>
            <ul id="recipe_list" class="collapse">
              ${GetRecipeHTML()}
            </ul>
            <div class="add_to_your_day_btn">
              Add to your day
            </div>
          </div>
          `;

          const clickable_div = result_div.querySelector(
            ".intial_recipe_view_divs"
          );

          const recipe_additional_info = result_div.querySelector(
            ".recipe_additional_info"
          );

          let active = false;
          clickable_div.addEventListener("click", () => {
            switch (active) {
              case true:
                // additional info displayed

                recipe_additional_info.classList.add("d-none");
                active = !active;
                break;
              case false:
                // additional info not displayed
                recipe_additional_info.classList.remove("d-none");
                active = !active;
                break;
            }
          });

          const add_to_your_day_btn = result_div.querySelector(
            ".add_to_your_day_btn"
          );

          add_to_your_day_btn.addEventListener("click", () => {
            const new_meal = new Meal();
            new_meal.ConfigureMealFromTemplate(result);
            storageHandler.AddNewMeal(day, new_meal);
            ui_handler.DisplayDay(day);
          });

          results_section_list.appendChild(result_div);
        }
      };

      const NewMealIntialView = () => {
        const initial_markup = `
        <div class="new_meal_section"></div>
        <div class="footer">
          <div class="tabs">
            <div class="plus">
                <svg xmlns="http://www.w3.org/2000/svg" fill="white" style="transform: rotate(45deg);" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
            </div>
          </div>
        </div>`;
        body.innerHTML = initial_markup;
        const cancel_btn = body.querySelector(".plus");
        cancel_btn.addEventListener("click", () => {
          this.DisplayDay(day);
        });

        const help_text =
          "Search for food then select a recipe template or create a new one.";

        body.querySelector(".new_meal_section").innerHTML = `
        <div class="search_box">
          <div class="input-group mb-2">
            <input type="text" id="search_input" class="form-control" placeholder="Enter a food name." aria-label="Recipient's username" aria-describedby="search_btn">
            <button class="btn btn-outline-secondary" type="button" id="search_btn">Search</button>
            <div class="search_help">${help_text}</div>
          </div>
        </div>
        <div class="search_results"></div>
        `;

        const search_results_section = body.querySelector(".search_results");

        const search_btn = body.querySelector("#search_btn");
        search_btn.addEventListener("click", () => {
          const search_input = body.querySelector("#search_input");
          if (search_input.value.trim() == "") {
            return;
          }
          api_handler
            .AutoCompleteRequest(search_input.value)
            .then((results) => {
              console.log(results);
              PopulateResultsSection(
                results,
                search_results_section,
                search_input.value
              );
            });
        });
      };

      NewMealIntialView();
    }
  }
  //#endregion

  //#region API Handler
  class ApiHandler {
    constructor(dev_mode = false) {
      this.dev_mode = dev_mode;
    }

    async AutoCompleteRequest(text) {
      const url = `https://tasty.p.rapidapi.com/recipes/list?from=0&size=20&q=${text}`;
      const options = {
        method: "GET",
        headers: {
          "X-RapidAPI-Key":
            "53ce3638a9mshb0c4fe33d0cfca9p1100ffjsnf7abe9c081b3",
          "X-RapidAPI-Host": "tasty.p.rapidapi.com",
        },
      };

      try {
        if (this.dev_mode) {
          const stored_results = localStorage.getItem("dev-results");
          if (stored_results) {
            return JSON.parse(stored_results);
            const reply = prompt("Do you wanna use stored data? (y/n)");
            if (reply == "y") {
              return JSON.parse(stored_results);
            }
          }
        }
        const response = await fetch(url, options);
        const result = await response.json();
        if (this.dev_mode) {
          localStorage.setItem("dev-results", JSON.stringify(result));
        }
        return result;
      } catch (error) {
        console.error(error);
      }
    }
  }
  //#endregion
} catch (e) {
  document.body.innerHTML = `
    ${JSON.stringify(e)}`;
  throw e;
}
