import { DraggedActions, releaseAction } from "./modules/drag.js";
import { print, output as textarea } from "./modules/export.js";

const add = document.getElementById("hotbars-add"),
    remove = document.getElementById("hotbars-remove"), 
    layouts = document.getElementById("hotbar-layouts"),
    share = document.getElementById("macro-share"),
    hotbars = document.getElementById("hotbars");

// Hotbars manager
add.addEventListener("click", addHotbar);
remove.addEventListener("click", removeHotbar);

// Macro share button
share.addEventListener("click", printMacro);

// Layouts picker
layouts.querySelectorAll("li").forEach(layout => {
    layout.addEventListener("click", changeLayout)
});

// Init default hotbars
hotbars.querySelectorAll(".hotbar").forEach((hotbar) => {
    hotbar.querySelectorAll("div[data-slot]").forEach((slot) => {
        slot.addEventListener("mouseup", releaseAction, true)
    })
});

// Functions

function addHotbar() {
    const sibling = hotbars.querySelector(".hotbar");

    if ( sibling.parentNode.children.length >= 10 ) return;

    const newHotbar = sibling.cloneNode();
    for ( let i=0; i<12; i++ ) newHotbar.innerHTML += `<div data-slot="${i}"></div>`;
    newHotbar.querySelectorAll("div[data-slot]").forEach((slot) => {
        slot.addEventListener("mouseup", releaseAction, true)
    })
    sibling.parentNode.appendChild(newHotbar);
    remove.innerHTML += `<button type="button" class="btn btn-outline-primary"></button>`;
}

function removeHotbar(e) {
    const index = [...e.target.parentNode.children].indexOf(e.target) + 1;
    const hotbar = hotbars.querySelector(`.hotbar:nth-of-type(${index})`);

    if ( hotbar.parentNode.children.length < 2 ) return;

    hotbar.querySelectorAll(".item").forEach((action) => DraggedActions.delete(action));
    hotbar.remove();
    e.target.remove();
}

function printMacro() {
    textarea.value = print();
}

function changeLayout(e) {
    document.body.setAttribute("data-layout", e.target.getAttribute("data-value"));
}

export { hotbars }
