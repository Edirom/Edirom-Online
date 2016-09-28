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
let $artist := $doc//mei:titleStmt/mei:respStmt/mei:persName[@role='artist']
let $album := $doc//mei:meiHead/mei:fileDesc/mei:sourceDesc/mei:source[1]/mei:titleStmt/mei:title[1]/text()
let $albumCover := $doc//mei:graphic[@type='cover']/string(@target)
let $records := for $rec in $doc//mei:recording
                let $recSource := $doc//mei:source[@xml:id = substring-after($rec/@decls, '#')]
                let $recTitle := $recSource/mei:titleStmt/mei:title
                let $avFile := $rec/mei:avFile[1]/string(@target)
                return
                    '{
    					"name": "' || replace($recTitle, '"', '\\"') || '"
    					,"artist": "' || replace($artist, '"', '\\"') || '"
    					,"album": "' || replace($album, '"', '\\"') || '"
    					,"url": "' || $avFile || '"
    					,"live": false' ||
    					',"cover_art_url": "' || $albumCover || '"' || '
				    }'

let $audioConfig := '{
			"songs": [' ||
				string-join($records, ', ')
			|| '],
			"default_album_art": "../../resources/img/no-cover.png"
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
		<!-- Start Top Header -->
		<div id="top-header" class="hidden-on-collapse">
			<div id="top-header-toggle" class="small-player-toggle-contract"></div>

			<div class="now-playing-title" amplitude-song-info="name"></div>
			<div class="album-information"><span amplitude-song-info="artist"></span> - <span amplitude-song-info="album"></span></div>
		</div>
		<!-- End Top Header -->

		<!-- Start Large Album Art -->
		<div id="top-large-album" class="hidden-on-collapse">
			<img id="large-album-art" amplitude-song-info="cover"/>
		</div>
		<!-- End Large Album Art -->

		<!-- Begin Small Player -->
		<div id="small-player">
			<!-- Begin Small Player Left -->
			<div id="small-player-left" class="hidden-on-expanded">
				
			</div>
			<!-- End Small Player Left -->

			<!-- Begin Small Player Album Art -->
			<img id="small-player-album-art" class="hidden-on-expanded" amplitude-song-info="cover"/>
			<!-- End Small Player Album Art -->

			<!-- Begin Small Player Middle -->
			<div id="small-player-middle" class="hidden-on-expanded">	
				<div id="small-player-middle-top">
					<!-- Begin Controls Container -->
					<div id="small-player-middle-controls">
						<div class="amplitude-prev" id="middle-top-previous"></div>
						<div class="amplitude-play-pause amplitude-paused" amplitude-main-play-pause="true" id="middle-top-play-pause"></div>
						<div class="amplitude-next" id="middle-top-next"></div>
					</div>
					<!-- End Controls Container -->

					<!-- Begin Meta Container -->
					<div id="small-player-middle-meta">
						<div class="now-playing-title" amplitude-song-info="name"></div>
						<div class="album-information"><span amplitude-song-info="artist"></span> - <span amplitude-song-info="album"></span></div>
					</div>
					<!-- End Meta Container -->
				</div>
				
				<div id="small-player-middle-bottom">
					<div class="amplitude-song-time-visualization" amplitude-single-song-time-visualization="true" id="song-time-visualization"></div>
				</div>
			</div>
			<!-- End Small Player Middle -->

			<!-- Begin Small Player Right -->
			<div id="small-player-right" class="hidden-on-expanded">
				<div id="toggle-playlist" class="playlist-toggle"></div>
				<span class="current-time">
					<span class="amplitude-current-minutes" amplitude-single-current-minutes="true">0</span>:<span class="amplitude-current-seconds" amplitude-single-current-seconds="true">00</span>
				</span>
			</div>
			<!-- End Small Player Right -->

			<!-- Begin Small Player Full Bottom -->
			<div id="small-player-full-bottom" class="hidden-on-collapse">
				<div id="toggle-playlist-full" class="playlist-toggle"></div>
				<div id="small-player-full-bottom-controls">
					<div class="amplitude-prev" id="middle-bottom-previous"></div>
					<div class="amplitude-play-pause amplitude-paused" amplitude-main-play-pause="true" id="small-player-bottom-play-pause"></div>
					<div class="amplitude-next" id="middle-top-next"></div>
				</div>
				<div id="small-player-full-bottom-info">
					<span class="current-time">
						<span class="amplitude-current-minutes" amplitude-single-current-minutes="true">0</span>:<span class="amplitude-current-seconds" amplitude-single-current-seconds="true">00</span>
					</span>
					
					<div class="amplitude-song-time-visualization" amplitude-single-song-time-visualization="true" id="song-time-visualization-large"></div>
					
					<span class="time-duration">
						<span class="amplitude-duration-minutes" amplitude-single-duration-minutes="true">0</span>:<span class="amplitude-duration-seconds" amplitude-single-duration-seconds="true">00</span>
					</span>
				</div>
			</div>
			<!-- End Small Player Full Bottom -->
		</div>
		<!-- End Small Player -->

		<!-- Begin Playlist -->
		<div id="small-player-playlist" style="height:auto;max-height:590px;margin-bottom:18px;">
			<div class="information">
				{$artist} – {$album}
				<hr/>
			</div>
			{
			for $rec at $i in $doc//mei:recording
                let $recSource := $doc//mei:source[@xml:id = substring-after($rec/@decls, '#')]
                let $recTitle := $recSource/mei:titleStmt/mei:title/text()
                let $avFile := '../../../exist/apps/contents/audioData/' || $rec/mei:avFile[2]/string(@target)
                return
                
                    <div class="amplitude-song-container amplitude-play-pause playlist-item" amplitude-song-index="{$i - 1}">
				        <div class="playlist-meta">
					       <div class="now-playing-title">{$recTitle}</div>
					       <div class="album-information">{$artist} – {$album}</div>
				        </div>
				        <div style="clear: both;"></div>
			         </div>
		    }
		</div>	
		<!-- End Playlist -->
	</body>
    <script type="text/javascript">
		Amplitude.init({$audioConfig});
		
		var expanded = false;
		var playlistEpxanded = true;
		/*
			jQuery Visual Helpers
		*/
		$('#small-player').hover(function(){{
			$('#small-player-middle-controls').show();
			$('#small-player-middle-meta').hide();
		}}, function(){{
			$('#small-player-middle-controls').hide();
			$('#small-player-middle-meta').show();

		}});

		$('#top-large-album').hover(function(){{
			$('#top-header').show();
			$('#small-player').show();
		}}, function(){{
			if( !$('#top-header').is(':hover')) {{
			 if(!$('#small-player').is(':hover') ){{
				$('#top-header').fadeOut(1000);
				$('#small-player').fadeOut(1000);
		      }}
			}}
		}});

		$('#top-header').hover(function(){{
			$('#top-header').show();
			$('#small-player').show();
		}}, function(){{

		}});

		/*
			Toggles Album Art
		*/
		$('#small-player-toggle').click(function(){{
			$('.hidden-on-collapse').show();
			$('.hidden-on-expanded').hide();
			/*
				Is expanded
			*/
			expanded = true;

			$('#small-player').css('border-top-left-radius', '0px');
			$('#small-player').css('border-top-right-radius', '0px');
		}});

		$('#top-header-toggle').click(function(){{
			$('.hidden-on-collapse').hide();
			$('.hidden-on-expanded').show();
			/*
				Is collapsed
			*/
			expanded = false;

			$('#small-player').css('border-top-left-radius', '5px');
			$('#small-player').css('border-top-right-radius', '5px');
		}});

		$('.playlist-toggle').click(function(){{
			if( playlistEpxanded ){{
				$('#small-player-playlist').hide();

				$('#small-player').css('border-bottom-left-radius', '5px');
				$('#small-player').css('border-bottom-right-radius', '5px');

				$('#large-album-art').css('border-bottom-left-radius', '5px');
				$('#large-album-art').css('border-bottom-right-radius', '5px');

				playlistEpxanded = false;
			}}else{{
				$('#small-player-playlist').show();

				$('#small-player').css('border-bottom-left-radius', '0px');
				$('#small-player').css('border-bottom-right-radius', '0px');

				$('#large-album-art').css('border-bottom-left-radius', '0px');
				$('#large-album-art').css('border-bottom-right-radius', '0px');

				playlistEpxanded = true;
			}}
		}});
	</script>
</html>
