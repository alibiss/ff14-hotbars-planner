let database = {};
const container = document.getElementById("container");
const actions = document.getElementById("list");

fetch("./dist/jobs.json", { mode: "no-cors" })
.then(res => res.json())
.then(data => Object.assign(database, data));

fetch("./dist/actions")
.then(res => res.text())
.then(data => actions.innerHTML = data);

// Change hotbar layout
const layouts = document.getElementById("layouts");
layouts.value = 12; // Reset on page reload
layouts.addEventListener("change", (e) => {
    document.body.setAttribute("data-layout", e.target.value)
})

// Show/Hide pickers depending on filter value
const pickerCombat = document.getElementById("jobs-combat-picker"),
    pickerCrafting = document.getElementById("jobs-craft-picker"),
    pickerGathering = document.getElementById("jobs-gather-picker");

[pickerCombat, pickerCrafting, pickerGathering].forEach(p => {
    p.addEventListener("change", (e) => {
        if (e.target.checked) {
            document.body.setAttribute("data-category", e.target.value);

            // Reset options when changing filters
            [jobsCombat, jobsCrafting, jobsGathering].forEach(c => c.value = -1);
        }
    })
});

// Show/Hide job-specific skills
const jobsCombat = document.getElementById("jobs-combat"),
    jobsCrafting = document.getElementById("jobs-crafting"),
    jobsGathering = document.getElementById("jobs-gathering");

[jobsCombat, jobsCrafting, jobsGathering].forEach(c => {
    c.value = -1; // Reset on page reload

    // Add callback function on value change
    c.addEventListener("change", (e) => {
        const value = e.target.value,
            option = e.target.querySelector(`option[value="${value}"]`);
        
        document.body.setAttribute("data-job", option.value);
    })
});