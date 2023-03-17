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
    fs.readFile("./dist/jobs-min.json", "utf-8", (err, data) => {
        parsedDb(Object.assign(database, JSON.parse(data)));
    })
})
.then(() => {
    new Promise(allSettled => {
        let categoryCount = 0;
        const categories = Object.values(database);

        parseCategory(categories[categoryCount]);
        function parseCategory(category) {
            new Promise(categorySettled => {
                let jobCount = 0;

                fetchJob(category[jobCount]);
                function fetchJob(job) {
                    const _jobName = job.name.replace(/ /, "_");

                    new Promise((jobParsed) => {
                        // Prevent overwriting of icons if parent job directory exists
                        if ( fs.existsSync(`./img/actions/${job.code}`) ) return jobParsed();

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
                                    const destination = `./img/actions/${job.code}/${mode}`;
                                    fs.existsSync(destination) || fs.mkdirSync(destination, { recursive: true });

                                    // Get rid of redundant tags like (PvP) or (Carpenter) in the filename
                                    const formattedFilename = filename.replace(/ \(\w+\)$/, "");

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
                            }
                        })
                        .catch(err => { throw new Error(err) })
                    })
                    .then(() => {
                        console.log(`Finished parsing ${job.name}..`);
                        jobCount++;
                        if ( (jobCount + 1) > categories[categoryCount].length ) return categorySettled();
                        setTimeout(() => { fetchJob(category[jobCount]) }, 1000);
                    })
                }
            })
            .then(() => {
                categoryCount++;
                if ( (categoryCount + 1) > Object.keys(database).length ) return allSettled();
                setTimeout(() => { parseCategory(categories[categoryCount]) }, 1000);
            })
        }
    })
    .then(() => {
        console.log("Finished parsing all the job URLs.");
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
