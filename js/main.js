// input handling
const floorSlider = document.getElementById("floorSlider");
const elevatorSlider = document.getElementById("elevatorSlider");

const floorValue = document.getElementById("floorValue");
const elevatorValue = document.getElementById("elevatorValue");

floorSlider.addEventListener("input", (event) => {
  floorValue.textContent = event.target.value;
});

elevatorSlider.addEventListener("input", (event) => {
  elevatorValue.textContent = event.target.value;
});

//elevators UI
const elevatorUI = document.getElementById("elevatorsUI");

let elevators = null;
let num;
