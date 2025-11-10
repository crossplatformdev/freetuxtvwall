const http = require('http');
const https = require('https');
const { urlencoded, default: e } = require('express');
const fs = require('fs');
const xml2js = require('xml2js');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const VideoPlayer = require("@hosseintaromi/video_player");
const { channel } = require('diagnostics_channel');
const { loadM3U } = require('./load');
const { url } = require('inspector');
//const mime = require('mime');
const mime = require('mime-types');

let languageIndex = 0;
let categoryIndex = 0;
let search = '';

let links = [
    '<link href="https://vjs.zencdn.net/8.16.1/video-js.css" rel="stylesheet" />',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.js" integrity="sha512-+k1pnlgt4F1H8L7t3z95o3/KO+o78INEcXTbnoJQ/F2VqDVhWoaiVml/OEHv9HsVgxUaVW+IbiZPUJQfF/YxZw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
    '<script src="https://cdn.jsdelivr.net/npm/video.js@8.22.0/dist/video.min.js"></script>',
    '<link href="https://cdn.jsdelivr.net/npm/video.js@8.22.0/dist/video-js.min.css" rel="stylesheet">',
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
    '<link href="/api/stylesheets/style.css" rel="stylesheet" type="text/css">',
    '<!-- Dash.js -->',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/dashjs/4.7.4/dash.all.min.js" integrity="sha512-LyDgm9kfqyKlZOe+QjpNA6L/ZpcjNj+cKSJ/bQLTGkKXaxYNpYGN9Fe6DpI0H0w3Da2WcXVX8ACjL14y3iWGBQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
    '<!-- videojs-contrib-dash script -->',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/videojs-contrib-dash/5.1.1/videojs-dash.min.js" integrity="sha512-jmpCwJ7o9/MxR36dZX+SQc4Ta2PDvMwM5MHmW0oDcy/UzkuppIj+F9FiN+UW/Q8adlOwb5Tx06zHsY/7yg4OYg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
    '<link rel="stylesheet" href="//code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.css">',
    '<script src="//code.jquery.com/jquery-1.10.2.js"></script>',
    '<script src="//code.jquery.com/ui/1.11.2/jquery-ui.js"></script>',
    '<link rel="icon" type="image/png" href="/api/favicon"/>',
    '<script src="/api/javascripts/webplayer.min.js" type="text/javascript"></script>',
    '<script async type="text/javascript" src="https://unpkg.com/@eyevinn/web-player-component@latest/dist/web-player.component.js"></script>',
    '<link rel="stylesheet" href="https://player.eyevinn.technology/v0.4.2/build/eyevinn-html-player.css"></link>'

];

let languages = [
    "none", "all", "af", "al", "dz", "as", "ad", "ao", "ai", "aq", "ag", "ar", "am", "aw", "au", "at", "az", "bs", "bh", "bd", "bb", "by", "be", "bz", "bj", "bm", "bt", "bo", "ba", "bw", "bv", "br", "io", "bn", "bg", "bf", "bi", "kh", "cm", "ca", "cv", "ky", "cf", "td", "cl", "cn", "cx", "cc", "co", "km", "cg", "cd", "ck", "cr", "ci", "hr", "cu", "cy", "cz", "dk", "dj", "dm", "do", "ec", "eg", "sv", "gq", "er", "ee", "et", "fk", "fo", "fj", "fi", "fr", "gf", "pf", "tf", "ga", "gm", "ge", "de", "gh", "gi", "gr", "gl", "gd", "gp", "gu", "gt", "gn", "gw", "gy", "ht", "hm", "va", "hn", "hk", "hu", "is", "in", "id", "ir", "iq", "ie", "il", "it", "jm", "jp", "jo", "kz", "ke", "ki", "kp", "kr", "kw", "kg", "la", "lv", "lb", "ls", "lr", "ly", "li", "lt", "lu", "mo", "mg", "mw", "my", "mv", "ml", "mt", "mh", "mq", "mr", "mu", "yt", "mx", "fm", "md", "mc", "mn", "ms", "ma", "mz", "mm", "na", "nr", "np", "nl", "an", "nc", "nz", "ni", "ne", "ng", "nu", "nf", "mk", "mp", "no", "om", "pk", "pw", "ps", "pa", "pg", "py", "pe", "ph", "pn", "pl", "pt", "pr", "qa", "re", "ro", "ru", "rw", "sh", "kn", "lc", "pm", "vc", "ws", "sm", "st", "sa", "sn", "rs", "cs", "sc", "sl", "sg", "sk", "si", "sb", "so", "za", "gs", "es", "lk", "sd", "sr", "sj", "sz", "se", "ch", "sy", "tw", "tj", "tz", "th", "tl", "tg", "tk", "to", "tt", "tn", "tr", "tm", "tc", "tv", "ug", "ua", "ae", "gb", "us", "um", "uy", "uz", "vu", "ve", "vn", "vg", "vi", "wf", "eh", "ye", "zm", "zw",
];

let countries = [
    "- None Country -",
    "- All Countries -",
    "Afghanistan",
    "Albania",
    "Algeria",
    "American Samoa",
    "Andorra",
    "Angola",
    "Anguilla",
    "Antarctica",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Aruba",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bermuda",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovi",
    "Botswana",
    "Bouvet Island",
    "Brazil",
    "British Indian Ocean",
    "Brunei Darussalam",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Cape Verde",
    "Cayman Islands",
    "Central African Repu",
    "Chad",
    "Chile",
    "China",
    "Christmas Island",
    "Cocos (Keeling) Isla",
    "Colombia",
    "Comoros",
    "Congo",
    "Congo, the Democrati",
    "Cook Islands",
    "Costa Rica",
    "Cote D'Ivoire",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Ethiopia",
    "Falkland Islands (Ma",
    "Faroe Islands",
    "Fiji",
    "Finland",
    "France",
    "French Guiana",
    "French Polynesia",
    "French Southern Terr",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Gibraltar",
    "Greece",
    "Greenland",
    "Grenada",
    "Guadeloupe",
    "Guam",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Heard Island and Mcd",
    "Holy See (Vatican Ci",
    "Honduras",
    "Hong Kong",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran, Islamic Republ",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea, Democratic Pe",
    "Korea, Republic of",
    "Kuwait",
    "Kyrgyzstan",
    "Lao People's Democra",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libyan Arab Jamahiri",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Macao",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Martinique",
    "Mauritania",
    "Mauritius",
    "Mayotte",
    "Mexico",
    "Micronesia, Federate",
    "Moldova, Republic of",
    "Monaco",
    "Mongolia",
    "Montserrat",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "Netherlands Antilles",
    "New Caledonia",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "Niue",
    "Norfolk Island",
    "North Macedonia",
    "Northern Mariana Isl",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestinian Territor",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Pitcairn",
    "Poland",
    "Portugal",
    "Puerto Rico",
    "Qatar",
    "Reunion",
    "Romania",
    "Russian Federation",
    "Rwanda",
    "Saint Helena",
    "Saint Kitts and Nevi",
    "Saint Lucia",
    "Saint Pierre and Miq",
    "Saint Vincent and th",
    "Samoa",
    "San Marino",
    "Sao Tome and Princip",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Serbia and Montenegr",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Georgia and th",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Svalbard and Jan May",
    "Swaziland",
    "Sweden",
    "Switzerland",
    "Syrian Arab Republic",
    "Taiwan, Province of ",
    "Tajikistan",
    "Tanzania, United Rep",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tokelau",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Turks and Caicos Isl",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "United States Minor ",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Venezuela",
    "Viet Nam",
    "Virgin Islands, Brit",
    "Virgin Islands, U.s.",
    "Wallis and Futuna",
    "Western Sahara",
    "Yemen",
    "Zambia",
    "Zimbabwe"
];

let types = [1, 2, 3, 4, 5];
let categories = ["Web TV", "Web Radio", "Web Cam", "Web Programmes"];
let countryNames = [];

let hasLoaded = false;

export let errorCodes = [
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
    let channels = [];
    let urls = [];
    //hasLoaded = false;
    if (!hasLoaded) {
        let lines = await loadM3U();
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];


            let parts = line.split(',');
            for (let i = 0; i < parts.length; i++) {
                parts[i] = parts[i].replaceAll('\n', '').replaceAll('\r', '');
            }

            console.log(parts);


            //console.log(parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + parts[3] + ',' + parts[4] + ',' + parts[5]);
            //tr,Web Radio,NAZİLLİ RADYO ÖZDEN,http://live.radyotvonline.com:9050,audio/mpegurl; charset=utf-8,200

            let channel = { language: parts[0], category: parts[1], name: parts[2], uri: parts[3], type: parts[4] };

            //guess content type from extension
            let filename = channel.uri.split('.');
            let ext = filename[filename.length - 1];

            //console.log(channel.uri);
            if (!urls.includes(channel.uri)) {
                if (channel.uri.startsWith('http://') || channel.uri.startsWith('https://')) {
                    //console.log(channel);
                    urls.push(channel.uri);
                    /*
                    let originalUri = channel.uri;
                    if (channel.uri.startsWith('https://')) {
                        channel.uri = '/api/proxy_s/' + toBinary(channel.uri);    
                    } else if (channel.uri.startsWith('http://')) {
                        channel.uri = '/api/proxy/' + toBinary(channel.uri);
                    }
                    channel.originalUri = originalUri; // Store original for debugging
                    */
                   channels.push(channel);
                }
            }
        }
        r.us = urls;
        r.cs = channels;
        console.log('Channels: ' + channels.length);
        console.log('URLs: ' + urls.length);
        console.log('Loaded channels.csv');
        hasLoaded = true;
    }

    return await { cs: r.cs, us: r.us };
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
    html += '<div style="background: var(--accent);">';
    html += '<h1><a href="/">Free Tux TV Wall</a></h1>';
    html += '<p>Free Tux TV Wall is a collection of free Web TV, Web Radio and Web Cam channels from around the world. The channels are organized by language and category. Enjoy!</p>';
    html += '</div>';
    html += '<div style="background: var(--accent);">';
    html += "<form id='form1' method=\"get\" style=\"justify-content: center; align-items: center;\">";
    html += '<label for="language" >Language:</label>';
    html += '<select id="language" name="language" onchange="languageIndex = this.selectedIndex && form1OnChange();" >';
    let i = 0;
    for (let i = 0; i < languages.length; i++) {
        let lang = languages[i];
        let name = countries[i];
        //if (r.cs.find(channel => channel.language == lang) == undefined) continue; 
        if (i == languageIndex) {
            html += '<option value="' + lang + '" selected>' + name + '</option>';
        } else {
            html += '<option value="' + lang + '">' + name + '</option>';
        }
    }
    html += '</select>';
    //spacer
    html += '<label for="spacer"> </label>';

    html += '<label for="category">Category:</label>';
    html += '<select id="category" name="category" onchange="categoryIndex = this.selectedIndex && form1OnChange();" >';
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
    html += "<form id='form2' method=\"get\" style=\"display: flex; justify-content: center; align-items: center;\">";
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
    let html = '<div style="background: var(--accent);">';
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
    let grid_counter = 0;
    let cs = r.cs.filter(channel => channel.name.toUpperCase() != 'DDD' && ((channel.language == languages[languageIndex] && channel.category == categories[categoryIndex]) || languages[languageIndex] == "all") || search != '' && channel.name.toLowerCase().includes(search.toLowerCase()));
    let grid_cells = 4;
    
    let table = '<table>';
    let counter = 0;
    let acc = 0;
    let begin = true;
    cs.forEach((channel) => {
        try {

            if (begin) {
                //Align center
                table += '<tr style="text-align:center;">';
                begin = false;
                acc += counter;
                counter = 0;
            }


            let row = renderChannel('', channel, acc + counter, search != '');
            table += row;
            counter++;
         

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

function getStreamMimeType(uri, category) {
    // Handle HLS streams
    if (uri.includes('.m3u8') || uri.includes('/hls/') || uri.includes('.m3u')) {
        return 'application/x-mpegURL';
    }
    
    // Handle DASH streams
    if (uri.includes('.mpd')) {
        return 'application/dash+xml';
    }
    
    // Category-based fallbacks
    if (category === 'Web Radio') {
        return 'audio/mpeg';
    } else if (category === 'Web TV' || category === 'Web Cam' || category === 'Web Programmes') {
        return 'video/mp4';
    }
    
    // Fallback to mime-types library
    let detectedType = mime.lookup(uri);
    if (detectedType) {
        return detectedType;
    }
    
    // Final fallback
    return 'application/x-mpegURL';
}

function renderChannel(render, ch, counter, search) {
    //try ch.uri with http and https
    let error = true;
    if (error) {
        let selector = 'video_' + counter;
        let videorender = '';
  /*      
        if(search) {
            videorender += '<td  style="height:540px;width:720;">';
        } else {
            videorender += '<td  style="height:200px;width:384px;">';
        }
        videorender += '<div id="' + selector + '">';
        videorender += '<p><a href="/api/wall/search/'+toBinary(ch.name)+'">' + ch.name.toUpperCase() + '</a></p>';
        videorender += '<eyevinn-video source="'+ch.uri+'" starttime="30" muted="true" autoplay="true"></eyevinn-video>';       
                
        let videoJS = "<script>";
        videoJS += "document.addEventListener('DOMContentLoaded', function(event) { ";
        videoJS += "const player = webplayer(document.querySelector('#"+ selector + "'));";
        videoJS += "player.load('"+ ch.uri + "').then((event)=>{player.pause();});";
        videoJS += "});";
        videoJS += "</script>";
        
        
        //videorender += videoJS;
        videorender += '</div>';
        videorender += '</td>';

        render += videorender;
*/
        
        
        if (search) {
            videorender += '<td  style="height:540px;width:720;">';
            videorender += '<div id="' + selector + '">';
            videorender += '<p><a href="/api/wall/search/' + toBinary(ch.name) + '">' + ch.name.toUpperCase() + '</a></p>';
            videorender += '<video id="' + selector + '" muted="true" autoplay="true" class="video-js" controls preload="metadata" width="720" height="480" data-setup="{}">';
        } else {
            videorender += '<td  style="height:200px;width:384px;">';
            videorender += '<div id="' + selector + '">';
            videorender += '<p><a href="/api/wall/search/' + toBinary(ch.name) + '">' + ch.name.toUpperCase() + '</a></p>';
            videorender += '<video id="' + selector + '" muted="true" autoplay="true" class="video-js" controls preload="metadata" width="384" height="200" data-setup="{}">';
        }
        videorender += '<source src="' + ch.uri + '" type="' + getStreamMimeType(ch.originalUri || ch.uri, ch.category) + '"/>';
        videorender += '    <p class="vjs-no-js"> \
                                To view this video please enable JavaScript, and consider upgrading to a \
                                web browser that \
                            <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a> \
                            </p>';
        videorender += '</video>';
        
        // Add error handling and retry logic
        let errorHandlingScript = `
            <script>
            (function() {
                var video = document.getElementById('${selector}');
                var retryCount = 0;
                var maxRetries = 3;
                
                function handleError() {
                    retryCount++;
                    console.log('Video error for ${ch.name}, attempt ' + retryCount);
                    
                    if (retryCount <= maxRetries) {
                        setTimeout(function() {
                            video.load();
                        }, 2000 * retryCount);
                    } else {
                        console.log('Max retries reached for ${ch.name}');
                        // Show fallback message
                        var errorDiv = document.createElement('div');
                        errorDiv.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 12px; text-align: center;';
                        errorDiv.innerHTML = 'Stream temporarily unavailable<br><small>Click to retry</small>';
                        errorDiv.onclick = function() { 
                            retryCount = 0; 
                            video.load(); 
                            errorDiv.remove(); 
                        };
                        video.parentElement.style.position = 'relative';
                        video.parentElement.appendChild(errorDiv);
                    }
                }
                
                video.addEventListener('error', handleError);
                video.addEventListener('loadstart', function() {
                    var existingError = video.parentElement.querySelector('div[style*="rgba(0,0,0,0.8)"]');
                    if (existingError) existingError.remove();
                });
            })();
            </script>
        `;
        
        videorender += errorHandlingScript;
        videorender += '</div>';
        videorender += '</td>';
        
        render += videorender;
    }
    return render;
}

export let r = { cs: [], us: [] };

export async function fttvw(req, res) {
    r = await readChannels();
    console.log('Channels: ' + r.cs.length);
    console.log('URLs: ' + r.us.length);


    if (undefined != req.params.language) {
        if ('string' == typeof req.params.language) {
            req.params.language = req.params.language.replaceAll('?', '');
            languageIndex = parseInt(req.params.language);
        } else if ('number' == typeof req.params.language) {
            languageIndex = req.params.language;
        }
        search = '';
    } else {
        languageIndex = 0;
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

    let html = '<html><head>{{links}}<title>{{title}}</title><meta http-equiv="Content-Security-Policy" content="default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob: https: http: ws: wss:; media-src \'self\' https: http: blob: data:; connect-src \'self\' https: http: ws: wss:;"></head>';
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
    return await res.send(html);
}

//module.exports = fttvw;