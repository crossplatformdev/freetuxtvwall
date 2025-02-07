
#!/bin/bash

curl ^"https://database.freetuxtv.net/playlists/list?format=xml^" ^
  -H ^"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7^" ^
  -H ^"Accept-Language: es-ES,es;q=0.9,en-GB;q=0.8,en;q=0.7^" ^
  -H ^"Cache-Control: max-age=0^" ^
  -H ^"Connection: keep-alive^" ^
  -H ^"Cookie: PHPSESSID=rtlf6j3fkmooeo91n7kth1j50l; __utma=59440056.1791045673.1738710504.1738710504.1738710504.1; __utmc=59440056; __utmz=59440056.1738710504.1.1.utmcsr=google^|utmccn=(organic)^|utmcmd=organic^|utmctr=(not^%^20provided); __utmb=59440056.1.10.1738710504^" ^
  -H ^"Referer: https://database.freetuxtv.net/^" ^
  -H ^"Sec-Fetch-Dest: document^" ^
  -H ^"Sec-Fetch-Mode: navigate^" ^
  -H ^"Sec-Fetch-Site: same-origin^" ^
  -H ^"Sec-Fetch-User: ?1^" ^
  -H ^"Upgrade-Insecure-Requests: 1^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36^" ^
  -H ^"sec-ch-ua: ^\^"Not A(Brand^\^";v=^\^"8^\^", ^\^"Chromium^\^";v=^\^"132^\^", ^\^"Google Chrome^\^";v=^\^"132^\^"^" ^
  -H ^"sec-ch-ua-mobile: ?0^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^"  > channels.xml

  
