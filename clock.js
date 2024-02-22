let day;
let text;
let date;
let time;

let bedtime = 23;
let daytime = 7;

document.addEventListener("DOMContentLoaded", () => {
  day = document.querySelector(".day");
  text = document.querySelector(".text");
  date = document.querySelector(".date");
  time = document.querySelector(".time");
  init();
  setInterval(init, 1000);
});

const GetDayName = (day) => {
  switch (day) {
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    case 7:
      return "Sunday";
  }
};

const GetMonthName = (month) => {
  switch (month) {
    case 0:
      return "Jan";
    case 1:
      return "Feb";
    case 2:
      return "Mar";
    case 3:
      return "Apr";
    case 4:
      return "May";
    case 5:
      return "Jun";
    case 6:
      return "Jul";
    case 7:
      return "Aug";
    case 8:
      return "Sep";
    case 9:
      return "Oct";
    case 10:
      return "Nov";
    case 11:
      return "Dec";
  }
};

function init() {
  const date_obj = new Date();
  day.textContent = GetDayName(date_obj.getDay()).toUpperCase();

  time.textContent = GetTime(date_obj);

  date.textContent = date_obj.toLocaleDateString();

  if (date_obj.getHours() < 7 || date_obj.getHours() > 23) {
    text.textContent = "BEDTIME";
  } else {
    text.textContent = "DAYTIME";
  }
}

function GetTime(date_obj = new Date()) {
  let hours = `${date_obj.getHours()}`;
  hours = hours.padStart(2, "0");

  let mins = `${date_obj.getMinutes()}`;
  mins = mins.padStart(2, "0");
  return `${hours}:${mins}`;
}
