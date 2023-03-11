(() => {
    let database = {};
    fetch("/dist/jobs-min.json", { mode: "no-cors" })
    .then(res => res.json())
    .then(data => Object.assign(database, data));

    const actions = document.getElementById("actions");
    fetch("/actions.html")
    .then(res => res.text())
    .then(data => {
        actions.innerHTML = data;
        let script = document.createElement("script");
        script.src = "/js/drag.js";
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
        })
    });

    const layouts = document.getElementById("layouts");
    layouts.querySelectorAll("input").forEach(layout => {
        layout.addEventListener("change", (e) => { 
            document.body.setAttribute("data-layout", e.target.value);
         })
    });

    const exportOptions = { pvp: false, reverse: false };
    const macroExport = document.getElementById("macro-export"),
        macroModal = document.getElementById("macro"),
        macro = macroModal.querySelector("textarea");
    macroExport.addEventListener("click", (e) => {
        const output = printMacro();
        macro.value = output;
    });
    macroModal.addEventListener("shown.bs.modal", () => {
        macro.focus();
    });

    const pvpToggle = document.getElementById("hotbarsPvPmode");
    pvpToggle.addEventListener("change", (e) => {
        exportOptions.pvp = e.target.checked;
        macro.value = printMacro();
    });

    const reverseOrder = document.getElementById("hotbarsReverse");
    reverseOrder.addEventListener("change", (e) => {
        exportOptions.reverse = e.target.checked;
        macro.value = printMacro();
    })

    const copyButton = document.getElementById("toClipboard");
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

    function printMacro() {
        let output = "";
        const options = exportOptions;

        const hotbarNodes = [...document.querySelectorAll(".hotbars-container .container > div")].filter((node) => !node.id);
        const hotbars = options.reverse === true ? [...hotbarNodes].slice().reverse() : hotbarNodes;

        hotbars.forEach((container, i) => {
            const slots = container.querySelectorAll("[data-slot]");
            if ( [...slots].every((slot) => slot.children.length < 1) ) return;

            if ( i > 0 ) output += "\n";
            output += `/echo Start of macro ${i + 1}\n`;

            slots.forEach((node) => {
                if ( node.children.length < 1 ) return;
                const hotbar = {
                    type: options.pvp === true ? "pvphotbar" : "hotbar",
                    number: (i + 1)
                };
                const slot = {
                    action: node.querySelector(".item.child").getAttribute("data-action"),
                    number: node.getAttribute("data-slot")
                };
                output += `/${hotbar.type} action "${slot.action}" ${hotbar.number} ${slot.number}\n`;
            })
        });

        return output
    }
})()