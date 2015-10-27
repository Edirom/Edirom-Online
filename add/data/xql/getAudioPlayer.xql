xquery version "3.0";
(:
  Edirom Online
  Copyright (C) 2015 The Edirom Project
  http://www.edirom.de

  Edirom Online is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Edirom Online is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.
:)

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

let $uri := request:get-parameter('uri', '')
let $docUri := if(contains($uri, '#')) then(substring-before($uri, '#')) else($uri)
let $doc := eutil:getDoc($docUri)
let $artist := $doc/mei:meiHead/mei:fileDesc/mei:sourceDesc/mei:source/mei:titleStmt/mei:respStmt[1]/mei:persName
let $album := string-join($doc/mei:meiHead/mei:fileDesc/mei:sourceDesc/mei:source/mei:titleStmt/mei:title, ' – ')
(: TODO: Prüfen, ob die Pfade relativ sind :)

let $albumCover := '../../../contents/recordings/' || $doc/mei:meiHead/mei:fileDesc/mei:sourceDesc/mei:source/mei:physDesc/mei:extend[@label='cover']/mei:fig/mei:graphic/string(@target)
let $records := for $rec in $doc//mei:recording
                let $recSource := $doc//mei:source[@xml:id = substring-after($rec/@decls, '#')]
                let $recTitle := $recSource/mei:titleStmt/mei:title
                let $avFile := '../../../contents/recordings/' || $rec/mei:avFile[2]/string(@target)
                return
                    '{
    					"name": "' || replace($recTitle, '"', '\\"') || '"
    					,"artist": "' || replace($artist, '"', '\\"') || '"
    					,"album": "' || replace($album, '"', '\\"') || '"
    					,"url": "' || $avFile || '"
    					,"live": false' || (if($albumCover = '../../../contents/recordings/')then()else(
    					',"cover_art_url": "' || $albumCover || '"')) || '
				    }'

let $audioConfig := '{
			"songs": [' ||
				string-join($records, ', ')
			|| '],
			"default_album_art": "../../resources/img/default-cover.png"
		}'

return
<html>
    <head>
        <meta charset="UTF-8"/>
        <title></title>
        
        <!-- **Amplitude.js** -->
        <script type="text/javascript" src="../../resources/js/amplitude.min.js"></script>
        <script type="text/javascript" src="../../resources/js/jquery-2.1.4.min.js"></script>
        
        <link rel="stylesheet" href="../../resources/css/audio-player.css"/>
    </head>
    <body>
        <div>
            <img id="small-player-album-art" amplitude-song-info="cover"/>
            <div id="small-player">
                <div id="small-player-left">
                    <div class="amplitude-play-pause amplitude-paused" amplitude-main-play-pause="true"></div>
                </div>
                <div id="small-player-middle">	
                    <div id="small-player-middle-top">
                            <div id="now-playing-title" amplitude-song-info="name"></div>
                            <div class="album-information"><span amplitude-song-info="artist"></span> - <span amplitude-song-info="album"></span></div>
                    </div>
                    <div id="small-player-middle-bottom">
                        <div class="amplitude-song-time-visualization" amplitude-single-song-time-visualization="true" id="song-time-visualization"></div>
                    </div>
                </div>
                <div id="small-player-right">
                    <span id="current-time">
                        <span class="amplitude-current-minutes" amplitude-single-current-minutes="true">0</span>:<span class="amplitude-current-seconds" amplitude-single-current-seconds="true">00</span>
                    </span>
                </div>
            </div>
        </div>
    </body>
    <script type="text/javascript">
		Amplitude.init({$audioConfig});
	</script>
</html>
