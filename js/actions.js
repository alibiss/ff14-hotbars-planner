import { DraggedActions, initDragging, releaseAction } from "./modules/drag.js";

window.addEventListener("mouseup", releaseAction);

const pve = document.getElementById("actions-mode-pve"),
    pvp = document.getElementById("actions-mode-pvp"),
    more = document.getElementById("add-new-hotbar"),
    controls = document.querySelector(".hotbar-controls"),
    hotbars = document.querySelector(".hotbars-container");

[pve, pvp].forEach(btn => btn.addEventListener("change", (e) => {
    document.body.setAttribute("data-job-mode", e.target.value);
}))

// Append action nodes to DOM
fetch("/actions.html")
.then(res => res.text())
.then(data => {
    const actions = document.getElementById("actions");
    actions.innerHTML += data;
    actions.querySelectorAll(".item").forEach((action) => {
        action.addEventListener("mousedown", initDragging, true)
    })
})

// TODO action tooltips
const db = {}
fetch("/dist/jobs-min.json", { mode: "no-cors" })
.then(res => res.json())
.then(data => Object.assign(db, data))

// Hotbars manager
more.addEventListener("click", addHotbar)
controls.addEventListener("click", removeHotbar)

// Init default hotbars
hotbars.querySelectorAll(".hotbar").forEach((hotbar) => {
    hotbar.querySelectorAll("div[data-slot]").forEach((slot) => {
        slot.addEventListener("mouseup", releaseAction, true)
    })
})

function addHotbar() {
    const sibling = hotbars.querySelector(".hotbar");

    if ( sibling.parentNode.children.length >= 10 ) return;

    const newHotbar = sibling.cloneNode();
    for ( let i=0; i<12; i++ ) newHotbar.innerHTML += `<div data-slot="${i}"></div>`;
    newHotbar.querySelectorAll("div[data-slot]").forEach((slot) => {
        slot.addEventListener("mouseup", releaseAction, true)
    })
    sibling.parentNode.appendChild(newHotbar);
    controls.innerHTML += `<button type="button" class="btn btn-outline-primary"></button>`;
}

function removeHotbar(e) {
    const index = [...e.target.parentNode.children].indexOf(e.target) + 1;
    const hotbar = hotbars.querySelector(`.hotbar:nth-of-type(${index})`);

    if ( hotbar.parentNode.children.length < 2 ) return;

    hotbar.querySelectorAll(".item").forEach((action) => DraggedActions.delete(action));
    hotbar.remove();
    e.target.remove();
}

export { pve, pvp }
