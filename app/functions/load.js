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

import e from 'express';

const fs = require('fs');
const xml2js = require('xml2js');
const axios = require('axios');
const https = require('https');
const http = require('http');
const m3u8Parser = require('m3u8-parser');



export async function loadM3U() {

  // 1. Leemos el contenido del fichero channels.xml
  let xmlData = '';
  let csvLines = [];
  let languages = [
    "public/assets/playlist_webtv_none.m3u",
    "public/assets/playlist_webradio_none.m3u",
    "public/assets/playlist_webcam_none.m3u",
    "public/assets/playlist_webtv_sq.m3u",
    "public/assets/playlist_webtv_ar.m3u",
    "public/assets/playlist_webradio_ar.m3u",
    "public/assets/playlist_webtv_az.m3u",
    "public/assets/playlist_webradio_bn.m3u",
    "public/assets/playlist_webtv_bg.m3u",
    "public/assets/playlist_webcam_bg.m3u",
    "public/assets/playlist_webradio_ca.m3u",
    "public/assets/playlist_webradio_zh.m3u",
    "public/assets/playlist_webtv_hr.m3u",
    "public/assets/playlist_webradio_hr.m3u",
    "public/assets/playlist_webcam_hr.m3u",
    "public/assets/playlist_webtv_cs.m3u",
    "public/assets/playlist_webradio_cs.m3u",
    "public/assets/playlist_webtv_da.m3u",
    "public/assets/playlist_webtv_nl.m3u",
    "public/assets/playlist_webradio_nl.m3u",
    "public/assets/playlist_webtv_en.m3u",
    "public/assets/playlist_webradio_en.m3u",
  ];

  for (let u = 0; u < languages.length; u++) {
    let uri = languages[u];
    console.log('URI:', uri);
    let lang = uri.split('_')[2].replace('.m3u', '');
    console.log('lang:', lang);
    let countryName = { name: '', code: '' };

    if (lang == 'none') {
      countryName.name = 'No lang Web TV and Radio';
      countryName.code = lang;
    } else {
      //country name from country code using locale
      let code = new Intl.DisplayNames("en", { type: 'language' });
      countryName.name = code.of(lang);
      countryName.code = lang;
    }

    const groupName = uri.split('_')[1];
    console.log('groupName:', groupName);

    // Determinamos la categoría a partir del _name
    // (Web TV, Web Radio, Web Cam o Web Programmes)
    let category = '';
    if (groupName.includes('tv')) {
      category = 'Web TV';
    } else if (groupName.includes('radio')) {
      category = 'Web Radio';
    } else if (groupName.includes('cam')) {
      category = 'Web Cam';
    } else if (groupName.includes('programmes')) {
      category = 'Web Programmes';
    }

    // Definimos un content_type según la categoría
    // (ej. para Radio usamos "audio", para TV/WebCam/WebProgrammes "video")
    let contentType = "";

    //read the m3u file
    const m3uFile = fs.readFileSync(uri, 'utf8');
    //parse the m3u file
    const parser = new m3u8Parser.Parser();
    parser.push(m3uFile);
    parser.end();
    const parsedM3U = parser.manifest;
    console.log('parsedM3U', parsedM3U);
    //get the lines from the m3u file
    const lines = parsedM3U.segments;
    console.log('lines', lines);
    //for each line get the name and url
    let name = '';
    let url = '';
    let error, statusCode, csvLine;
    for (let i = 0; i < lines.length; i++) {
      //get the line
      let line = lines[i];
      //get the name and url
      name = line.title;
      url = line.uri;
      console.log('name', name);
      console.log('url', url);
      //get the content type
      if (category == 'Web TV') {
        contentType = 'video';
      } else if (category == 'Web Radio') {
        contentType = 'audio';
      } else if (category == 'Web Cam') {
        contentType = 'video';
      } else if (category == 'Web Programmes') {
        contentType = 'video';
      }
      //get the status code
      error = false;
      try {
        ({ error, statusCode, csvLine } = testUrl(url, countryName, category, name, contentType, csvLines));
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

function testUrl(url, countryName, category, name, contentType, csvLines) {
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
