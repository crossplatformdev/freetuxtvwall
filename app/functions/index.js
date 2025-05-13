const http = require('http');
const https = require('https');
const { urlencoded, default: e } = require('express');
const fs = require('fs');
const xml2js = require('xml2js');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const VideoPlayer = require("@hosseintaromi/video_player");
import { channel } from 'diagnostics_channel';
import { loadM3U } from './load';
import { url } from 'inspector';
let languageIndex = 0;
let categoryIndex = 0;
let search = '';

let links = [
    '<link href="https://vjs.zencdn.net/8.16.1/video-js.css" rel="stylesheet" />',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.js" integrity="sha512-+k1pnlgt4F1H8L7t3z95o3/KO+o78INEcXTbnoJQ/F2VqDVhWoaiVml/OEHv9HsVgxUaVW+IbiZPUJQfF/YxZw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/video.js/8.21.1/video.min.js" integrity="sha512-4ojVomDWDnx2FZyOK/eVZCTut+02zggocT1Cj8S7Y/E31ozUWlU0vZ5+rzVyy+hKZCG6Gt9RJ9elOMS70LBRtQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
    '<!-- Video.js base CSS -->',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/video.js/8.21.1/video-js.min.css" integrity="sha512-eAxdlYVdHHB5//MPUJMimVOM0OoKa3I1RWCnrqvzwri3u5+RBdB6d0fdBsEOj78PyomrHR3+E3vy0ovoVU9hMQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />',
    '<!-- City -->',
    '<link href="https://unpkg.com/@videojs/themes@1/dist/city/index.css" rel="stylesheet">',
    '<!-- Fantasy -->',
    '<link href="https://unpkg.com/@videojs/themes@1/dist/fantasy/index.css" rel="stylesheet">',
    '<!-- Forest -->',
    '<link href="https://unpkg.com/@videojs/themes@1/dist/forest/index.css" rel="stylesheet">',
    '<!-- Sea -->',
    '<link href="https://unpkg.com/@videojs/themes@1/dist/sea/index.css" rel="stylesheet">',
    '<!-- Style.css -->',
    '<link href="/api/public/stylesheets/style.css" rel="stylesheet" type="text/css">',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/video.js/8.21.1/video-js.min.css" integrity="sha512-eAxdlYVdHHB5//MPUJMimVOM0OoKa3I1RWCnrqvzwri3u5+RBdB6d0fdBsEOj78PyomrHR3+E3vy0ovoVU9hMQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />',
    '<!-- Dash.js -->',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/dashjs/4.7.4/dash.all.min.js" integrity="sha512-LyDgm9kfqyKlZOe+QjpNA6L/ZpcjNj+cKSJ/bQLTGkKXaxYNpYGN9Fe6DpI0H0w3Da2WcXVX8ACjL14y3iWGBQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
    '<!-- videojs-contrib-dash script -->',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/videojs-contrib-dash/5.1.1/videojs-dash.min.js" integrity="sha512-jmpCwJ7o9/MxR36dZX+SQc4Ta2PDvMwM5MHmW0oDcy/UzkuppIj+F9FiN+UW/Q8adlOwb5Tx06zHsY/7yg4OYg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
    '<link rel="stylesheet" href="//code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.css">',
    '<script src="//code.jquery.com/jquery-1.10.2.js"></script>',
    '<script src="//code.jquery.com/ui/1.11.2/jquery-ui.js"></script>',
    '<link rel="icon" type="image/png" href="/public/images/favicon.png"/>',
    '<script src="/api/public/javascripts/webplayer.min.js" type="text/javascript"></script>',
    '<script async type="text/javascript" src="https://unpkg.com/@eyevinn/web-player-component@latest/dist/web-player.component.js"></script>'
];

const channels_csv = 'public/assets/channels.csv';
const channels_xml = 'public/assets/channels.xml';

let languages = [
    'none', 'sq', 'ar', 'az', 'bn', 'bg',
    'ca', 'zh', 'hr', 'cs', 'da', 'nl',
    'en', 'et', 'fi', 'fr', 'ka', 'de',
    'el', 'he', 'hi', 'hu', 'ia', 'ga',
    'it', 'ja', 'kk', 'ko', 'lo', 'lv',
    'lt', 'mk', 'ml', 'mt', 'mo', 'cn',
    'no', 'pl', 'pt', 'ro', 'ru', 'gd',
    'sr', 'sh', 'sk', 'sl', 'es', 'sv',
    'ta', 'th', 'tr', 'uk', 'ur', 'vi',
    'cy'
];
let categories = ["Web TV", "Web Radio", "Web Cam", "Web Programmes"];
let countryNames = [];

let hasLoaded = false;

export const errorCodes = [
    "400",
    "401",
    "402",
    "403",
    "404",
    "405",
    "406",
    "407",
    "408",
    "409",
    "410",
    "411",
    "412",
    "413",
    "414",
    "415",
    "416",
    "417",
    "418",
    "419",
    "420",
    "421",
    "422",
    "423",
    "424",
    "425",
    "426",
    "427",
    "428",
    "429",
    "431",
    "451",
    "500",
    "501",
    "502",
    "503",
    "504",
    "505",
    "506",
    "507",
    "508",
    "509",
    "510",
    "511",
    "520",
];

export async function readChannels() {
    console.log("Reading channels.csv...");
    let cs = [];
    let us = [];
    /*
    fs.readFile(channels_csv, 'utf-8', (err, data) => {
        if(err) {
            console.log(err);
        } else {
            let lines = data.split('\n');
            lines.forEach((line) => {
                if(line != '') {
                    let parts = line.split(',');
                    for(let i = 0; i < parts.length; i++) {
                        parts[i] = parts[i].replaceAll('\n', '').replaceAll('\r', '');
                    }

                    console.log(parts);
                    console.log(parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + parts[3] + ',' + parts[4] + ',' + parts[5]);

                    if(!errorCodes.includes(parts[5]) && !parts[4].includes("text/html") || !parts[4].includes("text/plain")){
                        //console.log(parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + parts[3] + ',' + parts[4] + ',' + parts[5]);
                        //tr,Web Radio,NAZİLLİ RADYO ÖZDEN,http://live.radyotvonline.com:9050,audio/mpegurl; charset=utf-8,200

                        let channel = { language: parts[0], category: parts[1], name: parts[2], uri: parts[3], type: parts[4] };
                        
                        if(channel.category.includes('Web TV')) {
                            channel.category = 'Web TV';
                        }
                        if(channel.category.includes('Web Radio')) {
                            channel.category = 'Web Radio';
                        }
                        if(channel.category.includes('Web Cam')) {
                            channel.category = 'Web Cam';
                        }
                        if(channel.category.includes('Web Programmes')) {
                            channel.category = 'Web Programmes';
                        }

                        //guess content type from extension
                        let filename = channel.uri.split('.');
                        let ext = filename[filename.length - 1];

                        //console.log(channel.uri);
                        if(!us.includes(channel.uri)) {                     
                            if(channel.uri.startsWith('http://') || channel.uri.startsWith('https://')) {
                                //console.log(channel);
                                us.push(channel.uri);
                                if(channel.uri.startsWith('https://')) {
                                    //channel.uri = '/api/proxy_s/' + toBinary(channel.uri);    
                                } else if(channel.uri.startsWith('http://')) {
                                    channel.uri = 'https://freetuxtvwall.netlify.app/api/proxy/' + toBinary(channel.uri);
                                }
                                cs.push(channel);
                                hasLoaded = true;
                            }
                        }
                        
                    } 
                } 
            });
        }
    });
    */

    let lines = await loadM3U();
    console.log("Lines: " + lines);
    console.log("Lines length: " + lines.length);

    lines.split('\n').forEach((line) => {
        if (line != '') {
            let parts = line.split(',');
            for (let i = 0; i < parts.length; i++) {
                parts[i] = parts[i].replaceAll('\n', '').replaceAll('\r', '');
            }

            console.log(parts);
            console.log(parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + parts[3] + ',' + parts[4] + ',' + parts[5]);

            if (!errorCodes.includes(parts[5]) && !parts[4].includes("text/html") || !parts[4].includes("text/plain")) {
                //console.log(parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + parts[3] + ',' + parts[4] + ',' + parts[5]);
                //tr,Web Radio,NAZİLLİ RADYO ÖZDEN,http://live.radyotvonline.com:9050,audio/mpegurl; charset=utf-8,200

                let channel = { language: parts[0], category: parts[1], name: parts[2], uri: parts[3], type: parts[4] };

                if (channel.category.includes('Web TV')) {
                    channel.category = 'Web TV';
                }
                if (channel.category.includes('Web Radio')) {
                    channel.category = 'Web Radio';
                }
                if (channel.category.includes('Web Cam')) {
                    channel.category = 'Web Cam';
                }
                if (channel.category.includes('Web Programmes')) {
                    channel.category = 'Web Programmes';
                }

                //guess content type from extension
                let filename = channel.uri.split('.');
                let ext = filename[filename.length - 1];

                //console.log(channel.uri);
                if (!us.includes(channel.uri)) {
                    if (channel.uri.startsWith('http://') || channel.uri.startsWith('https://')) {
                        //console.log(channel);
                        us.push(channel.uri);
                        if (channel.uri.startsWith('https://')) {
                            //channel.uri = '/api/proxy_s/' + toBinary(channel.uri);    
                        } else if (channel.uri.startsWith('http://')) {
                            //channel.uri = 'https://freetuxtvwall.netlify.app/api/proxy/' + toBinary(channel.uri);
                        }
                        cs.push(channel);
                        hasLoaded = true;
                    }
                }
            }
        }
    });

    return { cs: cs, us: us };
}

export function pushChannel(url) {
    if (!r.us.includes(url)) {
        r.us.push(url);
        r.cs.push({ uri: url });
    }
}
// convert a UTF-8 string to a string in which
// each 16-bit unit occupies only one byte
export function toBinary(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

export function fromBinary(str) {
    console.log(str);
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function stickyHeader(req, res) {
    let html = '';
    html += '<div>';
    html += '<h1><a href="/">Free Tux TV Wall</a></h1>';
    html += '<p>Free Tux TV Wall is a collection of free Web TV, Web Radio and Web Cam channels from around the world. The channels are organized by language and category. Enjoy!</p>';
    html += '</div>';
    html += '<div style="display: flex; justify-content: center;">';
    html += "<form id='form1' method=\"get\" >";
    html += '<label for="language">Language:</label>';
    html += '<select id="language" onchange="languageIndex = this.selectedIndex && form1OnChange();">';
    countryName = { name: '', code: '' };
    countryNames = [];
    let regionnames = new Intl.DisplayNames("en", { type: 'region' });
    let locale = new Intl.Locale("en", { type: 'country', script: 'Latn' });
    languages.forEach((lang) => {
        // <option value="es">Spain</option>
        if (lang == 'none') {
            countryName = { name: '', code: '' };
            countryName.name = 'No lang Web TV and Radio';
            countryName.code = lang;
            countryNames.push(countryName);
        } else {
            countryName = { name: '', code: '' };
            //country name from country code using locale
            let code = new Intl.DisplayNames("en", { type: 'language' });
            countryName.name = code.of(lang);
            countryName.code = lang;
            countryNames.push(countryName);
        }
    });
    countryNames.sort();
    languages = [];
    let i = 0;
    countryNames.forEach((cn) => {
        if (i == languageIndex) {
            html += '<option value="' + cn.code + '" selected>' + cn.name + '</option>';
        } else {
            html += '<option value="' + cn.code + '">' + cn.name + '</option>';
        }
        i++;
        languages.push(cn.code);
    });
    html += '</select>';
    //spacer
    html += '<label for="spacer"> </label>';

    html += '<label for="category">Category:</label>';
    html += '<select id="category" onchange="categoryIndex = this.selectedIndex && form1OnChange();">';
    let j = 0;
    categories.forEach((cat) => {
        if (j == categoryIndex) {
            html += '<option value="' + cat + '" selected>' + cat + '</option>';
        } else {
            html += '<option value="' + cat + '">' + cat + '</option>';
        }
        j++;
    });
    html += '</select>';
    html += '<input type="submit" value="Submit"/>';
    html += '</form>';
    html += '<script> function form1OnChange() { var lang = document.getElementById(\'language\').selectedIndex; var cat = document.getElementById(\'category\').selectedIndex; document.getElementById(\'form1\').action = \'/api/wall/lang/\'+ lang + \'/cat/\' + cat; } form1OnChange(); </script>';
    html += "<form id='form2' method=\"get\" >";
    html += '<label for="search">Channel Name:</label>';
    html += '<input type="text" type="search" id="search_box" onchange="javascript:form2OnChange()" />';
    html += '<input value="Search" type="submit" />';
    html += '</form>';
    html += '<script> function form2OnChange() { var search = document.getElementById(\'search_box\').value; var sb = document.getElementById(\'form2\').action = \'/api/wall/search/\'+ btoa(encodeURIComponent(search).replace(/%([0-9A-F]{2})/g,function toSolidBytes(match, p1) {return String.fromCharCode(\'0x\' + p1);})); } form2OnChange(); </script>';

    var availableTags = '[';

    r.cs.forEach((channel) => {
        availableTags += '"' + channel.name + '",';
    });
    availableTags = availableTags.endsWith(',') ? availableTags.slice(0, -1) : availableTags;
    availableTags += ']';



    html += '<script> $("#search_box").autocomplete({ source: ' + availableTags + '  }) </script>';
    html += '</div>';
    return html;
}

function footer() {
    let html = '<div>';
    html += '   <p style="text-align:center;">';
    html += '   This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.';
    html += '   <br />';
    html += '   <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">';
    html += '       <img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" />';
    html += '   </a>';
    html += '   </p>';
    html += '</div>';
    return html;
}

function new_render() {
    let table = '';
    let grid_counter = 0;
    let grid_cells = 5;
    table += '<table>';
    //table += '<tr><th>Channel</th><th>URI</th></tr>';
    let counter = 0;
    let acc = 0;
    let begin = true;
    r.cs.forEach((channel) => {
        try {

            if (begin) {
                table += '<tr>';
                begin = false;
                acc += counter;
                counter = 0;
            }

            if (search != '' && channel.name.toLowerCase().includes(search.toLowerCase())) {
                let row = '';
                row = renderChannel(row, channel, acc+counter, true);
                table += row;
                counter++;
            } else {
                if (channel.language == languages[languageIndex] && channel.category == categories[categoryIndex]) {
                    let row = '';
                    row = renderChannel(row, channel, acc+counter, false);
                    table += row;
                    counter++;
                }
            }

           
            if (counter >= grid_cells) {
                table += '</tr>';
                counter = 0;
                begin = true;
            }

        } catch (err) {
            console.log(err);
        }
    });
    table += '</table>';
    return table;
}

function renderChannel(render, ch, counter, search) {
    //try ch.uri with http and https
    let error = false;
    if (ch.uri.startsWith('http://')) {
        //Get status code
        const options = {
            method: 'HEAD',
            url: ch.uri,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        };
        http.get(ch.uri, (res) => {
            console.log('statusCode:', res.statusCode);
            if (errorCodes.includes(res.statusCode.toString())) {
                console.log('Error: ' + res.statusCode);
                error = true;
            }
        }).on('error', (e) => {
            console.error(e);
            console.log('Error: ' + e.message);
            error = true;
        });
    } else if (ch.uri.startsWith('https://')) {
        //Get status code
        const options = {
            method: 'HEAD',
            url: ch.uri,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        };
        https.get(ch.uri, (res) => {
            console.log('statusCode:', res.statusCode);
            if (errorCodes.includes(res.statusCode.toString())) {
                conserrorCole.log('Error: ' + res.statusCode);
                error = true;
            }
        }).on('error', (e) => {
            console.error(e);
            console.log('Error: ' + e.message);
            error = true;
        });
    }

    if (!error) {
        let selector = 'video_' + counter;
        if(search) {
            render += '<td  style="height:540px;width:720;">';
        } else {
            render += '<td  style="height:200px;width:384px;">';
        }
        let videorender = '<div id="' + selector + '" > \
        <eyevinn-video source='+ch.uri+' muted"></eyevinn-video> \
        </div>';
        render += '<p><a href="/api/wall/search/'+toBinary(ch.name)+'">' + ch.name.toUpperCase() + '</a></p>';

        let videoJS = "<script> \
                        document.addEventListener('DOMContentLoaded', function(event) { \
                            const player = webplayer(document.querySelector(\"#"+ selector + "\")); \
                            try { player.load(\""+ ch.uri + "\").then((event)=>{player.pause();}); } catch { console.log('-');} \
                        }); \
                    </script>";
        render += videorender;
        //render += videoJS;
        render += '</td>';
    }
    return render;
}

export let r = { cs: [], us: [] };

export async function main(req, res) {
    r = await readChannels();
    channels = r.cs;
    urls = r.us;

    if (undefined != req.params.language) {
        if ('string' == typeof req.params.language) {
            req.params.language = req.params.language.replaceAll('?', '');
            languageIndex = parseInt(req.params.language);
        } else if ('number' == typeof req.params.language) {
            languageIndex = req.params.language;
        }
        search = '';
    } else {
        languageIndex = 12;
    }

    if (undefined != req.params.category) {
        if ('string' == typeof req.params.category) {
            req.params.category = req.params.category.replaceAll('?', '');
            categoryIndex = parseInt(req.params.category);
        } else if ('number' == typeof req.params.category) {
            categoryIndex = req.params.category;
        }
        search = '';
    } else {
        categoryIndex = 0;
    }

    if (undefined != req.params.search_box) {
        if ('string' == typeof req.params.search_box) {
            search = fromBinary(req.params.search_box);
            categoryIndex = -1;
            languageIndex = -1;
        }
    }

    console.log("Language Index: " + languageIndex);
    console.log("Category Index: " + categoryIndex);
    console.log("Search: " + search);

    let html = '<html><head>{{links}}<title>{{title}}</title><meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"></head>';
    html += '<body>';
    html += '   <div id="header" class="header">';
    html += '       {{header}}';
    html += '   </div>';
    html += '   <div class="content-wrapper">';
    html += '       <div class="content">';
    if (r.cs.length != 0) {
        html += '          {{table}}';
    } else {
        html += '           <p>Ready to load channels...</p>';
    }
    html += '       </div>';
    html += '   </div>';
    html += '   <div class="footer">';
    html += '       {{footer}}';
    html += '   </div>';
    html += '</body>';
    html += '</html>';

    html = html.replace('{{title}}', 'Free Tux TV Wall');
    html = html.replace('{{header}}', stickyHeader(req, res));
    html = html.replace('{{links}}', links.join(''));
    if (r.cs.length > 0) {
        html = html.replace('{{table}}', new_render());
    }
    html = html.replace('{{footer}}', footer());
    res.send(html);
}

//module.exports = main;