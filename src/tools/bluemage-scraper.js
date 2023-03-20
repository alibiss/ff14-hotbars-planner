import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import * as fs from 'fs';

let database = {};
new Promise(parsedDb => {
    fs.readFile("./dist/jobs-min.json", "utf-8", (err, data) => {
        parsedDb(Object.assign(database, JSON.parse(data)));
    })
})
.then(() => {
    Promise.allSettled([...[scrapeJob()]])
    .then((res) => {
        console.log(res);
        
        const BLU = database.combat.find(j => j.code === "BLU");
        Object.assign(BLU.actions, res[0].value);
        fs.writeFileSync("./dist/jobs-min.json", JSON.stringify(database));
        fs.writeFileSync("./src/jobs.json", JSON.stringify(database, null, 2));
    })
})

function scrapeJob() {
    return fetch("https://ffxiv.gamerescape.com/wiki/Blue_Mage")
    .then(res => res.text())
    .then(html => {
        return new Promise((resolve) => {
            const document = parse(html);
    
            const jobActions = [...document.querySelectorAll("td[width]")]
            .filter(el => Object.values(el._attrs).length < 2)
            .filter(el => ["10%", "8%", "15%", "48%", "19%", "50%"].some(w => w === el._attrs.width))
            .reduce((o, v, i) => {
                if ( i < 1 || i % 5 === 0 ) {
                  o.push([v])
                } else {
                  o[o.length - 1].push(v)
                }
                return o
            }, []);
        
            const roleActions = jobActions.splice(-5, 5);
        
            const output = { pve: {} };
            [jobActions, roleActions].forEach((type, i) => {
                output.pve[ i<1 ? "jobActions" : "roleActions" ] = [];
                type.forEach((action, j) => {
                    const data = {};
                    
                    data.name = action[2].querySelector("a").innerText.trim();
                    data.lvl = action[0].childNodes.filter(node => node.nodeType === 3)[0]._rawText.match(/^(\d+)/)[1];
                    data.type = action[2].querySelector("span").innerText.match(/^\((.+?)\)/)[1];
        
                    const keys = [ "cast", "recast", "cost", "range", "radius" ];
                    const values = [...action[4].querySelector("div").childNodes.filter(node => node.nodeType === 3).map(node => node._rawText)]
                    .reduce((o, v, i) => {
                        if ( i === 0 && /^\d+$/.test(v) ) return o;
                        o.push(v);
                        return o
                    }, []);

                    // Cast & Recast
                    values.slice(0, 2).forEach((v, i) => data[keys[i]] = v);

                    // Rest
                    if ( values.length < 5 ) {
                        // Non standard length
                        values.slice(2).forEach((f, i, a) => {
                            if ( a.length > 1 ) {
                                if ( /y$/.test(f) && i < 1 ) data["cost"] = "0 MP";
                                data[keys[i+3]] = f;
                                if ( /MP/.test(f) && i < 1 ) data["range"] = "0y";
                            } else {
                                data["cost"] = "0 MP";
                                data["range"] = "0y";
                                data[keys[i+4]] = f;
                            }
                        })
                    } else {
                        // Standard length
                        values.slice(2).forEach((v, i) => data[keys[i+2]] = v);
                    }
                    
                    data.cost = data.cost === "0 MP" ? "-" : data.cost;
        
                    let type;
                    if ( i < 1 ) {
                        data.desc = action[3].querySelector(".poem > p").innerHTML.trim();
                        type = "jobActions";
                    } else {
                        data.desc = action[3].innerHTML.trim();
                        type = "roleActions";
                    }

                    data.desc = data.desc.replace(/\n(<\/p>)$/, "$1");

                    output.pve[type].push(data);
                })
            })
            resolve(output)
        })
    })
}
