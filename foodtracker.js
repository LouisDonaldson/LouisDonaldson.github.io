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
    console.log(result);
    testEndpointTwo(result.results[0].search_value);
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
  window.addEventListener("DOMContentLoaded", () => {
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
      const NewMealIntialView = () => {
        const initial_markup = `
      <div class="new_meal_section"></div>
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
        </div>`;
        body.innerHTML = initial_markup;

        body.querySelector(".new_meal_section").innerHTML = `
      <div class="search_box">
        <div class="input-group mb-3">
          <input type="text" class="form-control" placeholder="Enter a food name." aria-label="Recipient's username" aria-describedby="search_btn">
          <button class="btn btn-outline-secondary" type="button" id="search_btn">Search</button>
          <div class="search_help">Enter a name of a food that you've eaten today and pick from a template of recipes for customisation, or start a new meal from scratch.</div>
        </div>
      </div>
      `;
      };

      NewMealIntialView();
    }
  }
  //#endregion
} catch (e) {
  document.body.inner = `
    ${e}`;
  throw e;
}
