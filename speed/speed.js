let locations = [];
let interval;
let last_position;
let top_speed = 0;
let distance_travelled = 0;

window.addEventListener("DOMContentLoaded", async () => {
  let started = false;
  const start_btn = document.querySelector(".start");

  const TrackSpeed = () => {
    started = true;

    function Radians(degrees) {
      return degrees * (Math.PI / 180);
    }

    const GetDistance = (last_position, new_position) => {
      let distance =
        Math.acos(
          Math.sin(Radians(last_position.coords.latitude)) *
            Math.sin(Radians(new_position.coords.latitude)) +
            Math.cos(Radians(last_position.coords.latitude)) *
              Math.cos(Radians(new_position.coords.latitude)) *
              Math.cos(
                Radians(new_position.coords.longitude) -
                  Radians(last_position.coords.longitude)
              )
        ) * 6371;

      // distance = distance * 1000;
      let miles = distance * 0.621371;
      return {
        m: miles,
        km: distance,
      };
    };

    const number = document.querySelector(".number");
    const top_speed_div = document.querySelector(".top_speed_num");
    const distance_travelled = document.querySelector(".distance_travelled");
    navigator.geolocation.watchPosition(
      (pos) => {
        if (last_position) {
          // calculate distance
          const old_date = new Date(last_position.timestamp);
          const new_date = new Date(pos.timestamp);
          const difference_in_msecs = new_date - old_date;
          console.log(difference_in_msecs);
          let { m, km } = GetDistance(last_position, pos);
          distance_travelled += m;

          const difference_in_secs = difference_in_msecs / 1000;
          const diff_in_mins = difference_in_secs / 60;
          const diff_in_hours = diff_in_mins / 60;

          const speed = Math.round(m / diff_in_hours);

          number.innerHTML = speed;
          distance_travelled.innerHTML = `${Math.round(m)} miles`;
          if (speed > top_speed) {
            top_speed = speed;
            top_speed_div.innerHTML = `${top_speed} mph`;
          }
          last_position = pos;
        } else {
          // new pos = old pos
          last_position = pos;
        }
      },
      (err) => {
        console.error(err);
      }
    );

    // navigator.geolocation.getCurrentPosition((pos) => {
    //   console.log(pos);
    //   navigator.geolocation.watchPosition((watched_pos) => {
    //     console.log(watched_pos);
    //   });
    // });
  };

  TrackSpeed();
});
