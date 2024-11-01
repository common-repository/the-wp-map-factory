// Initialise global variables
var tmfPostId;

var tmfBackendThunderforestKey;
var tmfTheMap, tmfMapThumbnail, tmfBounds, tmfMapTypeId = '', tmfOSMCreditListenerIsSet = false;

var tmfCenterControlDiv, tmfMapTypesLocation;
var tmfMapTypeControl = false, tmfFullscreenControl = false, tmfStreetViewControl = false, tmfZoomControl = false;

var tmfAddPlacecardListener;

var tmfCurrentMarkerNumber, tmfMarkerObject = {}, tmfMarker, tmfMarkers = [], tmfMarkerObjects = [];
var tmfSvgMarkerArray = [];
var tmfAddMarkerListener, tmdAddEditMarkerListener, tmfEditMarkerListener = [];
var tmfShowMarkerInfoWindowListener = [], tmfMarkerInfoWindow;

var tmfCurrentCircleNumber, tmfCircleObject = {}, tmfCircle, tmfCircles = [], tmfCircleObjects = [];
var tmfAddCircleListener, tmdAddEditCircleListener, tmfEditCircleListener = [];
var tmfShowCircleInfoWindowListener = [], tmfCircleInfoWindow, tmfShowCircleMouseOverListener = [], tmfShowCircleMouseOutListener = [];

var tmfPath = [], tmfPolylineSymbolPath = [];

var tmfCurrentPolygonNumber, tmfPolygonObject = {}, tmfPolygon, tmfPolygons = [], tmfPolygonObjects = [];
var tmfAddPolygonListener, tmfAddEditPolygonListener, tmfEditPolygonListener = [], addPolygonVertexListener;
var tmfShowPolygonInfoWindowListener = [], tmfPolygonInfoWindow, tmfShowPolygonMouseOverListener = [], tmfShowPolygonMouseOutListener = [];

var tmfCurrentPolylineNumber, tmfPolylineObject = {}, tmfPolyline, tmfPolylines = [], tmfPolylineObjects = [];
var tmfAddPolylineListener, tmfAddEditPolylineListener, tmfEditPolylineListener = [], addPolylineVertexListener;
var tmfShowPolylineInfoWindowListener = [], tmfPolylineInfoWindow, tmfShowPolylineMouseOverListener = [], tmfShowPolylineMouseOutListener = [];
var tmfPolylineSymbolRepeat, tmfPolylineSymbolOffset;

var tmfNumberOfPolylinesWithCharts = 0, tmfProfileArray = [], tmfPolylineElevationSpacing = 256;

var tmfChart, tmfChartData, tmfChartOptions, tmfShowElevationChart, tmfChartColor, tmfChartStrokeweight, tmfChartAxisHeight, tmfChartMinAxisHeight, tmfChartMaxAxisHeight, tmfChartFixedAxisHeight;
var tmfChartElevationUnits = 1, tmfChartDistanceUnits = 1, tmfLowestElevation, tmfHighestElevation;

var tmfvAxisTitle, tmfhAxisTitle, tmfMetaDataDistance, tmfMetaDataHeight;


function tmfMapWidthCheck() {
    if (tmfPlacecardObject['tmfPlaceCardDisplay'] == 'true') {
        if (document.getElementById('tmf-map-container-' + tmfPostId).clientWidth < 370) {
            document.getElementById('tmf-placecard-container-outer').style.display = 'none';
        } else
        {
            document.getElementById('tmf-placecard-container-outer').style.display = 'block';
        }
    }
}

function tmfGetMapVariables() {
    if (tmfBackendVariables.tmfIsBackend == true || tmfBackendVariables.tmfLicenseStatus == 'valid') {
        window.addEventListener("resize", tmfMapWidthCheck);
    }

    tmfBackendThunderforestKey = tmfBackendVariables.tmfBackendThunderforestKey;

    if (tmfBackendVariables.tmfChartUnits == 'feet') {
        tmfChartElevationUnits = 3.28084;
        tmfChartDistanceUnits = 1.60934;
        tmfvAxisTitle = tmfFrontendVariables.tmfTextTokens.tmfTokenElevationF;
        tmfhAxisTitle = tmfFrontendVariables.tmfTextTokens.tmfTokenDistanceMiles;
        tmfMetaDataDistance = tmfFrontendVariables.tmfTextTokens.tmfTokenMiles;
        tmfMetaDataHeight = tmfFrontendVariables.tmfTextTokens.tmfTokenFeet;
    } else
    {
        tmfvAxisTitle = tmfFrontendVariables.tmfTextTokens.tmfTokenElevationM;
        tmfhAxisTitle = tmfFrontendVariables.tmfTextTokens.tmfTokenDistanceKm;
        tmfMetaDataDistance = tmfFrontendVariables.tmfTextTokens.tmfTokenKm;
        tmfMetaDataHeight = tmfFrontendVariables.tmfTextTokens.tmfTokenMeters;
    }

    tmfPluginUrl = tmfBackendVariables.tmfPluginUrl;    
    tmfSvgMarkerArray = tmfFrontendVariables.tmfSvgMarkerArray;
    tmfPostId = tmfFrontendVariables.tmfPostId;

    tmfMarkerObjects = tmfCreateObjectArrayFromString ('tmf-map-marker-array');
    tmfCircleObjects = tmfCreateObjectArrayFromString ('tmf-map-circle-array');
    tmfPolygonObjects = tmfCreateObjectArrayFromString ('tmf-map-polygon-array');
    tmfPolylineObjects = tmfCreateObjectArrayFromString ('tmf-map-polyline-array');

    if (tmfTheBasicsObject['tmfToggleType'] !='NONE') {
        tmfMapTypeControl = true;
    }
    if (tmfTheBasicsObject['tmfButtonFullScreen'] == 'true') {
        tmfFullscreenControl = true;
    }
    if (tmfTheBasicsObject['tmfButtonStreetView'] == 'true') {
        tmfStreetViewControl = true;
    }
    if (tmfTheBasicsObject['tmfButtonZoom'] == 'true') {
        tmfZoomControl = true;
    }
}

function tmfCreateObjectArrayFromString(id) {
    var tmfObjectString, tmfObjectArray, tmfObjectSubArray, tmfObjectElements, tmfSingleObject = [], tmfObjectToReturn = [];
    tmfObjectString = document.getElementById(id).value;
    if (tmfObjectString !="") {
        tmfObjectArray = tmfObjectString.split("|");

        var i, k;
        for (i = 0, k = -1; i < tmfObjectArray.length; i++) {
            if (i % tmfObjectArray.length === 0) {
                k++;
                tmfObjectSubArray = '';
            }
            tmfObjectSubArray = tmfObjectArray[i];
            tmfObjectSubArray = tmfObjectSubArray.slice(0, -1);
            tmfObjectElements = tmfObjectSubArray.split("¦");

            tmfSingleObject = [];
            for (var l = 0; l < tmfObjectElements.length; l = l + 2) {
                tmfSingleObject[tmfObjectElements[l]] = tmfObjectElements[l + 1]; 
            }
            tmfObjectToReturn.push(tmfSingleObject)
        }
    }
    return tmfObjectToReturn;
}

/**
 * Initialise map
 */
function tmfInitialiseMap() {
    tmfGetMapVariables();

    tmfBounds = new google.maps.LatLngBounds();

    tmfMarkerInfoWindow = new google.maps.InfoWindow();
    tmfCircleInfoWindow = new google.maps.InfoWindow();
    tmfPolygonInfoWindow = new google.maps.InfoWindow();
    tmfPolylineInfoWindow = new google.maps.InfoWindow();

    tmfTheMap = new google.maps.Map(document.getElementById('tmf-map-' + tmfPostId), {
    });

    tmfMapTypesLocation = google.maps.ControlPosition.LEFT_TOP;
    var tmfMapControlsLocation = google.maps.ControlPosition.TOP_RIGHT;
    if (tmfPlacecardObject['tmfPlaceCardDisplay'] == 'true') {
        tmfMapTypesLocation = google.maps.ControlPosition.TOP_RIGHT;
        tmfMapControlsLocation = google.maps.ControlPosition.RIGHT_TOP;
    }
    
    tmfBuildGoogleMapTypes();
    tmfTheMap.setOptions({
        mapTypeId: tmfMapTypeId,
        mapTypeControl: tmfMapTypeControl,
        fullscreenControl: tmfFullscreenControl,
        streetViewControl: tmfStreetViewControl,
        zoomControl: tmfZoomControl
    });

    tmfPlaceCardDisplay();
   
    if (tmfBackendVariables.tmfLicenseStatus != 'valid' && tmfBackendVariables.tmfIsBackend == false) {
        if (tmfMarkerObjects.length > 0) {
            for (var l = tmfMarkerObjects.length -1; l >= 0; l--) {
                if (tmfMarkerObjects[l].tmfMarkerType == 'png' || tmfMarkerObjects[l].tmfMarkerType == 'user') {
                    tmfMarkerObjects.splice(l, 1);   
                }
            }
        }
    }

    if (tmfMarkerObjects.length > 0) {
        tmfDrawMarkers();
    }
    if ((tmfCircleObjects.length > 0 && tmfBackendVariables.tmfLicenseStatus == 'valid') || (tmfCircleObjects.length > 0 && tmfBackendVariables.tmfIsBackend == true)) {
        tmfDrawCircles();
    }
    if ((tmfPolygonObjects.length > 0 && tmfBackendVariables.tmfLicenseStatus == 'valid') || (tmfCircleObjects.length > 0 && tmfBackendVariables.tmfIsBackend == true)) {
        tmfDrawPolygons();
    }
    if ((tmfPolylineObjects.length > 0 && tmfBackendVariables.tmfLicenseStatus == 'valid') || (tmfCircleObjects.length > 0 && tmfBackendVariables.tmfIsBackend == true)) {
        tmfDrawPolylines();
    }

    tmfTheMap.addListener('click', function() {
        if (tmfMarkerInfoWindow) {
            tmfMarkerInfoWindow.close();
        }
        if (tmfCircleInfoWindow) {
            tmfCircleInfoWindow.close();
        }
        if (tmfPolygonInfoWindow) {
            tmfPolygonInfoWindow.close();
        }
        if (tmfPolylineInfoWindow) {
            tmfPolylineInfoWindow.close();
        }
    });

    if (tmfTheBasicsObject['tmfFitMethod'] == 'objects') {
        tmfTheMap.fitBounds(tmfBounds);
    } else
    {
        tmfTheMap.setCenter({
            lat: parseFloat(tmfTheBasicsObject['tmfMapCenterLat']),
            lng: parseFloat(tmfTheBasicsObject['tmfMapCenterLon'])
        });

        tmfTheMap.setZoom(parseFloat(tmfTheBasicsObject['tmfMapZoom']));
    }

    tmfCenterControlDiv = document.createElement('div');
    var tmfCenterControl = new tmfCenterControlFunction(tmfCenterControlDiv);
    tmfCenterControlDiv.index = 1;
    tmfTheMap.controls[tmfMapControlsLocation].push(tmfCenterControlDiv);

    tmfMapTypeControls();

    tmfSetMapSize();
}

function tmfSetMapSize() { // Get and set map size
    if (tmfTheBasicsObject['tmfMapWidthType'] == 'percentage') {
        tmfMapWidth = tmfTheBasicsObject['tmfMapWidthPercentage'] + '%';
    } 
    else {
        tmfMapWidth = tmfTheBasicsObject['tmfMapWidthPixel'] + 'px';
    }

    if (tmfTheBasicsObject['tmfMapHeightType'] == 'percentage') {
        tmfMapHeight = tmfTheBasicsObject['tmfMapHeightPercentage'] + '%';
    } 
    else {
        tmfMapHeight = tmfTheBasicsObject['tmfMapHeightPixel'] + 'px';
    }

    document.getElementById('tmf-map-container-' + tmfPostId).style.width = tmfMapWidth; 
    document.getElementById('tmf-polyline-chart-' + tmfPostId).style.width = tmfMapWidth;
    document.getElementById('tmf-map-container-' + tmfPostId).style.height = tmfMapHeight;

    tmfPlaceCardDisplay();
}

function tmfBuildGoogleMapTypes() {
    tmfMapTypeIds = [];
    mapTypeIdCounter = 0;
    var tmfGoogleTypes = [
        tmfTheBasicsObject['tmfMapTypeGoogleRoadmap'],
        tmfTheBasicsObject['tmfMapTypeGoogleSatellite'],
        tmfTheBasicsObject['tmfMapTypeHybrid'],
        tmfTheBasicsObject['tmfMapTypeGoogleRoadmapTerrain']
    ];

    for (var type in google.maps.MapTypeId) {
        if (tmfGoogleTypes[mapTypeIdCounter] == 'true') {
            tmfMapTypeIds.push(google.maps.MapTypeId[type]);
            if (tmfMapTypeId == '') {
                tmfMapTypeId = google.maps.MapTypeId[type];
            }
        }
        mapTypeIdCounter = mapTypeIdCounter + 1;
    }

    if (tmfTheBasicsObject['tmfMapTypeOSM'] == 'true') {
        tmfMapTypeIds.push('OSM1');
        tmfTheMap.mapTypes.set("OSM1", new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return "https://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OSM",
            alt : "Show Open Street Map",
            maxZoom: 18
        }));

        if (!tmfOSMCreditListenerIsSet) {
            google.maps.event.addListener( tmfTheMap, 'maptypeid_changed', function() {
                if (tmfTheMap.getMapTypeId() == 'OSM1') {
                    var centerControlDiv = document.createElement('div');
                    var tmfOSMCenterController = new tmfOSMCenterControl(centerControlDiv);
                    centerControlDiv.index = 1;
                    tmfTheMap.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerControlDiv);
                }
                else if (document.getElementById("tmf_osm_credit")) {
                    var tmfOSMCreditElement = document.getElementById("tmf_osm_credit");
                    tmfOSMCreditElement.parentNode.removeChild(tmfOSMCreditElement);
                }
                tmfOSMCreditListenerIsSet = true;
            });
        }

        
        if (tmfMapTypeId == '') {
            tmfMapTypeId = 'OSM1';
        }
    }

    if (tmfTheBasicsObject['tmfMapTypeThunderforestocm'] == 'true') {
        tmfMapTypeIds.push('OSM2');
        tmfTheMap.mapTypes.set("OSM2", new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return "https://a.tile.thunderforest.com/cycle/" + zoom + "/" + coord.x + "/" + coord.y + ".png?apikey=" + tmfBackendThunderforestKey;
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OCM",
            alt : tmfFrontendVariables.tmfTextTokens.tmfTokenThunderforestCycle,
            maxZoom: 18
        }));

        if (tmfMapTypeId == '') {
            tmfMapTypeId = 'OSM2';
        }
    }

    if (tmfTheBasicsObject['tmfMapTypeThunderforestlandscape'] == 'true') {
        tmfMapTypeIds.push('OSM3');
        tmfTheMap.mapTypes.set("OSM3", new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return "https://a.tile.thunderforest.com/landscape/" + zoom + "/" + coord.x + "/" + coord.y + ".png?apikey=" + tmfBackendThunderforestKey;
            },
            tileSize: new google.maps.Size(256, 256),
            name: "Landscape",
            alt : tmfFrontendVariables.tmfTextTokens.tmfTokenThunderforestLandscape,
            maxZoom: 18
        }));

        if (tmfMapTypeId == '') {
            tmfMapTypeId = 'OSM3';
        }
    }

    if (tmfTheBasicsObject['tmfMapTypeThunderforestoutdoors'] == 'true') {
        tmfMapTypeIds.push('OSM4');
        tmfTheMap.mapTypes.set("OSM4", new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return "https://a.tile.thunderforest.com/outdoors/" + zoom + "/" + coord.x + "/" + coord.y + ".png?apikey=" + tmfBackendThunderforestKey;
            },
            tileSize: new google.maps.Size(256, 256),
            name: "Outdoors",
            alt : tmfFrontendVariables.tmfTextTokens.tmfTokenThunderforestOutdoors,
            maxZoom: 18
        }));

        if (tmfMapTypeId == '') {
            tmfMapTypeId = 'OSM4';
        }
    }
}

function tmfMapTypeControls() {
    switch(tmfTheBasicsObject['tmfToggleType']) {
        case "HORIZONTAL_BAR":
        case "DROPDOWN_MENU":
            tmfTheMap.setOptions({
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: tmfMapTypeIds,
                    position: tmfMapTypesLocation,
                    style: google.maps.MapTypeControlStyle[tmfTheBasicsObject['tmfToggleType']] 
                },
            });
            document.getElementById('tmf-map-thumbnail-wrapper').style.display = "none";
        break;

        case "NONE":
            tmfTheMap.setOptions({
                mapTypeControl: false
            });
            document.getElementById('tmf-map-thumbnail-wrapper').style.display = "none";
        break;

        case "THUMBNAIL":
            tmfCreateMapThumbnail();
            tmfTheMap.setOptions({
                    mapTypeControl: false
                });
            document.getElementById('tmf-map-thumbnail-wrapper').style.display = "block";
        break;
    }
}

function tmfCreateMapThumbnail() {
    tmfMapThumbnail = new google.maps.Map(document.getElementById('tmf-map-thumbnail'), {
    });

    tmfMapThumbnail.setZoom(tmfTheMap.getZoom());
    tmfMapThumbnail.setOptions({
        fullscreenControl: false,
        gestureHandling: 'none'
    });

    tmfThumbnailClicked(0);

    if (tmfTheBasicsObject['tmfFitMethod'] == 'objects') {
        var ne = tmfBounds.getNorthEast();
        var sw = tmfBounds.getSouthWest();
        var centerpoint = new google.maps.LatLng((ne.lat() + sw.lat()) / 2, (ne.lng() + sw.lng()) / 2);
        tmfMapThumbnail.setCenter(centerpoint);
    } else
    {
        tmfMapThumbnail.setCenter({
            lat: parseFloat(tmfTheBasicsObject['tmfMapCenterLat']),
            lng: parseFloat(tmfTheBasicsObject['tmfMapCenterLon'])
        });
        tmfMapThumbnail.setZoom(parseFloat(tmfTheBasicsObject['tmfMapZoom']));
    }
    
    tmfTheMap.addListener('drag', function() {
        tmfMapThumbnail.setCenter(tmfTheMap.getCenter());
    });
    tmfTheMap.addListener('zoom_changed', function() {
        tmfMapThumbnail.setZoom(tmfTheMap.getZoom());
    });

    document.getElementById("tmf-map-thumbnail-overlay").addEventListener("click", function() {
        tmfThumbnailClicked(1);
    });
}

function tmfThumbnailClicked(tmfThumbnailCounter) {
    for (var i = 0; i < tmfMapTypeIds.length; i++) {
        if (tmfMapTypeIds[i] === tmfTheMap.getMapTypeId()) {
            var tmfMapThumbnailTypeId = tmfMapTypeIds[(i + 1 + tmfThumbnailCounter) % tmfMapTypeIds.length];
            tmfMapTypeId = tmfMapTypeIds[(i + tmfThumbnailCounter) % tmfMapTypeIds.length];
            break;
        }
    }

    tmfTheMap.setOptions({
        mapTypeId: tmfMapTypeId,
    })

    tmfMapThumbnail.setOptions({
        mapTypeId: tmfMapThumbnailTypeId,
    })
    document.getElementById('tmf-map-thumbnail-overlay-text').innerHTML = tmfFrontendVariables.tmfTextTokens[tmfMapThumbnailTypeId]; // Text shown in thumbnail
}

function tmfPlaceCardDisplay() {
    if (tmfPlacecardObject['tmfPlaceCardDisplay'] == 'false') {
        document.getElementById('tmf-placecard-container-outer').style.display = "none";
    } else if (tmfBackendVariables.tmfIsBackend == true || tmfBackendVariables.tmfLicenseStatus == 'valid')
    {
        if (document.getElementById('tmf-map-container-' + tmfPostId).clientWidth < 370) {
            document.getElementById('tmf-placecard-container-outer').style.display = 'none';
        } else
        {
            document.getElementById('tmf-placecard-container-outer').style.display = 'block';
        }
        document.getElementById('tmf-placecard-business-name').innerHTML = tmfPlacecardObject['tmfPlacecardBusinessName'];
        document.getElementById('tmf-placecard-info').innerHTML = tmfPlacecardObject['tmfPlacecardAddress'];

        if (tmfPlacecardObject['tmfPlacecardName2Display'] == "false") {
            document.getElementById('tmf-placecard-view-large').href = "https://www.google.com/maps/search/?api=1&query=" + tmfPlacecardObject['tmfPlacecardBusinessName'].replace(/ /g, "+");
        } else
        {
            document.getElementById('tmf-placecard-view-large').href = "https://www.google.com/maps/search/?api=1&query=" + tmfPlacecardObject['tmfPlacecardName2'].replace(/ /g, "+");
        }

        switch(tmfPlacecardObject['tmfPlacecardAddressType']) {
            case "0":
                document.getElementById('tmf-placecard-direction-link').href = "https://www.google.com/maps/dir/?api=1&destination=" + tmfPlacecardObject['tmfPlacecardAddress'].replace(/ /g, "+");
            break;

            case "1":
                document.getElementById('tmf-placecard-direction-link').href = "https://www.google.com/maps/dir/?api=1&destination=" + tmfPlacecardObject['tmfPlacecardAddress2'].replace(/ /g, "+");
            break;

            case "2":
                document.getElementById('tmf-placecard-direction-link').href = "https://www.google.com/maps/dir/?api=1&destination=" + parseFloat(tmfPlacecardObject['tmfPlacecardAddressLat']) + "," + parseFloat(tmfPlacecardObject['tmfPlacecardAddressLon']);
            break;
        }
    }
}

function tmfCenterControlFunction(controlDiv) {
    var tmfControlUI = document.createElement('div');
    tmfControlUI.style.backgroundColor = '#fff';
    tmfControlUI.style.cursor = 'pointer';
    tmfControlUI.style.margin = '10px';
    tmfControlUICenter = document.createElement('img');
    tmfControlUICenter.src = tmfPluginUrl + 'mapimages/CenterIcon_40.png';
    tmfControlUICenter.style.cursor = 'pointer';
    tmfControlUICenter.title = tmfFrontendVariables.tmfTextTokens.tmfTokenFitIcon;
    tmfControlUI.appendChild(tmfControlUICenter);
    tmfControlUI.setAttribute('id', 'tmfCenterControlId');
    controlDiv.appendChild(tmfControlUI);

    if (tmfTheBasicsObject['tmfButtonCenter'] == 'true') {
        tmfControlUI.style.display = 'display';
    } else
    {
        tmfControlUI.style.display = 'none';
    }

    tmfControlUI.addEventListener('click', function() {
        tmfFitMap();        
    });
}

function tmfFitMap() {
    if (tmfTheBasicsObject['tmfFitMethod'] == 'objects') {
        tmfTheMap.fitBounds(tmfBounds);
    }
    else {
        tmfTheMap.setCenter({
            lat: parseFloat(tmfTheBasicsObject['tmfMapCenterLat']),
            lng: parseFloat(tmfTheBasicsObject['tmfMapCenterLon'])
        });

        tmfTheMap.setZoom(parseFloat(tmfTheBasicsObject['tmfMapZoom']));
    }
}

function tmfDrawMarkers() {
    var tmfMarkerIcon;

    for (var i = 0; i < tmfMarkerObjects.length; i++) {
        switch (tmfMarkerObjects[i].tmfMarkerType) {
            case 'svg':
                tmfMarkerCreated = true;
                tmfMarkerIcon = {
                    path: tmfSvgMarkerArray[tmfMarkerObjects[i].tmfMarkerPath]['geometry'],
                    scale: parseFloat(tmfMarkerObjects[i].tmfMarkerScale),
                    anchor: new google.maps.Point(tmfMarkerObjects[i].tmfMarkerSvgAnchorX, tmfMarkerObjects[i].tmfMarkerSvgAnchorY),
                    fillColor: tmfMarkerObjects[i].tmfMarkerFillColor,
                    fillOpacity: parseFloat(tmfMarkerObjects[i].tmfMarkerFillOpacity),
                    strokeColor: tmfMarkerObjects[i].tmfMarkerStrokeColor,
                    strokeOpacity: parseFloat(tmfMarkerObjects[i].tmfMarkerStrokeOpacity),
                    strokeWeight: parseFloat(tmfMarkerObjects[i].tmfMarkerStrokeWeight)
                }
            break;

            case 'png':        
                tmfMarkerIcon = {
                    url: tmfMarkerObjects[i].tmfMarkerUrl, 
                    //size: new google.maps.Size(parseInt(tmfMarkerObjects[i].tmfMarkerWidth), parseInt(tmfMarkerObjects[i].tmfMarkerHeight)),
                    //origin: new google.maps.Point(parseInt(tmfMarkerObjects[i].tmfMarkerOriginX), parseInt(tmfMarkerObjects[i].tmfMarkerOriginY)),
                    anchor: new google.maps.Point(parseInt(tmfMarkerObjects[i].tmfMarkerAnchorX), parseInt(tmfMarkerObjects[i].tmfMarkerAnchorY))
                }
            break;

            case 'user':
               tmfMarkerIcon = {
                    url: tmfMarkerObjects[i].tmfMarkerUrl, 
                    size: new google.maps.Size(parseInt(tmfMarkerObjects[i].tmfMarkerWidth), parseInt(tmfMarkerObjects[i].tmfMarkerHeight)),
                    origin: new google.maps.Point(parseInt(tmfMarkerObjects[i].tmfMarkerOriginX), parseInt(tmfMarkerObjects[i].tmfMarkerOriginY)),
                    anchor: new google.maps.Point(parseInt(tmfMarkerObjects[i].tmfMarkerAnchorX), parseInt(tmfMarkerObjects[i].tmfMarkerAnchorY))
                }
            break;
        }

        tmfMarker = new google.maps.Marker({
            position: new google.maps.LatLng(tmfMarkerObjects[i].tmfMarkerCenterLat, tmfMarkerObjects[i].tmfMarkerCenterLon),
            map: tmfTheMap,
            icon: tmfMarkerIcon,
            title: tmfMarkerObjects[i].tmfMarkerToolTip
        });

        tmfMarkers.push(tmfMarker);
        tmfBounds.extend(new google.maps.LatLng(tmfMarkerObjects[i].tmfMarkerCenterLat, tmfMarkerObjects[i].tmfMarkerCenterLon));
        tmfMarkerCreated = false;
    }

    tmfTurnOnMarkerInfoWindowListener();
}

function tmfDrawCircles() {
    for (var i = 0; i < tmfCircleObjects.length; i++) {
        tmfCircle = new google.maps.Circle({
            map: tmfTheMap,
            center: new google.maps.LatLng(tmfCircleObjects[i].tmfCircleCenterLat, tmfCircleObjects[i].tmfCircleCenterLon),
            radius: parseFloat(tmfCircleObjects[i].tmfCircleRadius),
            fillColor: tmfCircleObjects[i].tmfCircleFillColor,
            fillOpacity: parseFloat(tmfCircleObjects[i].tmfCircleFillOpacity),
            strokeColor: tmfCircleObjects[i].tmfCircleStrokeColor,
            strokeOpacity: parseFloat(tmfCircleObjects[i].tmfCircleStrokeOpacity),
            strokeWeight: parseFloat(tmfCircleObjects[i].tmfCircleStrokeWeight)
        });

        tmfCircles.push(tmfCircle);
        tmfBounds.extend(new google.maps.LatLng(tmfCircleObjects[i].tmfCircleCenterLat, tmfCircleObjects[i].tmfCircleCenterLon));
    }
    tmfTurnOnCircleEventListener();
}

function tmfDrawPolygons() {
    for (var i = 0; i < tmfPolygonObjects.length; i++) {
        
        var tmfPolygonPathPointsArray = tmfCreatePath(tmfPolygonObjects[i].tmfPolygonPath);
        
        tmfPolygon = new google.maps.Polygon({
            paths: tmfPolygonPathPointsArray,
            fillColor: tmfPolygonObjects[i].tmfPolygonFillColor,
            fillOpacity: tmfPolygonObjects[i].tmfPolygonFillOpacity,
            strokeColor: tmfPolygonObjects[i].tmfPolygonStrokeColor,
            strokeOpacity: tmfPolygonObjects[i].tmfPolygonStrokeOpacity,
            strokeWeight: tmfPolygonObjects[i].tmfPolygonStrokeWeight
        });

        tmfPolygon.setMap(tmfTheMap);

        tmfPolygons.push(tmfPolygon);
    }
    tmfTurnOnPolygonEventListener();
}

function tmfDrawPolylines() {
    for (var i = 0; i < tmfPolylineObjects.length; i++) {

        var tmfPolylinePathPointsArray = tmfCreatePath(tmfPolylineObjects[i].tmfPolylinePath, tmfPolylineObjects[i].tmfPolylineSource);

        tmfPolylineSymbolPath = {
            path: google.maps.SymbolPath
        };
        tmfPolylineSymbolPath.path = parseInt(tmfPolylineObjects[i].tmfPolylineSymbol);

        tmfPolylineSymbolPath.fillColor = tmfPolylineObjects[i].tmfPolylineSymbolFillColor;
        tmfPolylineSymbolPath.fillOpacity = tmfPolylineObjects[i].tmfPolylineSymbolFillOpacity;
        tmfPolylineSymbolPath.strokeColor = tmfPolylineObjects[i].tmfPolylineSymbolStrokeColor;
        tmfPolylineSymbolPath.strokeOpacity = tmfPolylineObjects[i].tmfPolylineSymbolStrokeOpacity;
        tmfPolylineSymbolPath.strokeWeight = tmfPolylineObjects[i].tmfPolylineSymbolStrokeWeight;
        tmfPolylineSymbolPath.scale = tmfPolylineObjects[i].tmfPolylineSymbolScale;

        var icons = [{
            icon: tmfPolylineSymbolPath,
            offset: tmfPolylineObjects[i].tmfPolylineSymbolOffset,
            repeat: tmfPolylineObjects[i].tmfPolylineSymbolRepeat,
            zIndex: 10
        }];

        tmfPolyline = new google.maps.Polyline({
            editable: false,
            icons: icons,
            path: tmfPolylinePathPointsArray,
            strokeColor: tmfPolylineObjects[i].tmfPolylineStrokeColor,
            strokeOpacity: tmfPolylineObjects[i].tmfPolylineStrokeOpacity,
            strokeWeight: tmfPolylineObjects[i].tmfPolylineStrokeWeight
        });

        tmfPolyline.setMap(tmfTheMap);
        tmfPolylines.push(tmfPolyline);
    }
    tmfTurnOnPolylineEventListener();
}

function tmfCreatePath(tmfObjectElement, tmfPolylineSource) {
    var tmfObjectPath = [], tmfTrkPoints = [];

    if (tmfPolylineSource == 'gpx') { // Create path for polyline from xml
        var tmfParser = new DOMParser();
        var tmfGpxDoc = tmfParser.parseFromString(tmfObjectElement, "text/xml");

        try { // Catch any error resulting from reading the gpx file. If not return empty
            var tmfTrkSeg = tmfGpxDoc.querySelectorAll("trkseg");
            tmfTrkPoints = tmfTrkSeg[0].querySelectorAll("trkpt");
        }
        catch (err) {
        }

        for (var p = 0; p < tmfTrkPoints.length; p++) {
            tmfObjectPath.push(new google.maps.LatLng(parseFloat(tmfTrkPoints[p].getAttribute("lat")),parseFloat(tmfTrkPoints[p].getAttribute("lon"))));
            tmfBounds.extend(new google.maps.LatLng(parseFloat(tmfTrkPoints[p].getAttribute("lat")),parseFloat(tmfTrkPoints[p].getAttribute("lon"))));
        }
        return tmfObjectPath;
    } else
    { // Create path for polyline from manually created polyline
        tmfPathArray = tmfObjectElement.split(",");
        for (var tmfPathPointsCounter = 0; tmfPathPointsCounter < (tmfPathArray.length) / 2; tmfPathPointsCounter++) {
            var tmflat = parseFloat(tmfPathArray[tmfPathPointsCounter * 2]);
            var tmflon = parseFloat(tmfPathArray[tmfPathPointsCounter * 2 + 1]);
            tmfObjectPath.push(new google.maps.LatLng(tmflat,tmflon));
            tmfBounds.extend(new google.maps.LatLng(tmflat,tmflon));
        }
        return tmfObjectPath;
    }
}

function tmfTurnOnMarkerInfoWindowListener() {
    for (var i = 0; i < tmfMarkerObjects.length; i++) {
        tmfAddMarkerInfoWindowListener(tmfMarkers[i], i, tmfMarkerInfoWindow);
    }
}

function tmfTurnOnCircleEventListener() {
    for (var i = 0; i < tmfCircleObjects.length; i++) {
        tmfAddCircleEventListener(tmfCircles[i], i, tmfCircleInfoWindow);
    }
}

function tmfTurnOnPolygonEventListener() {
    for (var i = 0; i < tmfPolygonObjects.length; i++) {
        tmfAddPolygonEventListener(tmfPolygons[i], i, tmfPolygonInfoWindow);
    }
}

function tmfTurnOnPolylineEventListener() {
    tmfNumberOfPolylinesWithCharts = 0;
    for (var i = 0; i < tmfPolylineObjects.length; i++) {
        if (tmfPolylineObjects[i].tmfPolylineIsChartShow == "true"){
            tmfNumberOfPolylinesWithCharts++;
            var tmfPolylineToShow = i;
        }
    }
    for (i = 0; i < tmfPolylineObjects.length; i++) {
        tmfAddPolylineEventListener(tmfPolylines[i], i, tmfPolylineInfoWindow);
    }
    if (tmfNumberOfPolylinesWithCharts == 1) {
        tmfPolylineDrawChartPreFunction(tmfPolylineToShow);
    } 
    else
    {
        document.getElementById('tmf-polyline-chart-' + tmfPostId).style.display = 'none';
        document.getElementById('tmf-meta-data-container-' + tmfPostId).style.display = 'none';
    }
}

function tmfAddMarkerInfoWindowListener(myMarker, i, myMarkerInfoWindow) {
    tmfMarker = myMarker;
    tmfMarkerInfoWindow = myMarkerInfoWindow;
    tmfShowMarkerInfoWindowListener[i] = google.maps.event.addListener(tmfMarker, 'click', (function(tmfMarker, i) {
        return function() {
            if (tmfMarkerObjects[i].tmfMarkerInfoWindowText) {
                tmfCircleInfoWindow.close();
                tmfPolygonInfoWindow.close();
                tmfPolylineInfoWindow.close();
                tmfMarkerInfoWindow.close();

                var tmfInfoWindowTextToDisplay = tmfTrimCaption(tmfMarkerObjects[i].tmfMarkerInfoWindowText); // This is called in common.js since this function is called from backend.js for not yet stored objects where [Caption] needs trimming
                tmfMarkerInfoWindow.setContent(tmfInfoWindowTextToDisplay);

                if (tmfMarkerObjects[i].tmfMarkerInfoWindowWidth > 100) {
                    tmfMarkerInfoWindow.setOptions({
                        maxWidth: (tmfMarkerObjects[i].tmfMarkerInfoWindowWidth)
                    });
                }
                tmfMarkerInfoWindow.open(tmfTheMap, tmfMarker);
            }
        }
    })(tmfMarker, i));
}

function tmfAddCircleEventListener(myCircle, i, myCircleInfoWindow) {
    tmfCircle = myCircle;
    tmfCircleInfoWindow = myCircleInfoWindow;
    tmfShowCircleInfoWindowListener[i] = google.maps.event.addListener(tmfCircle, 'click', (function(tmfCircle, i) {
        return function() {
            if (tmfCircleObjects[i].tmfCircleInfoWindowText) {
                tmfMarkerInfoWindow.close();
                tmfPolygonInfoWindow.close();
                tmfPolylineInfoWindow.close();
                tmfCircleInfoWindow.close();

                var tmfInfoWindowTextToDisplay = tmfTrimCaption(tmfCircleObjects[i].tmfCircleInfoWindowText);  // This is called in common.js since this function is called from backend.js for not yet stored objects where [Caption] needs trimming
                tmfCircleInfoWindow.setContent(tmfInfoWindowTextToDisplay);

                if (tmfCircleObjects[i].tmfCircleInfoWindowWidth > 100) {
                    tmfCircleInfoWindow.setOptions({
                        maxWidth: (tmfCircleObjects[i].tmfCircleInfoWindowWidth)
                    });
                }
                tmfCircleInfoWindow.setPosition(tmfCircle.getCenter());
                tmfCircleInfoWindow.open(tmfTheMap, tmfCircle);
            }
        }
    })(tmfCircle, i));

    tmfShowCircleMouseOverListener[i] = google.maps.event.addListener(tmfCircle, 'mouseover', (function(tmfCircle, i) {
        return function() {
            if (tmfCircleObjects[i].tmfCircleMouseOver == 'true') {
                this.setOptions({
                    zIndex: 10,
                    fillColor: tmfCircleObjects[i].tmfCircleMouseoverFillColor,
                    fillOpacity: tmfCircleObjects[i].tmfCircleMouseoverFillOpacity,
                    strokeColor: tmfCircleObjects[i].tmfCircleMouseoverStrokeColor,
                    strokeOpacity: tmfCircleObjects[i].tmfCircleMouseoverStrokeOpacity,
                    strokeWeight: tmfCircleObjects[i].tmfCircleMouseoverStrokeWeight
                });
            }
        }
    })(tmfCircle, i));

    tmfShowCircleMouseOutListener[i] = google.maps.event.addListener(tmfCircle, 'mouseout', (function(tmfCircle, i) {
        return function() {
            this.setOptions({
                zIndex: 0,
                fillColor: tmfCircleObjects[i].tmfCircleFillColor,
                fillOpacity: tmfCircleObjects[i].tmfCircleFillOpacity,
                strokeColor: tmfCircleObjects[i].tmfCircleStrokeColor,
                strokeOpacity: tmfCircleObjects[i].tmfCircleStrokeOpacity,
                strokeWeight: tmfCircleObjects[i].tmfCircleStrokeWeight
            });
        }
    })(tmfCircle, i));
}

function tmfAddPolygonEventListener(myPolygon, i, myPolygonInfoWindow) {
    tmfPolygon = myPolygon;
    tmfPolygonInfoWindow = myPolygonInfoWindow;

    tmfShowPolygonInfoWindowListener[i] = google.maps.event.addListener(tmfPolygon, 'click', (function(tmfPolygon, i) {
        return function(event) {

            if (tmfPolygonObjects[i].tmfPolygonInfoWindowText) {
                tmfMarkerInfoWindow.close();
                tmfCircleInfoWindow.close();
                tmfPolygonInfoWindow.close();
                tmfPolylineInfoWindow.close();

                if (!tmfPolygonObjects[i].tmfPolygonInfoWindowText) {
                    tmfPolygonObjects[i].tmfPolygonInfoWindowText = '';
                }

                var tmfInfoWindowTextToDisplay = tmfTrimCaption(tmfPolygonObjects[i].tmfPolygonInfoWindowText); // This is called in common.js since this function is called from backend.js for not yet stored objects where [Caption] needs trimming
                tmfPolygonInfoWindow.setContent(tmfInfoWindowTextToDisplay);

                if (tmfPolygonObjects[i].tmfPolygonInfoWindowWidth > 100) {
                    tmfPolygonInfoWindow.setOptions({
                        maxWidth: (tmfPolygonObjects[i].tmfPolygonInfoWindowWidth)
                    });
                }
                
                tmfPolygonInfoWindow.setPosition(event.latLng);
                tmfPolygonInfoWindow.open(tmfTheMap, tmfPolygon);
            }
        }
    })(tmfPolygon, i));

    tmfShowPolygonMouseOverListener[i] = google.maps.event.addListener(tmfPolygon, 'mouseover', (function(tmfPolygon, i) {
        return function() {
            if (tmfPolygonObjects[i].tmfPolygonMouseOver == 'true') {
                this.setOptions({
                    zIndex: 10,
                    fillColor: tmfPolygonObjects[i].tmfPolygonMouseoverFillColor,
                    fillOpacity: tmfPolygonObjects[i].tmfPolygonMouseoverFillOpacity,
                    strokeColor: tmfPolygonObjects[i].tmfPolygonMouseoverStrokeColor,
                    strokeOpacity: tmfPolygonObjects[i].tmfPolygonMouseoverStrokeOpacity,
                    strokeWeight: tmfPolygonObjects[i].tmfPolygonMouseoverStrokeWeight
                });
            }
        }
    })(tmfPolygon, i));

    tmfShowPolygonMouseOutListener[i] = google.maps.event.addListener(tmfPolygon, 'mouseout', (function(tmfPolygon, i) {
        return function() {
            this.setOptions({
                zIndex: 0,
                fillColor: tmfPolygonObjects[i].tmfPolygonFillColor,
                fillOpacity: tmfPolygonObjects[i].tmfPolygonFillOpacity,
                strokeColor: tmfPolygonObjects[i].tmfPolygonStrokeColor,
                strokeOpacity: tmfPolygonObjects[i].tmfPolygonStrokeOpacity,
                strokeWeight: tmfPolygonObjects[i].tmfPolygonStrokeWeight
            });
        }
    })(tmfPolygon, i));
}

function tmfAddPolylineEventListener(myPolyline, i, myPolylineInfoWindow) {
    tmfPolyline = myPolyline;
    tmfPolylineInfoWindow = myPolylineInfoWindow;

    tmfShowPolylineInfoWindowListener[i] = google.maps.event.addListener(tmfPolyline, 'click', (function(tmfPolyline, i) {
        return function(event) {

            if (tmfPolylineObjects[i].tmfPolylineInfoWindowText) {
                tmfMarkerInfoWindow.close();
                tmfCircleInfoWindow.close();
                tmfPolygonInfoWindow.close();
                tmfPolylineInfoWindow.close();

                if (!tmfPolylineObjects[i].tmfPolylineInfoWindowText) {
                    tmfPolylineObjects[i].tmfPolylineInfoWindowText = '';
                }

                var startLoc = tmfPolylineObjects[i].tmfPolylineInfoWindowText.indexOf("[caption");
                var endLoc = tmfPolylineObjects[i].tmfPolylineInfoWindowText.indexOf("caption]") - 9;
                var Length = tmfPolylineObjects[i].tmfPolylineInfoWindowText.length;
                var newString = tmfPolylineObjects[i].tmfPolylineInfoWindowText.substring(0, startLoc) + tmfPolylineObjects[i].tmfPolylineInfoWindowText.substring(endLoc, Length);

                var tmfInfoWindowTextToDisplay = tmfTrimCaption(tmfPolylineObjects[i].tmfPolylineInfoWindowText); // This is called in common.js since this function is called from backend.js for not yet stored objects where [Caption] needs trimming
                tmfPolylineInfoWindow.setContent(tmfInfoWindowTextToDisplay);
                
                if (tmfPolylineObjects[i].tmfPolylineInfoWindowWidth > 100) {
                    tmfPolylineInfoWindow.setOptions({
                        maxWidth: (tmfPolylineObjects[i].tmfPolylineInfoWindowWidth)
                    });
                }
                
                tmfPolylineInfoWindow.setPosition(event.latLng);
                tmfPolylineInfoWindow.open(tmfTheMap, tmfPolyline);
            }

            if (tmfPolylineObjects[i].tmfPolylineIsChartShow == "true" && tmfNumberOfPolylinesWithCharts !=1) {
                tmfPolylineDrawChartPreFunction(i);
            }
        }
    })(tmfPolyline, i));

    tmfShowPolylineMouseOverListener[i] = google.maps.event.addListener(tmfPolyline, 'mouseover', (function(tmfPolyline, i) {
        return function() {

            if (tmfPolylineObjects[i].tmfPolylineMouseOver == 'true') {
                var tmfPoylineIcons = [];
                tmfPolylineSymbolPath = [];

                if (tmfPolylineObjects[i].tmfPolylineMouseoverSymbol != "none") {
                    tmfPolylineSymbolPath = {
                        path: google.maps.SymbolPath
                    };
                    tmfPolylineSymbolPath.path = parseInt(tmfPolylineObjects[i].tmfPolylineMouseoverSymbol);
                    tmfPolylineSymbolPath.fillColor = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolFillColor;
                    tmfPolylineSymbolPath.fillOpacity = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolFillOpacity;
                    tmfPolylineSymbolPath.strokeColor = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolStrokeColor;
                    tmfPolylineSymbolPath.strokeOpacity = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolStrokeOpacity;
                    tmfPolylineSymbolPath.strokeWeight = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolStrokeWeight;
                    tmfPolylineSymbolPath.scale = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolScale;

                    tmfPoylineIcons = [{
                        icon: tmfPolylineSymbolPath,
                        offset: tmfPolylineObjects[i].tmfPolylineMouseoverSymbolOffset,
                        repeat: tmfPolylineObjects[i].tmfPolylineMouseoverSymbolRepeat,
                        zIndex: 10
                    }];
                }

                this.setOptions({
                    icons: tmfPoylineIcons,
                    strokeColor: tmfPolylineObjects[i].tmfPolylineMouseoverStrokeColor,
                    strokeOpacity: tmfPolylineObjects[i].tmfPolylineMouseoverStrokeOpacity,
                    strokeWeight: tmfPolylineObjects[i].tmfPolylineMouseoverStrokeWeight,
                    zIndex: 10
                });
            }
        }
    })(tmfPolyline, i));

    tmfShowPolylineMouseOutListener[i] = google.maps.event.addListener(tmfPolyline, 'mouseout', (function(tmfPolyline, i) {
        return function() {

            if (tmfPolylineObjects[i].tmfPolylineSymbol != "none") {                
                tmfPolylineSymbolPath.path = parseInt(tmfPolylineObjects[i].tmfPolylineSymbol);
            } 

            tmfPolylineSymbolPath.fillColor = tmfPolylineObjects[i].tmfPolylineSymbolFillColor;
            tmfPolylineSymbolPath.fillOpacity = tmfPolylineObjects[i].tmfPolylineSymbolFillOpacity;
            tmfPolylineSymbolPath.strokeColor = tmfPolylineObjects[i].tmfPolylineSymbolStrokeColor;
            tmfPolylineSymbolPath.strokeOpacity = tmfPolylineObjects[i].tmfPolylineSymbolStrokeOpacity;
            tmfPolylineSymbolPath.strokeWeight = tmfPolylineObjects[i].tmfPolylineSymbolStrokeWeight;
            tmfPolylineSymbolPath.scale = tmfPolylineObjects[i].tmfPolylineSymbolScale;

            var tmfPoylineIcons = [{
                icon: tmfPolylineSymbolPath,
                offset: tmfPolylineObjects[i].tmfPolylineSymbolOffset,
                repeat: tmfPolylineObjects[i].tmfPolylineSymbolRepeat,
                zIndex: 10
            }];

            if (tmfPolylineObjects[i].tmfPolylineSymbol == "none") {
                tmfPoylineIcons = [];                               
            }

            this.setOptions({
                icons: tmfPoylineIcons,
                strokeColor: tmfPolylineObjects[i].tmfPolylineStrokeColor,
                strokeOpacity: tmfPolylineObjects[i].tmfPolylineStrokeOpacity,
                strokeWeight: tmfPolylineObjects[i].tmfPolylineStrokeWeight,
                zIndex: 0,
            });
        }
    })(tmfPolyline, i));
}

function tmfTrimCaption(tmfTextToTrim) { // Trims caption shortcode from images in infowindow
    var tmfImageTextToReturn = '';

    var tmfStartSearch = tmfTextToTrim.indexOf("[caption");

    while (tmfStartSearch !=-1) {
        if (!tmfTextSection1) {
            tmfCaptionStart = tmfTextToTrim.indexOf("[caption", tmfStartSearch);
            var tmfTextSection1 = tmfTextToTrim.substr(0, tmfCaptionStart);
        } else
        {
            var tmfTextSection1 = '';
        }

        var tmfImgStart = tmfTextToTrim.indexOf("<img", tmfStartSearch);
        var tmfImgEnd = tmfTextToTrim.indexOf("/>", tmfImgStart) + 2;
        
        var tmfTextSection2 = tmfTextToTrim.substring(tmfImgStart, tmfImgEnd);

        var tmfCaptionEnd = tmfTextToTrim.indexOf("[/caption]", tmfImgEnd) + 10;
        var tmfNextStartSearch = tmfTextToTrim.indexOf("[caption", tmfCaptionEnd); 
        if (tmfNextStartSearch != -1) {
            tmfStartSearch = tmfStartSearch + tmfNextStartSearch;
            var tmfTextSection3 = tmfTextToTrim.substring(tmfCaptionEnd, tmfNextStartSearch);
        } else{
            var tmfTextSection3 = tmfTextToTrim.substring(tmfCaptionEnd);
            tmfStartSearch = tmfNextStartSearch;
        }
        
        tmfImageTextToReturn = tmfImageTextToReturn + tmfTextSection1 + tmfTextSection2 + tmfTextSection3;

    }
    if (tmfImageTextToReturn == '') {
        tmfImageTextToReturn = tmfTextToTrim;
    }
    return tmfImageTextToReturn;
}

/**
 * Draw the chart
 */
function tmfPolylineDrawChartPreFunction(i) {
    var tmfProfileArrayx = [
        ['Distance', tmfvAxisTitle]
    ];

    switch(tmfPolylineObjects[i].tmfPolylineSource) {
        case 'manual':
        var tmfPolylineVerticesArray = [];
        var tmfProfileArrayPoint = [];
        tmfPolylineVerticesArray = tmfPolylineObjects[i].tmfPolylineVertices.split(',');
        
        for (tmfCounter = 0; tmfCounter < tmfPolylineVerticesArray.length; tmfCounter++) {
            tmfProfileArrayPoint = [tmfPolylineObjects[i].tmfPolylineXAxisSpacing * tmfCounter  * tmfChartDistanceUnits, parseFloat(tmfPolylineVerticesArray[tmfCounter]) * tmfChartElevationUnits];
            tmfProfileArrayx.push(tmfProfileArrayPoint);
        }
        break;

        case 'gpx':
            tmfProfileArrayx = tmfPrepareProfileArray(tmfPolylineObjects[i].tmfPolylinePath);
        break;
    }

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(function() {tmfPolylineDrawChart(tmfProfileArrayx, tmfPolylineObjects[i].tmfPolylineChartColor, tmfPolylineObjects[i].tmfPolylineChartStrokeWeight, tmfPolylineObjects[i].tmfPolylineChartAxisHeight, tmfPolylineObjects[i].tmfPolylineChartAxisHeightMin, tmfPolylineObjects[i].tmfPolylineChartAxisHeightMax, tmfPolylineObjects[i].tmfPolylineChartAxisHeightFixed, tmfPolylineObjects[i].tmfPolylineIsChartMetadataShow); });

    window.onresize = function(event) {
        if (document.getElementById('tmf-polyline-chart-' + tmfPostId).style.display == 'block') {
            tmfPolylineDrawChart(tmfProfileArrayx, tmfPolylineObjects[i].tmfPolylineChartColor, tmfPolylineObjects[i].tmfPolylineChartStrokeWeight, tmfPolylineObjects[i].tmfPolylineChartAxisHeight, tmfPolylineObjects[i].tmfPolylineChartAxisHeightMin, tmfPolylineObjects[i].tmfPolylineChartAxisHeightMax, tmfPolylineObjects[i].tmfPolylineChartAxisHeightFixed, tmfPolylineObjects[i].tmfPolylineIsChartMetadataShow);
        }
    };
}

function tmfPrepareProfileArray(tmfPolylineElements) {
    var tmfAccumulatedDistance = 0;
    var tmfNextRow = [];
    var tmfProfileArray = [
        ['Distance', 'Elevation (m)']
    ];
    var tmfParser = new DOMParser();
    var tmfGpxDoc = tmfParser.parseFromString(tmfPolylineElements, "text/xml");
    var tmfTrkSeg = tmfGpxDoc.querySelectorAll("trkseg");
    var tmfTrkPoints = tmfTrkSeg[0].querySelectorAll("trkpt");

    var tmfTrkElevations =  tmfTrkSeg[0].querySelectorAll("ele");

    for (p = 0; p < tmfTrkPoints.length - 1; p++) {
        aLat = parseFloat(tmfTrkPoints[p].getAttribute("lat"));
        aLng = parseFloat(tmfTrkPoints[p].getAttribute("lon"));
        bLat = parseFloat(tmfTrkPoints[p + 1].getAttribute("lat"));
        bLng = parseFloat(tmfTrkPoints[p + 1].getAttribute("lon"));
        aTOb = haversine (aLat, aLng, bLat, bLng) * tmfChartDistanceUnits;

        tmfAccumulatedDistance = tmfAccumulatedDistance + aTOb;
        tmfNextRow = [tmfAccumulatedDistance, parseFloat(tmfTrkElevations[p].innerHTML) * tmfChartElevationUnits];
        tmfProfileArray.push(tmfNextRow);
    }
    return tmfProfileArray;
}

function tmfPolylineDrawChart(tmfProfileArray, tmfChartColor, tmfChartStrokeweight, tmfAutoAdjustChartAxis, tmfChartMinAxisHeight, tmfChartMaxAxisHeight, tmfChartFixedHeight, tmfShowMetaData) {
    document.getElementById('tmf-polyline-chart-' + tmfPostId).style.display = 'block';
    var tmfAscent = 0, tmfDescent = 0;
    tmfLowestElevation = tmfProfileArray[1][1];
    tmfHighestElevation = tmfLowestElevation;

    for (var i = 2; i < tmfProfileArray.length; i++) {
        if (tmfProfileArray[i][1] < tmfLowestElevation) {
            tmfLowestElevation = tmfProfileArray[i][1];
        }
        if (tmfProfileArray[i][1] > tmfHighestElevation) {
            tmfHighestElevation = tmfProfileArray[i][1];   
        }
        var tmfVerticalDif = (tmfProfileArray[i][1] - tmfProfileArray[i-1][1]); 
        if (tmfVerticalDif > 0 ) {
            tmfAscent += tmfVerticalDif;
        } else {
            tmfDescent += Math.abs(tmfVerticalDif);
        }
    }

    if (tmfAutoAdjustChartAxis == "adjust") {
        tmfChartAxisHeight = Number(tmfChartMinAxisHeight) + ((tmfHighestElevation - tmfLowestElevation) / 5);
        if (tmfChartAxisHeight > tmfChartMaxAxisHeight ) {
            tmfChartAxisHeight = tmfChartMaxAxisHeight;
        }
    }
    else {
        tmfChartAxisHeight = tmfChartFixedHeight;
    }

    tmfChartData = google.visualization.arrayToDataTable(tmfProfileArray);
    tmfChartOptions = {
        height: tmfChartAxisHeight,
        width: '100%',
        chartArea: {
            left: '10%',
            top: '3%',
            height: '80%',
            width: '85%'
        },
        vAxis: {
            title: tmfvAxisTitle,
            maxValue: tmfHighestElevation,
            minValue: tmfLowestElevation
        },
        hAxis: {
            title: tmfhAxisTitle,
            format:'0.0'
        },
        crosshair: {
            trigger: 'both' 
        },
        colors: [tmfChartColor],
        lineWidth: tmfChartStrokeweight,
        legend: 'none'
    };

    tmfChart = new google.visualization.LineChart(document.getElementById('tmf-polyline-chart-' + tmfPostId));
    tmfChart.draw(tmfChartData, tmfChartOptions);

    document.getElementById('tmf-meta-data-distance-' + tmfPostId).innerHTML = tmfProfileArray[tmfProfileArray.length - 1][0].toFixed(1) + ' ' + tmfMetaDataDistance;
    document.getElementById('tmf-meta-data-ascent-' + tmfPostId).innerHTML = tmfAscent.toFixed(0) +' ' +  tmfMetaDataHeight;
    document.getElementById('tmf-meta-data-descent-' + tmfPostId).innerHTML = tmfDescent.toFixed(0) +' ' +  tmfMetaDataHeight;
    document.getElementById('tmf-meta-data-highest-' + tmfPostId).innerHTML = tmfHighestElevation.toFixed(0) + ' ' + tmfMetaDataHeight;
    document.getElementById('tmf-meta-data-lowest-' + tmfPostId).innerHTML = tmfLowestElevation.toFixed(0) +' ' +  tmfMetaDataHeight;

    if (tmfShowMetaData == 'true' || tmfShowMetaData == true) {
        document.getElementById('tmf-meta-data-container-' + tmfPostId).style.display = 'block';
    } else
    {
        document.getElementById('tmf-meta-data-container-' + tmfPostId).style.display = 'none';
    }

    tmfSetMapSize();
}

/**
 * OSM credits
 */
function tmfOSMCenterControl(controlDiv) {
    // Set CSS for the control border.
    var tmfControlUI = document.createElement('div');
    tmfControlUI.setAttribute("id", "tmf_osm_credit");
    tmfControlUI.style.backgroundColor = '#fff';
    tmfControlUI.style.border = '2px solid #fff';
    tmfControlUI.style.borderRadius = '3px';
    tmfControlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    tmfControlUI.style.cursor = 'pointer';
    tmfControlUI.style.marginBottom = '22px';
    tmfControlUI.style.textAlign = 'center';
    tmfControlUI.title = 'OpenStreetMap contributors';
    controlDiv.appendChild(tmfControlUI);

    // Set CSS for the control interior.
    var tmfControlText = document.createElement('div');
    tmfControlText.style.color = 'rgb(25,25,25)';
    tmfControlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    tmfControlText.style.fontSize = '12px';
    tmfControlText.style.lineHeight = '18px';
    tmfControlText.style.paddingLeft = '5px';
    tmfControlText.style.paddingRight = '5px';
    tmfControlUI.appendChild(tmfControlText);

    var tmfTag = document.createElement('a');
    tmfTag.setAttribute('href','http://www.openstreetmap.org/copyright');
    tmfTag.innerHTML = '&copy; OpenStreetMap';
    tmfControlText.appendChild(tmfTag);
}

function haversine(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}