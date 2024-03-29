import { hotbars } from "../hotbars.js";

const dialog = document.getElementById("macro-dialog"),
    pvp = document.getElementById("toggle-pvp"),
    reverse = document.getElementById("toggle-reverse"),
    output = dialog.querySelector("textarea"),
    copy = document.getElementById("clipboard");

// Default options
const options = { pvp: false, reverse: false };

dialog.addEventListener("shown.bs.modal", () => {
    output.focus();
    if ( output.value.length < 1 ) {
        output.placeholder = output.getAttribute("value");
    }
});

pvp.addEventListener("change", (e) => {
    options.pvp = e.target.checked;
    output.value = print();
});

reverse.addEventListener("change", (e) => {
    options.reverse = e.target.checked;
    output.value = print();
});

copy.addEventListener("click", (e) => {
    output.select();
    output.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard.writeText(output.value);

    const tooltip = new bootstrap.Tooltip(e.target, {
        placement: "left",
        title: "Copied to cliboard!",
        trigger: "manual"
    });
    tooltip.show();
});

// Functions
    
function print() {
    let output = "";

    const array = [...hotbars.querySelectorAll(".hotbar")];
    const hotbarsList = options.reverse ? [...array].slice().reverse() : array;

    let counter = 0;
    hotbarsList.forEach((container, i) => {
        const slots = container.querySelectorAll("[data-slot]");
        if ( [...slots].every((slot) => slot.children.length < 1) ) return;

        counter++;
        output += `/echo Start of macro ${counter}\n`;

        slots.forEach((node) => {
            if ( node.children.length < 1 ) return;

            const hotbar = {
                mode: options.pvp ? "pvphotbar" : "hotbar",
                number: i+1,
                slot: node.getAttribute("data-slot"),
                action: node.querySelector(".item.child").getAttribute("data-info").split("|")[1]
            }

            output += `/${hotbar.mode} action "${hotbar.action}" ${hotbar.number} ${hotbar.slot}\n`;
        });

        output += "\n";
    });

    return output.trim()
}

export { print, output }
