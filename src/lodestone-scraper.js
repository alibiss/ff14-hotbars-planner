import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import * as fs from 'fs';

const jobs = { combat: [
    { name: "Paladin", code: "PLD", actions: {} },
    { name: "Warrior", code: "WAR", actions: {} },
    { name: "Dark Knight", code: "DRK", actions: {} },
    { name: "Gunbreaker", code: "GNB", actions: {} },
    { name: "White Mage", code: "WHM", actions: {} },
    { name: "Scholar", code: "SCH", actions: {} },
    { name: "Astrologian", code: "AST", actions: {} },
    { name: "Sage", code: "SGE", actions: {} },
    { name: "Monk", code: "MNK", actions: {} },
    { name: "Dragoon", code: "DRG", actions: {} },
    { name: "Ninja", code: "NIN", actions: {} },
    { name: "Samurai", code: "SAM", actions: {} },
    { name: "Reaper", code: "RPR", actions: {} },
    { name: "Bard", code: "BRD", actions: {} },
    { name: "Machinist", code: "MCH", actions: {} },
    { name: "Dancer", code: "DNC", actions: {} },
    { name: "Black Mage", code: "BLM", actions: {} },
    { name: "Summoner", code: "SMN", actions: {} },
    { name: "Red Mage", code: "RDM", actions: {} },
    { name: "Blue Mage", code: "BLU", actions: {} }
], crafting: [
    { name: "Carpenter", code: "CRP", actions: {} },
    { name: "Blacksmith", code: "BSM", actions: {} },
    { name: "Armoer", code: "ARM", actions: {} },
    { name: "Goldsmith", code: "GSM", actions: {} },
    { name: "Leatherworker", code: "LTW", actions: {} },
    { name: "Weaver", code: "WVR", actions: {} },
    { name: "Alchemist", code: "ALC", actions: {} },
    { name: "Culinarian", code: "CUL", actions: {} }
], gathering: [
    { name: "Miner", code: "MIN", actions: {} },
    { name: "Botanist", code: "BTN", actions: {} },
    { name: "Fisher", code: "FSH", actions: {} }
] };

let counter = 0;
const pagedRequests = arrayPager(jobs.combat, 5);
new Promise(allSettled => {
    sendRequest(pagedRequests[counter]);
    function sendRequest(batch) {
        Promise.allSettled([...batch.map(job => {
            const formattedName = job.name.toLowerCase().replace(/\s/g, "");
            return fetch("https://na.finalfantasyxiv.com/jobguide/" + formattedName)
            .then(res => res.text())
            .then(html => {
                const document = parse(html);
                const actions = scrapeSkills(document, formattedName);
                Object.assign(job.actions, actions);
                console.log(`Finished parsing ${job.name}..`);
            })
        })])
        .then(() => {
            counter++;
            if ( (counter + 1) > pagedRequests.length ) return allSettled();
            setTimeout(() => { sendRequest(pagedRequests[counter]) }, 1000);
        })
    }
})
.then(() => {
    console.log("All done!");
    console.log(jobs.combat[0].actions.pvp.jobActions);
    // fs.writeFileSync("./jobs.json", JSON.stringify(jobs, null, 2));
})

function arrayPager(array, amount) {
    if ( !(Array.isArray(array)) ) {
        throw new Error("Failed to parse array: ", array)
    };

    // Make a copy of the source array
    const newArray = [...array];
  
    let i = 0;
    const output = [];
    while (i < newArray.length) {
        output.push(newArray.splice(0, amount));
        i++;
    };

    return output
}

function scrapeSkills(d, job) {
    // Node structure isn't preserved 1:1 but thankfully
    // all the important nodes have a convenient id assigned..
    const actions = Array.from(d.querySelectorAll("tr")).filter(node => {
        if (node.id) return node
    });

    // Blue Mage fallback I guess..
    if ( job === "bluemage" ) return [];

    // Init array container
    const skills = {
        pve: { jobActions: [], roleActions: [] }, 
        pvp: { jobActions: [], limitBreak: [], commonActions: [] }
    };
    actions.forEach(action => {
        switch(true) {
            case action.id.startsWith("pve_action"):
                skills.pve.jobActions.push(findElements(action));
                break;
            case action.id.startsWith("tank_action"):
            case action.id.startsWith("healer_action"):
            case action.id.startsWith("melee_action"):
            case action.id.startsWith("prange_action"):
            case action.id.startsWith("mrange_action"):
                skills.pve.roleActions.push(findElements(action));
            case action.id.startsWith("pvp_action"):
                skills.pvp.jobActions.push(findElements(action));
                break;
            case action.id.startsWith("pvplimitbreakaction"):
                skills.pvp.limitBreak.push(findElements(action));
                break;
            case action.id.startsWith("pvpcommmononlyaction"):
                skills.pvp.commonActions.push(findElements(action));
                break;
        }
    });

    return skills

    function findElements(n) {
       
        const payload = {};

        if (n.querySelector(".jobclass")) payload.lvl = n.querySelector(".jobclass").innerText.match(/\d+/)[0];
        if (n.querySelector(".classification")) payload.type = n.querySelector(".classification").innerText;

        payload.name = n.querySelector(".skill p strong").innerText;
        payload.cast = n.querySelector(".cast").innerText;
        payload.recast = n.querySelector(".recast").innerText;
        payload.cost = n.querySelector(".cost").innerText.replace(/-/, "0 MP");
        payload.range = n.querySelector(".distant_range").innerText.match(/(\d+y)/g)[0];
        payload.radius = n.querySelector(".distant_range").innerText.match(/(\d+y)/g)[1];
        payload.desc = n.querySelector(".content").innerHTML.replace(/^[\t\n]+|[\t\n]+$/g, "");

        return payload
    }
}