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
        actions.appendChild(script);
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

    function initJobActions(job) {
        const parentNode = actions.querySelector(`[data-job="${job}"]`);
        if ( parentNode.querySelector("img").hasAttribute("src") ) return;
    
        parentNode.querySelectorAll(".item > img").forEach(icon => {
            const actionContainer = icon.parentNode;
            const modeContainer = actionContainer.parentNode;
            const mode = Array.from(modeContainer.classList).pop();
            icon.src = `./img/actions/${job}/${mode}/${actionContainer.getAttribute("data-action")}.png`;
        });
    };

    const layouts = document.getElementById("layouts");
    layouts.querySelectorAll("input").forEach(layout => {
        layout.addEventListener("change", (e) => { 
            document.body.setAttribute("data-layout", e.target.value);
         })
    });

    const macroExport = document.getElementById("macro-export"),
        macroModal = document.getElementById("macro"),
        macro = macroModal.querySelector("textarea"),
        pvpToggle = document.getElementById("hotbarsPvPmode"),
        copyButton = document.getElementById("toClipboard");
    
    macroExport.addEventListener("click", (e) => {
        const output = pvpToggle.checked ? printMacro(true) : printMacro();
        macro.value = output;
    });

    macroModal.addEventListener("shown.bs.modal", () => {
        macro.focus();
    });

    pvpToggle.addEventListener("change", (e) => {
        const output = e.target.checked ? printMacro(true) : printMacro();
        macro.value = output;
    });

    copyButton.addEventListener("click", (e) => {
        const textarea = document.getElementById("macro").querySelector("textarea");

        // Select the text field
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices

        // Copy the text inside the text field
        navigator.clipboard.writeText(textarea.value);

        // Show tooltip
        const tooltip = new bootstrap.Tooltip(e.target, {
            placement: "left",
            title: "Copied to cliboard!",
            trigger: "manual"
        });
        tooltip.show();
    })

    function printMacro(isPvP) {
        let output = "";
        document.getElementById("hotbar").querySelectorAll("[data-slot]").forEach((node) => {
            if ( node.children.length < 1 ) return;
            const hotbar = {
                type: isPvP === true ? "pvphotbar" : "hotbar",
                number: node.parentElement.getAttribute("data-number")
            };
            const slot = {
                action: node.querySelector(".item.child").getAttribute("data-action"),
                number: node.getAttribute("data-slot")
            };
            output += `/${hotbar.type} action "${slot.action}" ${hotbar.number} ${slot.number}\n`;
        });

        return output
    }
})()