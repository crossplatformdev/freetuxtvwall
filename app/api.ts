import express from "express";
import router from './routes/index';
import serverless from "serverless-http";
import * as XMLHttpRequest from "xmlhttprequest";
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import { channels, main, readChannels } from "./functions/index";

const api = express();

router.get("/hello", (req, res) => {res.send("Hello World!") });
router.get("/wall", (req, res) => { main(req, res) });

router.get('/channels.csv', (req, res) => { 
    res.redirect('/public/assets/channels.csv');
});

router.get('/public/stylesheets/style.css', (req, res) => {
    res.redirect('/public/stylesheets/style.css');
});

router.get('/channels.xml', (req, res) => { 
    res.redirect('/public/assets/channels.xml');
});

router.get('/init', (req, res) => {
    try{
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
    } catch (error) {
        console.log(error);
    }
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
    let urldecoded = btoa(urlencoded);
    
    let allowed = false;
    let ch;

    if(channels.length == 0) {
        readChannels();
    }

    channels.forEach((channel) => {
        if(channel.uri === urldecoded) {
            console.log("urldecoded allowed");
            allowed = true;
            ch = channel;
        }
    });

    if(!allowed) {
        res.redirect(404, '/404');
        return;
    }

    //urldecoded = urldecoded.replaceAll('/api/proxy/', '');

    //urldecoded is a http url
    //we need to serve this url through https

    //run wget command to get the content of the url
    let result = '';
    http.get(urldecoded, (response) => {
        response.on('data', (chunk) => {
            result += chunk;
        });
        response.on('end', () => {
            res.send(result);
        });
    });
});

api.use("/api/", router);

readChannels();

export const handler = serverless(api);

