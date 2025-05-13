import express from "express";
import router from './routes/index';
import serverless from "serverless-http";
import * as XMLHttpRequest from "xmlhttprequest";
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import { toBinary, fromBinary, main, pushChannel, r, errorCodes } from "./functions/index";
import { unescape } from "node:querystring";

const api = express();

router.get("/hello", (req, res) => { res.send("Hello World!") });
router.get("/wall", (req, res) => { 
    //let arg = req.params.arg;
    main(req, res)
});


router.get('/channels.csv', (req, res) => {
    res.redirect('/public/assets/channels.csv');
});

router.get('/public/javascripts/webplayer.min.js', (req, res) => {
    let data = fs.readFileSync('public/javascripts/webplayer.min.js');
    res.setHeader('Content-Type', 'text/javascript');
    res.send(data);
});
router.get('/public/stylesheets/style.css', (req, res) => {
    let data = fs.readFileSync('public/stylesheets/style.css');
    res.setHeader('Content-Type', 'text/javascript');
    res.send(data);
});

router.get('/public/javascripts/webplayer.min.js', (req, res) => {
    let data = fs.readFileSync('public/javascripts/webplayer.min.js');
    res.setHeader('Content-Type', 'text/javascript');
    res.send(data);
});

router.get('/channels.xml', (req, res) => {
    res.redirect('/public/assets/channels.xml');
});

router.get('/init', (req, res) => {
    http.get('/channels.xml', (response) => {
        let result = '';
        response.on('data', (chunk) => {
            result += chunk;
        });
        response.on('end', () => {
            fs.writeFile('channels.xml', result, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
    });

    http.get('/channels.csv', (response) => {
        let result = '';
        response.on('data', (chunk) => {
            result += chunk;
        });
        response.on('end', () => {
            fs.writeFile('channels.csv', result, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
    });
    console.log("Init done");
    res.redirect('/wall');
});

// /lang/:language/cat/:category? Puede tener una interrogación al final
router.get('/wall/lang/:language/cat/:category', (req, res) => {
    main(req, res);
});

///?search_box=24h
router.get('/wall/search/:search_box', (req, res) => {
    main(req, res);
});

router.get('/proxy/:urlencoded', (req, res) => {
    let urlencoded = req.params.urlencoded;
    let urldecoded = fromBinary(urlencoded);
    let allowed = false;
    let channel;

    if (urldecoded.startsWith('https://')) {
        res.redirect('/api/proxy_s/' + urlencoded);

        console.log("redirecting to https");
        return;
    }

    r.cs.forEach((c) => {
        if (c.uri == 'https://freetuxtvwall.netlify.app/api/proxy/' + toBinary(urldecoded) || c.uri == '/api/proxy_s/' + toBinary(urldecoded)) {
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
    });
});

router.get('/proxy_s/:urlencoded', (req, res) => {
    let urlencoded = req.params.urlencoded;
    let urldecoded = fromBinary(urlencoded);
    let allowed = false;
    let channel;


    if (urldecoded.startsWith('http://')) {
        res.redirect('/api/proxy/' + urlencoded);
        console.log("redirecting to http");
        return;
    }

    r.cs.forEach((c) => {
        if (c.uri == '/api/proxy/' + toBinary(urldecoded) || c.uri == '/api/proxy_s/' + toBinary(urldecoded)) {
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
            res.send(res.statusCode);
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
    });

});

router.get('/#', (req, res) => {
    res.redirect('/wall');
});

api.use("/api", router);
export const handler = serverless(api);