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

//import fs from 'fs';
//import https from 'https';
//import http from 'http';
const fs = require('fs');
const https = require('https');
const http = require('http');

export async function download() {

  // 1. Leemos el contenido del fichero channels.xml
  let xmlData = '';
  let csvLines = [];
  let languages = [
    "none", "af", "al", "dz", "as", "ad", "ao", "ai", "aq", "ag", "ar", "am", "aw", "au", "at", "az", "bs", "bh", "bd", "bb", "by", "be", "bz", "bj", "bm", "bt", "bo", "ba", "bw", "bv", "br", "io", "bn", "bg", "bf", "bi", "kh", "cm", "ca", "cv", "ky", "cf", "td", "cl", "cn", "cx", "cc", "co", "km", "cg", "cd", "ck", "cr", "ci", "hr", "cu", "cy", "cz", "dk", "dj", "dm", "do", "ec", "eg", "sv", "gq", "er", "ee", "et", "fk", "fo", "fj", "fi", "fr", "gf", "pf", "tf", "ga", "gm", "ge", "de", "gh", "gi", "gr", "gl", "gd", "gp", "gu", "gt", "gn", "gw", "gy", "ht", "hm", "va", "hn", "hk", "hu", "is", "in", "id", "ir", "iq", "ie", "il", "it", "jm", "jp", "jo", "kz", "ke", "ki", "kp", "kr", "kw", "kg", "la", "lv", "lb", "ls", "lr", "ly", "li", "lt", "lu", "mo", "mg", "mw", "my", "mv", "ml", "mt", "mh", "mq", "mr", "mu", "yt", "mx", "fm", "md", "mc", "mn", "ms", "ma", "mz", "mm", "na", "nr", "np", "nl", "an", "nc", "nz", "ni", "ne", "ng", "nu", "nf", "mk", "mp", "no", "om", "pk", "pw", "ps", "pa", "pg", "py", "pe", "ph", "pn", "pl", "pt", "pr", "qa", "re", "ro", "ru", "rw", "sh", "kn", "lc", "pm", "vc", "ws", "sm", "st", "sa", "sn", "rs", "cs", "sc", "sl", "sg", "sk", "si", "sb", "so", "za", "gs", "es", "lk", "sd", "sr", "sj", "sz", "se", "ch", "sy", "tw", "tj", "tz", "th", "tl", "tg", "tk", "to", "tt", "tn", "tr", "tm", "tc", "tv", "ug", "ua", "ae", "gb", "us", "um", "uy", "uz", "vu", "ve", "vn", "vg", "vi", "wf", "eh", "ye", "zm", "zw", 
  ];

  let types = [ 1, 2, 3, 4, 5];

  for (let u = 0; u < languages.length; u++) {
    //Sleep for 1 second
    

    let lang = languages[u];
    let countryName = { name: '', code: '' };
    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      // 2. Hacemos una petición HTTP/HTTPS a la URI indicada para obtener una lista .m3u
      let uri = 'https://database.freetuxtv.net/WebStreamExport/index?format=m3u&type='+type+'&status=2&country='+lang+'&isp=';
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      let m3uFile = '';

      https.get(uri, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          m3uFile += chunk;
        });
        res.on('end', () => {
          console.log('m3uFile', m3uFile);                  
          //save the parsedM3U string in public/assets/ as lang_type_cat.m3u
          const fileName = `public/assets/${lang}_${type}.m3u`;
          fs.writeFile(fileName, m3uFile, (err) => {
            if (err) {
              console.error('Error writing file', err);
            } else {
              console.log('File written successfully');
            }
          });
        });
      }).on('error', (e) => {
        console.error(e);
        console.log('Error: ' + e.message);
      });
    }
  }
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
/*
download()
  .then(() => {
    console.log('Download complete');
  })
  .catch((error) => {
    console.error('Error downloading', error);
  });
  */


export default download;
