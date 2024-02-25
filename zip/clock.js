let day;
let text;
let date;
let time;

let bedtime = 23;
let daytime = 7;

const update_interval = 5000;
const refresh_time = 60000 * 60 * 2;

document.addEventListener("DOMContentLoaded", () => {
  day = document.querySelector(".day");
  text = document.querySelector(".text");
  date = document.querySelector(".date");
  time = document.querySelector(".time");
  try {
    init();
  } catch (e) {
    document.querySelector(".body").innerHTML = `${e}`;
    setTimeout(() => {
      window.location.reload();
    }, 60000);
  }
  setInterval(init, update_interval);
  setTimeout(() => {
    window.location.reload();
  }, refresh_time);
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
    case 0:
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

  time.innerHTML = GetTime(date_obj);

  date.textContent = date_obj.toLocaleDateString();

  /*
  10pm - 7am sleeptime
  7
  */

  if (date_obj.getHours() < 7 || date_obj.getHours() > 22) {
    // night time
    text.textContent = "SLEEP TIME";
  } else {
    text.textContent = "DAY TIME";
  }
}

function GetTime(date_obj = new Date()) {
  const time_string = date_obj.toLocaleTimeString().split(" ");
  return `${time_string[0].slice(0, -3)} <span class="am_pm">${
    time_string[1]
  }</span>`;
  time_string;
  // return `${}`;
  // let hours = `${date_obj.getHours()}`;
  // hours = hours.padStart(2, "0");

  // let mins = `${date_obj.getMinutes()}`;
  // mins = mins.padStart(2, "0");
  // return `${hours}:${mins}`;
}
