let cols = 50;
let rows = 50;
let grid = new Array(cols);
let openSet = [];
let closedSet = [];
var start;
let end;
let w, h;
let path = [];
let ready = false;
let setStartPoint = false;
let setEndPoint = false;
let setDiagonal = true;
let removeWalls = false;

class Spot {
  constructor(i, j) {
    this.x = i;
    this.y = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous;
    this.wall = false;

    this.show = function (color) {
      fill(color);
      if (this.wall) {
        fill(60, 60, 60);
      }
      noStroke();
      rect(this.x * w, this.y * h, w - 1, h - 1);
    };
    this.addNeighbors = function (grid) {
      this.neighbors = [];
      let i = this.x;
      let j = this.y;
      if (i < cols - 1) {
        this.neighbors.push(grid[i + 1][j]);
      }
      if (i > 0) {
        this.neighbors.push(grid[i - 1][j]);
      }
      if (j < rows - 1) {
        this.neighbors.push(grid[i][j + 1]);
      }
      if (j > 0) {
        this.neighbors.push(grid[i][j - 1]);
      }
      if (setDiagonal === true) {
        if (i > 0 && j > 0) {
          this.neighbors.push(grid[i - 1][j - 1]);
        }
        if (i < cols - 1 && j > 0) {
          this.neighbors.push(grid[i + 1][j - 1]);
        }
        if (i > 0 && j < rows - 1) {
          this.neighbors.push(grid[i - 1][j + 1]);
        }
        if (i < cols - 1 && j < rows - 1) {
          this.neighbors.push(grid[i + 1][j + 1]);
        }
      }
    };
  }
}

function removeFromArray(arr, element) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === element) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(a, b) {
  let d = abs(a.x - b.x) + abs(a.y - b.y);
  return d;
}

function addRandomWalls(numberOfWalls) {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++)
      if (random(1) < numberOfWalls) {
        grid[i][j].wall = true;
      }
  }
  start.wall = false;
  end.wall = false;
}

// choose a start point by clicking on the grid
function nextClickStartOrEnd(choice) {
  if (choice === "start") {
    setStartPoint = true;
  } else if (choice === "end") {
    setEndPoint = true;
  }
  updateButtonStatus();
}

function updateButtonStatus() {
  document.getElementById("diagonalStatus").textContent = setDiagonal
    ? "Enabled"
    : "Disabled";
  document.getElementById("startPointStatus").textContent = setStartPoint
    ? "Enabled"
    : "Disabled";
  document.getElementById("endPointStatus").textContent = setEndPoint
    ? "Enabled"
    : "Disabled";
  document.getElementById("removeWallsStatus").textContent = removeWalls
    ? "Enabled"
    : "Disabled";
}

function toggleWall(i, j) {
  // Check if the coordinates are within the grid
  if (i >= 0 && i < cols && j >= 0 && j < rows) {
    // Toggle the wall state for the spot
    if (grid[i][j] === start || grid[i][j] === end) {
      return;
    }
    if (removeWalls === false) {
      grid[i][j].wall = true;
    } else {
      grid[i][j].wall = false;
    }
  }
}

function removeWallsOnOff() {
  if (removeWalls === true) {
    removeWalls = false;
  } else {
    removeWalls = true;
  }
  updateButtonStatus();
}

function mousePressed() {
  console.log("mouse pressed");
  let i = floor(mouseX / w);
  let j = floor(mouseY / h);
  if (setStartPoint === true) {
    if (grid[i] && grid[i][j]) {
      start = grid[i][j];
      start.wall = false;
      setStartPoint = false;
      updateButtonStatus();
    }
  } else if (setEndPoint === true) {
    if (grid[i] && grid[i][j]) {
      end = grid[i][j];
      end.wall = false;
      setEndPoint = false;
      updateButtonStatus();
    }
  } else {
    toggleWall(i, j);
  }
}

function onOffDiagonal() {
  if (setDiagonal === true) {
    setDiagonal = false;
  } else {
    setDiagonal = true;
  }
  updateButtonStatus();
  // Recall neighbors to redo the neighbors with diagonal or not
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) grid[i][j].addNeighbors(grid);
  }
}

function startPathDinding() {
  ready = true;
  openSet.push(start);
}

function resetBoard() {
  ready = false;
  openSet = [];
  closedSet = [];
  path = [];
  setStartPoint = false;
  setEndPoint = false;
  setDiagonal = true;
  removeWalls = false;
  setup();
  loop();
  draw();
}

// p5.js
function setup() {
  updateButtonStatus();
  const myCanvas = createCanvas(600, 600);
  myCanvas.parent("canvasDiv");
  w = width / cols;
  h = height / rows;

  // 2D array
  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j);
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  start = grid[0][0];
  end = grid[cols - 1][rows - 1];
  start.wall = false;
  end.wall = false;

  console.log(grid);
  //openSet.push(start);
}
// p5.js
function draw() {
  background(0);
  // Print the board
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show(color(225));
    }
  }
  start.show(color(143, 32, 145));
  end.show(color(184, 103, 6));

  if (mouseIsPressed && !setStartPoint) {
    // Continuous drawing of walls while mouse is pressed
    toggleWall(floor(mouseX / w), floor(mouseY / h));
  }

  if (ready === true) {
    if (openSet.length > 0) {
      let lowestF = 0;

      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestF].f) {
          lowestF = i;
        }
      }
      var current = openSet[lowestF];

      if (current === end) {
        // find the path

        noLoop();
        console.log("We found the end!");
      }

      removeFromArray(openSet, current);
      closedSet.push(current);

      let neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        if (!closedSet.includes(neighbor) && !neighbor.wall) {
          let tempG = current.g + 1;
          let newPath = false;
          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
              newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            openSet.push(neighbor);
          }
          if (newPath) {
            neighbor.h = heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
          }
        }
      }

      // we can keep going
    } else {
      console.log("No solution");
      noLoop();
      return;
    }

    // Red Spot
    for (let i = 0; i < closedSet.length; i++) {
      closedSet[i].show(color(168, 27, 22));
    }
    // Green Spot
    for (let i = 0; i < openSet.length; i++) {
      openSet[i].show(color(35, 130, 26));
    }
    // Blue path

    path = [];
    let temp = current;
    path.push(temp);
    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
    }

    // Blue Spot
    for (let i = 0; i < path.length; i++) {
      path[i].show(color(26, 35, 156));
    }
  }
}
