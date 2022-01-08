//Gera o mapa
var mapa = L.map('map', {
	preferCanvas: true,
    zoomSnap: 0.1,
}).setView([15,0], 2.9);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 7,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ2lkaXNjYWNjaWF0aSIsImEiOiJja25oc2hxYXowN2VsMnFxY2MxamZhOXBzIn0.jIB4XQHGA06EQz684svC3w'
}).addTo(mapa);

mapa.on('click', handleMapClick);

function handleMapClick(e){
    let lat = e.latlng.lat;
    let long = e.latlng.lng;
    let urlGetCountry = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + long + ',' + lat +'.json?limit=1&access_token=pk.eyJ1IjoiZ2lkaXNjYWNjaWF0aSIsImEiOiJja25oc2hxYXowN2VsMnFxY2MxamZhOXBzIn0.jIB4XQHGA06EQz684svC3w'
    var req = new XMLHttpRequest();
    var req2 = new XMLHttpRequest();
    var country = '';
    var popup = L.popup();

    req2.onreadystatechange = function(){
        if(req2.readyState == XMLHttpRequest.DONE) {
			if (req2.status == 0 || (req2.status >= 200 && req2.status < 400)) {
				resp2 = JSON.parse(req2.responseText);
                var tracks = resp2.tracks.track;
                popup
                    .setLatLng(e.latlng)
                    .setContent(()=>{
                        let tracksString = '<h4>' + country.toLocaleUpperCase() + '</h4>';
                        tracks.forEach((element, index) => {
                            console.log(index);
                            let track = element.name;
                            let artist = element.artist.name;
                            tracksString += '<p id="track'+index.toString()+'">'+ track + ' - ' + artist +' <button class="video" onclick=handleVideoClick(this.parentElement)>Show</button></p>';
                        });
                        return tracksString.trim();
                    })
                    .openOn(mapa);
                        
            }
        }
    }

	req.onreadystatechange = function (){
		
		if(req.readyState == XMLHttpRequest.DONE) {
			if (req.status == 0 || (req.status >= 200 && req.status < 400)) {
				resp = JSON.parse(req.responseText);
                if(resp.features.length != 0){
                    let place = resp.features[0].place_name;
                    console.log(place);
                    country = place.split(',').pop().toLowerCase().trim();
                    console.log(country);
                    console.log(encodeURI(country));
                    urlGetTracks = 'http://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country='+encodeURI(country)+'&limit=5&api_key=cfb7bdf9a70c43f3c35c98c161eff14a&format=json';
                    req2.open("GET", urlGetTracks, true);
                    req2.send();
                }  
            }
        }
    }

    

    req.open("GET", urlGetCountry, true);
	req.send();
    
}

function handleVideoClick(element){
    let track = element.textContent.trim();
    console.log(track);
}