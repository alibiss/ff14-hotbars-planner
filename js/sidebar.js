import { initDragging } from "./modules/drag.js";

const categories = document.getElementById("job-categories"), 
    pickers = document.getElementById("job-pickers"), 
    pve = document.getElementById("actions-mode-pve"), 
    pvp = document.getElementById("actions-mode-pvp");

categories.querySelectorAll("input").forEach(category => {
    category.addEventListener("change", changeCategory)
});

pickers.querySelectorAll("select").forEach(job => {
    job.addEventListener("change", (e) => {
        if ( e.target.value.length < 1 ) return;
        document.body.setAttribute("data-job", e.target.value);

        if ( document.body.getAttribute("data-category") > 1 ) return
        if ( e.target.value === "BLU" ) {
            pve.checked = true;
            pvp.setAttribute("disabled", true);
            document.body.setAttribute("data-job-mode", 1);
        } else {
            pvp.removeAttribute("disabled");
        }
    })
});

[pve, pvp].forEach(btn => btn.addEventListener("change", (e) => {
    document.body.setAttribute("data-job-mode", e.target.value);
}));

// Append action nodes to DOM
fetch("/actions.html")
.then(res => res.text())
.then(data => {
    const actions = document.getElementById("actions");
    actions.innerHTML += data;
    actions.querySelectorAll(".item").forEach((action) => {
        action.addEventListener("mousedown", initDragging, true);
        new bootstrap.Tooltip(action, {
            title: action.getAttribute("data-info").split("|")[1]
        });
    })
});

// Functions

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
    pickers.querySelectorAll("select").forEach(menu => menu.value = 0);

    document.body.setAttribute("data-job-mode", 1);
    pve.checked = true;
    pvp.checked = false;
}
