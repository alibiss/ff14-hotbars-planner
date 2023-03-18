import { print, output as textarea } from "./export.js";
import { pve, pvp } from "./actions.js";

const categories = document.getElementById("job-categories"),
    menus = document.getElementById("job-menus"),
    macro = document.getElementById("macro-export"),
    layouts = document.getElementById("hotbar-layouts");

categories.querySelectorAll("input").forEach(category => {
    category.addEventListener("change", changeCategory)
})

menus.querySelectorAll("select").forEach(job => {
    job.addEventListener("change", changeJob)
})

macro.addEventListener("click", printMacro)

layouts.querySelectorAll("input").forEach(layout => {
    layout.addEventListener("change", changeLayout)
})

function changeCategory(e) {
    document.body.setAttribute("data-category", e.target.value);

    switch(+e.target.value) {
        case 1:
            pvp.removeAttribute("disabled");
            break;
        default:
            pvp.setAttribute("disabled", true);
    }

    document.body.setAttribute("data-job", "");
    menus.querySelectorAll("select").forEach(menu => menu.value = 0);

    document.body.setAttribute("data-job-mode", 1);
    pve.checked = true;
    pvp.checked = false;
}

function changeJob(e) {
    if ( e.target.value.length < 1 ) return;
    document.body.setAttribute("data-job", e.target.value);
}

function changeLayout(e) {
    document.body.setAttribute("data-layout", e.target.value);
}

function printMacro() {
    textarea.value = print();
}
