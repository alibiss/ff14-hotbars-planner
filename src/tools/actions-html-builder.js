import * as fs from 'fs';
import jsb from 'js-beautify';

const database = {};

new Promise(parsedDb => {
    fs.readFile("./dist/jobs-min.json", "utf-8", (err, data) => {
        parsedDb(Object.assign(database, JSON.parse(data)));
    })
})
.then(() => {
    let output = "";

    const categories = Object.keys(database);
    categories.forEach(category => { // combat, crafting, gathering
        output += `<div class="${category}">`;
        const jobs = Object.values(database[category]);
        jobs.forEach(job => { // PLD, WAR, DRK, etc..
            output += `<div data-job="${job.code}">`;
            const modes = Object.keys(job.actions);
            modes.forEach(mode => { // pve, pvp
                // output += `<div class="${mode}">`;
                const types = Object.keys(job.actions[mode]);
                types.forEach(type => { // jobActions, roleActions, etc..
                    // output += `<div class="${type}">`;
                    const actions = Object.values(job.actions[mode][type]);
                    actions.forEach(action => {
                        const info = [...Object.entries(action).flatMap((a) => [
                            a[0], a[1].replace(/\|/g, encodeURIComponent("|"))
                        ])].join("|").replace(/>/g, "&gt;").replace(/</g, "&lt;");
                        const img = `<img src="./img/actions/${job.code}/${mode}/${action.name}.png" loading="lazy">`;
                        output += `<div class="item parent ${mode} ${type.replace(/s$/, "").toLowerCase()}" data-info="${info}" data-bs-toggle="tooltip">${img}</div>`;
                    })
                    // output += "</div>"; // close type div
                })
                // output += "</div>"; // close mode div
            })
            output += "</div>"; // close job div
        })
        output += "</div>"; // close category div
    });

    fs.writeFileSync("./actions.html", jsb.html(output));
})
