// window.ChartJS is the access to the Chart-JS bundled npm module
// console.log(window.socket_io);

// const socket = window.socket_io.Socket;

// const socket = io();
// const chart_js = window.ChartJS;

// { Chart,
//   ChartConfiguration,
//   LineController,
//   LineElement,
//   PointElement,
//   LinearScale,
//   Title } = chart_js

document.addEventListener("DOMContentLoaded", () => {
  const config_menu_button = document.querySelector("#config_menu_button");
  config_menu_button.click();
  const run_code_btn = document.querySelector("#run_code_btn");
  run_code_btn.addEventListener("click", RunCode);

  // socket.on("path_data", (data) => {
  //   HandlePathData(data);
  // });
});

function RunCode() {
  let learning_type;

  const q_learning_radio = document.querySelector("#q_learning_radio");
  const sarsa_radio = document.querySelector("#sarsa_radio");
  const double_q_learning_radio = document.querySelector(
    "#double_q_learning_radio"
  );

  if (q_learning_radio.checked) {
    learning_type = 0;
  } else if (sarsa_radio.checked) {
    learning_type = 1;
  } else if (double_q_learning_radio.checked) {
    learning_type = 2;
  } else {
    throw new Error("Learning type selection went wrong.");
  }

  const episode_input = document.querySelector("#episode_input");
  const step_input = document.querySelector("#steps_input");
  const learning_rate_input = document.querySelector("#learning_rate_input");
  const discount_rate_input = document.querySelector("#discount_rate_input");
  const xy_size_input = document.querySelector("#xy_size_input");
  const coords_input = document.querySelector("#coords_input");

  const socket_data = {
    learning_type: learning_type,
    episodes: episode_input.value,
    steps: step_input.value,
    learning_rate: learning_rate_input.value,
    discount_rate: discount_rate_input.value,
    xy_size: xy_size_input.value,
    coords: coords_input.value,
  };

  SendConfigData(socket_data).then((status) => {
    const status_div = document.querySelector(".status");
    status_div.innerHTML = status;
    status_div.classList.remove("d-none");
    socket.on("csv_string", (data) => {
      DisplayGraphs(data);
    });
  });
}

function UpdateStatus(status) {
  const status_div = document.querySelector(".status");
  status_div.innerHTML = status;
  status_div.classList.remove("d-none");
}

function SendConfigData(socket_data) {
  return new Promise((resolve, reject) => {
    RunRL(socket_data);
    // socket.emit("run", socket_data);
    // socket.on("status", (status) => {
    //   resolve(status);
    // });
  });
}

const status_div = document.querySelector(".status");

function DisplayGraphs(csv_string) {
  FormatCSV(csv_string);
  const status_div = document.querySelector(".status");
  const config_menu_button = document.querySelector("#config_menu_button");
  config_menu_button.classList.remove("d-none");

  status_div.classList.add("d-none");
  config_menu_button.click();
}

function FormatCSV(csv_string) {
  //   status_div.innerHTML = csv_string;
  const split_by_newline = csv_string.split("\n");
  //   console.log(split_by_newline.length);
  const headings = split_by_newline[0].split(","); // only 0-2 are useful
  let episode = []; // 0
  let reward = []; // 1
  let steps = []; // 2
  for (let i = 1; i < split_by_newline.length; i++) {
    const split_row = split_by_newline[i].split(",");

    // filter's the array
    // if (split_row[2] == "0") {
    //   continue;
    // }

    episode.push(split_row[0]);
    reward.push(split_row[1]);
    steps.push(split_row[2]);
  }

  CreateLineChart(episode, reward, steps);
}

function CreateLineChart(episode, reward, steps) {
  const left_side = document.querySelector(".charts");

  left_side.innerHTML = `
    <canvas id="chart_canvas_reward" class="h-sm-50"></canvas>
    <canvas id="chart_canvas_steps" class="h-sm-50"></canvas>`;

  const chart_canvas_1 = left_side.querySelector("#chart_canvas_reward");
  const chart_canvas_2 = left_side.querySelector("#chart_canvas_steps");

  const episode_vs_reward = new Chart(chart_canvas_1, {
    type: "line",
    data: {
      labels: episode,
      datasets: [
        {
          label: "Reward",
          borderColor: "blue",
          data: reward,
          pointRadius: 3,
          pointBackgroundColor: "red",
          pointBorderColor: "red",
          borderWidth: 1,
          pointStyle: "line",
        },
      ],
    },
    options: {
      legend: { display: false },
      plugins: {
        title: {
          display: true,
          text: "Epsiode vs Reward",
        },
      },
    },
  });

  const episode_vs_steps = new Chart(chart_canvas_2, {
    type: "line",
    data: {
      labels: episode,
      datasets: [
        {
          label: "Steps",
          borderColor: "red",
          data: steps,
          pointRadius: 3,
          pointBorderColor: "blue",
          borderWidth: 1,
        },
      ],
    },
    options: {
      legend: { display: true },
      plugins: {
        title: {
          display: true,
          text: "Epsiode vs Steps Taken to find all turbines",
        },
      },
    },
  });
}

function HandlePathData(data) {
  console.log(data);
  const xy_size = parseInt(document.querySelector("#xy_size_input").value);
  // data.steps
  // data.route
  // data.turbine_coords

  const path_content = document.querySelector(".path_content");
  if (!data?.route) {
    path_content.innerHTML = "";
    return;
  }

  path_content.innerHTML = `
  <h2>Shortest path found</h1>
  <div class="grid_content">
    <div class="grid_legend mx-2">
      <div class="d-flex align-items-center">
        <div class="cell agent mx-1"></div>
        <div>Agent</div>
      </div>
      <div class="d-flex align-items-center">
        <div class="cell turbine mx-1"></div>
        <div>Turbine</div>
      </div>
      <div class="d-flex align-items-center">
        <div class="cell empty mx-1"></div>
        <div>Empty</div>
      </div>
      
    </div>
    <div class="grid"></div>
  </div>
  <div class="grid_controls">
      <div class="next_btn btn btn-primary">Next step</div>
      <div class="grid_step_info">
      </div>
    </div>
  
  `;

  const grid = path_content.querySelector(".grid");

  // format turbine_coords into states
  let turbine_states = [];
  for (const coord of data.turbine_coords) {
    const split = coord.split(",");
    turbine_states.push(parseInt(split[0]) * xy_size + parseInt(split[1]));
  }

  const grid_step_info = path_content.querySelector(".grid_step_info");

  let state_counter = 0;

  const PrintGrid = (state_counter, data, turbine_states) => {
    // display grid
    grid.innerHTML = "";

    grid_step_info.innerHTML = `
    <p>Length of path: <strong>${data.steps}</strong></p>
    <p>Current step: <strong>${state_counter}</strong></p>
    <p>Current state: <strong>${data.route[state_counter]}</strong></p>`;

    for (let x = 0; x < xy_size; x++) {
      const row = document.createElement("div");
      row.classList.add("grid_row");
      for (let y = 0; y < xy_size; y++) {
        let this_state = x * xy_size + y;

        if (data.route[state_counter] == this_state) {
          row.innerHTML += `<div class="cell agent"></div>`;
          continue;
        }

        // cell is a turbine
        if (turbine_states.includes(this_state)) {
          row.innerHTML += `<div class="cell turbine"></div>`;
          continue;
        }
        row.innerHTML += `<div class="cell empty"></div>`;
      }
      grid.appendChild(row);
    }
  };

  PrintGrid(state_counter, data, turbine_states);

  const next_btn = path_content.querySelector(".next_btn");
  next_btn.addEventListener("click", () => {
    if (state_counter == data.steps) {
      state_counter = 0;
    } else {
      state_counter++;
    }

    PrintGrid(state_counter, data, turbine_states);
  });
}

let csv_string = "";
let q_csv_string = "";

let status = "Initialised";

// if (!isMainThread) {
//   parentPort.on("message", (message) => {
//     if (message.request == "status") {
//       let response = { status: status };
//       parentPort.postMessage(response);
//     } else {
//       parentPort.postMessage("Not a clue...");
//     }
//   });
// }

const num_states = 5; // 0 north, 1 east, 2 south, 3 west, 4  perform maintenance

// Environment that the Agent will be traversing and will determine the rewards/punishment
class Environment {
  constructor(env_size, state_size, action_size, start_state, coords) {
    this.env_size = env_size;
    this.turbine_locations = coords;
    this.start_state = start_state;

    const init_env = () => {
      // Maps turbine locations to the array
      const CheckTurbineLocation = (x, y) => {
        for (const i of this.turbine_locations) {
          const x_y_split = i.split(",");
          if (x == parseInt(x_y_split[0] - 1)) {
            if (y == parseInt(x_y_split[1] - 1)) {
              return 1;
            }
          }
        }
        return 0;
      };

      // populates the array
      this.env_arr = new Array(env_size);
      let counter = 0;
      for (let i = 0; i < this.env_arr.length; i++) {
        this.env_arr[i] = new Array(env_size);

        for (let j = 0; j < this.env_arr[i].length; j++) {
          this.env_arr[i][j] = {
            index: counter,
            value: CheckTurbineLocation(i, j),
          };
          counter++;
          // console.log(counter);
        }
      }

      // generates Q-table
      // x = states = 100, y = actions = 4
      // possible states = env_size * env_size (10 * 10 == 100)
      this.q_table = new Array(state_size);
      for (let i = 0; i < this.q_table.length; i++) {
        this.q_table[i] = new Array(action_size);
        for (let j = 0; j < this.q_table[i].length; j++) {
          this.q_table[i][j] = 0;
        }
      }

      this.q_table_b = new Array(state_size);
      for (let i = 0; i < this.q_table.length; i++) {
        this.q_table_b[i] = new Array(action_size);
        for (let j = 0; j < this.q_table[i].length; j++) {
          this.q_table_b[i][j] = 0;
        }
      }
    };

    init_env(); // initialises environment
  }

  FindVertexNumber(coords) {
    const split = coords.split(",");
    return parseInt(split[0]) * this.env_arr.length + parseInt(split[1]);
  }

  FindCoordFromVertex(vertex_num) {
    let floor = Math.floor(vertex_num / this.env_size);
    let remainder = vertex_num % this.env_size;

    return { x: floor, y: remainder };
  }

  FindPossibleStates(current_state) {
    const current_coords = this.FindCoordFromVertex(current_state);

    let possible_states = [];

    // north
    try {
      let new_coords = { x: current_coords.x - 1, y: current_coords.y };
      if (this.env_arr[new_coords.x][new_coords.y] != undefined) {
        possible_states.push({
          action: "0",
          vertex: this.FindVertexNumber(`${new_coords.x},${new_coords.y}`),
        });
      }
    } catch (e) {
      e;
    }

    // east y++
    try {
      let new_coords = { x: current_coords.x, y: current_coords.y + 1 };
      if (this.env_arr[new_coords.x][new_coords.y] != undefined) {
        possible_states.push({
          action: "1",
          vertex: this.FindVertexNumber(`${new_coords.x},${new_coords.y}`),
        });
      }
    } catch (e) {
      e;
    }

    // south x++
    try {
      let new_coords = { x: current_coords.x + 1, y: current_coords.y };
      if (this.env_arr[new_coords.x][new_coords.y] != undefined) {
        possible_states.push({
          action: "2",
          vertex: this.FindVertexNumber(`${new_coords.x},${new_coords.y}`),
        });
      }
    } catch (e) {
      e;
    }

    // west y--
    try {
      let new_coords = { x: current_coords.x, y: current_coords.y - 1 };
      if (this.env_arr[new_coords.x][new_coords.y] != undefined) {
        possible_states.push({
          action: "3",
          vertex: this.FindVertexNumber(`${new_coords.x},${new_coords.y}`),
        });
      }
    } catch (e) {
      e;
    }
    //#endregion

    return possible_states;
  }

  IsTurbineLocation(vertex) {
    const coords = this.FindCoordFromVertex(vertex);
    const string_coord = `${coords.x},${coords.y}`;
    for (const turbine_location of this.turbine_locations) {
      if (string_coord == turbine_location) {
        return true;
      }
    }
    return false;
  }

  // returns new state, reward, done boolean and any additional info
  Step(chosen_action, current_state) {
    // Determine Agent's reward from actions
    let reward = 0;
    const possible_states = this.FindPossibleStates(current_state);

    // if action is in list, check reward, else reward = -5
    let next_action = {
      found: false,
      state: undefined,
    };
    for (const possible_state of possible_states) {
      if (parseInt(possible_state.action) == chosen_action) {
        next_action.found = true;
        next_action.state = possible_state.vertex;
        break;
      }
    }

    // reward policy
    //#region

    // action did nothing
    if (!next_action.found) {
      return {
        new_state: current_state,
        reward: -2,
        done: false,
        info: undefined,
      };
    }

    let next_action_is_turbine_location = this.IsTurbineLocation(
      next_action.state
    );

    // didn't find turbine
    if (!next_action_is_turbine_location) {
      return {
        new_state: next_action.state,
        reward: -1,
        done: false,
        info: undefined,
      };
    }

    // found turbine
    if (this.found_turbines.includes(next_action.state)) {
      // turbine already visited
      return {
        new_state: next_action.state,
        reward: -1,
        done: false,
        info: undefined,
      };
    } else {
      // turbine not visited
      this.found_turbines.push(next_action.state);

      // found all turbines
      if (this.found_turbines.length == this.turbine_locations.length) {
        return {
          new_state: next_action.state,
          reward: 10 * this.found_turbines.length,
          done: true,
          info: undefined,
        };
      }

      // found new turbine
      return {
        new_state: next_action.state,
        reward: 5 * this.found_turbines.length,
        done: false,
        info: undefined,
      };
    }

    //#endregion
  }

  Reset() {
    this.found_turbines = [];
    return this.start_state;
  }
}

// class which controls the entire RL process.
// any variables can be edited here.
// No need to edit variables from within the framework.
// Agent built into the Wrapper.Start() function.

const xy_size = 20;

// Only environment needs tweaking to fit use case.
class Wrapper {
  constructor(
    learning_type,
    episodes,
    steps,
    learning_rate,
    discount_rate,
    xy_size,
    coords
  ) {
    // learning type
    // 0 - q-learning, 1 - SARSA, 2 - double q-learning
    this.learning_type = learning_type;

    // number of states that the agent can be in.
    this.state_size = xy_size * xy_size;

    // number of actions a agent can take.
    this.action_size = 4; // up, left, down, right

    this.episodes = episodes;
    this.steps = steps;

    this.learning_rate = learning_rate;
    this.discount_rate = discount_rate;

    this.start_epsilon = 1;
    this.epsilon = 1; // probability agent will explore
    this.decay_rate = this.epsilon / (this.episodes * this.steps); // change in epsilon

    // configure coords
    const split_coords = coords.split("/");
    let environment_coords = [];
    for (const coord of split_coords) {
      const xy = coord.split(",");
      environment_coords.push(`${xy[0]},${xy[1]}`);
    }

    this.Env = new Environment(
      xy_size,
      this.state_size,
      this.action_size,
      0,
      environment_coords
    );

    status = "Episodes started";

    // parentPort.postMessage({ status: "Running..." });
    this.Start();
  }

  async Start(exploit = false) {
    csv_string = "Episode,Reward,Steps,Explored,Exploited\n";

    let shortest_path_steps = this.steps;
    let shortest_path_route;

    // chooses to explore or exploit
    const Explore = () => {
      this.counter_explore++;
      // random move
      // random number between 1 and 0. Have to be able to randomise picking between the number of possible states

      const random = Math.floor(Math.random() * this.action_size);

      return random;
    };

    const Exploit = (q_a_or_b) => {
      this.counter_exploit++;
      // exploit q_table
      // look at possible actions and query q-table to see which has highest value in current state
      // state 5 has 5 possible actions

      // debug purposes
      let temp_next_actions;
      if (this.learning_type == 2) {
        if (q_a_or_b == 0) {
          temp_next_actions = this.Env.q_table[this.state];
        } else {
          temp_next_actions = this.Env.q_table_b[this.state];
        }
      } else {
        temp_next_actions = this.Env.q_table[this.state];
      }

      // let best_action_value = Math.max.apply(null, temp_next_actions);
      // if (best_action_value == 0) {
      //   best_action_value == Math.min.apply(null, temp_next_actions);
      // }

      let best_action_value;
      for (const num of temp_next_actions) {
        if (!best_action_value || num > best_action_value) {
          best_action_value = num;
        }
      }

      let best_action = temp_next_actions.indexOf(best_action_value);
      return best_action;
    };

    // episodes
    for (let episode = 0; episode < this.episodes; episode++) {
      UpdateStatus(
        `Executing reinforcement learning.\nCurrent episode: ${episode}.\n`
      );
      // status = `Still executing reinforcement learning.\nCurrent episode: ${episode}.\n`;

      let steps_taken = 0;
      let found_all = false;

      let current_reward = 0;
      this.state = this.Env.Reset();

      this.counter_explore = 0;
      this.counter_exploit = 0;

      let state_path = [this.Env.start_state];

      // steps
      for (let step = 0; step < this.steps; step++) {
        let q_a_or_b;
        if (this.learning_type == 2) {
          const rnd = Math.random();
          if (rnd < 0.5) {
            q_a_or_b = 0;
          } else {
            q_a_or_b = 1;
          }
        }

        status += `Current step: ${step + 1}`;

        // keep updating epsilon even after turbines have been found
        if (found_all) {
          this.epsilon -= this.decay_rate;
          continue;
        }

        let action;

        // agent makes a move

        if (exploit) {
          action = Exploit(q_a_or_b);
        } else {
          Math.random() < this.epsilon
            ? (action = Explore())
            : (action = Exploit(q_a_or_b));
        }

        // agent makes that action in the environment
        let { done, info, new_state, reward } = this.Env.Step(
          action,
          this.state
        );

        if (this.learning_type == 0) {
          // q-learning updation
          // bellman equation logic
          const actions_in_state = this.Env.q_table[new_state];

          let math_max_test;
          for (const num of actions_in_state) {
            if (!math_max_test || num > math_max_test) {
              math_max_test = num;
            }
          }

          try {
            this.Env.q_table[this.state][action] +=
              this.learning_rate *
              (reward +
                this.discount_rate * math_max_test -
                this.Env.q_table[this.state][action]);
          } catch (e) {
            throw e;
          }
        } else if (this.learning_type == 1) {
          // SARSA q-table updation

          // bellman equation logic
          try {
            this.Env.q_table[this.state][action] +=
              this.learning_rate *
              (reward +
                this.discount_rate * this.Env.q_table[new_state][action] -
                this.Env.q_table[this.state][action]);
          } catch (e) {
            throw e;
          }
        } else if (this.learning_type == 2) {
          // q-learning updation
          // bellman equation logic

          const actions_in_state_a = this.Env.q_table[new_state];
          const actions_in_state_b = this.Env.q_table_b[new_state];

          // if Q-A chosen get max reward from Q-B

          let math_max_test;
          if (q_a_or_b == 0) {
            // update Q-table A

            for (const num of actions_in_state_b) {
              if (!math_max_test || num > math_max_test) {
                math_max_test = num;
              }
            }

            try {
              this.Env.q_table[this.state][action] +=
                this.learning_rate *
                (reward +
                  this.discount_rate * math_max_test -
                  this.Env.q_table[this.state][action]);
            } catch (e) {
              throw e;
            }
          } else if (q_a_or_b == 1) {
            // update Q-table A

            for (const num of actions_in_state_a) {
              if (!math_max_test || num > math_max_test) {
                math_max_test = num;
              }
            }

            try {
              this.Env.q_table_b[this.state][action] +=
                this.learning_rate *
                (reward +
                  this.discount_rate * math_max_test -
                  this.Env.q_table_b[this.state][action]);
            } catch (e) {
              throw e;
            }
          }
        }

        // ensures decimal can't get too big
        let val = this.Env.q_table[this.state][action];

        val = parseInt(val * 20) / 20;

        this.Env.q_table[this.state][action] = val;
        //#endregion

        // update q-table based on it's current move
        // bellman equation: qtable[state, action] += learning_rate * (reward + discount_rate * maximum value from(qtable[new_state,:]) - qtable[state,action])

        // update current state
        this.state = new_state;
        state_path.push(new_state);
        current_reward += reward;

        // decay epsilon (not)exponentially // at end
        this.epsilon -= this.decay_rate;
        // this.epsilon = parseFloat(this.epsilon.toFixed(5));

        if (done) {
          steps_taken = step + 1;
          console.log("Found turbines in " + step + " steps");
          found_all = true;
          if (step + 1 < shortest_path_steps) {
            shortest_path_steps = step + 1;
            shortest_path_route = state_path;
          }

          // break;
        } else {
          // steps_taken = step + 1;
        }
      }

      // console logging
      console.log(
        `Current episode: ${
          episode + 1
        }\nCurrent reward: ${current_reward}\nSteps taken: ${steps_taken}\nEpsilon: ${
          this.epsilon
        }\nExplored: ${this.counter_explore} times\nExploited: ${
          this.counter_exploit
        }\n`
      );

      // CSV writer
      csv_string += `${episode + 1},${current_reward},${steps_taken},${
        this.counter_explore
      }, ${this.counter_exploit}\n`;
    }

    console.log(`Shortest path found: ${shortest_path_steps}`);

    // change post messages into function calls
    DisplayGraphs(csv_string);
    // parentPort.postMessage({
    //   type: "csv",
    //   data: csv_string,
    // });
    const shortest_path_data = {
      steps: shortest_path_steps,
      route: shortest_path_route,
      turbine_coords: this.Env.turbine_locations,
    };
    HandlePathData(shortest_path_data);
    // parentPort.postMessage({
    //   type: "shortest_path",
    //   data: {
    //     steps: shortest_path_steps,
    //     route: shortest_path_route,
    //     turbine_coords: this.Env.turbine_locations,
    //   },
  }
}

let currently_running = false;
let wrapper;

async function RunRL(parent_data) {
  // const parent_data = data.data.data;
  wrapper = new Wrapper(
    parseInt(parent_data.learning_type),
    parseInt(parent_data.episodes),
    parseInt(parent_data.steps),
    parseFloat(parent_data.learning_rate),
    parseFloat(parent_data.discount_rate),
    parseInt(parent_data.xy_size),
    parent_data.coords
  );
}

// parentPort.on("message", (data) => {
//   if (data.type == "run") {
//   }
//   // console.log(data);
// });
