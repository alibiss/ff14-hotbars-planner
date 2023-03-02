import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import * as fs from 'fs';

// import json db
// wait for successful db parse
// fetch job page
// find icons
// split list in 10 items long batches
// fetch batch
// wait 250ms after batch completion
// fetch next batch
// repeat till no more batches
// wait 1000ms after job page completion
// fetch next job page

let database = {};

new Promise(parsedDb => {
    fs.readFile("./jobs.json", "utf-8", (err, data) => {
        parsedDb(Object.assign(database, JSON.parse(data)));
    })
})
.then(() => {
    let jobCount = 0;
    new Promise(allSettled => {
        fetchJob(database.combat[jobCount]);

        function fetchJob(job) {
            const jobName = job.name;
            const jobAbbr = job.code;
            const _jobName = jobName.replace(/ /, "_");

            new Promise((jobParsed, failedParse) => {
                fetch("https://ffxiv.gamerescape.com/wiki/" + _jobName, { mode: "cors" })
                .then(res => res.text())
                .then(html => {
                    const document = parse(html);
                    const icons = document.querySelectorAll("a > img[width='40']");
                    const pagedIcons = arrayPager(Array.from(icons), 10);
                
                    let pageCount = 0;
                    dlIcons(pagedIcons);
        
                    function dlIcons(batch) {
                        Promise.allSettled([...batch[pageCount]
                        .filter(node => node.hasAttribute("srcset"))
                        .map(node => {
                            const isHD = /2x$/.test(node.getAttribute("srcset"));

                            let relativePath = node.getAttribute("srcset");
                            if ( isHD ) { relativePath = relativePath.split(", ")[1] };
                            relativePath = relativePath.split(" ")[0];

                            // Simplify and sanitize filename imported from [Alt]
                            const filename = node.getAttribute("alt").replace(/ Icon\.png$/, "").replace(/[\\/:*?"<>|]/g, "");

                            // Init destination if it doesn't exist already
                            const mode = /\(PvP\)$/.test(filename) ? "pvp" : "pve";
                            const destination = `../img/actions/${jobAbbr}/${mode}`;
                            fs.existsSync(destination) || fs.mkdirSync(destination, { recursive: true });

                            // Get rid of redundant (PvP) tag in the filename after successful fetch
                            const formattedFilename = filename.replace(/ \(PvP\)$/, "");

                            if ( isHD ) {
                                return fetch(`https://ffxiv.gamerescape.com${relativePath}`)
                                .then(res => {
                                    res.body.pipe(fs.createWriteStream(`${destination}/${formattedFilename}.png`));
                                })
                                .catch(err => console.error(err));
                            } else {
                                console.log(`No HD icon found for ${filename}!`);
                                fs.writeFileSync(`${destination}/${formattedFilename} PLACEHOLDER`, "");
                                return Promise.resolve();
                            }
                        })])
                        .then(() => {
                            pageCount++;
                            if ( (pageCount + 1) > pagedIcons.length ) return jobParsed();
                            setTimeout(() => { dlIcons(pagedIcons) }, 250)
                        })
                        .catch(err => { failedParse(err) })
                    }
                })
            })
            .then(() => {
                console.log(`Finished parsing ${jobName}..`);
                jobCount++;
                if ( (jobCount + 1) > database.combat.length ) return allSettled();
                setTimeout(() => { fetchJob(database.combat[jobCount]) }, 1000);
            })
            .catch(err => { throw new Error(err) })
        }
    })
    .then(() => {
        console.log("Finished parsing all the job URLs.")
    })
});

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
