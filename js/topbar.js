import { print } from "./modules/export.js";
import { pve, pvp } from "./modules/actions.js";

const categories = document.getElementById("categories"),
    menus = document.getElementById("job-pickers"),
    macro = document.getElementById("macro-export"),
    layouts = document.getElementById("layouts");

categories.querySelectorAll("input").forEach(category => {
    category.addEventListener("change", changeCategory)
})

menus.querySelectorAll("select").forEach(job => {
    job.addEventListener("change", changeJob)
})

layouts.querySelectorAll("input").forEach(layout => {
    layout.addEventListener("change", changeLayout)
})

macro.addEventListener("click", printMacro)

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
    macro.value = print();
}
