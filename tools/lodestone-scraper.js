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
    { name: "Armorer", code: "ARM", actions: {} },
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
        new Promise(catSettled => {
            let jobsCounter = 0;
            const pagedRequests = arrayPager(array[categoryCounter], 5);
            loopJobs(pagedRequests);
            function loopJobs(array) {
                Promise.allSettled([...array[jobsCounter].map(job => {
                    return new Promise(jobParsed => {
                        // Exit early if Blue Mage (nothing to fetch on the Lodestone)
                        if ( job.code === "BLU" ) return jobParsed( Object.assign(job.actions, skills) );
                        
                        // Init action types
                        let skills = {}, URLcomponent;
                        switch(true) {
                            case categoryCounter === 0:
                                // If combat job
                                URLcomponent = "jobguide";
                                skills.pve = { jobActions: [], roleActions: [] };
                                skills.pvp = { jobActions: [], limitBreak: [], commonActions: [] };
                                break;
                            case categoryCounter === 1:
                                // If crafting job
                                URLcomponent = "crafting_gathering_guide";
                                skills.pve = { classActions: [], specialistActions: [] };
                                break;
                            case categoryCounter === 2:
                                // If gathering job
                                URLcomponent = "crafting_gathering_guide";
                                skills.pve = { classActions: [], roleActions: [] };
                                break;
                        }
                        Object.assign(job.actions, skills);

                        const formattedName = job.name.toLowerCase().replace(/\s/g, "");
                        return fetch(`https://na.finalfantasyxiv.com/${URLcomponent}/${formattedName}`)
                        .then(res => res.text())
                        .then(html => {
                            const document = parse(html);
                            jobParsed( scrapeSkills(document, job, categoryCounter) );
                        })
                        .catch(err => { throw new Error(err) })
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
    fs.writeFileSync("./dist/jobs-min.json", JSON.stringify(jobs));
    fs.writeFileSync("./src/jobs.json", JSON.stringify(jobs, null, 2));
})

function arrayPager(array, amount) {
    if ( !(Array.isArray(array)) ) {
        throw new Error("Failed to parse array: ", array)
    };

    // Make a copy of the source array
    const newArray = [...array];
  
    const output = [];
    while (newArray.length > 0) {
        output.push(newArray.splice(0, amount));
    };

    return output
}

function scrapeSkills(document, job, category) {
    // Node structure isn't preserved 1:1 but thankfully
    // all the important nodes have a convenient id assigned..
    const nodes = Array.from(document.querySelectorAll("tr")).filter(node => node.id);

    nodes.forEach(node => {
        switch(true) {
            // Combat
            case node.id.startsWith("pve_action"):
                job.actions.pve.jobActions.push(findElements(node, category));
                break;
            case node.id.startsWith("tank_action"):
            case node.id.startsWith("healer_action"):
            case node.id.startsWith("melee_action"):
            case node.id.startsWith("prange_action"):
            case node.id.startsWith("mrange_action"):
                job.actions.pve.roleActions.push(findElements(node, category));
                break;
            case node.id.startsWith("pvp_action"):
                job.actions.pvp.jobActions.push(findElements(node, category, true));
                break;
            case node.id.startsWith("pvplimitbreakaction"):
                job.actions.pvp.limitBreak.push(findElements(node, category, true));
                break;
            case node.id.startsWith("pvpcommmononlyaction"):
                job.actions.pvp.commonActions.push(findElements(node, category, true));
                break;
            // Crafting
            case category === 1 && node.id.startsWith("action"):
                job.actions.pve.classActions.push(findElements(node, category))
                break;
            case node.id.startsWith("meisteraction"):
                job.actions.pve.specialistActions.push(findElements(node, category))
                break;
            // Gathering
            case category === 2 && node.id.startsWith("action"):
                job.actions.pve.classActions.push(findElements(node, category))
                break;
            case node.id.startsWith("addaction"):
                job.actions.pve.roleActions.push(findElements(node, category))
                break;
        }
    });

    function findElements(n, c, pvp) {
        const payload = {};

        payload.name = n.querySelector(".skill p strong").innerText;

        switch(true) {
            case c === 0:
                // combat
                if (!pvp) payload.lvl = n.querySelector(".jobclass").innerText.match(/\d+/)[0];
                if (!pvp) payload.type = n.querySelector(".classification").innerText;
                payload.cast = n.querySelector(".cast").innerText;
                payload.recast = n.querySelector(".recast").innerText;
                payload.cost = n.querySelector(".cost").innerText.replace(/^[\t\n]+|[\t\n]+$/g, "");
                payload.range = n.querySelector(".distant_range").innerText.match(/(\d+y)/g)[0];
                payload.radius = n.querySelector(".distant_range").innerText.match(/(\d+y)/g)[1];
                payload.desc = n.querySelector(".content").innerHTML.replace(/^[\t\n]+|[\t\n]+$/g, "");
                break;
            case c === 1:
                // crafting
                payload.lvl = n.querySelector(".jobclass").innerText.match(/\d+/)[0];
                payload.cost = n.querySelector(".cost").innerText.replace(/^[\t\n]+|[\t\n]+$/g, "");
                break;
            case c === 2:
                // gathering
                payload.lvl = n.querySelector(".jobclass").innerText.match(/\d+/)[0];
                payload.type = n.querySelector(".classification").innerText;
                payload.recast = n.querySelector(".recast").innerText;
                payload.cost = n.querySelector(".cost").innerText.replace(/^[\t\n]+|[\t\n]+$/g, "");
                break;
        }

        payload.desc = n.querySelector(".content").innerHTML.replace(/^[\t\n]+|[\t\n]+$/g, "");

        return payload
    }
}