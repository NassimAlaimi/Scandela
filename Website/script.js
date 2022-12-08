//Option de la carte
let mapOptions = {
    center:[47.237054, -1.565895],
    zoom:12,
    zoomControl: false
}

// Option des layers
let layerOptions = {
    attribution: 'Scampoule !',
    maxNativeZoom: 18,
    maxZoom: 25
}

//Création de la carte
var map = new L.map('map' , mapOptions);

//Ajout des couches
let baseLayer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', layerOptions);
let darkLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', layerOptions);
map.addLayer(baseLayer);


//Bouton de switch dark/normal mode
let darkModeElem = document.getElementById('darkMode');

function onDarkModeClick() {
    let textDarkMode = document.getElementById('darkModeText');
    if (map.hasLayer(baseLayer)) {
        map.removeLayer(baseLayer);
        map.addLayer(darkLayer);
        textDarkMode.style.color = "yellow"
    } else {
        map.removeLayer(darkLayer);
        map.addLayer(baseLayer);
        textDarkMode.style.color = "white"
    }
}

//Gestion du clic sur la carte
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

//Gestion des positions des markers
let layerGroupArray = [];
let markerArray = [];

// A Faire
let filterArray = [];

//Gestion du texte des popups
function replaceToAcronym(str) {
    let value;
    switch (str) {
        case "DIC": value = String("Diodes Infrarouges (DIC)");              break;
        case "FC" : value = String("Fluorescentes Compactes (FC)");          break;
        case "HAL": value = String("Halogènes (HAL)");                       break;
        case "IC" : value = String("Infrarouges (IC)");                      break;
        case "IM" : value = String("Infrarouges à Mélange (IM)");            break;
        case "IMC": value = String("Infrarouges à Mélange Compactes (IMC)"); break;
        case "LED": value = String("Diodes Electroluminescentes (LED)");     break;
        case "MBP": value = String("Mercure Basse Pression (MBP)");          break;
        case "SHP": value = String("Sodium Haute Pression (SHP)");           break;
        case "SBP": value = String("Sodium Basse Pression (SBP)");           break;
        case "TF" : value = String("Tungstène Fluorescentes (TF)");          break;
        case "TL" : value = String("Tungstène à Lames (TL)");                break;
        default   : value = String("Donnée non disponible");                 break;
    }
    return (value);
}

function generatePopupText(json, i) {
    let type = String("<h1> Éclairage n° " + json[i]['fields']['numero'] + "</h1>");
    type += String("<h2> <u>Adresse:</u> <br/>" + json[i]['fields']['nom_voie'] + ", <br/>" + json[i]['fields']['lib_com'] + "</h2> <h2> <u>Type d'éclairage:</u> <br/>");
    type += replaceToAcronym(json[i]['fields']['type_lampe']);
    type += String("<h2> <u>État:</u> <br/>" + "Pas encore possible" + "</h2>");
    type += String("<h2><u>Conso:</u><br/> 34 kW/h</h2>");
    type += String("<h2><u>Émission (CO2):</u><br/> 14 gr de CO2</h2>");

    return (type);
}

function parseData(json, layerGroupArray, markerArray) {
    //Création des clusters et de leurs icones
    let clusters = L.markerClusterGroup({
        //Modifie l'icone des clusters
        // iconCreateFunction: function(cluster) {
        //     return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
        // },
        singleMarkerMode: false, //Affiche uniquement des clusters
        spiderfyOnMaxZoom: false, //Désactive le spiderfy --> je sais plus c'est quoi mais c'est cool, vas de paire avec disableClusteringAtZoom donc à laisser
        disableClusteringAtZoom: 20 //Désactive le clustering à partir du zoom
    });

    //Options css des popups
    var customOptions = {
        'maxWidth': '500',
        'className' : 'custom'
    }

    //Iterate through the JSON array.
    for (let i = 0; i < json.length; i++) {
        let lat = json[i]['fields']['geo_point_2d'][0];
        let lng = json[i]['fields']['geo_point_2d'][1];
        let ville = json[i]['fields']['lib_com'];
        createMarker(map, lat, lng, ville, layerGroupArray, markerArray);

        // Information sur les Lampadaires
        type = generatePopupText(json, i);

        let marker = new L.Marker([lat, lng]).bindPopup(type, customOptions);
        clusters.addLayer(marker);
    }
    //Ajout des cluster dans la carte
    map.addLayer(clusters);
    filterArray = getAndApplyFilter(json); // a faire ne marche pas encore
}

//Gestion de l'icone des markers -- A FAIRE
var myIcon = L.icon({
    class : "circle",
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    // shadowUrl: 'my-icon-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
});

//Création des markers
function createMarker(lat, lng, ville, layerGroupArray, markerArray) {
    let marker = new L.Marker([lat, lng])
    .bindPopup(ville);
    markerArray.push(marker);
    addMarkerToLayerGroup(marker, ville, layerGroupArray);
}

//Ajout des markers dans un layerGroup
function addMarkerToLayerGroup(marker, layerGroup, layerGroupArray) {
    if (layerGroupArray[layerGroup] == undefined) {
        layerGroupArray[layerGroup] = new L.LayerGroup();
    }
    layerGroupArray[layerGroup].addLayer(marker);
}

//Read json
function readData() {
    fetch("nantesData.json")
        .then(response => response.json())
        .then(json => parseData(json, layerGroupArray, markerArray))
        .catch(err => console.log(err));
}

readData();

//Gestion du print du zoom
// map.on('zoomend', showZoomLevel);
// showZoomLevel();

// function showZoomLevel() {
//     document.getElementById('zoom').innerHTML = map.getZoom();
// }