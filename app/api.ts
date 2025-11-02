import express from "express";
import router from './routes/index';
import serverless from "serverless-http";
import * as XMLHttpRequest from "xmlhttprequest";
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import { toBinary, fromBinary, fttvw, pushChannel, r } from "./functions/index";
import { unescape } from "node:querystring";
import { download } from "./functions/download";
import { list } from "./functions/list";
const api = express();

router.get("/hello", (req, res) => { res.send("Hello World!") });

router.get("/wall", (req, res) => { 
    //let arg = req.params.arg;
    fttvw(req, res)
});

router.get('/images/favicon.png', (req, res) => {
  //__dirname = path to the directory that the executing script resides in, functions/index.js
  res.sendFile('./public/images/favicon.png', { root: '.'});
});

router.get('/stylesheets/style.css', (req, res) => {
  //__dirname = path to the directory that the executing script resides in, functions/index.js
  res.sendFile('./public/stylesheets/style.css', { root: '.' });
});

router.get('/javascripts/webplayer.min.js', (req, res) => {
    //__dirname = path to the directory that the executing script resides in, functions/index.js
    res.sendFile('./public/javascripts/webplayer.min.js', { root: '.' });
});



// /lang/:language/cat/:category? Puede tener una interrogación al final
router.get('/wall/lang/:language/cat/:category', (req, res) => {
    fttvw(req, res);
});

///?search_box=24h
router.get('/wall/search/:search_box', (req, res) => {
    fttvw(req, res);
});

router.get('/proxy/:urlencoded', (req, res) => {
    let urlencoded = req.params.urlencoded;
    let urldecoded = fromBinary(urlencoded);
    let allowed = false;
    let channel;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (urldecoded.startsWith('https://')) {
        res.redirect('/api/proxy_s/' + urlencoded);

        console.log("redirecting to https");
        return;
    }

    r.cs.forEach((c) => {
        if (c.uri == '/api/proxy/' + urlencoded || c.originalUri == urldecoded) {
            channel = c;
            console.log("found channel: " + channel.uri);
        }
    });

    if (channel) {
        allowed = true;
    }

    if (!allowed || channel == null) {
        console.log("not allowed: " + urldecoded);
        res.sendStatus(401);

        return;
    }

    console.log("starting proxy");
    //console.log("urlencoded: " + urlencoded);
    console.log("urldecoded: " + urldecoded);

    res.setHeader('Content-Type', channel.type);
    http.get(urldecoded, (response) => {
        response.pipe(res);
    }).on('error', (err) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
    });
});

router.get('/proxy_s/:urlencoded', (req, res) => {
    let urlencoded = req.params.urlencoded;
    let urldecoded = fromBinary(urlencoded);
    let allowed = false;
    let channel;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (urldecoded.startsWith('http://')) {
        res.redirect('/api/proxy/' + urlencoded);
        console.log("redirecting to http");
        return;
    }

    r.cs.forEach((c) => {
        if (c.uri == '/api/proxy_s/' + urlencoded || c.originalUri == urldecoded) {
            channel = c;
            console.log("found channel: " + channel.uri);
        }
    });

    if (channel) {
        allowed = true;
    }

    if (!allowed || channel == null) {
        console.log("not allowed: " + urldecoded);
        res.sendStatus(401);

        return;
    }

    console.log("starting proxy");
    //console.log("urlencoded: " + urlencoded);
    console.log("urldecoded: " + urldecoded);

    let result = '';
    let hasNewUrl = false;
    https.get(urldecoded, (response) => {
        //SET Header: content-type: channel.type
        res.setHeader('Content-Type', channel.type);
        //It is a proxy for a stream, so we need to pipe the response to the client
        response.on('error', (err) => {
            console.log(err);
            // Handle the response error here
            res.status(500).send('Proxy error');
        });
        response.on('data', (chunk) => {
            let data = chunk.toString();
            let lines = data.split('\n');
            lines[0] = '';
            if (lines[0].includes('#EXTM3U')) {
                let newChunk = '';
                lines.forEach(l => {
                    let line = unescape(l);
                    if (line.startsWith('#') || line.startsWith('http://') || line.startsWith('https://')) {
                        if (line.startsWith('http://')) {
                            pushChannel(line);
                            line = toBinary(line);
                        }

                        if (line.startsWith('https://')) {
                            pushChannel(line);
                            line = toBinary(line);
                        }

                        newChunk += line + '\n';

                    } else {
                        let newUrl = '';
                        let urlparts = urldecoded.split('/');

                        for (let i = 0; i < urlparts.length - 1; i++) {
                            newUrl += urlparts[i] + '/';
                        }

                        let ending = toBinary(newUrl + line)

                        pushChannel(ending);

                        if (urlparts[0] == 'https:') {
                            line = '/api/proxy_s/' + ending;
                        } else {
                            line = '/api/proxy/' + ending;
                        }

                        newChunk += line + '\n';
                    }
                });

                res.write(encodeURI(newChunk));
            } else {
                res.write(chunk);
            }
        });

        response.on('end', () => {
            res.end();
        });
    }).on('error', (err) => {
        console.error('HTTPS Proxy error:', err);
        res.status(500).send('Proxy error');
    });

});

router.get('/download', (req, res) => {
    download();
});


let languages = [
"none", "af", "al", "dz", "as", "ad", "ao", "ai", "aq", "ag", "ar", "am", "aw", "au", "at", "az", "bs", "bh", "bd", "bb", "by", "be", "bz", "bj", "bm", "bt", "bo", "ba", "bw", "bv", "br", "io", "bn", "bg", "bf", "bi", "kh", "cm", "ca", "cv", "ky", "cf", "td", "cl", "cn", "cx", "cc", "co", "km", "cg", "cd", "ck", "cr", "ci", "hr", "cu", "cy", "cz", "dk", "dj", "dm", "do", "ec", "eg", "sv", "gq", "er", "ee", "et", "fk", "fo", "fj", "fi", "fr", "gf", "pf", "tf", "ga", "gm", "ge", "de", "gh", "gi", "gr", "gl", "gd", "gp", "gu", "gt", "gn", "gw", "gy", "ht", "hm", "va", "hn", "hk", "hu", "is", "in", "id", "ir", "iq", "ie", "il", "it", "jm", "jp", "jo", "kz", "ke", "ki", "kp", "kr", "kw", "kg", "la", "lv", "lb", "ls", "lr", "ly", "li", "lt", "lu", "mo", "mg", "mw", "my", "mv", "ml", "mt", "mh", "mq", "mr", "mu", "yt", "mx", "fm", "md", "mc", "mn", "ms", "ma", "mz", "mm", "na", "nr", "np", "nl", "an", "nc", "nz", "ni", "ne", "ng", "nu", "nf", "mk", "mp", "no", "om", "pk", "pw", "ps", "pa", "pg", "py", "pe", "ph", "pn", "pl", "pt", "pr", "qa", "re", "ro", "ru", "rw", "sh", "kn", "lc", "pm", "vc", "ws", "sm", "st", "sa", "sn", "rs", "cs", "sc", "sl", "sg", "sk", "si", "sb", "so", "za", "gs", "es", "lk", "sd", "sr", "sj", "sz", "se", "ch", "sy", "tw", "tj", "tz", "th", "tl", "tg", "tk", "to", "tt", "tn", "tr", "tm", "tc", "tv", "ug", "ua", "ae", "gb", "us", "um", "uy", "uz", "vu", "ve", "vn", "vg", "vi", "wf", "eh", "ye", "zm", "zw", 
];

let types = [ 1, 2, 3, 4, 5];

for (let i = 0; i < languages.length; i++) {
    for (let j = 0; j < types.length; j++) {
        let lang = languages[i];
        let type = types[j];
        
    
        router.get('/' + lang + '/' + type, (req, res) => {
            let lang = req.params.lang;
            let type = req.params.type;
            res.sendFile('./public/assets/' + lang + '_' + type + '.m3u', { root: '.' });
        });

    }
}

router.get('/:lang/:type', (req, res) => {
    let lang = req.params.lang;
    let type = req.params.type;
    res.redirect('/public/assets/' + lang + '_' + type + '.m3u');
});

router.get('/list', (req, res) => {
    let r = list();
    res.send(r);
});
api.use("/api", router);
export const handler = serverless(api);