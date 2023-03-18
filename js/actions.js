import { initDragging, releaseAction } from "./modules/drag.js";

window.addEventListener("mouseup", releaseAction);

const pve = document.getElementById("actions-mode-pve"),
    pvp = document.getElementById("actions-mode-pvp");

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

// TODO hotbar manager events (add/delete hotbars)
const more = document.getElementById("new-hotbar");
more.addEventListener("click", (e) => {
    return
})

// Init default hotbars
document.querySelectorAll(".hotbars-container .hotbar").forEach((hotbar) => {
    hotbar.querySelectorAll("div[data-slot]").forEach((slot) => {
        slot.addEventListener("mouseup", releaseAction, true)
    })
})

export { pve, pvp }
