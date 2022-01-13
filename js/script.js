//Gera o mapa
var mapa = L.map('map', {
	preferCanvas: true,
    zoomSnap: 0.1,
    worldCopyJump: true,
}).setView([15,0], 2.9);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 7,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ2lkaXNjYWNjaWF0aSIsImEiOiJja25oc2hxYXowN2VsMnFxY2MxamZhOXBzIn0.jIB4XQHGA06EQz684svC3w'
}).addTo(mapa);

//Aciona a função que lida com os cliques no mapa
mapa.on('click', handleMapClick);

var info = L.control();

//Cria caixa de intruções no canto superior direito da tela.
info.onAdd = function () {
    this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = '<h4>Last.fm\'s Top Tracks by Country</h4>'+
                            '<p>Click anywhere on the map</p>';
    return this._div;
};

info.addTo(mapa);



//Ao clicar em um local do mapa, faz uma chamada à API do Mapbox para realizar uma geocodificação reversa,
//de forma a detectar o país através das coordenadas do clique.
//Com o país detectado, faz uma requisição à API do Last.fm para descobrir as top 5 músicas (com base nos dados da plataforma Last.fm)
//daquele país na semana anterior, e as apresenta na forma de um pop-up no local clicado no mapa.
function handleMapClick(e){
    let lat = e.latlng.lat;
    let long = e.latlng.lng;
    let urlGetCountry = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + long + ',' + lat +'.json?limit=1&access_token=pk.eyJ1IjoiZ2lkaXNjYWNjaWF0aSIsImEiOiJja25oc2hxYXowN2VsMnFxY2MxamZhOXBzIn0.jIB4XQHGA06EQz684svC3w'
    var req = new XMLHttpRequest();
    var req2 = new XMLHttpRequest();
    var country = '';
    var popup = L.popup();
    popup
        .setLatLng(e.latlng)
        .setContent('Loading...')
        .openOn(mapa);

    req2.onreadystatechange = function(){
        if(req2.readyState == XMLHttpRequest.DONE) {
			if (req2.status == 0 || (req2.status >= 200 && req2.status < 400)) {
				resp2 = JSON.parse(req2.responseText);
                if(!resp2.error){
                    var tracks = resp2.tracks.track;
                    if(tracks.length == 0){
                        setPopupForInvalidData(popup);
                    }
                    else{
                        popup
                            .setLatLng(e.latlng)
                            .setContent(()=>{
                                let tracksString = '<h4>' + country.toLocaleUpperCase() + '</h4>';
                                tracks.forEach((element, index) => {
                                    let track = element.name;
                                    let artist = element.artist.name;
                                    tracksString += '<p id="track'+index.toString()+'" class="tracks">'+ track + ' - ' + artist +' <button onclick=handleVideoClick(this.parentElement)>Show Link</button><div id="track'+index.toString()+'Player" class="divLink" style="display: none;"></div></p>';
                                });
                                return tracksString.trim();
                            })
                            .openOn(mapa);
                    }
                }
                else{
                    setPopupForInvalidData(popup);
                }
                        
            }
            
        }
    }

	req.onreadystatechange = function (){
		
		if(req.readyState == XMLHttpRequest.DONE) {
			if (req.status == 0 || (req.status >= 200 && req.status < 400)) {
				resp = JSON.parse(req.responseText);
                if(resp.features.length != 0){
                    let place = resp.features[0].place_name;
                    country = place.split(',').pop().toLowerCase().trim();
                    urlGetTracks = 'http://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country='+encodeURI(country)+'&limit=5&api_key=cfb7bdf9a70c43f3c35c98c161eff14a&format=json';
                    req2.open("GET", urlGetTracks, true);
                    req2.send();
                }
                else{
                    setPopupForInvalidData(popup);
                } 
            }
        }
    }
    req.open("GET", urlGetCountry, true);
	req.send();
}

//Para cada faixa mostrada no pop-up, é mostrado ao lado um botão que, caso seja clicado pela primeira vez, faz uma busca pela música
//na API do YouTube, obtendo o link para um vídeo da música e o exibe no pop-up e o armazena no localStorage. Caso não seja o primeiro
//clique, busca o link direto do localStorage.
function handleVideoClick(element){
    let track = element.childNodes[0].nodeValue.toLowerCase().trim();
    let divVideo = $('#'+ element.id + 'Player')[0];
    let currentButton = element.childNodes[1];
    let url = 'https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=' + encodeURI(track) + '&type=video&videoDefinition=high&key=AIzaSyAExjmURrgX4oK9ldd1j_beKpHjKG_aJbc';
    var req = new XMLHttpRequest();
    toggle(divVideo, currentButton);
    divVideo.innerHTML = '<p>Loading...</p>';
    req.onreadystatechange = function (){
		
		if(req.readyState == XMLHttpRequest.DONE) {
			if (req.status == 0 || (req.status >= 200 && req.status < 400)) {
				resp = JSON.parse(req.responseText);
                let videoID = resp.items[0].id.videoId;
                let videoURL = 'https://youtube.com/watch?v=' + videoID;
                localStorage.setItem(track, videoURL);
                divVideo.innerHTML = '<a href="'+videoURL+'" target="_blank" class="videoLink">Watch on YouTube</a>';
            }
            else{
                if(req.status == 403){
                    divVideo.innerHTML = '<p>Requests\' limit has been reached.</p>';
                }
                else{
                    divVideo.innerHTML = '<p>A problem has ocurred, please try again later.</p>';
                }
            }
        }
    }
    //Checa se o link do vídeo já foi pesquisado e está no localStorage.
    let cachedTrack = localStorage.getItem(track);
    if(cachedTrack === null){
        req.open("GET", url, true);
        req.send();
    }
    else{
        divVideo.innerHTML = '<a href="'+cachedTrack+'" target="_blank" class="videoLink">Watch on Youtube</a>';
    }
}

//Função que "liga e desliga" a exibição do elemento com o link do vídeo.
function toggle(element, button){
    if (element.style.display === "none") {
        element.style.display = "block";
        button.textContent = 'Hide Link';
        }
    else {
        element.style.display = "none";
        button.textContent = 'Show Link';
    }

}

function setPopupForInvalidData(popup){
    popup
        .setContent('No available data for this location :(')
        .openOn(mapa);
}