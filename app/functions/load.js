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
//const { errorCodes } = require('./index');

const errorCodes = [
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

export async function loadM3U() {

  // 1. Leemos el contenido del fichero channels.xml
  let xmlData = '';
  let csvLines = [];
  let languages = [
    "none", "af", "al", "dz", "as", "ad", "ao", "ai", "aq", "ag", "ar", "am", "aw", "au", "at", "az", "bs", "bh", "bd", "bb", "by", "be", "bz", "bj", "bm", "bt", "bo", "ba", "bw", "bv", "br", "io", "bn", "bg", "bf", "bi", "kh", "cm", "ca", "cv", "ky", "cf", "td", "cl", "cn", "cx", "cc", "co", "km", "cg", "cd", "ck", "cr", "ci", "hr", "cu", "cy", "cz", "dk", "dj", "dm", "do", "ec", "eg", "sv", "gq", "er", "ee", "et", "fk", "fo", "fj", "fi", "fr", "gf", "pf", "tf", "ga", "gm", "ge", "de", "gh", "gi", "gr", "gl", "gd", "gp", "gu", "gt", "gn", "gw", "gy", "ht", "hm", "va", "hn", "hk", "hu", "is", "in", "id", "ir", "iq", "ie", "il", "it", "jm", "jp", "jo", "kz", "ke", "ki", "kp", "kr", "kw", "kg", "la", "lv", "lb", "ls", "lr", "ly", "li", "lt", "lu", "mo", "mg", "mw", "my", "mv", "ml", "mt", "mh", "mq", "mr", "mu", "yt", "mx", "fm", "md", "mc", "mn", "ms", "ma", "mz", "mm", "na", "nr", "np", "nl", "an", "nc", "nz", "ni", "ne", "ng", "nu", "nf", "mk", "mp", "no", "om", "pk", "pw", "ps", "pa", "pg", "py", "pe", "ph", "pn", "pl", "pt", "pr", "qa", "re", "ro", "ru", "rw", "sh", "kn", "lc", "pm", "vc", "ws", "sm", "st", "sa", "sn", "rs", "cs", "sc", "sl", "sg", "sk", "si", "sb", "so", "za", "gs", "es", "lk", "sd", "sr", "sj", "sz", "se", "ch", "sy", "tw", "tj", "tz", "th", "tl", "tg", "tk", "to", "tt", "tn", "tr", "tm", "tc", "tv", "ug", "ua", "ae", "gb", "us", "um", "uy", "uz", "vu", "ve", "vn", "vg", "vi", "wf", "eh", "ye", "zm", "zw",
  ];

  let types = [1, 2, 3, 4, 5];

  for (let u = 0; u < languages.length; u++) {
    let lang = languages[u];
    let countryName = { name: '', code: '' };
    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      let uri = './public/assets/' + lang + '_' + type + '.m3u';

      let m3uFile = await fs.readFileSync(uri, 'utf8');
      const parser = new m3u8Parser.Parser();
      parser.push(m3uFile);
      parser.end();
      const parsedM3U = parser.manifest;
      let segments = parsedM3U.segments;

      for (let j = 0; j < segments.length; j++) {
        let segment = segments[j];

        let title = segment.title;
        let url = segment.uri;
        let statusCode = 200;
        let contentType;
        let category;
        if (type == 1) {
          category = 'Web TV';
          contentType = 'video/m3u';
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
        let csvLine = lang + ',' + category + ',' + title + ',' + url + ',' + contentType + ',' + statusCode;
        //console.log('line', line);
        //add the line to the csvLines
        csvLines.push(csvLine);
      }
    }
  }
  // Generamos el contenido CSV final, separando las líneas por salto de línea
  //let csvContent = csvLines.join('\n');


  console.log('csvLines', csvLines);

  return await csvLines;
}

export default loadM3U;