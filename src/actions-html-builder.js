import * as fs from 'fs';
import jsb from 'js-beautify';

const database = {};

new Promise(parsedDb => {
    fs.readFile("./jobs.json", "utf-8", (err, data) => {
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
            output += `<div class="${job.code}">`;
            const modes = Object.keys(job.actions);
            modes.forEach(mode => { // pve, pvp
                output += `<div class="${mode}">`;
                const types = Object.keys(job.actions[mode]);
                types.forEach(type => { // jobActions, roleActions, etc..
                    output += `<span class="${type}">`;
                    const actions = Object.values(job.actions[mode][type]);
                    actions.forEach(action => {
                        const icon = `<img src="" width="48" height="48">`
                        output += `<div class="item parent" data-skill="${action.name}" draggable="true">${icon}</div>`;
                    })
                    output += "</span>"; // close type div
                })
                output += "</div>"; // close mode div
            })
            output += "</div>"; // close job div
        })
        output += "</div>"; // close category div
    });

    fs.writeFileSync("../dist/actions.html", jsb.html(output));
})