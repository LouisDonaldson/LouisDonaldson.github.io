let paintable_grid;
document.addEventListener("DOMContentLoaded", () => {
  // new paintable grid, default is 20 by 20
  paintable_grid = new PaintableGrid();
});

class PaintableGrid {
  constructor(width = 20, height = 20, pre_existing_grid = undefined) {
    this.grid = [height - 1];
    for (let temp = 0; temp < height; temp++) {
      this.grid[temp] = [];
    }

    if (pre_existing_grid != undefined) {
      // pre_existing_grid;
      this.grid = pre_existing_grid;
    }

    this.width = width;
    this.height = height;

    this.startpoint_coords_i;
    this.startpoint_coords_j;
    this.endpoint_coords_i;
    this.endpoint_coords_j;

    this.adjacency_matrix = [];

    // distance from source node to every other node
    this.distance_to_nodes = [];
    this.distance_to_nodes.length = width * height;

    this.visited = [];
    // this.visited.length = this.distance_to_nodes.length;
    // for (let i = 0; i < this.visited.length; i++) {
    //   this.visited[i] = false;
    // }
    this.unvisited = [];
    this.unvisited.length = this.distance_to_nodes.length;

    const initialise_adjacency_matrix = () => {
      this.adjacency_matrix.length = width * height;
      for (let i = 0; i < width * height; i++) {
        this.adjacency_matrix[i] = [];
        this.adjacency_matrix[i].length = width * height;
        for (let j = 0; j < this.adjacency_matrix[i].length; j++) {
          this.adjacency_matrix[i][j] = 0;
        }
      }
    };

    initialise_adjacency_matrix();

    let startpoint_choice = false;
    let endpoint_choice = false;
    console.log(this.grid.length);
    const paintable_grid_div = document.querySelector(".paintable_grid");
    paintable_grid_div.innerHTML = "";
    for (let i = 0; i < height; i++) {
      const row = document.createElement("div");
      row.classList.add("row");
      for (let j = 0; j < width; j++) {
        // cell logic
        this.grid[i][j] = 0;

        const cell_num = j * this.grid.length + i;

        // initialise other similar arrays here
        this.distance_to_nodes[cell_num] = width * height + 1;
        this.visited[cell_num] = false;

        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.id = cell_num;

        // for development purposes
        // cell.textContent = `${j * this.grid.length + i}`;

        row.append(cell);

        cell.addEventListener("mouseenter", () => {
          cell.classList.add("mouse_enter");
        });

        cell.addEventListener("mouseleave", () => {
          cell.classList.remove("mouse_enter");
        });

        cell.addEventListener("click", () => {
          console.log(`Row: ${i + 1}, column: ${j + 1}`);

          // if start or end point is chosen
          if (startpoint_choice) {
            if (this.CheckBoxIsEmpty(i, j)) {
              this.startpoint_coords_i = i;
              this.startpoint_coords_j = j;
              startpoint_choice = false;
              cell.classList.add("cell_start");
            }
          } else if (endpoint_choice) {
            if (this.CheckBoxIsEmpty(i, j)) {
              this.endpoint_coords_i = i;
              this.endpoint_coords_j = j;
              endpoint_choice = false;
              cell.classList.add("cell_end");
            }
          } else {
            // if grid is active vs not active
            // 1 = active
            // 0 = not active
            if (this.grid[i][j] == 1) {
              this.grid[i][j] = 0;

              cell.classList.remove("cell_active");
            } else {
              this.grid[i][j] = 1;
              cell.classList.add("cell_active");
            }
          }
        });
      }
      paintable_grid_div.append(row);
    }

    // startpoint button logic
    const startpoint_choice_btn = document.querySelector(".choose_start");
    startpoint_choice_btn.addEventListener("click", () => {
      startpoint_choice = true;
      this.RemoveCellClass("cell_start");
    });

    // endpoint button logic
    const endpoint_choice_btn = document.querySelector(".choose_end");
    endpoint_choice_btn.addEventListener("click", () => {
      endpoint_choice = true;
      this.RemoveCellClass("cell_end");
    });

    // start button logic
    const start_button = document.querySelector(".start");
    start_button.addEventListener("click", () => {
      if (
        this.startpoint_coords_i != undefined &&
        this.startpoint_coords_j != undefined &&
        this.endpoint_coords_i != undefined &&
        this.endpoint_coords_j != undefined
      ) {
        this.GenerateAdjacencyMatrix();
        this.FindDistanceToEveryOtherNode();
      } else {
        alert("Make sure you have added a start point and an endpoint.");
      }
    });
  }

  LoadGrid = (new_grid) => {
    paintable_grid = new PaintableGrid(this.width, this.height, new_grid);
  };

  CheckBoxIsEmpty = (i, j) => {
    if (
      this.grid[i][j] == 1 ||
      (i == this.startpoint_coords_i && j == this.startpoint_coords_j) ||
      (i == this.endpoint_coords_i && j == this.endpoint_coords_j)
    ) {
      alert("Cell already in use");
      return false;
    } else {
      return true;
    }
  };

  RemoveCellClass = (class_to_remove) => {
    const printable_grid = document.querySelector(".paintable_grid");
    const rows = printable_grid.children;
    for (let row = 0; row < rows.length; row++) {
      let selected_row = rows[row];
      let row_cells = selected_row.children;
      for (let cell = 0; cell < row_cells.length; cell++) {
        let selected_cell = row_cells[cell];
        selected_cell.classList.remove(class_to_remove);
      }
    }
  };

  GenerateAdjacencyMatrix = () => {
    // adjacency matrix shows which nodes are connected to one another
    // find index of first node, see which node it's connected to.
    // store connected nodes in adjacency matrix then move onto next node

    const CheckAdjacentCells = (x, y, cell_number) => {
      // checks adjacent cells and updates adjacency matrix
      const check_adjacent_cell_update_matrix = (new_x, new_y) => {
        try {
          const adjacent_cell = this.grid[new_x][new_y];

          if (adjacent_cell == undefined) return;

          const adjacent_cell_number = new_y * this.grid.length + new_x;

          if (adjacent_cell == 1) return false;
          // if (adjacent_cell == 0) {
          //   return true;
          // } else {
          //   return false;
          // }

          this.adjacency_matrix[cell_number][adjacent_cell_number] = 1;
        } catch {
          return false;
        }
      };

      // left
      check_adjacent_cell_update_matrix(x - 1, y);

      // up
      check_adjacent_cell_update_matrix(x, y - 1);

      // right
      check_adjacent_cell_update_matrix(x + 1, y);

      // down
      check_adjacent_cell_update_matrix(x, y + 1);
    };

    // counter acts as the cell number
    let counter = 0;
    for (let x = 0; x < this.grid.length; x++) {
      // const row = this.grid[i];
      for (let y = 0; y < this.grid[x].length; y++) {
        // i and j iterate over each node in the grid.
        // cell state = 0 || 1
        // 1 = obstacle, 0 = clear
        const cell_state = this.grid[x][y];

        const cell_number = y * this.grid.length + x;
        // console.log("Node: " + counter);
        console.log("Node: " + cell_number);

        // check to see if it's adjacent to other cells
        CheckAdjacentCells(x, y, cell_number);

        // increment counter
        counter++;
      }
    }

    // adjacency matrix generated
    this.adjacency_matrix;
  };

  FindDistanceToEveryOtherNode = () => {
    const FindSurroundingNodes = (node_index) => {
      let surrounding_nodes = [];
      try {
        for (let i = 0; i < this.adjacency_matrix[node_index].length; i++) {
          if (this.adjacency_matrix[node_index][i]) {
            surrounding_nodes.push(i);
          }
        }
        return surrounding_nodes;
      } catch {
        return [];
      }
    };

    const NodeHasBeenVisited = (node_index) => {
      return this.visited[node_index];
    };

    const start_node =
      this.startpoint_coords_j * this.grid.length + this.startpoint_coords_i;
    let node_index =
      this.startpoint_coords_j * this.grid.length + this.startpoint_coords_i;

    this.distance_to_nodes[node_index] = 0;

    // find distance from start node to every other node
    // counter is indexer for nodes
    let counter = 0;

    // execute until every node is visited
    while (true) {
      // pick unvisited node
      // find distance from node to it's surrounding nodes
      // Update table with known distance

      // next node = node with smallest distance
      // store distance between surrounding nodes execpt the ones already visited

      const surrounding_nodes = FindSurroundingNodes(node_index);

      for (const surrounding_node of surrounding_nodes) {
        if (surrounding_node == start_node) {
          continue;
        }

        // if new distance is smaller than existing distance, update
        // else leave it
        const distance = this.adjacency_matrix[node_index][surrounding_node];

        const updated_distance_from_start =
          this.distance_to_nodes[node_index] + distance;

        if (
          this.distance_to_nodes[surrounding_node] > updated_distance_from_start
        )
          this.distance_to_nodes[surrounding_node] =
            updated_distance_from_start;
      }

      this.visited[node_index] = true;
      let smallest_distance = Infinity;
      // node index becomes node with the least value.
      // ensure it's not been visisted

      // iterate through unvisited nodes to find
      let next_node_num;

      for (
        let discovered_node = 0;
        discovered_node < this.distance_to_nodes.length;
        discovered_node++
      ) {
        if (
          this.distance_to_nodes[discovered_node] == 0 ||
          this.distance_to_nodes[discovered_node] == undefined
        ) {
          continue;
        } else {
          // check to see if node has been visisted
          if (!NodeHasBeenVisited(discovered_node)) {
            if (this.distance_to_nodes[discovered_node] < smallest_distance) {
              smallest_distance = this.distance_to_nodes[discovered_node];
              next_node_num = discovered_node;
            }
          }
        }
      }

      node_index = next_node_num;
      if (node_index == undefined) {
        // alert("All nodes have been visited");
        break;
      }
      // go through distance to nodes array and cross reference to ones that have been visited.
      // If an unvisited one has been found ensure it has the lowest value

      // for (let i = 0; i < this.width * this.height; i++) {
      //   if (this.visited.find(i)) {
      //     continue;
      //   }
      //   if (this.distance_to_nodes[i] < smallest_distance) {
      //     smallest_distance = this.distance_to_nodes[i];
      //     node_index = i;
      //   }
      // }
    }

    // start backtracking distance array from end point
    let backtracked_nodes = [];

    this.distance_to_nodes;

    const end_node_number =
      this.endpoint_coords_j * this.grid.length + this.endpoint_coords_i;

    const start_node_number =
      this.startpoint_coords_j * this.grid.length + this.startpoint_coords_i;

    let next_node = end_node_number;

    let found_start = false;

    // print backtracked route to start
    while (next_node != start_node_number) {
      const surrounding_nodes = FindSurroundingNodes(next_node);
      surrounding_nodes;

      let temp_node;
      let smallest_distance = Infinity;
      for (let i = 0; i < surrounding_nodes.length; i++) {
        const surrounding_node = surrounding_nodes[i];
        const surrounding_node_distance =
          this.distance_to_nodes[surrounding_node];
        // if (surrounding_nodes[i] == start_node_number) {
        //   found_start = true;
        //   break;
        // }
        if (surrounding_node_distance < smallest_distance) {
          temp_node = surrounding_nodes[i];
          smallest_distance = surrounding_node_distance;
        }
      }
      // if (found_start) {
      //   break;
      // }
      next_node = temp_node;

      if (temp_node != start_node_number) {
        const cell_to_highlight = document.getElementById(`${temp_node}`);
        cell_to_highlight.classList.add("highlight_cell");
      }
    }

    // end point
    // find surrounding nodes
    // travel down shortest distance nodes
  };
}

const SaveGrid = () => {
  localStorage.setItem("Pre-saved grid", JSON.stringify(paintable_grid.grid));
};

const LoadGrid = () => {
  paintable_grid.LoadGrid(JSON.parse(localStorage.getItem("Pre-saved grid")));
};
