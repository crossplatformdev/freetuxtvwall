import express from "express";
import http from "http";
import router from './routes/index';
import serverless from "serverless-http";
import { channels, main, readChannels } from "./functions/index";
import * as XMLHttpRequest from "xmlhttprequest";
import fs from "fs";
import { exec } from "child_process";
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
    let urldecoded = decodeURIComponent(urlencoded);
    
    let allowed = false;
    let ch;
    console.log(urldecoded);

    if(channels.length < 10) {
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
    try {
        http.get(urldecoded, (response) => {
            if(undefined != response.statusCode) {
                if (response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 304) {
                    console.log("Got response: " + res.statusCode);
                    res.header('Content-Type', response.headers['content-type']);
                    response.on('data', (chunk) => {
                        result += chunk;
                    });
                } 
                
                if (response.statusCode > 304) {
                    res.redirect(404, '/404');
                    return;
                }
            }   
        });
    } catch (error) {
        console.log(error);
        res.redirect(404, '/404');
        return;
    }

    res.send(result);
});

api.use("/api/", router);

readChannels();

export const handler = serverless(api);

