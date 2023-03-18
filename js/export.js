const popup = document.getElementById("macro"),
    pvp = document.getElementById("hotbarsPvPmode"),
    reverse = document.getElementById("hotbarsReverse"),
    macros = popup.querySelector("textarea"),
    copy = document.getElementById("toClipboard");

const options = { pvp: false, reverse: false };

popup.addEventListener("shown.bs.modal", () => {
    macros.focus();
    if ( macros.value.length < 1 ) {
        macros.placeholder = macros.getAttribute("value");
    }
})

pvp.addEventListener("change", (e) => {
    options.pvp = e.target.checked;
    macros.value = print();
})

reverse.addEventListener("change", (e) => {
    options.reverse = e.target.checked;
    macros.value = print();
})

copy.addEventListener("click", (e) => {
    macros.select();
    macros.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard.writeText(macros.value);

    const tooltip = new bootstrap.Tooltip(e.target, {
        placement: "left",
        title: "Copied to cliboard!",
        trigger: "manual"
    });
    tooltip.show();
})
    
function print() {
    let output = "";

    const array = [...document.querySelectorAll(".hotbars-container .hotbar")];
    const hotbars = options.reverse ? [...array].slice().reverse() : array;

    hotbars.forEach((container, i) => {
        const slots = container.querySelectorAll("[data-slot]");
        if ( [...slots].every((slot) => slot.children.length < 1) ) return;

        output += `/echo Start of macro ${i+1}\n`;

        slots.forEach((node) => {
            if ( node.children.length < 1 ) return;

            const hotbar = {
                mode: options.pvp ? "pvphotbar" : "hotbar",
                number: i+1,
                slot: node.getAttribute("data-slot"),
                action: node.querySelector(".item.child").getAttribute("data-action")
            }

            output += `/${hotbar.mode} action "${hotbar.action}" ${hotbar.number} ${hotbar.slot}\n`;
        });

        output += "\n";
    });

    return output.trim()
}

export { print, macros }
