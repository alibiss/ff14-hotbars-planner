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

new Promise(allSettled => {
    let categoryCounter = 0;
    const pagedCategories = Object.values(jobs);
    loopCategories(pagedCategories);
    function loopCategories(array) {
        console.log(`Category counter: ${categoryCounter}`);
        new Promise(catSettled => {
            let jobsCounter = 0;
            const pagedRequests = arrayPager(array[categoryCounter], 5);
            loopJobs(pagedRequests);
            function loopJobs(array) {
                Promise.allSettled([...array[jobsCounter].map(job => {
                    return new Promise(jobParsed => {
                        // Init array container
                        const skills = { pve: { jobActions: [], roleActions: [] } };

                        if ( categoryCounter > 0 || job.code === "BLU" ) {
                            jobParsed( Object.assign(job.actions, skills) );
                        } else {
                            skills.pvp = { jobActions: [], limitBreak: [], commonActions: [] };
                            Object.assign(job.actions, skills);
    
                            const formattedName = job.name.toLowerCase().replace(/\s/g, "");
                            return fetch("https://na.finalfantasyxiv.com/jobguide/" + formattedName)
                            .then(res => res.text())
                            .then(html => {
                                const document = parse(html);
                                jobParsed( scrapeSkills(document, job.actions) );
                            })
                        }
                    })
                    .then(() => {
                        console.log(`Finished parsing ${job.name}..`);
                    })
                })])
                .then(() => {
                    jobsCounter++;
                    if ( (jobsCounter + 1) > pagedRequests.length ) return catSettled();
                    setTimeout(() => { loopJobs(pagedRequests) }, 1000);
                })
            }
        })
        .then(() => {
            categoryCounter++;
            if ( (categoryCounter + 1) > pagedCategories.length ) return allSettled();
            setTimeout(() => { loopCategories(pagedCategories) }, 1000);
        })
    }
})
.then(() => {
    console.log("All done!");
    //console.log(jobs)
    fs.writeFileSync("./jobs.json", JSON.stringify(jobs, null, 2));
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

function scrapeSkills(d, jobActions) {
    // Node structure isn't preserved 1:1 but thankfully
    // all the important nodes have a convenient id assigned..
    const actions = Array.from(d.querySelectorAll("tr")).filter(node => node.id);

    actions.forEach(action => {
        switch(true) {
            case action.id.startsWith("pve_action"):
                jobActions.pve.jobActions.push(findElements(action));
                break;
            case action.id.startsWith("tank_action"):
            case action.id.startsWith("healer_action"):
            case action.id.startsWith("melee_action"):
            case action.id.startsWith("prange_action"):
            case action.id.startsWith("mrange_action"):
                jobActions.pve.roleActions.push(findElements(action));
                break;
            case action.id.startsWith("pvp_action"):
                jobActions.pvp.jobActions.push(findElements(action));
                break;
            case action.id.startsWith("pvplimitbreakaction"):
                jobActions.pvp.limitBreak.push(findElements(action));
                break;
            case action.id.startsWith("pvpcommmononlyaction"):
                jobActions.pvp.commonActions.push(findElements(action));
                break;
        }
    });

    function findElements(n) {
       
        const payload = {};

        payload.name = n.querySelector(".skill p strong").innerText;
        if (n.querySelector(".jobclass")) payload.lvl = n.querySelector(".jobclass").innerText.match(/\d+/)[0];
        if (n.querySelector(".classification")) payload.type = n.querySelector(".classification").innerText;
        payload.cast = n.querySelector(".cast").innerText;
        payload.recast = n.querySelector(".recast").innerText;
        payload.cost = n.querySelector(".cost").innerText.replace(/-/, "0 MP");
        payload.range = n.querySelector(".distant_range").innerText.match(/(\d+y)/g)[0];
        payload.radius = n.querySelector(".distant_range").innerText.match(/(\d+y)/g)[1];
        payload.desc = n.querySelector(".content").innerHTML.replace(/^[\t\n]+|[\t\n]+$/g, "");

        return payload
    }
}