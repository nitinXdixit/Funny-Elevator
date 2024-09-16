// input handling, display input
const floorSlider = document.getElementById("floorSlider");
const elevatorSlider = document.getElementById("elevatorSlider");

let noOfFloors = parseInt(floorSlider.value); //default value
let noOfElevators = parseInt(elevatorSlider.value); //default value
elevatorSlider.max = Math.floor(noOfFloors / 2); //elevator quantity half of no. of floors just to be little practical

floorSlider.addEventListener("input", (event) => {
  noOfFloors = parseInt(event.target.value);
  document.getElementById("floorValue").textContent = noOfFloors; //display floors value
  //set max no. of elevator to half of floors + 1 and set no. of elevators to half if already past that
  const maxElevators = Math.floor(noOfFloors / 2) + 1;
  elevatorSlider.max = maxElevators;
  if (noOfElevators > maxElevators) {
    noOfElevators = maxElevators;
    document.getElementById("elevatorValue").textContent = maxElevators;
  }
});

elevatorSlider.addEventListener("input", (event) => {
  noOfElevators = parseInt(event.target.value);
  document.getElementById("elevatorValue").textContent = noOfElevators; // display elevators value
});

// handle generate button to generate elevator UI
document.getElementById("generate").addEventListener("click", () => {
  buildUI(noOfFloors, noOfElevators);
});

//elevators UI
const elevatorUI = document.getElementById("elevatorsUI");

function buildUI(floors, elevators) {
  const building = document.getElementById("elevatorsUI");
  building.innerHTML = "";

  for (let i = 1; i <= floors; i++) {
    const floor = document.createElement("div");
    floor.classList.add("floor");
    floor.setAttribute("data-floor", i);

    const floorNumber = document.createElement("div");
    floorNumber.classList.add("floor-number");
    floorNumber.innerText = i - 1;

    const floorButtons = document.createElement("div");
    floorButtons.classList.add("floor-buttons");

    if (i !== floors) {
      const upButton = document.createElement("button");
      upButton.classList.add("floor-button", "up-button");
      upButton.textContent = `⮝`;
      upButton.addEventListener("click", () => callElevator(i, "up"));
      floorButtons.appendChild(upButton);
    }

    if (i !== 1) {
      const downButton = document.createElement("button");
      downButton.classList.add("floor-button", "down-button");
      downButton.textContent = `⮟`;
      downButton.addEventListener("click", () => callElevator(i, "down"));
      floorButtons.appendChild(downButton);
    }

    const elevatorContainer = document.createElement("div");
    elevatorContainer.classList.add("elevator-container");

    floor.appendChild(floorNumber);
    floor.appendChild(floorButtons);
    floor.appendChild(elevatorContainer);
    building.appendChild(floor);
  }

  const floorHeight = document.querySelector(".floor").offsetHeight;

  const buildingWidth = building.offsetWidth;
  const maxElevatorWidth = Math.min(75, (buildingWidth - 75) / elevators);
  const elevatorWidth = Math.max(35, maxElevatorWidth);

  for (let j = 0; j < elevators; j++) {
    const elevator = document.createElement("div");
    elevator.classList.add("elevator");
    elevator.setAttribute("data-elevator-id", j);
    elevator.style.height = `${floorHeight}px`;
    elevator.style.width = `${elevatorWidth}px`;

    const leftPanel = document.createElement("div");
    leftPanel.classList.add("panel", "left-panel");
    leftPanel.style.width = `${elevatorWidth / 2 - 5}px`; // Set width according to elevator width - 5px for side borders

    const rightPanel = document.createElement("div");
    rightPanel.classList.add("panel", "right-panel");
    rightPanel.style.width = `${elevatorWidth / 2 - 5}px`;

    elevator.appendChild(leftPanel);
    elevator.appendChild(rightPanel);

    const initialFloorElevatorContainer = document.querySelector(
      '.floor[data-floor="1"] .elevator-container'
    );
    initialFloorElevatorContainer.appendChild(elevator);
  }

  initializeState(floors, elevators);
}

function openElevatorPanels(elevatorElement) {
  const leftPanel = elevatorElement.querySelector(".left-panel");
  const rightPanel = elevatorElement.querySelector(".right-panel");

  leftPanel.style.transform = `translateX(-100%)`;
  rightPanel.style.transform = `translateX(100%)`;

  setTimeout(() => {
    closeElevatorPanels(elevatorElement);
  }, 2500); //close after 2.5sec
}

function closeElevatorPanels(elevatorElement) {
  const leftPanel = elevatorElement.querySelector(".left-panel");
  const rightPanel = elevatorElement.querySelector(".right-panel");

  leftPanel.style.transform = `translateX(0)`;
  rightPanel.style.transform = `translateX(0)`;

  setTimeout(() => {
    const elevatorIndex = parseInt(
      elevatorElement.getAttribute("data-elevator-id")
    );
    appState.elevators[elevatorIndex].isBusy = false;
    checkAndProcessQueue();
  }, 1500); // close panels in 1.5sec
}

const appState = {
  elevators: [],
  floors: [],
  queues: [],
};

function initializeState(floors, elevators) {
  appState.floors = Array.from({ length: floors }, () => ({
    isCallingUp: false,
    isCallingDown: false,
  }));
  appState.elevators = Array.from({ length: elevators }, () => ({
    currentFloor: 1,
    isBusy: false,
    calledUsing: null,
    movingToFloor: null,
  }));
  appState.queues = Array.from({ length: floors }, () => []); // Initialize queues for each floor
}

function callElevator(floorNumber, dir) {
  // elevators at the current floor
  const filteredElevators = appState.elevators.filter(
    (elevator) =>
      elevator.currentFloor === floorNumber ||
      elevator.movingToFloor === floorNumber
  );

  if (floorNumber !== 1) {
    const elevatorsAtFloor = filteredElevators.filter(
      (elevator) => elevator.currentFloor === floorNumber
    );
    const elevatorsMovingToFloor = filteredElevators.filter(
      (elevator) => elevator.movingToFloor === floorNumber
    );

    if (elevatorsAtFloor.length > 0) {
      if (elevatorsAtFloor.length === 2) {
        // If two elevators are at the floor, open their panels if they are not busy
        const elevator1 = elevatorsAtFloor[0];
        const elevator2 = elevatorsAtFloor[1];
        if (!elevator1.isBusy) {
          elevator1.isBusy = true;
          const elevatorElement1 = document.querySelector(
            `.elevator[data-elevator-id="${appState.elevators.indexOf(
              elevator1
            )}"]`
          );
          openElevatorPanels(elevatorElement1);
        }
        if (!elevator2.isBusy) {
          elevator2.isBusy = true;
          const elevatorElement2 = document.querySelector(
            `.elevator[data-elevator-id="${appState.elevators.indexOf(
              elevator2
            )}"]`
          );
          openElevatorPanels(elevatorElement2);
        }
        return;
      } else if (elevatorsAtFloor[0].calledUsing === dir) {
        // If an elevator is at the floor and is called in the same direction, open its panels if not busy
        if (!elevatorsAtFloor[0].isBusy) {
          elevatorsAtFloor[0].isBusy = true;
          const elevatorElement = document.querySelector(
            `.elevator[data-elevator-id="${appState.elevators.indexOf(
              elevatorsAtFloor[0]
            )}"]`
          );
          openElevatorPanels(elevatorElement);
        }
        return;
      }
    }
    if (elevatorsMovingToFloor.length > 0) {
      if (
        elevatorsMovingToFloor.length === 2 ||
        elevatorsMovingToFloor[0].calledUsing === dir
      ) {
        return;
      }
    }
  }

  // Set calling status on the appropriate floor
  if (dir === "up") {
    appState.floors[floorNumber - 1].isCallingUp = true;
  } else if (dir == "down") {
    appState.floors[floorNumber - 1].isCallingDown = true;
  }

  // Move an elevator to the floor
  moveElevatorToFloor(floorNumber, dir);
}

function moveElevatorToFloor(targetFloor, dir) {
  const availableElevators = appState.elevators.filter(
    (elevator) => elevator.isBusy === false
  );
  if (availableElevators.length === 0) {
    // If no elevators are available, add the request to the queue for that floor
    appState.queues[targetFloor - 1].push(dir);
    return;
  }

  let closestElevator = availableElevators[0];
  let minDistance = Math.abs(closestElevator.currentFloor - targetFloor);

  availableElevators.forEach((elevator) => {
    const distance = Math.abs(elevator.currentFloor - targetFloor);
    if (distance < minDistance) {
      closestElevator = elevator;
      minDistance = distance;
    }
  });
  closestElevator.calledUsing = dir;
  closestElevator.movingToFloor = targetFloor;
  closestElevator.isBusy = true;
  moveElevator(closestElevator, targetFloor);
}

function moveElevator(elevator, targetFloor) {
  const elevatorElement = document.querySelector(
    `.elevator[data-elevator-id="${appState.elevators.indexOf(elevator)}"]`
  );
  const floorHeight = document.querySelector(".floor").offsetHeight;
  const floorsToMove = Math.abs(elevator.currentFloor - targetFloor);
  const durationPerFloor = 2000; // Duration in milliseconds per floor
  const totalDuration = durationPerFloor * floorsToMove;
  const translateY = -(targetFloor - 1) * floorHeight;

  elevatorElement.style.transition = `transform ${totalDuration}ms ease-in-out`; // Update transition duration based on floors
  elevatorElement.style.transform = `translateY(${translateY}px)`;
  setTimeout(() => {
    elevator.currentFloor = targetFloor;
    openElevatorPanels(elevatorElement);
  }, totalDuration); // Delay panel opening until movement is complete
}

function checkAndProcessQueue() {
  for (let i = 0; i < appState.queues.length; i++) {
    if (appState.queues[i].length > 0) {
      const nextDir = appState.queues[i].shift(); // Get the next request from the queue
      callElevator(i + 1, nextDir); // Process the queued request
      break; // Only process one queued request at a time
    }
  }
}
