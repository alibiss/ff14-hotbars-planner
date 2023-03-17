const db = {},
    pve = document.getElementById("actions-mode-pve"),
    pvp = document.getElementById("actions-mode-pvp");

[pve, pvp].forEach(btn => btn.addEventListener("change", (e) => {
    document.body.setAttribute("data-job-mode", e.target.value);
}))

// Append action nodes to DOM
const actions = document.getElementById("actions");
fetch("/actions.html")
.then(res => res.text())
.then(data => actions.innerHTML += data )

// TODO action tooltips
fetch("/dist/jobs-min.json", { mode: "no-cors" })
.then(res => res.json())
.then(data => Object.assign(db, data));

export { pve, pvp }
