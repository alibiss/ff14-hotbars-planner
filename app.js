(() => {
    let database = {};
    fetch("./dist/jobs.json", { mode: "no-cors" })
    .then(res => res.json())
    .then(data => Object.assign(database, data));

    const actions = document.getElementById("actions");
    fetch("./dist/actions")
    .then(res => res.text())
    .then(data => {
        actions.innerHTML = data;
        let script = document.createElement("script");
        script.src = "drag.js";
        //actions.appendChild(script);
    });

    const categories = document.getElementById("categories");
    categories.querySelectorAll("input").forEach(category => {
        category.addEventListener("change", (e) => {
            document.body.setAttribute("data-category", e.target.value);

            // Reset job picker when changing category
            document.body.removeAttribute("data-job");
            jobPickers.querySelectorAll("select").forEach(picker => picker.value = 0);
        })
    });

    const jobPickers = document.getElementById("job-pickers");
    jobPickers.querySelectorAll("select").forEach(job => {
        job.addEventListener("change", (e) => {
            if ( e.target.value.length < 1 ) return;
            document.body.setAttribute("data-job", e.target.value);
            initJobActions(e.target.value);
        })
    });

    const layouts = document.getElementById("layouts");
    layouts.querySelectorAll("input").forEach(layout => {
        layout.addEventListener("change", (e) => { 
            document.body.setAttribute("data-layout", e.target.value);
         })
    });

    const macroModal = document.getElementById("macro"),
        macro = macroModal.querySelector("input");
    macroModal.addEventListener("shown.bs.modal", () => {
        macro.focus()
    });

    function initJobActions(job) {
        const parentNode = actions.querySelector(`[data-job="${job}"]`);
        if ( parentNode.querySelector("img").hasAttribute("src") ) return;
    
        parentNode.querySelectorAll(".item > img").forEach(icon => {
            const actionContainer = icon.parentNode;
            const modeContainer = actionContainer.parentNode;
            const mode = Array.from(modeContainer.classList).pop();
            icon.src = `./img/actions/${job}/${mode}/${actionContainer.getAttribute("data-skill")}.png`;
        });
    };
})()