const http = require('http');
const { urlencoded } = require('express');
const fs = require('fs');
const xml2js = require('xml2js');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let languageIndex = 0;
let categoryIndex = 0;
let search = '';

let links = [
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
    '<link href="/public/stylesheets/style.css" rel="stylesheet" type="text/css">',    
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/video.js/8.21.1/video-js.min.css" integrity="sha512-eAxdlYVdHHB5//MPUJMimVOM0OoKa3I1RWCnrqvzwri3u5+RBdB6d0fdBsEOj78PyomrHR3+E3vy0ovoVU9hMQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />',
    '<!-- Dash.js -->',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/dashjs/4.7.4/dash.all.min.js" integrity="sha512-LyDgm9kfqyKlZOe+QjpNA6L/ZpcjNj+cKSJ/bQLTGkKXaxYNpYGN9Fe6DpI0H0w3Da2WcXVX8ACjL14y3iWGBQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
    '<!-- videojs-contrib-dash script -->',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/videojs-contrib-dash/5.1.1/videojs-dash.min.js" integrity="sha512-jmpCwJ7o9/MxR36dZX+SQc4Ta2PDvMwM5MHmW0oDcy/UzkuppIj+F9FiN+UW/Q8adlOwb5Tx06zHsY/7yg4OYg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
    '<link rel="stylesheet" href="//code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.css">',
    '<script src="//code.jquery.com/jquery-1.10.2.js"></script>',
    '<script src="//code.jquery.com/ui/1.11.2/jquery-ui.js"></script>',
    '<link rel="icon" type="image/png" href="/public/images/favicon.png"/>'

    ];

const channels_csv = 'public/assets/channels.csv';
const channels_xml = 'public/assets/channels.xml';

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
export let channels = [];
let urls = [];
let channel = { uri: '', name: '', language: '', category: '', type: '' };
let countryNames = [];

let hasLoaded = false;

export function readChannels(){
    console.log("Reading channels.csv...");
    try{
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
                        channel = { language: parts[0], category: parts[1], name: parts[2], uri: parts[3], type: ''};
                        
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

                        if(ext == 'm3u8') {
                            channel.type = 'application/x-mpegURL';
                        } else if(ext == 'mpd') {
                            channel.type = 'application/dash+xml';
                        } else if(ext == 'mp4') {
                            channel.type = 'video/mp4';
                        } else if(ext == 'webm') {
                            channel.type = 'video/webm';
                        } else if(ext == 'ogg') {
                            channel.type = 'video/ogg';
                        } else if(ext == 'flv') {
                            channel.type = 'video/x-flv';
                        } else if(ext == 'avi') {
                            channel.type = 'video/x-msvideo';
                        } else if(ext == 'wmv') {
                            channel.type = 'video/x-ms-wmv';
                        } else if(ext == 'mkv') {
                            channel.type = 'video/x-matroska';
                        } else if(ext == 'mov') {
                            channel.type = 'video/quicktime';
                        } 

                        
                        if(!urls.includes(channel.uri)) {                     

                            //console.log(channel);
                            channels.push(channel);
                            urls.push(channel.uri);
                            hasLoaded = true;
                        }
                    
                    }
                });
            }
        });
        console.log("Total channels: "+channels.length);
    } catch(err) {
        console.log(err);
    }
}

function stickyHeader(req, res){
    let html = '';
    html += '<div>';
    html += '<h1>Free Tux TV Wall</h1>';
    html += '<p>Free Tux TV Wall is a collection of free Web TV, Web Radio and Web Cam channels from around the world. The channels are organized by language and category. Enjoy!</p>';
    html += '</div>';
    html += '<div style="display: flex; justify-content: center;">';
    html += "<form id='form1' method=\"get\" >";
    html += '<label for="language">Language:</label>';
    html += '<select id="language" onchange="languageIndex = this.selectedIndex && form1OnChange();">';
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
    html += '<select id="category" onchange="categoryIndex = this.selectedIndex && form1OnChange();">';
    categories.forEach((cat) => {
        html += '<option value="' + cat + '">' + cat + '</option>';
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
    html += '<script> function form2OnChange() { var search = document.getElementById(\'search_box\').value; var sb = document.getElementById(\'form2\').action = \'/api/wall/search/\'+ window.btoa(search); } form2OnChange(); </script>';

    var availableTags = '[';

    channels.forEach((channel) => {
        availableTags += '"'+channel.name+'",';
    });
    availableTags = availableTags.endsWith(',') ? availableTags.slice(0, -1) : availableTags;
    availableTags += ']';



    html += '<script> $("#search_box").autocomplete({ source: '+availableTags+'  }) </script>';
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
    let table = '';

    table += '<table>';
    table += '<tr><th>Channel</th><th>URI</th></tr>';
    let counter = 0;
    channels.forEach((channel) => {
        try{
            if(search != '' && channel.name.toLowerCase().includes(search.toLowerCase())) {
                let row = '';
                row = renderChannel(row, channel, counter);            
                table += row;
                counter++;
            } else {
                if(channel.language == languages[languageIndex] && channel.category == categories[categoryIndex]){
                    let row = '';
                    row = renderChannel(row, channel, counter);            
                    table += row;
                    counter++;
                }
            }
        } catch(err) {
            console.log(err);
        }
    });
    table += '</table>';
    return table;
}

function renderChannel(render, channel, counter) {

    if(!channel.uri.includes('https')) {
        //http request to channel.uri to get the type and status
        try {
            //you need to run in a higher memory lambda runtime.
            
            http.get(channel.uri, (res) => {
                if(res.statusCode == 413) {
                    return render;
                }
                //If 200 or redirect
                if(res.statusCode == 200 || res.statusCode == 301 || res.statusCode == 302 || res.statusCode == 303 || res.statusCode == 307 || res.statusCode == 308) {
                    let type = res.headers['content-type'];
                    if(type != undefined) {
                        channel.type = type;
                    } 
                    
                } else {
                    console.log("URI: "+channel.uri+" Status: "+res.statusCode);
                }
            });
        
            //we pass it through our proxy
            channel.uri = 'https://freetuxtvwall.netlify.app/api/proxy/' + encodeURIComponent(channel.uri);
    
        } catch(err) {
            console.log("URI: "+channel.uri);
            console.log(err);
        }
    }

    let selector = 'video_'+counter;

    render += '<tr>';
    render += '<td>' + channel.name.toUpperCase() + '</td>';
    render += '<td>';

    let videorender = '<video id="'+selector+'" class="video-js vjs-default-skin vjs-big-play-centered" controls preload="auto" width="960" height="640" data-setup="{}">';
    videorender += '<source src="'+channel.uri+'" type="'+channel.type+'">';
    videorender += '</video>';
    let videoJS = '<script>var player = videojs("'+selector+'");</script>';


    render += videorender;
    render += videoJS;
    render += '</td>';
    render += '</tr>';
    //console.log(render);
    return render;
}

export function main(req, res){
    //null or undef
    if(undefined != req.params.language) {
        if('string' == typeof req.params.language) {
            req.params.language = req.params.language.replaceAll('?', '');
            languageIndex = parseInt(req.params.language);
        } else if('number' == typeof req.params.language) {
            languageIndex = req.params.language;
        }
        search = '';
    } else {
        languageIndex = 0;
    }

    if(undefined != req.params.category) {
        if('string' == typeof req.params.category) {
            req.params.category = req.params.category.replaceAll('?', '');
            categoryIndex = parseInt(req.params.category);
        } else if('number' == typeof req.params.category) {
            categoryIndex = req.params.category;
        }           
        search = '';      
    } else {
        categoryIndex = 0;
    }
    if(undefined != req.params.search_box) {     
        if('string' == typeof req.params.search_box) {
            req.params.search_box = atob(req.params.search_box).replaceAll('?', '');
            search = req.params.search_box;
            categoryIndex = -1;
            languageIndex = -1;
        } 
    } 

    
    console.log("Language Index: "+languageIndex);
    console.log("Category Index: "+categoryIndex);
    console.log("Search: "+search);
    

    if(channels.length < 10) {
        readChannels();
    }
    
    let html =  '<html><head>{{links}}<title>{{title}}</title></head>';
    html += '<body>';
    html += '   <div id="header" class="header">';
    html += '       {{header}}';
    html += '   </div>';
    html += '   <div class="content-wrapper">';    
    html += '       <div class="content">';
    if(channels.length != 0) {
        html += '          {{table}}';        
    } else  {
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
    html = html.replace('{{links}}', links.join('')+'<link href="https://vjs.zencdn.net/8.16.1/video-js.css" rel="stylesheet" />');
    if(channels.length != 0) {
        html = html.replace('{{table}}', new_render());
    } 
    html = html.replace('{{footer}}', footer());
    res.send(html);
}

//module.exports = main;