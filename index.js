
const express = require('express');
const fs = require('fs');
const countryjs = require('i18n-iso-countries');
const xml2js = require('xml2js');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
const app = express();
const port = 3000;


let languageIndex = 0;
let categoryIndex = 0;
let search = '';

let links = [
'<!-- Video.js base CSS -->',
'<link href="https://unpkg.com/video.js@7/dist/video-js.min.css" rel="stylesheet">',
'<!-- City -->',
'<link href="https://unpkg.com/@videojs/themes@1/dist/city/index.css" rel="stylesheet">',
'<!-- Fantasy -->',
'<link href="https://unpkg.com/@videojs/themes@1/dist/fantasy/index.css" rel="stylesheet">',
'<!-- Forest -->',
'<link href="https://unpkg.com/@videojs/themes@1/dist/forest/index.css" rel="stylesheet">',
'<!-- Sea -->',
'<link href="https://unpkg.com/@videojs/themes@1/dist/sea/index.css" rel="stylesheet">',
'<!-- Style.css -->',
'<link href="style.css" rel="stylesheet">'
];

let languages = [
    'none', 'sq', 'ar', 'az', 'bn', 'bg',
    'ca',   'zh', 'hr', 'cs', 'da', 'nl',
    'en',   'et', 'fi', 'fr', 'ka', 'de',
    'el',   'he', 'hi', 'hu', 'ia', 'ga',
    'it',   'ja', 'kk', 'ko', 'lo', 'lv',
    'lt',   'mk', 'ml', 'mt', 'mo', 'cn',
    'no',   'pl', 'pt', 'ro', 'ru', 'gd',
    'sr',   'sh', 'sk', 'sl', 'es', 'sv',
    'ta',   'th', 'tr', 'uk', 'ur', 'vi',
    'cy'
  ];
let categories = ["Web TV", "Web Radio", "Web Cam", "Web Programmes"];
let channels = [];
let channel = { uri: '', name: '', language: '', category: '' };
let countryNames = [];

let hasLoaded = false;

function stickyHeader(){
        //Deserialize channels.csv to channels array
    fs.open('channels.csv', 'r', (err, fd) => {
        if(err) {
            fs.readFile('channels.xml', 'utf-8', (err, data) => {
                if(err) {
                    console.log(err);
                } else {
                    xml2js.parseString(data, (err, result) => {
                        if(err) {
                            console.log(err);
                        } else {
                            result.channels_groups.language.forEach((lang) => {
                                languages.push(lang.$.id);
    
                                for(let i = 0; i < lang.channels_group.length; i++) {
                                    let group = lang.channels_group[i];
                                    let xml = new XMLHttpRequest();
                                    xml.open("GET", group.$.uri, false);
                                    xml.send();
                                    let channelsLines = xml.responseText;
                                    let lines = channelsLines.split('\n');
                                    let name = '';
                                    for(let j = 0; j < lines.length; j++) {
                                        let line = lines[j];
                                        if(line.startsWith('http')) {
                                            channel = { uri: '', name: '', language: '', category: '' };
                                            channel.uri = line;
                                            channel.language = lang.$.id;
                                            channel.name = name;
    
                                            if(group.$._name.startsWith("Web TV")) {
                                                channel.category = "Web TV";
                                            }
                                            if(group.$._name.startsWith("Web Radio")) {
                                                channel.category = "Web Radio";
                                            }
                                            if(group.$._name.startsWith("Web Cam")) {
                                                channel.category = "Web Cam";
                                            }
                                            if(group.$._name.startsWith("Web Programmes")) {
                                                channel.category = "Web Programmes";
                                            }
                                            channels.push(channel);
                                        } else {
                                            name = line.split(',')[1];
                                        }
                                    }
                                }                         
                            });
                        }
                    });
                }
            });
        } else {
            fs.readFile('channels.csv', 'utf-8', (err, data) => {
                if(err) {
                    console.log(err);
                } else {
                    let lines = data.split('\n');
                    lines.forEach((line) => {
                        let parts = line.split(',');
                        if(parts.length == 4) {
                            channel = { uri: '', name: '', language: '', category: '' };
                            channel.language = parts[0];
                            channel.category = parts[1];
                            channel.name = parts[2];
                            channel.uri = parts[3];
                            channels.push(channel);
                        }
                    });
                }
            });

            hasLoaded = true;
        }
    });
    
    let html = '';
    html += '<div>';
    html += '<h1>Free Tux TV Wall</h1>';
    html += '<p>Free Tux TV Wall is a collection of free Web TV, Web Radio and Web Cam channels from around the world. The channels are organized by language and category. Enjoy!</p>';
    html += '</div>';
    html += '<div style="display: flex; justify-content: center;">';
    html += '<form action="/" method="get">';
    html += '<label for="language">Language:</label>';
    html += '<select name="language" id="language" onchange="languageIndex = this.selectedIndex;">';
    countryName = {name: '', code: ''};
    countryNames = [];
    let regionnames = new Intl.DisplayNames("en", {type: 'region'});
    let locale = new Intl.Locale("en", {type: 'country', script: 'Latn'}); 
    languages.forEach((lang) => {
        // <option value="es">Spain</option>
        if(lang == 'none') {
            countryName = {name: '', code: ''};
            countryName.name = 'No lang Web TV and Radio';
            countryName.code = lang;
            countryNames.push(countryName);
        } else {       
            countryName = {name: '', code: ''};            
            //country name from country code using locale
            let code = new Intl.DisplayNames("en", {type: 'language'});
            countryName.name = code.of(lang);
            countryName.code = lang;
            countryNames.push(countryName);
        }
    });
    countryNames.sort();
    languages = [];
    countryNames.forEach((cn) => {
        html += '<option value="' + cn.code + '">' + cn.name + '</option>';
        languages.push(cn.code);
    });
    html += '</select>';
    //spacer
    html += '<label for="spacer"> </label>';

    html += '<label for="category">Category:</label>';
    html += '<select name="category" id="category" onchange="categoryIndex = this.selectedIndex;">';
    categories.forEach((cat) => {
        html += '<option value="' + cat + '">' + cat + '</option>';
    });
    html += '</select>';
    html += '<input type="submit" value="Submit">';
    html += '</form>';
    html += '<form action="/" method="get">';
    html += '<label for="search">Channel Name:</label>';
    html += '<input type="text" id="search_box" name="search_box" onchange="search = document.getElementById(\'search_box\').value;" />';
    html += '<input value="Search" type="submit" />';
    html += '</form>';
    html += '</div>';
    return html;
}

function footer(){
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

function new_render(){
    let html = '';
    if(channels.length == 0) {
        return html;
    }
    html += '<table>';
    html += '<tr><th>Channel</th><th>URI</th></tr>';
    channels.forEach((channel) => {
        if(search != '' && channel.name.toLowerCase().includes(search.toLowerCase())) {
            html += '<tr>';
            html += '<td>' + channel.name + '</td>';
            html += '<td>';
            html += '<video id="my-video" class="video-js" controls preload="auto" width="640" height="264" data-setup="{}">';
            html += '<source src="' + channel.uri + '" type="application/x-mpegURL" />';
            html += '<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>';
            html += '</video>';
            html += '</td>';
            html += '</tr>';            
        } else {
            if(channel.language == languages[languageIndex] && channel.category == categories[categoryIndex]){
                html += '<tr>';
                html += '<td>' + channel.name + '</td>';
                html += '<td>';
                html += '<video id="my-video" class="video-js" controls preload="auto" width="640" height="264" data-setup="{}">';
                html += '<source src="' + channel.uri + '" type="application/x-mpegURL" />';
                html += '<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>';
                html += '</video>';
                html += '</td>';
                html += '</tr>';
            }
        }

    });
    html += '</table>';
    return html;
}

app.get('/', (req, res) => {
    
    if(req.query.language) {
        languageIndex = languages.indexOf(req.query.language);
    } else {
        languageIndex = 0;
    }

    if(req.query.category) {
        categoryIndex = categories.indexOf(req.query.category);
    } else {
        categoryIndex = 0;
    }

    if(req.query.search_box) {
        search = req.query.search_box;
        languageIndex = -1;
        categoryIndex = -1;
    } else {
        search = '';
    }


    html =  '<html><head>{{links}}<title>{{title}}</title></head>';
    html += '<body>';
    html += '   <div id="header" class="header">';
    html += '       {{header}}';
    html += '   </div>';

    if(channels.length > 0) {
        html += '   <div class="content-wrapper">';    
        html += '       <div class="content">';
        html += '          {{table}}';
        html += '       </div>';
        html += '   </div>';
    } else  {
        html += '   <div class="content-wrapper">';
        html += '       <div class="content">';
        html += '           <p>Ready to load channels...</p>';
        html += '       </div>';
        html += '   </div>';
    }

    html += '   <div class="footer">';
    html += '       {{footer}}';
    html += '   </div>';
    html += '   <script src="https://vjs.zencdn.net/8.16.1/video.min.js"></script>';
    html += '</body>';
    html += '</html>';

    html = html.replace('{{title}}', 'Free Tux TV Wall');
    html = html.replace('{{header}}', stickyHeader());
    html = html.replace('{{links}}', links.join('')+'<link href="https://vjs.zencdn.net/8.16.1/video-js.css" rel="stylesheet" />');
    if(channels.length > 0) {
        html = html.replace('{{table}}', new_render());
    } else {
        html = html.replace('{{table}}', '');
    }
    html = html.replace('{{footer}}', footer());

    console.log("Language Index: "+languageIndex);
    console.log("Category Index: "+categoryIndex);
    console.log("Search: "+search);

    if(channels.length > 0) {
        fs.writeFile('channels.csv', '', (err) => {
            if(err) {
                console.log(err);
            } else {
                channels.forEach((channel) => {
            //Serialize channel to CSV
                    fs.appendFile('channels.csv', channel.language + ',' + channel.category + ',' + channel.name + ',' + channel.uri + '\n', (err) => {
                        if(err) {
                            console.log(err);
                        }
                    });
                });
            }
        });    
    }
    res.send(html);
});

app.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/style.css');    
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
