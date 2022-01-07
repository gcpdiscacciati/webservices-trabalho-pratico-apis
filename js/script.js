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