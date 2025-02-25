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
async function parseChannelsXmlAndCreateCsv() {
  try {
    // 1. Leemos el contenido del fichero channels.xml
    const xmlData = fs.readFileSync('channels.xml', 'utf-8');
    
    // 2. Parseamos el XML a objeto JavaScript
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    // Suponemos que la raíz es <channels_groups> y que tiene múltiples <language>
    const languages = result.channels_groups.language;

    // Prepararemos las líneas de nuestro CSV en un array
    const csvLines = [];

    // Recorremos cada <language>
    for (const lang of languages) {
      // Obtenemos el identificador o nombre del idioma
      const languageId = lang.$.id; // Por ejemplo "en", "es", etc.
      // const languageName = lang.$._lang; // Alternativa si se prefiere "English", "Spanish", etc.

      // Cada <language> puede tener varios <channels_group>
      for (const group of lang.channels_group) {
        // Ej: uri="https://database.freetuxtv.net/playlists/playlist_webtv_en.m3u"
        //     _name="Web TV (English)"
        const uri = group.$.uri;
        const groupName = group.$._name;

        // Determinamos la categoría a partir del _name
        // (Web TV, Web Radio, Web Cam o Web Programmes)
        let category = '';
        if (groupName.includes('Web TV')) {
          category = 'Web TV';
        } else if (groupName.includes('Web Radio')) {
          category = 'Web Radio';
        } else if (groupName.includes('Web Cam')) {
          category = 'Web Cam';
        } else if (groupName.includes('Web Programmes')) {
          category = 'Web Programmes';
        }

        // Definimos un content_type según la categoría
        // (ej. para Radio usamos "audio", para TV/WebCam/WebProgrammes "video")
        let contentType = "";

        if(uri.includes("https://")){
            https.get(uri, (res) => {
                contentType = res.headers['content-type'];
                console.log(contentType);
            });
        } else if(uri.includes("http://")){
            http.get(uri, (res) => {
                contentType = res.headers['content-type'];
                console.log(contentType);
            });
        }
        



        try {
          // 3. Hacemos la petición para obtener el M3U (lista de canales)
          const response = await axios.get(uri);
          const m3uData = response.data;

          // 4. Parseamos las líneas de la lista M3U
          const lines = m3uData.split('\n');

          // Recorremos las líneas para encontrar #EXTINF y su siguiente (URL)
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#EXTINF')) {
              // Ejemplo: #EXTINF:-1 tvg-id="...", NombreDelCanal
              // Capturamos el texto tras la coma como nombre del canal
              const nameMatch = line.match(/#EXTINF.*,(.*)/);
              const channelName = nameMatch ? nameMatch[1].trim() : 'Desconocido';

              // La línea siguiente a #EXTINF debería contener la URL del stream
              const streamUrl = (i + 1 < lines.length) ? lines[i + 1].trim() : '';

              // 5. Formamos la línea CSV:
              // <idioma>,<categoria>,<nombre>,<url>,<content_type>
              csvLines.push(`${languageId},${category},${channelName},${streamUrl},${contentType}`);
            }
          }
        } catch (error) {
          console.error(`Error al obtener o procesar la playlist M3U desde ${uri}:`, error.message);
        }
      }
    }

    // Generamos el contenido CSV final, separando las líneas por salto de línea
    const csvContent = csvLines.join('\n');

    // Escribimos el CSV en un fichero (output.csv)
    fs.writeFileSync('output.csv', csvContent, 'utf-8');
    console.log('CSV generado con éxito en: output.csv');

  } catch (error) {
    console.error('Error general en parseChannelsXmlAndCreateCsv:', error.message);
  }
}

// Llamada a la función principal
parseChannelsXmlAndCreateCsv();
