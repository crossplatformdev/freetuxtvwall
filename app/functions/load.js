/**
 * Este script en Node.js:
 * 1. Lee y parsea el fichero channels.xml con la ayuda de xml2js.
 * 2. Para cada <channels_group> obtenido del XML, hace una petición HTTP/HTTPS 
 *    a la URI indicada para obtener una lista .m3u.
 * 3. Parseando la lista M3U, extrae los nombres de cada canal (línea #EXTINF)
 *    y la URL (la línea inmediatamente siguiente).
 * 4. Genera un CSV con las columnas:
 *    <idioma>,<categoria>,<nombre>,<url>,<content_type>
 * 5. Por defecto se guardará en un fichero 'output.csv'.
 *
 * Requisitos:
 *   - npm install xml2js axios
 */

const fs = require('fs');
const xml2js = require('xml2js');
const axios = require('axios');
const https = require('https');
const http = require('http');
const m3u8Parser = require('m3u8-parser');
const { errorCodes } = require('./index');

export async function loadM3U() {

  // 1. Leemos el contenido del fichero channels.xml
  let xmlData = '';
  let csvLines = [];
  let languages = [
    "none", "af", "al", "dz", "as", "ad", "ao", "ai", "aq", "ag", "ar", "am", "aw", "au", "at", "az", "bs", "bh", "bd", "bb", "by", "be", "bz", "bj", "bm", "bt", "bo", "ba", "bw", "bv", "br", "io", "bn", "bg", "bf", "bi", "kh", "cm", "ca", "cv", "ky", "cf", "td", "cl", "cn", "cx", "cc", "co", "km", "cg", "cd", "ck", "cr", "ci", "hr", "cu", "cy", "cz", "dk", "dj", "dm", "do", "ec", "eg", "sv", "gq", "er", "ee", "et", "fk", "fo", "fj", "fi", "fr", "gf", "pf", "tf", "ga", "gm", "ge", "de", "gh", "gi", "gr", "gl", "gd", "gp", "gu", "gt", "gn", "gw", "gy", "ht", "hm", "va", "hn", "hk", "hu", "is", "in", "id", "ir", "iq", "ie", "il", "it", "jm", "jp", "jo", "kz", "ke", "ki", "kp", "kr", "kw", "kg", "la", "lv", "lb", "ls", "lr", "ly", "li", "lt", "lu", "mo", "mg", "mw", "my", "mv", "ml", "mt", "mh", "mq", "mr", "mu", "yt", "mx", "fm", "md", "mc", "mn", "ms", "ma", "mz", "mm", "na", "nr", "np", "nl", "an", "nc", "nz", "ni", "ne", "ng", "nu", "nf", "mk", "mp", "no", "om", "pk", "pw", "ps", "pa", "pg", "py", "pe", "ph", "pn", "pl", "pt", "pr", "qa", "re", "ro", "ru", "rw", "sh", "kn", "lc", "pm", "vc", "ws", "sm", "st", "sa", "sn", "rs", "cs", "sc", "sl", "sg", "sk", "si", "sb", "so", "za", "gs", "es", "lk", "sd", "sr", "sj", "sz", "se", "ch", "sy", "tw", "tj", "tz", "th", "tl", "tg", "tk", "to", "tt", "tn", "tr", "tm", "tc", "tv", "ug", "ua", "ae", "gb", "us", "um", "uy", "uz", "vu", "ve", "vn", "vg", "vi", "wf", "eh", "ye", "zm", "zw", 
  ];

  let types = [ 1, 2, 3, 4, 5];

  for (let u = 0; u < languages.length; u++) {
    let lang = languages[u];
    let countryName = { name: '', code: '' };
    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      //get the line
      // 2. Hacemos una petición HTTP/HTTPS a la URI indicada para obtener una lista .m3u
      let uri = `/${lang}/${type}`;
      console.log('uri', uri);
      // 3. Parseamos la lista M3U, extraemos los nombres de cada canal (línea #EXTINF)
      // y la URL (la línea inmediatamente siguiente).
      // 4. Generamos un CSV con las columnas: <idioma>,<categoria>,<nombre>,<url>,<content_type>
      // 5. Por defecto se guardará en un fichero 'output.csv'.

      // Definimos un array para almacenar los códigos de error
      // Definimos un content_type según la categoría
      // (ej. para Radio usamos "audio", para TV/WebCam/WebProgrammes "video")
      let contentType = "";

      //read the m3u file
      let m3uFile = '';
      let notExist = false;
      let segments = [];


      https.get(uri, (res) => {
        res.on('data', (chunk) => {
          m3uFile += chunk;
        });

        res.on('end', () => {
          console.log('m3uFile', m3uFile);
          //parse the m3u file
          const parser = new m3u8Parser.Parser();
          parser.push(m3uFile);
          parser.end();
          const parsedM3U = parser.manifest;
          console.log('parsedM3U', parsedM3U);
          //get the lines from the m3u file
          segments = parsedM3U.segments;
          console.log('lines', segments);

          for (let j = 0; j < segments.length; j++) {
            let segment = segments[j];
            if (lang == 'none') {
              countryName.name = 'No lang Web TV and Radio';
              countryName.code = lang;
            } else {
              //country name from country code using locale
              let code = new Intl.DisplayNames("en", { type: 'language' });
              countryName.name = code.of(lang);
              countryName.code = lang;
            }
            console.log('lang:', lang);
            const groupName = uri.split('_')[1];
            console.log('groupName:', groupName);

            // Determinamos la categoría a partir del _name
            // (Web TV, Web Radio, Web Cam o Web Programmes)
            let category = line;
            if (type == 1) {
              category = 'Web TV';
              contentType = 'video';
            } else if (type == 2) {
              category = 'Web Radio';
              contentType = 'audio';
            } else if (type == 3) {
              category = 'Web Cam';
              contentType = 'video';
            } else if (type == 4) {
              category = 'Web Programmes';
              contentType = 'video';
            }
            let name = segment.name;
            let url = segment.uri;
            let error, statusCode, csvLine;
            //get the name and url

            console.log('name', name);
            console.log('url', url);

            error = false;
            try {
              ({ error, statusCode, csvLine } = testUrl(url, countryName, category, name, contentType, csvLines, errorCodes));
              if (error) {
                console.log('Error: ' + error);
                statusCode = 404;
              } else {
                console.log('statusCode:', statusCode);
                csvLines.push(csvLine);
              }

            } catch (error) {
              console.error('Error:', error);
              //handle the error
              if (error.code === 'ENOTFOUND') {
                console.log('Error: ' + error.message);
                statusCode = 404;
              } else if (error.code === 'ECONNREFUSED') {
                console.log('Error: ' + error.message);
                statusCode = 404;
              } else if (error.code === 'ETIMEDOUT') {
                console.log('Error: ' + error.message);
                statusCode = 404;
              } else if (error.code === 'ECONNRESET') {
                console.log('Error: ' + error.message);
                statusCode = 404;
              } else {
                console.log('Error: ' + error.message);
                statusCode = 404;
              }
            }
          }
        });       

        res.on('error', (e) => {
          console.error(e);
          console.log('Error: ' + e.message);
          notExist = true;
        });

      }).on('error', (e) => {
        console.error(e);
        console.log('Error: ' + e.message);
        notExist = true;
      });
    }
  }


  csvLines.forEach(element => {
    let parts = element.split(',');
    let languageId = parts[0];
    let category = parts[1];
    let groupName = parts[2];
    let uri = parts[3];
    let contentType = parts[4];
    let statusCode = parts[5];
  });


  // Generamos el contenido CSV final, separando las líneas por salto de línea
  let csvContent = csvLines.join('\n');


  console.log('csvContent', csvLines);

  return csvContent;
}

function testUrl(url, countryName, category, name, contentType, csvLines, errorCodes) {
  let error = false;
  let statusCode = 0;
  if (url.startsWith('http://')) {
    //Get status code
    const options = {
      method: 'HEAD',
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    };
    http.get(url, (res) => {
      console.log('statusCode:', res.statusCode);
      statusCode = res.statusCode;
      if (errorCodes.includes(res.statusCode.toString())) {
        console.log('Error: ' + res.statusCode);
        error = true;
      }
    }).on('error', (e) => {
      console.error(e);
      console.log('Error: ' + e.message);
    });
  } else if (url.startsWith('https://')) {
    //Get status code
    const options = {
      method: 'HEAD',
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    };
    https.get(url, (res) => {
      console.log('statusCode:', res.statusCode);
      statusCode = res.statusCode;
      if (errorCodes.includes(res.statusCode.toString())) {
        console.log('Error: ' + res.statusCode);
        error = true;
      }
    }).on('error', (e) => {
      console.error(e);
      console.log('Error: ' + e.message);
    });
    //get the line
    let line = `${countryName.code},${category},${name},${url},${contentType},${statusCode}`;
    console.log('line', line);
    //add the line to the csvLines
    csvLines.push(line);
  }
  return { error, statusCode, line };
}

export default loadM3U;
