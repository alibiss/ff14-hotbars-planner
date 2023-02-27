const container = document.getElementById("container");

// Change hotbar layout
const layouts = document.getElementById("layouts");
layouts.value = 12; // Reset on page reload
layouts.addEventListener("change", (e) => {
    container.setAttribute("data-layout", e.target.value)
})

// Show/Hide pickers depending on filter value
const pickerCombat = document.getElementById("jobs-combat-picker"),
    pickerCrafting = document.getElementById("jobs-craft-picker"),
    pickerGathering = document.getElementById("jobs-gather-picker");

[pickerCombat, pickerCrafting, pickerGathering].forEach(p => {
    p.addEventListener("change", (e) => {
        if (e.target.checked) {
            e.target.parentNode.removeAttribute("class");
            e.target.parentNode.setAttribute("data-category", e.target.value);

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
        
        console.debug(`You picked ${option.textContent}`);
    })
});