function tmfPngMarkerColorChanged() {
	var tmfMarkerBlock = document.getElementsByClassName('tmf-marker-block');
    for (var i = 0; i < tmfMarkerBlock.length; i++) {
        tmfMarkerBlock[i].style.display = "none";
    }
    tmfDisplayPngMarkerImages();
}

function tmfDisplayPngMarkerImages() {
	var tmfPngMarkerColour = document.getElementById('tmf-png-marker-color').value;
	tmfPngMarkerColour = tmfPngMarkerColour.replace(/\s/g, '');
	var tmfPngMarkerCategory = document.getElementById('tmf-png-marker-category').value;
	tmfPngMarkerCategory = tmfPngMarkerCategory.replace(/\s/g, '');
	document.getElementById(tmfPngMarkerColour + '-' + tmfPngMarkerCategory).style.display = 'block';
}

function tmfPngMarkerImageClicked(imageClicked) {
	var tmfMarkerImage = document.getElementsByClassName('tmf-marker-image');
    for (var i = 0; i < tmfMarkerImage.length; i++) {
        tmfMarkerImage[i].style.height = "37px";
    }
	document.getElementById(imageClicked).style.height = "50px";

	var tmfCurrentMarkerNumber = document.getElementById('tmf-map-marker-number').innerHTML;

	var tmfClickedImage = document.getElementById(imageClicked);

	var tmfClickedImageUrl = tmfClickedImage.src;
	document.getElementById('tmf-marker-pngimage-url').value = tmfClickedImageUrl;

	var tmfClickedImageWidth = tmfClickedImage.naturalWidth;
	var tmfClickedImageHeight = tmfClickedImage.naturalHeight;

	document.getElementById('tmf-marker-pngimage-anchor-x').value = tmfClickedImageWidth / 2; 
    document.getElementById('tmf-marker-pngimage-anchor-y').value = tmfClickedImageHeight;

	var tmfPngImageMarkerIcon = {
		url: tmfClickedImageUrl, 
		size: new google.maps.Size(tmfClickedImageWidth, tmfClickedImageHeight),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(tmfClickedImageWidth / 2, tmfClickedImageHeight)
	}
	tmfMarkers[tmfCurrentMarkerNumber].setIcon(tmfPngImageMarkerIcon);
}

function tmfPngImagePropertyChanged() {
	var tmfCurrentMarkerNumber = document.getElementById('tmf-map-marker-number').innerHTML;

	var tmfPngImageMarkerIcon = {
		url: document.getElementById('tmf-marker-pngimage-url').value,
		//size: new google.maps.Size(parseInt(document.getElementById('tmf-marker-url-width').value), parseInt(document.getElementById('tmf-marker-url-height').value)),
		//origin: new google.maps.Point(parseInt(document.getElementById('tmf-marker-origin-x').value), parseInt(document.getElementById('tmf-marker-origin-y').value)),
	    anchor: new google.maps.Point(parseInt(document.getElementById('tmf-marker-pngimage-anchor-x').value), parseInt(document.getElementById('tmf-marker-pngimage-anchor-y').value))
	}	
	tmfMarkers[tmfCurrentMarkerNumber].setIcon(tmfPngImageMarkerIcon);
}

function tmfCheckCheckBox(name, key) {
	if (document.getElementById(name).checked == false) {
		tmfTheBasicsObject[key] = ('false');
	} else
	{
		tmfTheBasicsObject[key] = ('true');
		tmfMapTypeCounter = tmfMapTypeCounter + 1;
	}
}

function tmfTheBasicsChanged() { 
	tmfMapTypeCounter = 0;
	if (document.getElementById('tmf-map-fit-manually').checked == true) {
		tmfTheBasicsObject['tmfFitMethod'] = ('manual');
		document.getElementById('tmf-map-manually-position-controls').style.display = "block";
	} else
	{
		tmfTheBasicsObject['tmfFitMethod'] = ('objects');
		document.getElementById('tmf-map-manually-position-controls').style.display = "none";
	}

	if (document.getElementById('tmf-map-center').checked == false) {
		document.getElementById('tmfCenterControlId').style.display = "none";
		tmfTheBasicsObject['tmfButtonCenter'] = ('false');
	} else
	{
		document.getElementById('tmfCenterControlId').style.display = "block";
		tmfTheBasicsObject['tmfButtonCenter'] = ('true');
	}

	if (document.getElementById('tmf-map-fullscreen').checked == false) {
		var tmfFullscreenControl = false;
		tmfTheBasicsObject['tmfButtonFullScreen'] = ('false');
	} else
	{
		var tmfFullscreenControl = true;
		tmfTheBasicsObject['tmfButtonFullScreen'] = ('true');
	}

	if (document.getElementById('tmf-map-streetview').checked == false) {
		var tmfStreetViewControl = false;
		tmfTheBasicsObject['tmfButtonStreetView'] = ('false');
	} else
	{
		var tmfStreetViewControl = true;
		tmfTheBasicsObject['tmfButtonStreetView'] = ('true');
	}

	if (document.getElementById('tmf-map-zoombuttons').checked == false) {
		var tmfZoomControl = false;
		tmfTheBasicsObject['tmfButtonZoom'] = ('false');
	} else
	{
		var tmfZoomControl = true;
		tmfTheBasicsObject['tmfButtonZoom'] = ('true');
	}

	tmfCheckCheckBox('tmf-map-type-google-roadmap', 'tmfMapTypeGoogleRoadmap');
	tmfCheckCheckBox('tmf-map-type-google-satellite', 'tmfMapTypeGoogleSatellite');
	tmfCheckCheckBox('tmf-map-type-google-hybrid', 'tmfMapTypeHybrid');
	tmfCheckCheckBox('tmf-map-type-google-terrain', 'tmfMapTypeGoogleRoadmapTerrain');
	tmfCheckCheckBox('tmf-map-type-osm', 'tmfMapTypeOSM');
	tmfCheckCheckBox('tmf-map-type-thunderforestocm', 'tmfMapTypeThunderforestocm');
	tmfCheckCheckBox('tmf-map-type-thunderforestlandscape', 'tmfMapTypeThunderforestlandscape');
	tmfCheckCheckBox('tmf-map-type-thunderforestoutdoors', 'tmfMapTypeThunderforestoutdoors');
	
	tmfBuildGoogleMapTypes();

	if (tmfMapTypeCounter > 1) { 
		document.getElementById('tmf-settings-map-type-group').style.display = 'flex'; 
	} else 
	{
		document.getElementById('tmf-settings-map-type-group').style.display = 'none';
		document.getElementById('tmf-map-display').selectedIndex = 'NONE';
	}

	tmfTheMap.setOptions({
		fullscreenControl: tmfFullscreenControl,
		streetViewControl: tmfStreetViewControl,
		zoomControl: tmfZoomControl
	});

	tmfTheBasicsObject['tmfToggleType'] = document.getElementById('tmf-map-display').value;
	if (tmfTheBasicsObject['tmfToggleType'] == 'THUMBNAIL' && typeof tmfMapThumbnail == 'undefined') {
		tmfCreateMapThumbnail();
	}
    if (tmfPlacecardObject['tmfPlaceCardDisplay'] == 'true') {
        tmfMapTypesLocation = google.maps.ControlPosition.TOP_RIGHT;
    } 
    else {
    	tmfMapTypesLocation = google.maps.ControlPosition.LEFT_TOP;
    }
	tmfMapTypeControls();

	// Get and set map size
	if (document.getElementById('tmf-map-width-percentage-radio').checked == true) {
    	tmfMapWidth = document.getElementById('tmf-map-width-percentage').value + '%';
    	document.getElementById('tmf-map-width-percentage').style.display = 'block';
    	document.getElementById('tmf-map-width-pixel').style.display = 'none';
    	tmfTheBasicsObject['tmfMapWidthType'] = 'percentage';
    } 
    else {
    	tmfMapWidth = document.getElementById('tmf-map-width-pixel').value + 'px';
    	document.getElementById('tmf-map-width-percentage').style.display = 'none';
    	document.getElementById('tmf-map-width-pixel').style.display = 'block'; 
    	tmfTheBasicsObject['tmfMapWidthType'] = 'pixel';
    }

    if (document.getElementById('tmf-map-height-percentage-radio').checked == true) {
    	tmfMapHeight = document.getElementById('tmf-map-height-percentage').value + '%';
    	document.getElementById('tmf-map-height-percentage').style.display = 'block';
    	document.getElementById('tmf-map-height-pixel').style.display = 'none';
    	tmfTheBasicsObject['tmfMapHeightType'] = 'percentage';
    } 
    else {
    	tmfMapHeight = document.getElementById('tmf-map-height-pixel').value + 'px';
    	document.getElementById('tmf-map-height-percentage').style.display = 'none';
    	document.getElementById('tmf-map-height-pixel').style.display = 'block';
    	tmfTheBasicsObject['tmfMapHeightType'] = 'pixel';
    }

    tmfTheBasicsObject['tmfMapWidthPercentage'] = document.getElementById('tmf-map-width-percentage').value;
    tmfTheBasicsObject['tmfMapWidthPixel'] = document.getElementById('tmf-map-width-pixel').value;
    tmfTheBasicsObject['tmfMapHeightPercentage'] = document.getElementById('tmf-map-height-percentage').value;
    tmfTheBasicsObject['tmfMapHeightPixel'] = document.getElementById('tmf-map-height-pixel').value;

    tmfSetMapSize();

	tmfUpdateTheBasicsString();
}

function tmfUpdateTheBasicsString() {
	if (document.getElementById('tmf-map-fit-manually').checked == true) {
		tmfTheBasicsObject['tmfFitMethod'] = ('manual');
	} else
	{
		tmfTheBasicsObject['tmfFitMethod'] = ('objects');
	}
	document.getElementById('tmf-map-the-basics-object').value = JSON.stringify(tmfTheBasicsObject);
}

function tmfPlacecardUpdated() {
	if (document.getElementById('tmf-placecard').checked == true) {
		document.getElementById('tmf-placecard-texts').style.display = "block";
		tmfPlacecardObject['tmfPlaceCardDisplay'] = ('true');

		tmfTheMap.setOptions({
	        mapTypeControlOptions: {
	            position: google.maps.ControlPosition.TOP_RIGHT,
	            style: google.maps.MapTypeControlStyle[tmfTheBasicsObject['tmfToggleType']] //ADDED
	        },
	    });
	    tmfTheMap.controls[google.maps.ControlPosition.TOP_RIGHT].clear();
	    tmfTheMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(tmfCenterControlDiv);
	} else
	{
		document.getElementById('tmf-placecard-texts').style.display = "none";
		tmfPlacecardObject['tmfPlaceCardDisplay'] = ('false');

		tmfTheMap.setOptions({
	        mapTypeControlOptions: {
	            position: google.maps.ControlPosition.LEFT_TOP,
	            style: google.maps.MapTypeControlStyle[tmfTheBasicsObject['tmfToggleType']] //ADDED
	        },
	    });
	    tmfTheMap.controls[google.maps.ControlPosition.RIGHT_TOP].clear();
	    tmfTheMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(tmfCenterControlDiv);
	}

	tmfPlacecardObject['tmfPlacecardBusinessName'] = document.getElementById('tmf-placecard-name').value;
	tmfPlacecardObject['tmfPlacecardAddress'] = document.getElementById('tmf-placecard-address').value;

	if (document.getElementById('tmf-placecard-larger-map-name-checkbox').checked == true) {
		tmfPlacecardObject['tmfPlacecardName2Display'] = "true";
		tmfPlacecardObject['tmfPlacecardName2'] = document.getElementById('tmf-placecard-search-name').value; 
		document.getElementById('tmf-placecard-larger-map-name-group').style.display = "block";
	} else
	{
		tmfPlacecardObject['tmfPlacecardName2Display'] = "false"; 
		document.getElementById('tmf-placecard-larger-map-name-group').style.display = "none";
	}
	

	switch(document.getElementById('tmf-placecard-directions-listbox').value) {
		case "0":
			document.getElementById('tmf-placecard-directions-name-group').style.display = "none";
			document.getElementById('tmf-placecard-directions-coord-group').style.display = "none";
			tmfPlacecardObject['tmfPlacecardAddressType'] = "0";

			if (tmfAddPlacecardListener) {
                google.maps.event.removeListener(tmfAddPlacecardListener);
            }

			tmfTheMap.setOptions({
		        disableDoubleClickZoom: false,
		    });
		break;

		case "1":
			document.getElementById('tmf-placecard-directions-name-group').style.display = "block";
			document.getElementById('tmf-placecard-directions-coord-group').style.display = "none";
			tmfPlacecardObject['tmfPlacecardAddressType'] = "1";
			tmfPlacecardObject['tmfPlacecardAddress2'] = document.getElementById('tmf-placecard-direction-name').value;

			if (tmfAddPlacecardListener) {
                google.maps.event.removeListener(tmfAddPlacecardListener);
            }

			tmfTheMap.setOptions({
		        disableDoubleClickZoom: false,
		    });
		break;

		case "2":
			document.getElementById('tmf-placecard-directions-name-group').style.display = "none";
			document.getElementById('tmf-placecard-directions-coord-group').style.display = "block";
			tmfPlacecardObject['tmfPlacecardAddressType'] = "2";

			tmfAddPlacecardListener = google.maps.event.addListener(tmfTheMap, 'dblclick', tmfSetPlacecardLocation);

			tmfTheMap.setOptions({
		        disableDoubleClickZoom: true,
		    });
		break;
	};

	document.getElementById('tmf-map-placecard-object').value = JSON.stringify(tmfPlacecardObject);
	tmfPlaceCardDisplay();
}

function tmfMapPolylineCreationMethod() { // 
	if (document.getElementById('tmf-poyline-creation-method-create').checked == true){
		document.getElementById('tmf-poyline-creation-method-file-button').style.display = "none";
		document.getElementById('tmf-create-polyline-help-text').style.display = "block";
	} else
	{
		document.getElementById('tmf-poyline-creation-method-file-button').style.display = "flex";
		document.getElementById('tmf-create-polyline-help-text').style.display = "none";
	}
}

function tmfMarkerTypeSelected() {
	switch(document.getElementById('tmf-marker-listbox').value) {
		case "svg":
			document.getElementById('tmf-marker-pngimage-settings').style.display = "none";
			document.getElementById('tmf-marker-user-settings').style.display = "none";
			document.getElementById('tmf-marker-svg-settings').style.display = "block";

			tmfSvgMarkerSelected();
		break;

		case "png":
			document.getElementById('tmf-marker-pngimage-settings').style.display = "block";
			document.getElementById('tmf-marker-user-settings').style.display = "none";
			document.getElementById('tmf-marker-svg-settings').style.display = "none";

			if (document.getElementById('tmf-new-marker-buttons').style.display == 'block' || document.getElementById('tmf-marker-pngimage-url').src == '') { //Check to see if a new marker is being created or if an existing user or svg marker is being edited. If an existing png marker is being edited then dont select the image - it has already been done!  
				tmfDisplayPngMarkerImages(); // Display image blocks
				var tmfClickedImageId = document.getElementsByClassName('tmf-marker-image')[0];
				tmfPngMarkerImageClicked(tmfClickedImageId.id);
			}
		break;

		case "user":
			document.getElementById('tmf-marker-pngimage-settings').style.display = "none";
			document.getElementById('tmf-marker-user-settings').style.display = "block";
			document.getElementById('tmf-marker-svg-settings').style.display = "none";

			if (document.getElementById('tmf-marker-url').value != '') {
				tmfUserImageSelected();
			}
		break;
	}
}

// Listeners
function tmfTurnOnEditMarkerListener() {
    for (var i = 0; i < tmfMarkerObjects.length; i++) {
        tmfAddEditMarkerListener(tmfMarkers[i], i);
    }
}

function tmfTurnOnEditCircleListener() {
    for (var i = 0; i < tmfCircleObjects.length; i++) {
        tmfAddEditCircleListener(tmfCircles[i], i);
    }
}

function tmfTurnOnEditPolygonListener() {
    for (var i = 0; i < tmfPolygonObjects.length; i++) {
        tmfAddEditPolygonListener(tmfPolygons[i], i);
    }
}

function tmfTurnOnEditPolylineListener() {
    for (var i = 0; i < tmfPolylineObjects.length; i++) {
        tmfAddEditPolylineListener(tmfPolylines[i], i);
    }
}

function tmfTurnOffEditMarkerListener() {
	for (var i = 0; i < tmfMarkerObjects.length; i++) {
	    google.maps.event.removeListener(tmfEditMarkerListener[i]);
	}
	google.maps.event.removeListener(tmfAddMarkerListener);
}

function tmfTurnOffEditCircleListener() {
	for (var i = 0; i < tmfCircleObjects.length; i++) {
	    google.maps.event.removeListener(tmfEditCircleListener[i]);
	}
	google.maps.event.removeListener(tmfAddCircleListener);
}

function tmfTurnOffEditPolygonListener() {
	for (var i = 0; i < tmfPolygonObjects.length; i++) {
	    google.maps.event.removeListener(tmfEditPolygonListener[i]);
	}
	google.maps.event.removeListener(tmfAddPolygonListener);
}

function tmfTurnOffEditPolylineListener() {
	for (var i = 0; i < tmfPolylineObjects.length; i++) {
	    google.maps.event.removeListener(tmfEditPolylineListener[i]);
	}
	google.maps.event.removeListener(tmfAddPolylineListener);
}

function tmfTurnOffShowMarkerListener() {
	for (var i = 0; i < tmfMarkerObjects.length; i++) {
	    google.maps.event.removeListener(tmfShowMarkerInfoWindowListener[i]);
	}
}

function tmfTurnOffShowCircleListener() {
	for (var i = 0; i < tmfCircleObjects.length; i++) {
	    google.maps.event.removeListener(tmfShowCircleInfoWindowListener[i]);
	}
}

function tmfTurnOffShowPolygonListener() {
	for (var i = 0; i < tmfPolygonObjects.length; i++) {
	    google.maps.event.removeListener(tmfShowPolygonInfoWindowListener[i]);
	}
}

function tmfTurnOffShowPolylineListener() {
	for (var i = 0; i < tmfPolylineObjects.length; i++) {
	    google.maps.event.removeListener(tmfShowPolylineInfoWindowListener[i]); 
		google.maps.event.removeListener(tmfShowPolylineMouseOverListener[i]);
		google.maps.event.removeListener(tmfShowPolylineMouseOutListener[i]);
	}
}

function tmfTurnOffAllObjectListeners() {
	tmfTurnOffEditMarkerListener();
    tmfTurnOffEditCircleListener();
    tmfTurnOffEditPolygonListener();
    tmfTurnOffEditPolylineListener();

    tmfTurnOffShowMarkerListener();
    tmfTurnOffShowCircleListener();
    tmfTurnOffShowPolygonListener();
    tmfTurnOffShowPolylineListener();
}

function tmfTurnOnAllObjectListeners() {
	tmfTurnOnMarkerInfoWindowListener();
	tmfTurnOnCircleEventListener();
	tmfTurnOnPolygonEventListener();
	tmfTurnOnPolylineEventListener();

	tmfTurnOnEditMarkerListener();
    tmfTurnOnEditCircleListener();
    tmfTurnOnEditPolygonListener();
    tmfTurnOnEditPolylineListener();
}

function tmfSetPlacecardLocation(event) {
	tmfPlacecardObject['tmfPlacecardAddressLat'] = event.latLng.lat();
	tmfPlacecardObject['tmfPlacecardAddressLon'] = event.latLng.lng();

	document.getElementById('tmf-placecard-lat').innerHTML = tmfPlacecardObject['tmfPlacecardAddressLat'].toFixed(6);
	document.getElementById('tmf-placecard-lon').innerHTML = tmfPlacecardObject['tmfPlacecardAddressLon'].toFixed(6);

	document.getElementById('tmf-map-placecard-object').value = JSON.stringify(tmfPlacecardObject);
	tmfPlaceCardDisplay();
}

function tmfAddMarkerAndPanTo(event) {
    tmfTurnOffAllObjectListeners();

    document.getElementById('tmf-map-marker-number').innerHTML = tmfMarkerObjects.length;
	document.getElementById('tmf-map-marker-name').value = 'Marker ' + tmfMarkerObjects.length;

	document.getElementById('tmf-marker-path').value = 0;
	document.getElementById('tmf-marker-scale').value = 0.6;
	document.getElementById('tmf-marker-svg-anchor-x').value = tmfSvgMarkerArray[0]['anchorx'];
	document.getElementById('tmf-marker-svg-anchor-y').value = tmfSvgMarkerArray[0]['anchory'];

	document.getElementById('tmf-marker-fill-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-marker-fill-opacity').value = 1.0;
	document.getElementById('tmf-marker-stroke-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-marker-stroke-opacity').value = 1.0;
	document.getElementById('tmf-marker-stroke-weight').value = 2;

    var tmfClickPosition = event.latLng; 
    tmfMarker = new google.maps.Marker({
    	draggable: true,
        position: tmfClickPosition,
        map: tmfTheMap,
        icon: {
            anchor: new google.maps.Point(document.getElementById('tmf-marker-svg-anchor-x').value, document.getElementById('tmf-marker-svg-anchor-y').value),
            path: tmfSvgMarkerArray[0]['geometry'],
            fillColor: document.getElementById('tmf-marker-fill-selected-color').style.backgroundColor,
            fillOpacity: parseFloat(document.getElementById('tmf-marker-fill-opacity').value),
            scale: parseFloat(document.getElementById('tmf-marker-scale').value),
            strokeColor: document.getElementById('tmf-marker-stroke-selected-color').style.backgroundColor,
            strokeWeight: parseInt(document.getElementById('tmf-marker-stroke-weight').value),
            strokeOpacity: parseFloat(document.getElementById('tmf-marker-stroke-opacity').value)
        }
    });
	tmfMarkers.push(tmfMarker);

	/*tmfMarkerTypeSvgSelected();*/
	tmfMarkerTypeSelected();

	document.getElementById('tmf-marker-url').value = '';
	document.getElementById('tmf-marker-url-src').src = '';
    document.getElementById('tmf-marker-url-width').value = '';
    document.getElementById('tmf-marker-url-height').value = '';
    document.getElementById('tmf-marker-origin-x').value = '';
    document.getElementById('tmf-marker-origin-y').value = '';
    document.getElementById('tmf-marker-anchor-x').value = '';
    document.getElementById('tmf-marker-anchor-y').value = '';
    document.getElementById('tmf-map-marker-title').value = '';

    var tmfTinymceEditor = tinyMCE.get('tmf_mapmarker_infowindow_text');
    if (tmfTinymceEditor !== null) {
		tmfTinymceEditor.setContent('');
	}

	document.getElementById('tmf-new-marker-buttons').style.display = "block";
	document.getElementById('tmf-add-single-marker-settings').style.display = "block";
	document.getElementById('tmf-marker-png-image-settings').style.display = "none";
}

function tmfAddCircleAndPanTo(event) {
    tmfTurnOffAllObjectListeners();
    
    document.getElementById('tmf-map-circle-number').innerHTML = tmfCircleObjects.length;
	document.getElementById('tmf-map-circle-name').value = 'Circle ' + tmfCircleObjects.length;
	document.getElementById('tmf-circle-radius').value = 1000;
	document.getElementById('tmf-circle-fill-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-circle-fill-opacity').value = 1.0;
	document.getElementById('tmf-circle-stroke-selected-color').style.backgroundColor = '#ff0000';
	document.getElementById('tmf-circle-stroke-opacity').value = 1.0;
	document.getElementById('tmf-circle-stroke-weight').value = 2;
	document.getElementById('tmf-circle-mouseover-fill-color').value = '#FF0000';
	document.getElementById('tmf-circle-mouseover-fill-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-circle-mouseover-fill-opacity').value = 1;
	document.getElementById('tmf-circle-mouseover-stroke-color').value = '#ff0000';
	document.getElementById('tmf-circle-mouseover-stroke-selected-color').style.backgroundColor = '#ff0000';
	document.getElementById('tmf-circle-mouseover-stroke-opacity').value = 1.0;
	
	document.getElementById('tmf-circle-mouseover').checked = false;
	document.getElementById('tmf-circle-mouseover-settings').style.display = "none";

	// Create new circle
    var tmfClickPosition = event.latLng;
    tmfCircle = new google.maps.Circle({
    	map: tmfTheMap,
    	draggable: true,
    	editable: true,
        center: tmfClickPosition,
        radius: parseInt(document.getElementById('tmf-circle-radius').value),
	    fillColor: document.getElementById('tmf-circle-fill-selected-color').style.backgroundColor,
        fillOpacity: document.getElementById('tmf-circle-fill-opacity').value,
        strokeColor: document.getElementById('tmf-circle-stroke-selected-color').style.backgroundColor,
        strokeWeight: document.getElementById('tmf-circle-stroke-weight').value,
        strokeOpacity: document.getElementById('tmf-circle-stroke-opacity').value
    });
	tmfCircles.push(tmfCircle);

	var tmfTinymceEditor = tinyMCE.get('tmf_mapcircle_infowindow_text');
	if (tmfTinymceEditor !== null) {
		tmfTinymceEditor.setContent('');
	}

	document.getElementById('tmf-new-circle-buttons').style.display = "block";
	document.getElementById('tmf-add-circle-settings').style.display = "block";
}

function tmfAddPolygonAndPanTo(event) {
    tmfTurnOffAllObjectListeners();

	document.getElementById('tmf-map-polygon-number').innerHTML = tmfPolygonObjects.length;
	document.getElementById('tmf-map-polygon-name').value = 'Polygon ' + tmfPolygonObjects.length;
	document.getElementById('tmf-polygon-fill-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-polygon-fill-opacity').value = 1;
	document.getElementById('tmf-polygon-stroke-selected-color').style.backgroundColor = '#ff0000';
	document.getElementById('tmf-polygon-stroke-opacity').value = 0.6;
	document.getElementById('tmf-polygon-stroke-weight').value = 5;
	document.getElementById('tmf-polygon-mouseover-fill-color').value = '#FF0000';
	document.getElementById('tmf-polygon-mouseover-fill-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-polygon-mouseover-fill-opacity').value = 1;
	document.getElementById('tmf-polygon-mouseover-stroke-color').value = '#ff0000';
	document.getElementById('tmf-polygon-mouseover-stroke-selected-color').style.backgroundColor = '#ff0000';
	document.getElementById('tmf-polygon-mouseover-stroke-opacity').value = 0.6;
	document.getElementById('tmf-polygon-mouseover-stroke-weight').value = 5;
	document.getElementById('tmf-polygon-mouseover').checked = false;
	document.getElementById('tmf-polygon-mouseover-settings').style.display = "none";

	var tmfTinymceEditor = tinyMCE.get('tmf_mappolygon_infowindow_text');
	if (tmfTinymceEditor !== null) {
		tmfTinymceEditor.setContent('');
	}

	tmfPolygon = new google.maps.Polygon({
		editable: true,
		fillColor: document.getElementById('tmf-polygon-fill-selected-color').style.backgroundColor,
		fillOpacity: document.getElementById('tmf-polygon-fill-opacity').value,
        strokeColor: document.getElementById('tmf-polygon-stroke-selected-color').style.backgroundColor,
        strokeOpacity: document.getElementById('tmf-polygon-stroke-opacity').value,
        strokeWeight: document.getElementById('tmf-polygon-stroke-weight').value
    });
	
	tmfPath = tmfPolygon.getPath();
	tmfPath.push(event.latLng);

	tmfPolygon.setMap(tmfTheMap);
	addPolygonVertexListener = google.maps.event.addListener(tmfTheMap, 'click', tmfAddPolygonVertex);

    tmfPolygons.push(tmfPolygon);

	document.getElementById('tmf-new-polygon-buttons').style.display = "block";
	document.getElementById('tmf-add-polygon-settings').style.display = "block";
}

function tmfAddPolygonVertex(event) {
    tmfPath = tmfPolygon.getPath();
    tmfPath.push(event.latLng);
}

function tmfSetUpManualPolyline() {
    tmfTurnOffAllObjectListeners();

	document.getElementById('tmf-map-polyline-number').innerHTML = tmfPolylineObjects.length;
	document.getElementById('tmf-map-polyline-name').value = 'Polyline ' + tmfPolylineObjects.length;
	document.getElementById('tmf-polyline-stroke-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-polyline-stroke-opacity').value = 0.6;
	document.getElementById('tmf-polyline-stroke-weight').value = 5;
	document.getElementById('tmf-polyline-symbol-fill-color').value = '#FF0000';
	document.getElementById('tmf-polyline-symbol-fill-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-polyline-symbol-stroke-color').value = '#FF0000';
	document.getElementById('tmf-polyline-symbol-stroke-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-polyline-mouseover-stroke-color').value = '#FF0000';
	document.getElementById('tmf-polyline-mouseover-stroke-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-polyline-mouseover-stroke-opacity').value = 0.6;
	document.getElementById('tmf-polyline-mouseover-stroke-weight').value = 5;
	document.getElementById('tmf-polyline-mouseover-symbol-stroke-color').value = '#FF0000';
	document.getElementById('tmf-polyline-mouseover-symbol-stroke-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-polyline-mouseover-symbol-fill-color').value = '#FF0000';
	document.getElementById('tmf-polyline-mouseover-symbol-fill-selected-color').style.backgroundColor = '#FF0000';
	document.getElementById('tmf-polyline-mouseover').checked = false;
	document.getElementById('tmf-polyline-mouseover-settings').style.display = "none";

	var tmfTinymceEditor = tinyMCE.get('tmf_mappolyline_infowindow_text');
	if (tmfTinymceEditor !== null) {
		tmfTinymceEditor.setContent('');
	}

	tmfPolyline = new google.maps.Polyline({
        strokeColor: document.getElementById('tmf-polyline-stroke-selected-color').style.backgroundColor,
        strokeOpacity: document.getElementById('tmf-polyline-stroke-opacity').value,
        strokeWeight: document.getElementById('tmf-polyline-stroke-weight').value
    });
	
	tmfPolyline.setMap(tmfTheMap);
    tmfPolylines.push(tmfPolyline);

    document.getElementById('tmf-poyline-creation-method').style.display = "none";
    document.getElementById('tmf-polyline-creation-text').style.display = "none"; 
    document.getElementById('tmf-create-polyline-help-text').style.display = "none";
    document.getElementById('tmf-poyline-creation-method-file-button').style.display = "none";

    document.getElementById('tmf-show-elevation-chart').checked = false;
	tmfPolylineChartNotSelected();
	document.getElementById('tmf-chart-color').value = '#FF0000';
	document.getElementById('tmf-chart-selected-color').style.backgroundColor = '#FF0000';

	document.getElementById('tmf-show-chart-meta-data').checked = false;
	document.getElementById('tmf-meta-data-container-' + tmfPostId).style.display = "none";

	document.getElementById('tmf-new-polyline-buttons').style.display = "block";
	document.getElementById('tmf-add-polyline-settings').style.display = "block";
}

function tmfAddPolylineVertex(event) {
    tmfPath = tmfPolyline.getPath();
    tmfPath.push(event.latLng);
}

function tmfAddPolylineAndPanTo(event) {
	tmfSetUpManualPolyline();

	tmfPolyline.setOptions({
		editable: true
	});

	tmfPath = tmfPolyline.getPath();
	tmfPath.push(event.latLng);
	addPolylineVertexListener = google.maps.event.addListener(tmfTheMap, 'click', tmfAddPolylineVertex);
}

function tmfLoadPolylineFileFromUrlBackend(gpxFile) { // If chosen to create polyline from gpx file then load contents of gpx file. Once map is stored, gpx file contents are loaded from frontend.php
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var tmfDataReadyToSend = this.responseXML;

            var serializer = new XMLSerializer ();
            document.getElementById('tmf-polyline-file-contents').value = serializer.serializeToString(tmfDataReadyToSend);

            tmfSetUpManualPolyline();

            tmfPath = [];
            var tmfTrk = tmfDataReadyToSend.querySelectorAll("trk");
            var tmfTrkseg = tmfTrk[0].querySelectorAll("trkseg");
            var tmfTrkPoints = tmfTrkseg[0].querySelectorAll("trkpt");
            var tmfTrkElevations =  tmfTrkseg[0].querySelectorAll("ele");
            for (p = 0; p < tmfTrkPoints.length; p++) {
                var tmfPoint = new google.maps.LatLng(parseFloat(tmfTrkPoints[p].getAttribute("lat")), parseFloat(tmfTrkPoints[p].getAttribute("lon")));
                tmfPath.push(tmfPoint);
                tmfBounds.extend(tmfPoint);
            }
            tmfPolyline.setPath(tmfPath);
            tmfTheMap.fitBounds(tmfBounds);
        }
    };
    xhttp.open("GET", gpxFile, true);
    xhttp.send();
}

function tmfUserImageSelected() {
	var tmfCurrentMarkerNumber = document.getElementById('tmf-map-marker-number').innerHTML;
	var tmfMarkerImageWidth = parseInt(document.getElementById('tmf-marker-url-width').value);
	var tmfMarkerImageHeight = parseInt(document.getElementById('tmf-marker-url-height').value);

	document.getElementById('tmf-marker-origin-x').value = 0;
    document.getElementById('tmf-marker-origin-y').value = 0; 
    document.getElementById('tmf-marker-anchor-x').value = tmfMarkerImageWidth / 2; 
    document.getElementById('tmf-marker-anchor-y').value = tmfMarkerImageHeight;

	// Update marker
	var tmfPngMarkerIcon = {
		url: document.getElementById('tmf-marker-url').value, 
		size: new google.maps.Size(tmfMarkerImageWidth, tmfMarkerImageHeight),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(tmfMarkerImageWidth / 2, tmfMarkerImageHeight)
	}
	
	tmfMarkers[tmfCurrentMarkerNumber].setIcon(tmfPngMarkerIcon);
}

function tmfPngMarkerGeneralPropertyChanged() {
	var tmfCurrentMarkerNumber = document.getElementById('tmf-map-marker-number').innerHTML;

	// Update marker
	var tmfPngMarkerIcon = {
		url: document.getElementById('tmf-marker-url').value, 
		size: new google.maps.Size(parseInt(document.getElementById('tmf-marker-url-width').value), parseInt(document.getElementById('tmf-marker-url-height').value)),
		origin: new google.maps.Point(parseInt(document.getElementById('tmf-marker-origin-x').value), parseInt(document.getElementById('tmf-marker-origin-y').value)),
	    anchor: new google.maps.Point(parseInt(document.getElementById('tmf-marker-anchor-x').value), parseInt(document.getElementById('tmf-marker-anchor-y').value))
	}	
	tmfMarkers[tmfCurrentMarkerNumber].setIcon(tmfPngMarkerIcon);
}

function tmfSvgMarkerSelected() { //If different svg marker is selected, then get the origin values from the marker and update the input fields. Then draw the marker
	var tmfCurrentMarkerNewPath = document.getElementById('tmf-marker-path').value;
	document.getElementById('tmf-marker-svg-anchor-x').value = tmfSvgMarkerArray[tmfCurrentMarkerNewPath]['anchorx'];
	document.getElementById('tmf-marker-svg-anchor-y').value = tmfSvgMarkerArray[tmfCurrentMarkerNewPath]['anchory'];
	tmfSvgMarkerPropertyChanged()
}

function tmfSvgMarkerPropertyChanged() {
	var tmfCurrentMarkerNumber = document.getElementById('tmf-map-marker-number').innerHTML;
	var tmfCurrentMarkerNewPath = document.getElementById('tmf-marker-path').value;

	var tmfMarkerProperty = tmfMarkers[tmfCurrentMarkerNumber].getIcon();
	delete tmfMarkerProperty.url; 
    tmfMarkerProperty.path = tmfSvgMarkerArray[tmfCurrentMarkerNewPath]['geometry'];    
    tmfMarkerProperty.anchor = new google.maps.Point(parseInt(document.getElementById('tmf-marker-svg-anchor-x').value), parseInt(document.getElementById('tmf-marker-svg-anchor-y').value))
    tmfMarkerProperty.scale = parseFloat(document.getElementById('tmf-marker-scale').value);
    tmfMarkerProperty.fillColor = document.getElementById('tmf-marker-fill-selected-color').style.backgroundColor;
    tmfMarkerProperty.fillOpacity = parseFloat(document.getElementById('tmf-marker-fill-opacity').value);
    tmfMarkerProperty.strokeColor = document.getElementById('tmf-marker-stroke-selected-color').style.backgroundColor;
    tmfMarkerProperty.strokeOpacity = parseFloat(document.getElementById('tmf-marker-stroke-opacity').value);
    tmfMarkerProperty.strokeWeight = parseFloat(document.getElementById('tmf-marker-stroke-weight').value);

    tmfMarkers[tmfCurrentMarkerNumber].setIcon(tmfMarkerProperty);
}

function tmfCircleGeneralPropertyChanged() {
	if (document.getElementById('tmf-circle-mouseover').checked) {
        document.getElementById('tmf-circle-mouseover-settings').style.display = "block";
    }
    else {
        document.getElementById('tmf-circle-mouseover-settings').style.display = "none";
    }

	var tmfCurrentCircleNumber = document.getElementById('tmf-map-circle-number').innerHTML;
	var tmfCircleProperty = tmfCircles[tmfCurrentCircleNumber];
    tmfCircleProperty.radius = parseFloat(document.getElementById('tmf-circle-radius').value);;
    tmfCircleProperty.fillOpacity = parseFloat(document.getElementById('tmf-circle-fill-opacity').value)
    tmfCircleProperty.strokeOpacity = parseFloat(document.getElementById('tmf-circle-stroke-opacity').value);
    tmfCircleProperty.strokeWeight = parseFloat(document.getElementById('tmf-circle-stroke-weight').value);
    
    tmfCircles[tmfCurrentCircleNumber].setOptions(tmfCircleProperty);
}

function tmfPolygonGeneralPropertyChanged() {
	if (document.getElementById('tmf-polygon-mouseover').checked) {
        document.getElementById('tmf-polygon-mouseover-settings').style.display = "block";
    }
    else {
        document.getElementById('tmf-polygon-mouseover-settings').style.display = "none";
    }

	var tmfCurrentPolygonNumber = document.getElementById('tmf-map-polygon-number').innerHTML;
	var tmfPolygonProperty = tmfPolygons[tmfCurrentPolygonNumber];
    tmfPolygonProperty.fillOpacity = parseFloat(document.getElementById('tmf-polygon-fill-opacity').value);
    tmfPolygonProperty.strokeOpacity = parseFloat(document.getElementById('tmf-polygon-stroke-opacity').value);
    tmfPolygonProperty.strokeWeight = parseFloat(document.getElementById('tmf-polygon-stroke-weight').value);
    
    tmfPolygons[tmfCurrentPolygonNumber].setOptions(tmfPolygonProperty);
}

function tmfPolylinePropertyChanged() {
	var tmfCurrentPolylineNumber = document.getElementById('tmf-map-polyline-number').innerHTML;
	var tmfPolylineMouseoverSymbolPath = [];
	tmfPolylineSymbolPath = [];

	// Check symbol offset method 
	if (document.getElementById('tmf-polyline-symbol-offset-pixel-radio').checked == true) {
		document.getElementById('tmf-polyline-symbol-offset-percentage-value').style.display = "none";
		document.getElementById('tmf-polyline-symbol-offset-pixel-value').style.display = "block";
	}
	else {
		document.getElementById('tmf-polyline-symbol-offset-percentage-value').style.display = "block";
		document.getElementById('tmf-polyline-symbol-offset-pixel-value').style.display = "none";
	}

	// Check symbol repeat value
	if (document.getElementById('tmf-polyline-symbol-repeat-pixel-radio').checked == true) {
		document.getElementById('tmf-polyline-symbol-repeat-percentage-value').style.display = "none";
		document.getElementById('tmf-polyline-symbol-repeat-pixel-value').style.display = "block";
	}
	else {
		document.getElementById('tmf-polyline-symbol-repeat-percentage-value').style.display = "block";
		document.getElementById('tmf-polyline-symbol-repeat-pixel-value').style.display = "none";
	}

	// Check polyline mouse over symbol offset
	if (document.getElementById('tmf-polyline-mouseover-symbol-offset-pixel-radio').checked == true) {
		document.getElementById('tmf-polyline-mouseover-symbol-offset-percentage-value').style.display = "none";
		document.getElementById('tmf-polyline-mouseover-symbol-offset-pixel-value').style.display = "block";
	}
	else {
		document.getElementById('tmf-polyline-mouseover-symbol-offset-percentage-value').style.display = "block";
		document.getElementById('tmf-polyline-mouseover-symbol-offset-pixel-value').style.display = "none";
	}

	// Check polyline mouse over symbol repeat
	if (document.getElementById('tmf-polyline-mouseover-symbol-repeat-pixel-radio').checked == true) {
		document.getElementById('tmf-polyline-mouseover-symbol-repeat-percentage-value').style.display = "none";
		document.getElementById('tmf-polyline-mouseover-symbol-repeat-pixel-value').style.display = "block";
	}
	else {
		document.getElementById('tmf-polyline-mouseover-symbol-repeat-percentage-value').style.display = "block";
		document.getElementById('tmf-polyline-mouseover-symbol-repeat-pixel-value').style.display = "none";
	}

	// Check if mouseover selected
	if (document.getElementById('tmf-polyline-mouseover').checked) {
        document.getElementById('tmf-polyline-mouseover-settings').style.display = "block";
    }
    else {
        document.getElementById('tmf-polyline-mouseover-settings').style.display = "none";
    }

	// Check if symbol has been selected to be displayed
	if (document.getElementById('tmf-polyline-symbol-type').value == "none") {
		document.getElementById('tmf-polyline-symbol-settings').style.display = "none";
	} 
	else {
		document.getElementById('tmf-polyline-symbol-settings').style.display = "block";

		tmfPolylineSymbolPath = {
	        path: google.maps.SymbolPath
	    };
		tmfPolylineSymbolPath.path = parseInt(document.getElementById('tmf-polyline-symbol-type').value);

		tmfPolylineSymbolPath.fillColor = document.getElementById('tmf-polyline-symbol-fill-selected-color').style.backgroundColor;
		tmfPolylineSymbolPath.fillOpacity = document.getElementById('tmf-polyline-symbol-fill-opacity').value;
		tmfPolylineSymbolPath.strokeColor = document.getElementById('tmf-polyline-symbol-stroke-selected-color').style.backgroundColor;
		tmfPolylineSymbolPath.strokeOpacity = document.getElementById('tmf-polyline-symbol-stroke-opacity').value;
		tmfPolylineSymbolPath.strokeWeight = document.getElementById('tmf-polyline-symbol-stroke-weight').value;
		tmfPolylineSymbolPath.scale = document.getElementById('tmf-polyline-symbol-scale').value;

    	if (document.getElementById('tmf-polyline-symbol-offset-percentage-radio').checked == true) {
	    	tmfPolylineSymbolOffset = document.getElementById('tmf-polyline-symbol-offset-percentage-value').value + '%';
	    } 
	    else {
	    	tmfPolylineSymbolOffset = document.getElementById('tmf-polyline-symbol-offset-pixel-value').value + 'px';
	    }

	    if (document.getElementById('tmf-polyline-symbol-repeat-percentage-radio').checked == true) {
	    	 tmfPolylineSymbolRepeat = document.getElementById('tmf-polyline-symbol-repeat-percentage-value').value  + '%';
	    } 
	    else {
	    	tmfPolylineSymbolRepeat = document.getElementById('tmf-polyline-symbol-repeat-pixel-value').value + 'px';
	    }		
	}

    var icons = [{
        icon: tmfPolylineSymbolPath,
        offset: tmfPolylineSymbolOffset,
        repeat: tmfPolylineSymbolRepeat,
        zIndex: 10
    }];

// Update polyline
	var tmfPolylineProperty = tmfPolylines[tmfCurrentPolylineNumber];
    tmfPolylineProperty.strokeColor = document.getElementById('tmf-polyline-stroke-selected-color').style.backgroundColor;
    tmfPolylineProperty.strokeOpacity = parseFloat(document.getElementById('tmf-polyline-stroke-opacity').value);
    tmfPolylineProperty.strokeWeight = parseFloat(document.getElementById('tmf-polyline-stroke-weight').value);
    tmfPolylineProperty.icons = icons; 
    tmfPolylines[tmfCurrentPolylineNumber].setOptions(tmfPolylineProperty);

// Mouseover changes
	if (document.getElementById('tmf-polyline-mouseover-symbol-type').value == "none") {
		document.getElementById('tmf-polyline-mouseover-symbol-settings').style.display = "none";			
	} 
	else {
		document.getElementById('tmf-polyline-mouseover-symbol-settings').style.display = "block";
	}

	tmfPolylineMouseoverSymbolPath.fillColor = document.getElementById('tmf-polyline-mouseover-symbol-fill-selected-color').style.backgroundColor;
	tmfPolylineMouseoverSymbolPath.fillOpacity = document.getElementById('tmf-polyline-mouseover-symbol-fill-opacity').value;
	tmfPolylineMouseoverSymbolPath.strokeColor = document.getElementById('tmf-polyline-mouseover-symbol-stroke-selected-color').style.backgroundColor;
	tmfPolylineMouseoverSymbolPath.strokeOpacity = document.getElementById('tmf-polyline-mouseover-symbol-stroke-opacity').value;
	tmfPolylineMouseoverSymbolPath.strokeWeight = document.getElementById('tmf-polyline-mouseover-symbol-stroke-weight').value;
	tmfPolylineMouseoverSymbolPath.scale = document.getElementById('tmf-polyline-mouseover-symbol-scale').value;

	tmfPolylineMouseoverSymbolPath.path = parseInt(document.getElementById('tmf-polyline-mouseover-symbol-type').value);

	if (document.getElementById('tmf-polyline-mouseover-symbol-offset-percentage-radio').checked == true) {
    	var tmfPolylineMouseoverSymbolOffset = document.getElementById('tmf-polyline-mouseover-symbol-offset-percentage-value').value + '%';
    } 
    else {
    	var tmfPolylineMouseoverSymbolOffset = document.getElementById('tmf-polyline-mouseover-symbol-offset-pixel-value').value + 'px';
    }

    if (document.getElementById('tmf-polyline-symbol-repeat-percentage-radio').checked == true) {
    	var tmfPolylineMouseoverSymbolRepeat = document.getElementById('tmf-polyline-mouseover-symbol-repeat-percentage-value').value  + '%';
    } 
    else {
    	var tmfPolylineMouseoverSymbolRepeat = document.getElementById('tmf-polyline-mouseover-symbol-repeat-pixel-value').value + 'px';
    }
}

function tmfMarkerTitleTextChanged() {
	var tmfCurrentMarkerNumber = document.getElementById('tmf-map-marker-number').innerHTML;
	tmfMarkers[tmfCurrentMarkerNumber].setTitle(document.getElementById('tmf-map-marker-title').value);
}

function tmfAddEditMarkerListener(myMarker, i) {
    tmfMarker = myMarker;
    tmfEditMarkerListener[i] = google.maps.event.addListener(tmfMarker, 'dblclick', (function(tmfMarker, i) {
        return function() {
            document.getElementById('tmf-map-marker-number').innerHTML = i;
            document.getElementById('tmf-map-marker-name').value = tmfMarkerObjects[i].tmfMarkerName;
            document.getElementById('tmf-marker-listbox').value = tmfMarkerObjects[i].tmfMarkerType;

            switch(document.getElementById('tmf-marker-listbox').value) {
				case "svg":
					document.getElementById('tmf-marker-path').value = tmfMarkerObjects[i].tmfMarkerPath; 
		            document.getElementById('tmf-marker-scale').value = tmfMarkerObjects[i].tmfMarkerScale; 
		            document.getElementById('tmf-marker-svg-anchor-x').value = tmfMarkerObjects[i].tmfMarkerSvgAnchorX;
					document.getElementById('tmf-marker-svg-anchor-y').value = tmfMarkerObjects[i].tmfMarkerSvgAnchorY;
		            document.getElementById('tmf-marker-fill-selected-color').style.backgroundColor = tmfMarkerObjects[i].tmfMarkerFillColor; 
		            document.getElementById('tmf-marker-fill-opacity').value = tmfMarkerObjects[i].tmfMarkerFillOpacity; 
		            document.getElementById('tmf-marker-stroke-selected-color').style.backgroundColor = tmfMarkerObjects[i].tmfMarkerStrokeColor; 
		            document.getElementById('tmf-marker-stroke-opacity').value = tmfMarkerObjects[i].tmfMarkerStrokeOpacity;
		            document.getElementById('tmf-marker-stroke-weight').value = tmfMarkerObjects[i].tmfMarkerStrokeWeight; 
		          break;
            
		        case "png":
	            	document.getElementById('tmf-marker-pngimage-url').src = tmfMarkerObjects[i].tmfMarkerUrl; 
		            document.getElementById('tmf-marker-pngimage-anchor-x').value = tmfMarkerObjects[i].tmfMarkerAnchorX; 
		            document.getElementById('tmf-marker-pngimage-anchor-y').value = tmfMarkerObjects[i].tmfMarkerAnchorY; 

		            document.getElementById('tmf-marker-pngimage-settings').style.display = "block";

		            var tmfMarkerPngImageUrlArray = tmfMarkerObjects[i].tmfMarkerUrl.split("/");
		            var tmfMarkerPngImageUrlArrayLength = tmfMarkerPngImageUrlArray.length;
		            
		            var tmfMarkerPngImageColour = decodeURIComponent(tmfMarkerPngImageUrlArray[tmfMarkerPngImageUrlArrayLength - 3]);
		            var tmfMarkerPngImageCategory = decodeURIComponent(tmfMarkerPngImageUrlArray[tmfMarkerPngImageUrlArrayLength - 2]);
		            
		            var tmfMarkerPngImageId = tmfMarkerPngImageColour.replace(/\s/g, '') + '-' + tmfMarkerPngImageCategory.replace(/\s/g, '') + '-' + decodeURIComponent(tmfMarkerPngImageUrlArray[tmfMarkerPngImageUrlArrayLength - 1]).slice(0, -4);
		            tmfMarkerPngImageId = tmfMarkerPngImageId.replace(/\s/g, '');

		            document.getElementById('tmf-png-marker-color').value = tmfMarkerPngImageColour;
		            document.getElementById('tmf-png-marker-category').value = tmfMarkerPngImageCategory;
		            tmfPngMarkerColorChanged(); // Show correct block of markers

		            var tmfMarkerImage = document.getElementsByClassName('tmf-marker-image');
				    for (var j = 0; j < tmfMarkerImage.length; j++) {
				        tmfMarkerImage[j].style.height = "37px";
				    }
					document.getElementById(tmfMarkerPngImageId).style.height = "50px";
		        break;

            	case "user":
	            	document.getElementById('tmf-marker-url').value = tmfMarkerObjects[i].tmfMarkerUrl; 
	            	document.getElementById('tmf-marker-url-src').src = tmfMarkerObjects[i].tmfMarkerUrl; 
		            document.getElementById('tmf-marker-url-width').value = tmfMarkerObjects[i].tmfMarkerWidth; 
		            document.getElementById('tmf-marker-url-height').value = tmfMarkerObjects[i].tmfMarkerHeight;
		            document.getElementById('tmf-marker-origin-x').value = tmfMarkerObjects[i].tmfMarkerOriginX; 
		            document.getElementById('tmf-marker-origin-y').value = tmfMarkerObjects[i].tmfMarkerOriginY; 
		            document.getElementById('tmf-marker-anchor-x').value = tmfMarkerObjects[i].tmfMarkerAnchorX; 
		            document.getElementById('tmf-marker-anchor-y').value = tmfMarkerObjects[i].tmfMarkerAnchorY; 
		            document.getElementById('tmf-marker-png-image-settings').style.display = "block";
		        break;
            } 
            document.getElementById('tmf-map-marker-title').value = tmfMarkerObjects[i].tmfMarkerToolTip; 
            tmfMarkerTypeSelected(); // CHECK THIS

            tmfMarkerInfoWindow.close();

            var tmfTinymceEditor = tinyMCE.get('tmf_mapmarker_infowindow_text');
            tmfTinymceEditor.setContent(tmfMarkerObjects[i].tmfMarkerInfoWindowText);

		    document.getElementById('tmf-marker-infowindow-width').value = tmfMarkerObjects[i].tmfMarkerInfoWindowWidth;

		    tmfMarkers[i].setOptions({
		    	draggable: true
		    });

            // Check to see if the current object page tab is visible. If yes, dont call the toggletab function. If this is done, a second event listener is setup 
            if (!document.getElementById('tmf_markers_id').classList.contains("active")) {
	            tmftoggletabs(event, 'tmf_markers');
	        }
	        tmfTurnOffAllObjectListeners();

            document.getElementById('tmf-add-single-marker-settings').style.display = "block";
            document.getElementById('tmf-existing-marker-buttons').style.display = "block";
        }
    })(tmfMarker, i));
}

function tmfAddEditCircleListener(myCircle, i) {
    tmfCircle = myCircle;
    tmfEditCircleListener[i] = google.maps.event.addListener(tmfCircle, 'dblclick', (function(tmfCircle, i) {
        return function() {
            document.getElementById('tmf-map-circle-number').innerHTML = i;
            document.getElementById('tmf-map-circle-name').value = tmfCircleObjects[i].tmfCircleName; 
            document.getElementById('tmf-circle-radius').value = parseInt(tmfCircleObjects[i].tmfCircleRadius); 
            document.getElementById('tmf-circle-fill-selected-color').style.backgroundColor = tmfCircleObjects[i].tmfCircleFillColor;
            document.getElementById('tmf-circle-fill-opacity').value = tmfCircleObjects[i].tmfCircleFillOpacity; 
            document.getElementById('tmf-circle-stroke-selected-color').style.backgroundColor = tmfCircleObjects[i].tmfCircleStrokeColor; 
            document.getElementById('tmf-circle-stroke-opacity').value = tmfCircleObjects[i].tmfCircleStrokeOpacity; 
            document.getElementById('tmf-circle-stroke-weight').value = tmfCircleObjects[i].tmfCircleStrokeWeight; 

            tmfCircleInfoWindow.close();
		    
		    var tmfTinymceEditor = tinyMCE.get('tmf_mapcircle_infowindow_text');
		    tmfTinymceEditor.setContent(tmfCircleObjects[i].tmfCircleInfoWindowText);

		    document.getElementById('tmf-circle-infowindow-width').value = tmfCircleObjects[i].tmfCircleInfoWindowWidth; 
		    if (tmfCircleObjects[i].tmfCircleMouseOver == 'true') { 
				document.getElementById('tmf-circle-mouseover').checked = true;
				}
			else {
				document.getElementById('tmf-circle-mouseover').checked = false;
				}
			document.getElementById('tmf-circle-mouseover-fill-selected-color').style.backgroundColor = tmfCircleObjects[i].tmfCircleMouseoverFillColor; 
			document.getElementById('tmf-circle-mouseover-fill-opacity').value = tmfCircleObjects[i].tmfCircleMouseoverFillOpacity; 
		    document.getElementById('tmf-circle-mouseover-stroke-selected-color').style.backgroundColor = tmfCircleObjects[i].tmfCircleMouseoverStrokeColor; 
		    document.getElementById('tmf-circle-mouseover-stroke-opacity').value = tmfCircleObjects[i].tmfCircleMouseoverStrokeOpacity; 
		    document.getElementById('tmf-circle-mouseover-stroke-weight').value = tmfCircleObjects[i].tmfCircleMouseoverStrokeWeight; 

		    if (tmfCircleObjects[i].tmfCircleMouseOver == 'true') {
		    	document.getElementById('tmf-circle-mouseover-settings').style.display = "block";
		    }
		    else {
		    	document.getElementById('tmf-circle-mouseover-settings').style.display = "none";	
		    }

		    tmfCircles[i].setOptions({
		    	draggable: true,
		    	editable: true
		    });

		    google.maps.event.addListener(tmfCircles[i], 'radius_changed', function () {
			    document.getElementById('tmf-circle-radius').value = tmfCircles[i].getRadius().toFixed(0);
			});

            // Check to see if the current object page tab is visible. If yes, dont call the toggletab function. If this is done, a second event listener is setup 
            if (!document.getElementById('tmf_circles_id').classList.contains("active")) {
	            tmftoggletabs(event, 'tmf_circles');
	        }
            tmfTurnOffAllObjectListeners();

            document.getElementById('tmf-add-circle-settings').style.display = "block";
            document.getElementById('tmf-existing-circle-buttons').style.display = "block";
        }
    })(tmfCircle, i));
}

function tmfAddEditPolygonListener(myPolygon, i) {
    tmfPolygon = myPolygon;
    tmfEditPolygonListener[i] = google.maps.event.addListener(tmfPolygon, 'dblclick', (function(tmfPolygon, i) {
        return function() {
        	// Close open info window
            if (tmfPolygonInfoWindow) {
	            tmfPolygonInfoWindow.close();
	        }

            document.getElementById('tmf-map-polygon-number').innerHTML = i;
            document.getElementById('tmf-map-polygon-name').value = tmfPolygonObjects[i].tmfPolygonName;
            document.getElementById('tmf-polygon-fill-selected-color').style.backgroundColor = tmfPolygonObjects[i].tmfPolygonFillColor
            document.getElementById('tmf-polygon-fill-opacity').value = tmfPolygonObjects[i].tmfPolygonFillOpacity;
            document.getElementById('tmf-polygon-stroke-selected-color').style.backgroundColor = tmfPolygonObjects[i].tmfPolygonStrokeColor;
            document.getElementById('tmf-polygon-stroke-opacity').value = tmfPolygonObjects[i].tmfPolygonStrokeOpacity;
            document.getElementById('tmf-polygon-stroke-weight').value = tmfPolygonObjects[i].tmfPolygonStrokeWeight;

		    var tmfTinymceEditor = tinyMCE.get('tmf_mappolygon_infowindow_text');
		    tmfTinymceEditor.setContent(tmfPolygonObjects[i].tmfPolygonInfoWindowText);

		    document.getElementById('tmf-polygon-infowindow-width').value = tmfPolygonObjects[i].tmfPolygonInfoWindowWidth;
		    if (tmfPolygonObjects[i].tmfPolygonMouseOver == 'true') {
				document.getElementById('tmf-polygon-mouseover').checked = true;
				}
			else {
				document.getElementById('tmf-polygon-mouseover').checked = false;
			}

			document.getElementById('tmf-polygon-mouseover-fill-selected-color').style.backgroundColor = tmfPolygonObjects[i].tmfPolygonMouseoverFillColor; 
			document.getElementById('tmf-polygon-mouseover-fill-opacity').value = tmfPolygonObjects[i].tmfPolygonMouseoverFillOpacity;
		    document.getElementById('tmf-polygon-mouseover-stroke-selected-color').style.backgroundColor = tmfPolygonObjects[i].tmfPolygonMouseoverStrokeColor;
		    document.getElementById('tmf-polygon-mouseover-stroke-opacity').value = tmfPolygonObjects[i].tmfPolygonMouseoverStrokeOpacity;
		    document.getElementById('tmf-polygon-mouseover-stroke-weight').value = tmfPolygonObjects[i].tmfPolygonMouseoverStrokeWeight;

		    if (tmfPolygonObjects[i].tmfPolygonMouseOver == 'true') {
		    	document.getElementById('tmf-polygon-mouseover-settings').style.display = "block";
		    }
		    else {
		    	document.getElementById('tmf-polygon-mouseover-settings').style.display = "none";	
		    }

		    tmfPolygons[i].setOptions({
		    	draggable: true,
		    	editable: true
		    });

		    addPolygonVertexListener = google.maps.event.addListener(tmfTheMap, 'click', tmfAddPolygonVertex);

            // Check to see if the current object page tab is visible. If yes, dont call the toggletab function. If this is done, a second event listener is setup 
            if (!document.getElementById('tmf_polygons_id').classList.contains("active")) {
	            tmftoggletabs(event, 'tmf_polygons');
	        }
            tmfTurnOffAllObjectListeners();

            document.getElementById('tmf-add-polygon-settings').style.display = "block";
            document.getElementById('tmf-existing-polygon-buttons').style.display = "block";
        }
    })(tmfPolygon, i));
}

function tmfAddEditPolylineListener(myPolyline, i) {
    tmfPolyline = myPolyline;
    tmfEditPolylineListener[i] = google.maps.event.addListener(tmfPolyline, 'dblclick', (function(tmfPolyline, i) {
        return function() {
        	// Close open info window
            if (tmfPolylineInfoWindow) {
	            tmfPolylineInfoWindow.close();
	        }

            document.getElementById('tmf-map-polyline-number').innerHTML = i;
            if (tmfPolylineObjects[i].tmfPolylineSource != 'manual') {
            	document.getElementById('tmf-polyline-file-url-text').value = tmfPolylineObjects[i].tmfPolylineFileUrl 
            }
            document.getElementById('tmf-polyline-file-contents').value = tmfPolylineObjects[i].tmfPolylinePath; 
            document.getElementById('tmf-map-polyline-name').value = tmfPolylineObjects[i].tmfPolylineName; 
            document.getElementById('tmf-polyline-stroke-selected-color').style.backgroundColor = tmfPolylineObjects[i].tmfPolylineStrokeColor; 
            document.getElementById('tmf-polyline-stroke-opacity').value = tmfPolylineObjects[i].tmfPolylineStrokeOpacity; 
            document.getElementById('tmf-polyline-stroke-weight').value = tmfPolylineObjects[i].tmfPolylineStrokeWeight; 

		    var tmfTinymceEditor = tinyMCE.get('tmf_mappolyline_infowindow_text');
		    tmfTinymceEditor.setContent(tmfPolylineObjects[i].tmfPolylineInfoWindowText);

		    document.getElementById('tmf-polyline-infowindow-width').value = tmfPolylineObjects[i].tmfPolylineInfoWindowWidth; 
		    document.getElementById('tmf-polyline-symbol-type').value = tmfPolylineObjects[i].tmfPolylineSymbol; 
		    if (document.getElementById('tmf-polyline-symbol-type').value == "none") {
		    	document.getElementById('tmf-polyline-symbol-settings').style.display = "none";
		    } 
		    else {
		    	document.getElementById('tmf-polyline-symbol-settings').style.display = "block";
		    }

		    if (tmfPolylineObjects[i].tmfPolylineSymbolOffset.substr(-1) == '%') {
		    	document.getElementById('tmf-polyline-symbol-offset-percentage-value').value = tmfPolylineObjects[i].tmfPolylineSymbolOffset.slice(0,-1);
				document.getElementById('tmf-polyline-symbol-offset-percentage-radio').checked = true;
				document.getElementById('tmf-polyline-symbol-offset-pixel-value').value = 20;
				document.getElementById('tmf-polyline-symbol-offset-percentage-value').style.display = "block";
				document.getElementById('tmf-polyline-symbol-offset-pixel-value').style.display = "none";

			}
			else {
				document.getElementById('tmf-polyline-symbol-offset-pixel-value').value = tmfPolylineObjects[i].tmfPolylineSymbolOffset.slice(0,-2);
				document.getElementById('tmf-polyline-symbol-offset-pixel-radio').checked = true;
				document.getElementById('tmf-polyline-symbol-offset-percentage-value').value = 20;
				document.getElementById('tmf-polyline-symbol-offset-percentage-value').style.display = "none";
				document.getElementById('tmf-polyline-symbol-offset-pixel-value').style.display = "block";
			}

			if (tmfPolylineObjects[i].tmfPolylineSymbolRepeat.substr(-1) == '%') {
		    	document.getElementById('tmf-polyline-symbol-repeat-percentage-value').value = tmfPolylineObjects[i].tmfPolylineSymbolRepeat.slice(0,-1);
				document.getElementById('tmf-polyline-symbol-repeat-percentage-radio').checked = true;
				document.getElementById('tmf-polyline-symbol-repeat-pixel-value').value = 20;
				document.getElementById('tmf-polyline-symbol-repeat-percentage-value').style.display = "block";
				document.getElementById('tmf-polyline-symbol-repeat-pixel-value').style.display = "none";
			}
			else {
				document.getElementById('tmf-polyline-symbol-repeat-pixel-value').value = tmfPolylineObjects[i].tmfPolylineSymbolRepeat.slice(0,-2);
				document.getElementById('tmf-polyline-symbol-repeat-pixel-radio').checked = true;
				document.getElementById('tmf-polyline-symbol-repeat-percentage-value').value = 20;
				document.getElementById('tmf-polyline-symbol-repeat-percentage-value').style.display = "none";
				document.getElementById('tmf-polyline-symbol-repeat-pixel-value').style.display = "block";
			}

		    document.getElementById('tmf-polyline-symbol-scale').value = tmfPolylineObjects[i].tmfPolylineSymbolScale; 
		    document.getElementById('tmf-polyline-symbol-stroke-selected-color').style.backgroundColor = tmfPolylineObjects[i].tmfPolylineSymbolStrokeColor;
		    document.getElementById('tmf-polyline-symbol-stroke-opacity').value = tmfPolylineObjects[i].tmfPolylineSymbolStrokeOpacity; 
		    document.getElementById('tmf-polyline-symbol-stroke-weight').value = tmfPolylineObjects[i].tmfPolylineSymbolStrokeWeight;
		    document.getElementById('tmf-polyline-symbol-fill-selected-color').style.backgroundColor = tmfPolylineObjects[i].tmfPolylineSymbolFillColor;
		    document.getElementById('tmf-polyline-symbol-fill-opacity').value = tmfPolylineObjects[i].tmfPolylineSymbolFillOpacity;

		    if (tmfPolylineObjects[i].tmfPolylineMouseOver == 'true') { // 20
				document.getElementById('tmf-polyline-mouseover').checked = true;
			}
			else {
				document.getElementById('tmf-polyline-mouseover').checked = false;
			}

		    if (document.getElementById('tmf-polyline-mouseover').checked == true) {
			    document.getElementById('tmf-polyline-mouseover-settings').style.display = "block";
			}
			else {
				document.getElementById('tmf-polyline-mouseover-settings').style.display = "none";	
			}

		    document.getElementById('tmf-polyline-mouseover-stroke-selected-color').style.backgroundColor = tmfPolylineObjects[i].tmfPolylineMouseoverStrokeColor;
		    document.getElementById('tmf-polyline-mouseover-stroke-opacity').value = tmfPolylineObjects[i].tmfPolylineMouseoverStrokeOpacity;
		    document.getElementById('tmf-polyline-mouseover-stroke-weight').value = tmfPolylineObjects[i].tmfPolylineMouseoverStrokeWeight; 
		    document.getElementById('tmf-polyline-mouseover-symbol-type').value = tmfPolylineObjects[i].tmfPolylineMouseoverSymbol;

		    if (document.getElementById('tmf-polyline-mouseover-symbol-type').value == "none") {
		    	document.getElementById('tmf-polyline-mouseover-symbol-settings').style.display = "none";
		    } 
		    else {
		    	document.getElementById('tmf-polyline-mouseover-symbol-settings').style.display = "block";
		    }

		    if (tmfPolylineObjects[i].tmfPolylineMouseoverSymbolOffset.substr(-1) == '%') {
		    	document.getElementById('tmf-polyline-mouseover-symbol-offset-percentage-value').value = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolOffset.slice(0,-1);
				document.getElementById('tmf-polyline-mouseover-symbol-offset-percentage-radio').checked = true;
				document.getElementById('tmf-polyline-mouseover-symbol-offset-pixel-value').value = 20;
				document.getElementById('tmf-polyline-mouseover-symbol-offset-percentage-value').style.display = "block";
				document.getElementById('tmf-polyline-mouseover-symbol-offset-pixel-value').style.display = "none";
			}
			else {
				document.getElementById('tmf-polyline-mouseover-symbol-offset-pixel-value').value = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolOffset.slice(0,-2);
				document.getElementById('tmf-polyline-mouseover-symbol-offset-pixel-radio').checked = true;
				document.getElementById('tmf-polyline-mouseover-symbol-offset-percentage-value').value = 20;
				document.getElementById('tmf-polyline-mouseover-symbol-offset-percentage-value').style.display = "none";
				document.getElementById('tmf-polyline-mouseover-symbol-offset-pixel-value').style.display = "block";
			}

			if (tmfPolylineObjects[i].tmfPolylineMouseoverSymbolRepeat.substr(-1) == '%') {
		    	document.getElementById('tmf-polyline-mouseover-symbol-repeat-percentage-value').value = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolRepeat.slice(0,-1);
				document.getElementById('tmf-polyline-mouseover-symbol-repeat-percentage-radio').checked = true;
				document.getElementById('tmf-polyline-mouseover-symbol-repeat-pixel-value').value = 20;
				document.getElementById('tmf-polyline-mouseover-symbol-repeat-percentage-value').style.display = "block";
				document.getElementById('tmf-polyline-mouseover-symbol-repeat-pixel-value').style.display = "none";
			}
			else {
				document.getElementById('tmf-polyline-mouseover-symbol-repeat-pixel-value').value = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolRepeat.slice(0,-2);
				document.getElementById('tmf-polyline-mouseover-symbol-repeat-pixel-radio').checked = true;
				document.getElementById('tmf-polyline-mouseover-symbol-repeat-percentage-value').value = 20;
				document.getElementById('tmf-polyline-mouseover-symbol-repeat-percentage-value').style.display = "none";
				document.getElementById('tmf-polyline-mouseover-symbol-repeat-pixel-value').style.display = "block";
			}

			document.getElementById('tmf-polyline-mouseover-symbol-scale').value = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolScale;
		    document.getElementById('tmf-polyline-mouseover-symbol-stroke-selected-color').style.backgroundColor = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolStrokeColor;
		    document.getElementById('tmf-polyline-mouseover-symbol-stroke-opacity').value = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolStrokeOpacity;
		    document.getElementById('tmf-polyline-mouseover-symbol-stroke-weight').value = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolStrokeWeight;
		    document.getElementById('tmf-polyline-mouseover-symbol-fill-selected-color').style.backgroundColor = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolFillColor;
		    document.getElementById('tmf-polyline-mouseover-symbol-fill-opacity').value = tmfPolylineObjects[i].tmfPolylineMouseoverSymbolFillOpacity;

		    if (tmfPolylineObjects[i].tmfPolylineIsChartShow == 'true') {
	            document.getElementById('tmf-show-elevation-chart').checked = true;
	        } else
	        {
	        	document.getElementById('tmf-show-elevation-chart').checked = false;
	        	document.getElementById('tmf-polyline-chart-' + tmfPostId).style.display = "none";
	        }
	        tmfCheckToShowUpdateHeights();

            document.getElementById('tmf-chart-selected-color').style.backgroundColor = tmfPolylineObjects[i].tmfPolylineChartColor;
            document.getElementById('tmf-chart-strokeweight').value = tmfPolylineObjects[i].tmfPolylineChartStrokeWeight;
            document.getElementById('tmf-chart-vaxis').value = tmfPolylineObjects[i].tmfPolylineChartAxisHeight;
            document.getElementById('tmf-chart-min-height').value = tmfPolylineObjects[i].tmfPolylineChartAxisHeightMin;
            document.getElementById('tmf-chart-max-height').value = tmfPolylineObjects[i].tmfPolylineChartAxisHeightMax;
            document.getElementById('tmf-chart-fixed-height').value = tmfPolylineObjects[i].tmfPolylineChartAxisHeightFixed;

            if (document.getElementById('tmf-show-elevation-chart').checked) {
		    	document.getElementById('tmf-chart-settings').style.display = "block";	
		    } else 
		    {
		    	document.getElementById('tmf-chart-settings').style.display = "none";
		    }

		    if (document.getElementById('tmf-chart-vaxis').value == "adjust") {
		    	document.getElementById('tmf-chart-height-adjust-settings').style.display = "block";
				document.getElementById('tmf-chart-height-fixed-settings').style.display = "none";
		    } else
		    {
		    	document.getElementById('tmf-chart-height-adjust-settings').style.display = "none";
				document.getElementById('tmf-chart-height-fixed-settings').style.display = "flex";
		    }

    		if (tmfPolylineObjects[i].tmfPolylineIsChartMetadataShow == 'true') {
					document.getElementById('tmf-show-chart-meta-data').checked = true;
				}
			else {
				document.getElementById('tmf-show-chart-meta-data').checked = false;
			}

			tmfPolylines[i].setOptions({
		    	draggable: true,
		    	editable: true
		    });

		    addPolylineVertexListener = google.maps.event.addListener(tmfTheMap, 'click', tmfAddPolylineVertex);

            // Check to see if the current object page tab is visible. If yes, dont call the toggletab function. If this is done, a second event listener is setup 
            if (!document.getElementById('tmf_polylines_id').classList.contains("active")) {
	            tmftoggletabs(event, 'tmf_polylines');
	        }
            tmfTurnOffAllObjectListeners();

            document.getElementById('tmf-add-polyline-settings').style.display = "block";
            document.getElementById('tmf-existing-polyline-buttons').style.display = "block";
            document.getElementById('tmf-poyline-creation-method').style.display = "none";
    		document.getElementById('tmf-poyline-creation-method-file-button').style.display = "none";
    		document.getElementById('tmf-polyline-creation-text').style.display = "none";
    		document.getElementById('tmf-create-polyline-help-text').style.display = "none";
        }
    })(tmfPolyline, i));
}

function getTinyMceContent(id) {
    var tmfTinymceContent = '';
    var tmfTinymceInputid = id;
    var tmfTinymceEditor = tinyMCE.get(tmfTinymceInputid);
    var tmfTinymceInputidTextArea = jQuery('textarea#' + tmfTinymceInputid);    
    if (tmfTinymceInputidTextArea.length > 0 && tmfTinymceInputidTextArea.is(':visible')) {
        tmfTinymceContent = tmfTinymceInputidTextArea.val();        
    } 
    else {
        tmfTinymceContent = tmfTinymceEditor.getContent();
    }    
    return tmfTinymceContent;
}

function tmfAddMarker(tmfAddOrUpdate) {
	var tmfCurrentMarkerNumber = document.getElementById('tmf-map-marker-number').innerHTML;

	var y = tmfMarkers[tmfCurrentMarkerNumber];
	var x = y.getIcon();
	if (typeof y.title === "undefined") {
		y.title = '';
	}

	var tmfMarkerInfoWindowText = getTinyMceContent('tmf_mapmarker_infowindow_text'); // STRIP OFF SEPARATOR 
	tmfMarkerInfoWindow = new google.maps.InfoWindow({
        content: tmfMarkerInfoWindowText 
    });

	tmfMarkerObject = {};

	switch(document.getElementById('tmf-marker-listbox').value) {
		case "svg":
			tmfMarkerObject.tmfMarkerType = 'svg';
	    	tmfMarkerObject.tmfMarkerCenterLat = y.getPosition().lat();
	    	tmfMarkerObject.tmfMarkerCenterLon = y.getPosition().lng();
	    	tmfMarkerObject.tmfMarkerName = document.getElementById('tmf-map-marker-name').value;
	    	tmfMarkerObject.tmfMarkerPath = document.getElementById('tmf-marker-path').value;
	    	tmfMarkerObject.tmfMarkerScale = x.scale;
	    	tmfMarkerObject.tmfMarkerSvgAnchorX = x.anchor.x;
	    	tmfMarkerObject.tmfMarkerSvgAnchorY = x.anchor.y; 
	    	tmfMarkerObject.tmfMarkerFillColor = x.fillColor;
	    	tmfMarkerObject.tmfMarkerFillOpacity = x.fillOpacity;
	    	tmfMarkerObject.tmfMarkerStrokeColor = x.strokeColor;
	    	tmfMarkerObject.tmfMarkerStrokeOpacity = x.strokeOpacity;
	    	tmfMarkerObject.tmfMarkerStrokeWeight = x.strokeWeight;
	    	tmfMarkerObject.tmfMarkerToolTip = y.title;
    	break;

		case "png":
			tmfMarkerObject.tmfMarkerType = 'png';
	    	tmfMarkerObject.tmfMarkerCenterLat = y.getPosition().lat(); 
	    	tmfMarkerObject.tmfMarkerCenterLon = y.getPosition().lng();
	    	tmfMarkerObject.tmfMarkerName = document.getElementById('tmf-map-marker-name').value;
	    	tmfMarkerObject.tmfMarkerUrl = x.url;
	    	tmfMarkerObject.tmfMarkerAnchorX = x.anchor.x;
	    	tmfMarkerObject.tmfMarkerAnchorY =  x.anchor.y;
	    	tmfMarkerObject.tmfMarkerToolTip = y.title;
		break;

		case "user":
			tmfMarkerObject.tmfMarkerType = 'user';
	    	tmfMarkerObject.tmfMarkerCenterLat = y.getPosition().lat(); 
	    	tmfMarkerObject.tmfMarkerCenterLon = y.getPosition().lng();
	    	tmfMarkerObject.tmfMarkerName = document.getElementById('tmf-map-marker-name').value;
	    	tmfMarkerObject.tmfMarkerUrl = x.url;
	    	tmfMarkerObject.tmfMarkerWidth = x.size.width;
	    	tmfMarkerObject.tmfMarkerHeight = x.size.height;
	    	tmfMarkerObject.tmfMarkerOriginX = x.origin.x;
	    	tmfMarkerObject.tmfMarkerOriginY = x.origin.y; 
	    	tmfMarkerObject.tmfMarkerAnchorX = x.anchor.x;
	    	tmfMarkerObject.tmfMarkerAnchorY =  x.anchor.y;
	    	tmfMarkerObject.tmfMarkerToolTip = y.title;
		break;
	}

	tmfMarkerInfoWindowText = tmfMarkerInfoWindowText.replace(/¦/g, '');
	tmfMarkerObject.tmfMarkerInfoWindowText = tmfMarkerInfoWindowText.replace(/\|/g, '');
	tmfMarkerObject.tmfMarkerInfoWindowWidth = document.getElementById('tmf-marker-infowindow-width').value;

	if (tmfAddOrUpdate == "add") {
	    tmfMarkerObjects.push(tmfMarkerObject);
	}
	else {
		tmfMarkerObjects.splice(tmfCurrentMarkerNumber, 1, tmfMarkerObject);
	}

	document.getElementById('tmf-map-marker-array').value = tmfConvertMultiObjectArrayWithKeysToString(tmfMarkerObjects);
	tmfRemoveMarkerButtons();
}

function tmfAddCircle(tmfAddOrUpdate) {
	var tmfCurrentCircleNumber = document.getElementById('tmf-map-circle-number').innerHTML;
	var y = tmfCircles[tmfCurrentCircleNumber];
	var tmfCircleInfoWindowText = getTinyMceContent('tmf_mapcircle_infowindow_text'); // STRIP OFF SEPARATOR 

	tmfCircleInfoWindow = new google.maps.InfoWindow({
        content: tmfCircleInfoWindowText 
    });
	tmfCircleObject = {};
	tmfCircleObject.tmfCircleCenterLat = y.getCenter().lat();
	tmfCircleObject.tmfCircleCenterLon = y.getCenter().lng();
	tmfCircleObject.tmfCircleName = document.getElementById('tmf-map-circle-name').value;
	tmfCircleObject.tmfCircleRadius = y.radius;
	tmfCircleObject.tmfCircleFillColor = y.fillColor;
	tmfCircleObject.tmfCircleFillOpacity = y.fillOpacity;
	tmfCircleObject.tmfCircleStrokeColor = y.strokeColor;
	tmfCircleObject.tmfCircleStrokeOpacity = y.strokeOpacity;
	tmfCircleObject.tmfCircleStrokeWeight = y.strokeWeight;
	tmfCircleInfoWindowText = tmfCircleInfoWindowText.replace(/¦/g, '');
	tmfCircleObject.tmfCircleInfoWindowText = tmfCircleInfoWindowText.replace(/\|/g, '');
	tmfCircleObject.tmfCircleInfoWindowWidth = document.getElementById('tmf-circle-infowindow-width').value;
	if (document.getElementById('tmf-circle-mouseover').checked) {
		tmfCircleObject.tmfCircleMouseOver = 'true';
	} else
	{
		tmfCircleObject.tmfCircleMouseOver = 'false';
	}
	tmfCircleObject.tmfCircleMouseoverFillColor = document.getElementById('tmf-circle-mouseover-fill-selected-color').style.backgroundColor;
	tmfCircleObject.tmfCircleMouseoverFillOpacity = document.getElementById('tmf-circle-mouseover-fill-opacity').value;
    tmfCircleObject.tmfCircleMouseoverStrokeColor = document.getElementById('tmf-circle-mouseover-stroke-selected-color').style.backgroundColor;
    tmfCircleObject.tmfCircleMouseoverStrokeOpacity = document.getElementById('tmf-circle-mouseover-stroke-opacity').value;
    tmfCircleObject.tmfCircleMouseoverStrokeWeight = document.getElementById('tmf-circle-mouseover-stroke-weight').value;

    if (tmfAddOrUpdate == 'add') {
	    tmfCircleObjects.push(tmfCircleObject);
	}
	else {
		tmfCircleObjects.splice(tmfCurrentCircleNumber, 1, tmfCircleObject);
	}

	document.getElementById('tmf-map-circle-array').value = tmfConvertMultiObjectArrayWithKeysToString(tmfCircleObjects);
	tmfRemoveCircleButtons();
}

function tmfAddPolygon(tmfAddOrUpdate) {
	var tmfCurrentPolygonNumber = document.getElementById('tmf-map-polygon-number').innerHTML;
	var y = tmfPolygons[tmfCurrentPolygonNumber];
	var tmfPolygonInfoWindowText = getTinyMceContent('tmf_mappolygon_infowindow_text');

	tmfPolygonInfoWindow = new google.maps.InfoWindow({
        content: tmfPolygonInfoWindowText 
    });

	tmfPolygonObject = {};
	tmfPolygonObject.tmfPolygonPath = tmfGetObjectPath(y.getPath());
	tmfPolygonObject.tmfPolygonName = document.getElementById('tmf-map-polygon-name').value; 
	tmfPolygonObject.tmfPolygonFillColor = document.getElementById('tmf-polygon-fill-selected-color').style.backgroundColor;
	tmfPolygonObject.tmfPolygonFillOpacity = document.getElementById('tmf-polygon-fill-opacity').value;
	tmfPolygonObject.tmfPolygonStrokeColor = document.getElementById('tmf-polygon-stroke-selected-color').style.backgroundColor;
    tmfPolygonObject.tmfPolygonStrokeOpacity = document.getElementById('tmf-polygon-stroke-opacity').value;
    tmfPolygonObject.tmfPolygonStrokeWeight = document.getElementById('tmf-polygon-stroke-weight').value;    
    tmfPolygonInfoWindowText = tmfPolygonInfoWindowText.replace(/¦/g, '');
	tmfPolygonObject.tmfPolygonInfoWindowText = tmfPolygonInfoWindowText.replace(/\|/g, '');
	tmfPolygonObject.tmfPolygonInfoWindowWidth = document.getElementById('tmf-polygon-infowindow-width').value;
	if (document.getElementById('tmf-polygon-mouseover').checked) {
		tmfPolygonObject.tmfPolygonMouseOver = 'true';
	} else
	{
		tmfPolygonObject.tmfPolygonMouseOver = 'false';
	}
	tmfPolygonObject.tmfPolygonMouseoverFillColor = document.getElementById('tmf-polygon-mouseover-fill-selected-color').style.backgroundColor; 
	tmfPolygonObject.tmfPolygonMouseoverFillOpacity = document.getElementById('tmf-polygon-mouseover-fill-opacity').value;
    tmfPolygonObject.tmfPolygonMouseoverStrokeColor = document.getElementById('tmf-polygon-mouseover-stroke-selected-color').style.backgroundColor;
    tmfPolygonObject.tmfPolygonMouseoverStrokeOpacity = document.getElementById('tmf-polygon-mouseover-stroke-opacity').value;
    tmfPolygonObject.tmfPolygonMouseoverStrokeWeight = document.getElementById('tmf-polygon-mouseover-stroke-weight').value;

    if (tmfAddOrUpdate == 'add') {
	    tmfPolygonObjects.push(tmfPolygonObject);
	}
	else {
		tmfPolygonObjects.splice(tmfCurrentPolygonNumber, 1, tmfPolygonObject);
	}

	document.getElementById('tmf-map-polygon-array').value = tmfConvertMultiObjectArrayWithKeysToString(tmfPolygonObjects);
	tmfRemovePolygonButtons();
}

function tmfAddPolyline(tmfAddOrUpdate) {	
	var tmfCurrentPolylineNumber = document.getElementById('tmf-map-polyline-number').innerHTML;
	var y = tmfPolylines[tmfCurrentPolylineNumber];

	var tmfPolylineInfoWindowText = getTinyMceContent('tmf_mappolyline_infowindow_text'); // STRIP OFF SEPARATOR 
	tmfPolylineInfoWindow = new google.maps.InfoWindow({
        content: tmfPolylineInfoWindowText 
    });

    tmfPolylineObject = {};

    if (document.getElementById('tmf-polyline-file-url-text').value) { 
    	tmfPolylineObject.tmfPolylineSource = 'gpx';
    	tmfPolylineObject.tmfPolylineFileUrl = document.getElementById('tmf-polyline-file-url-text').value; 
    	tmfPolylineObject.tmfPolylinePath = document.getElementById('tmf-polyline-file-contents').value; 
    } else
    {
    	tmfPolylineObject.tmfPolylineSource = 'manual'; 
    	tmfPolylineObject.tmfPolylinePath = tmfGetObjectPath(y.getPath());
    }

	tmfPolylineObject.tmfPolylineName = document.getElementById('tmf-map-polyline-name').value;
	tmfPolylineObject.tmfPolylineStrokeColor = document.getElementById('tmf-polyline-stroke-selected-color').style.backgroundColor; 
    tmfPolylineObject.tmfPolylineStrokeOpacity = document.getElementById('tmf-polyline-stroke-opacity').value;
    tmfPolylineObject.tmfPolylineStrokeWeight =  document.getElementById('tmf-polyline-stroke-weight').value;
    tmfPolylineInfoWindowText = tmfPolylineInfoWindowText.replace(/¦/g, '');
	tmfPolylineObject.tmfPolylineInfoWindowText = tmfPolylineInfoWindowText.replace(/\|/g, '');
	tmfPolylineObject.tmfPolylineInfoWindowWidth = document.getElementById('tmf-polyline-infowindow-width').value;
	tmfPolylineObject.tmfPolylineSymbol = document.getElementById('tmf-polyline-symbol-type').value;

	if (document.getElementById('tmf-polyline-symbol-offset-percentage-radio').checked == true) {
    	tmfPolylineSymbolOffset = document.getElementById('tmf-polyline-symbol-offset-percentage-value').value + '%';
    } 
    else {
    	tmfPolylineSymbolOffset = document.getElementById('tmf-polyline-symbol-offset-pixel-value').value + 'px';
    }
    tmfPolylineObject.tmfPolylineSymbolOffset = tmfPolylineSymbolOffset;

    if (document.getElementById('tmf-polyline-symbol-repeat-percentage-radio').checked == true) {
    	tmfPolylineSymbolRepeat = document.getElementById('tmf-polyline-symbol-repeat-percentage-value').value + '%';
    } 
    else {
    	tmfPolylineSymbolRepeat = document.getElementById('tmf-polyline-symbol-repeat-pixel-value').value + 'px';
    }
    tmfPolylineObject.tmfPolylineSymbolRepeat = tmfPolylineSymbolRepeat;
    tmfPolylineObject.tmfPolylineSymbolScale = document.getElementById('tmf-polyline-symbol-scale').value; 
    tmfPolylineObject.tmfPolylineSymbolStrokeColor = document.getElementById('tmf-polyline-symbol-stroke-selected-color').style.backgroundColor; 
    tmfPolylineObject.tmfPolylineSymbolStrokeOpacity = document.getElementById('tmf-polyline-symbol-stroke-opacity').value;
    tmfPolylineObject.tmfPolylineSymbolStrokeWeight = document.getElementById('tmf-polyline-symbol-stroke-weight').value; 
    tmfPolylineObject.tmfPolylineSymbolFillColor = document.getElementById('tmf-polyline-symbol-fill-selected-color').style.backgroundColor; 
    tmfPolylineObject.tmfPolylineSymbolFillOpacity = document.getElementById('tmf-polyline-symbol-fill-opacity').value; 

	// Polyline mouseover
	if (document.getElementById('tmf-polyline-mouseover').checked) { 
		tmfPolylineObject.tmfPolylineMouseOver = 'true'; 
	} else
	{
		tmfPolylineObject.tmfPolylineMouseOver = 'false'; 
	} 
    tmfPolylineObject.tmfPolylineMouseoverStrokeColor = document.getElementById('tmf-polyline-mouseover-stroke-selected-color').style.backgroundColor; 
    tmfPolylineObject.tmfPolylineMouseoverStrokeOpacity = document.getElementById('tmf-polyline-mouseover-stroke-opacity').value;
    tmfPolylineObject.tmfPolylineMouseoverStrokeWeight = document.getElementById('tmf-polyline-mouseover-stroke-weight').value; 

	// Polyline mouseover symbols
    tmfPolylineObject.tmfPolylineMouseoverSymbol = document.getElementById('tmf-polyline-mouseover-symbol-type').value;

    if (document.getElementById('tmf-polyline-mouseover-symbol-offset-percentage-radio').checked == true) {
    	var tmfPolylineMouseoverSymbolOffset = document.getElementById('tmf-polyline-mouseover-symbol-offset-percentage-value').value + '%';
    } 
    else {
    	var tmfPolylineMouseoverSymbolOffset = document.getElementById('tmf-polyline-mouseover-symbol-offset-pixel-value').value + 'px';
    }
    tmfPolylineObject.tmfPolylineMouseoverSymbolOffset = tmfPolylineMouseoverSymbolOffset;

    if (document.getElementById('tmf-polyline-mouseover-symbol-repeat-percentage-radio').checked == true) {
    	var tmfPolylineMouseOverSymbolRepeat = document.getElementById('tmf-polyline-mouseover-symbol-repeat-percentage-value').value + '%';
    } 
    else {
    	var tmfPolylineMouseOverSymbolRepeat = document.getElementById('tmf-polyline-mouseover-symbol-repeat-pixel-value').value + 'px';
    }
    tmfPolylineObject.tmfPolylineMouseoverSymbolRepeat = tmfPolylineMouseOverSymbolRepeat;

    tmfPolylineObject.tmfPolylineMouseoverSymbolScale = document.getElementById('tmf-polyline-mouseover-symbol-scale').value;
    tmfPolylineObject.tmfPolylineMouseoverSymbolStrokeColor = document.getElementById('tmf-polyline-mouseover-symbol-stroke-selected-color').style.backgroundColor;
    tmfPolylineObject.tmfPolylineMouseoverSymbolStrokeOpacity = document.getElementById('tmf-polyline-mouseover-symbol-stroke-opacity').value;
    tmfPolylineObject.tmfPolylineMouseoverSymbolStrokeWeight = document.getElementById('tmf-polyline-mouseover-symbol-stroke-weight').value; 
    tmfPolylineObject.tmfPolylineMouseoverSymbolFillColor = document.getElementById('tmf-polyline-mouseover-symbol-fill-selected-color').style.backgroundColor;
    tmfPolylineObject.tmfPolylineMouseoverSymbolFillOpacity = document.getElementById('tmf-polyline-mouseover-symbol-fill-opacity').value;
 
    if (document.getElementById('tmf-show-elevation-chart').checked == true) {
		tmfPolylineObject.tmfPolylineIsChartShow = 'true';
	}
	else {
		tmfPolylineObject.tmfPolylineIsChartShow = 'false';
	}

    tmfPolylineObject.tmfPolylineChartColor = document.getElementById('tmf-chart-selected-color').style.backgroundColor; 
    tmfPolylineObject.tmfPolylineChartStrokeWeight = document.getElementById('tmf-chart-strokeweight').value; 
    tmfPolylineObject.tmfPolylineChartAxisHeight = document.getElementById('tmf-chart-vaxis').value; 
    tmfPolylineObject.tmfPolylineChartAxisHeightMin = document.getElementById('tmf-chart-min-height').value; 
    tmfPolylineObject.tmfPolylineChartAxisHeightMax = document.getElementById('tmf-chart-max-height').value; 
    tmfPolylineObject.tmfPolylineChartAxisHeightFixed = document.getElementById('tmf-chart-fixed-height').value;

    if (document.getElementById('tmf-show-chart-meta-data').checked == true) {
		tmfPolylineObject.tmfPolylineIsChartMetadataShow = 'true';
	}
	else {
		tmfPolylineObject.tmfPolylineIsChartMetadataShow = 'false';
	}

	var tmfPolylineLocations = [];
	var tmfCurrentPolylinePath = tmfPolylines[document.getElementById('tmf-map-polyline-number').innerHTML].getPath(); 

	for (var j = 0; j < tmfCurrentPolylinePath.length; j++) {
		var tmfPolylineLocation = new google.maps.LatLng(tmfCurrentPolylinePath.getAt(j).lat(), tmfCurrentPolylinePath.getAt(j).lng());
		tmfPolylineLocations.push(tmfPolylineLocation);
	}

	if (!document.getElementById('tmf-show-elevation-chart').checked || tmfPolylineObject.tmfPolylineSource == 'gpx') {
		if (tmfAddOrUpdate == "add") {
		    tmfPolylineObjects.push(tmfPolylineObject);
		}
		else {
			tmfPolylineObjects.splice(tmfCurrentPolylineNumber, 1, tmfPolylineObject);
		}
		document.getElementById('tmf-map-polyline-array').value = tmfConvertMultiObjectArrayWithKeysToString(tmfPolylineObjects);
		tmfRemovePolylineButtons();
	}

	if (tmfPolylineObject.tmfPolylineSource == 'manual') {
		var tmfElevator = new google.maps.ElevationService;
	    tmfElevator.getElevationAlongPath({
	        'path': tmfPolylineLocations,
	        'samples': tmfPolylineElevationSpacing
	    }, 
	    function(tmfGoogleElevationResults, tmfGoogleElevationStatus) {
	        if (tmfGoogleElevationStatus != 'OK') {    
	        	alert('Elevation service failed due to: ' + tmfGoogleElevationStatus);

				if (tmfAddOrUpdate == "add") {
				    tmfPolylineObjects.push(tmfPolylineObject);
				}
				else {
					tmfPolylineObjects.splice(tmfCurrentPolylineNumber, 1, tmfPolylineObject);
				}
				document.getElementById('tmf-map-polyline-array').value = tmfConvertMultiObjectArrayWithKeysToString(tmfPolylineObjects);
	        } 
	        else {
		        tmfGetChartXAxisSpacing(tmfCurrentPolylinePath);
		        tmfPolylineObject.tmfPolylineXAxisSpacing = tmfXAxisSpacing;
		    	var tmfPolylineVertices = '';

				for (var i = 0; i < tmfGoogleElevationResults.length; i++) {
			        tmfPolylineVertices += tmfGoogleElevationResults[i].elevation + ',';
			    }
			    tmfPolylineVertices = tmfPolylineVertices.slice(0, -1);
			    tmfPolylineObject.tmfPolylineVertices = tmfPolylineVertices;

			    if (tmfAddOrUpdate == "add") {
				    tmfPolylineObjects.push(tmfPolylineObject);
				}
				else {
					tmfPolylineObjects.splice(tmfCurrentPolylineNumber, 1, tmfPolylineObject);
				}
			}
			document.getElementById('tmf-map-polyline-array').value = tmfConvertMultiObjectArrayWithKeysToString(tmfPolylineObjects);
			tmfRemovePolylineButtons();
	    });
	}
}

function tmfUpdatePolylineHeights() {
	var tmfPolylineLocations = [];
	var tmfCurrentPolylinePath = tmfPolylines[document.getElementById('tmf-map-polyline-number').innerHTML].getPath();

	for (var j = 0; j < tmfCurrentPolylinePath.length; j++) {
		var tmfPolylineLocation = new google.maps.LatLng(tmfCurrentPolylinePath.getAt(j).lat(), tmfCurrentPolylinePath.getAt(j).lng());
		tmfPolylineLocations.push(tmfPolylineLocation);
	}
	var tmfElevator = new google.maps.ElevationService;
    tmfElevator.getElevationAlongPath({
        'path': tmfPolylineLocations,
        'samples': tmfPolylineElevationSpacing
    }, 
    function(tmfGoogleElevationResults, tmfGoogleElevationStatus) {
        if (tmfGoogleElevationStatus != 'OK') {    
        	alert('Elevation service failed due to: ' + tmfGoogleElevationStatus);
        }    
    	google.charts.load('current', {'packages':['corechart']});
		google.charts.setOnLoadCallback(function() {tmfPolylinePrepareDataForChart(tmfCurrentPolylinePath, tmfGoogleElevationResults, tmfPolylineElevationSpacing); }); 
    });
}

function tmfDisplayPolylineMetaData() {
	if (document.getElementById('tmf-show-chart-meta-data').checked) {
		document.getElementById('tmf-meta-data-container-' + tmfPostId).style.display = "block";
	} else
	{
		document.getElementById('tmf-meta-data-container-' + tmfPostId).style.display = "none";
	}
}

function tmfPolylinePrepareDataForChart(tmfPolylinePathObject, tmfPolylineElevationArray, tmfSpacing) {    
    var tmfNextRow = [];
    var tmfAccumulatedDistance = 0;
    var tmfPolylineElevation, tmfPolylineElevations = [];
    var tmfProfileArrayx = [
        ['Distance', tmfvAxisTitle]
    ];

    tmfPolylineElevation = tmfPolylineElevationArray[0].elevation * tmfChartElevationUnits;
    tmfNextRow = [0, tmfPolylineElevation];
    tmfProfileArrayx.push(tmfNextRow);

    tmfGetChartXAxisSpacing(tmfPolylinePathObject);

    for (var i = 1; i < tmfPolylineElevationArray.length; i++) {
        tmfAccumulatedDistance = tmfAccumulatedDistance + tmfXAxisSpacing;
        tmfPolylineElevation = tmfPolylineElevationArray[i].elevation * tmfChartElevationUnits;
        tmfNextRow = [tmfAccumulatedDistance, tmfPolylineElevation];
        tmfProfileArrayx.push(tmfNextRow);
    }
    
    tmfPolylineDrawChart(tmfProfileArrayx, document.getElementById('tmf-chart-selected-color').style.backgroundColor, document.getElementById('tmf-chart-strokeweight').value, document.getElementById('tmf-chart-vaxis').value, document.getElementById('tmf-chart-min-height').value, document.getElementById('tmf-chart-max-height').value, document.getElementById('tmf-chart-fixed-height').value, document.getElementById('tmf-show-chart-meta-data').checked);
}

function tmfGetChartXAxisSpacing(tmfPathToGetSpacing) {
	var aLat, aLng, bLat, bLng;
	aLat = tmfPathToGetSpacing.getAt(0).lat();
    aLng = tmfPathToGetSpacing.getAt(0).lng();
    bLat = tmfPathToGetSpacing.getAt(tmfPathToGetSpacing.length - 1).lat();
    bLng = tmfPathToGetSpacing.getAt(tmfPathToGetSpacing.length - 1).lng();

    tmfXAxisSpacing = haversine (aLat, aLng, bLat, bLng) * tmfChartDistanceUnits / tmfPolylineElevationSpacing;
}

function tmfCancelAddMarker() { 
	tmfMarkers[tmfMarkers.length - 1].setMap(null);
	tmfMarkers.splice(tmfMarkers.length - 1, 1);

	tmfRemoveMarkerButtons();
}

function tmfCancelAddCircle() { 
	tmfCircles[tmfCircles.length - 1].setMap(null);
	tmfCircles.splice(tmfCircles.length - 1, 1);

	tmfRemoveCircleButtons();
}

function tmfCancelAddPolygon() {
	tmfPolygons[tmfPolygons.length - 1].setMap(null);
	tmfPolygons.splice(tmfPolygons.length - 1, 1);

	tmfRemovePolygonButtons();
}

function tmfCancelAddPolyline() {
	tmfPolylines[tmfPolylines.length - 1].setMap(null);
	tmfPolylines.splice(tmfPolylines.length - 1, 1);

	tmfRemovePolylineButtons();
}

function tmfDeleteMarker() { 
	tmfCurrentMarkerNumber = document.getElementById('tmf-map-marker-number').innerHTML;
	
	tmfMarkerObjects.splice(tmfCurrentMarkerNumber, 1);
	
	if (tmfMarkerObjects.length > 0) {
		document.getElementById('tmf-map-marker-array').value = tmfConvertMultiObjectArrayWithKeysToString(tmfMarkerObjects);
	} 
	else {
		document.getElementById('tmf-map-marker-array').value = '';
	}

	tmfMarkers[tmfCurrentMarkerNumber].setMap(null);
	tmfMarkers.splice(tmfCurrentMarkerNumber, 1);
	
	google.maps.event.clearInstanceListeners(tmfMarker);
	tmfShowMarkerInfoWindowListener.splice(tmfCurrentMarkerNumber, 1);

	tmfRemoveMarkerButtons();
}

function tmfDeleteCircle() {
	tmfCurrentCircleNumber = document.getElementById('tmf-map-circle-number').innerHTML;
	
	tmfCircleObjects.splice(tmfCurrentCircleNumber, 1);
	
	if (tmfCircleObjects.length > 0) {
		document.getElementById('tmf-map-circle-array').value = tmfConvertMultiObjectArrayWithKeysToString(tmfCircleObjects);
	} 
	else {
		document.getElementById('tmf-map-circle-array').value = '';
	}

	tmfCircles[tmfCurrentCircleNumber].setMap(null);
	tmfCircles.splice(tmfCurrentCircleNumber, 1);
	
	google.maps.event.clearInstanceListeners(tmfCircle);
	tmfShowCircleInfoWindowListener.splice(tmfCurrentCircleNumber, 1);

	tmfRemoveCircleButtons();
}

function tmfDeletePolygon() {
	tmfCurrentPolygonNumber = document.getElementById('tmf-map-polygon-number').innerHTML;
	
	tmfPolygonObjects.splice(tmfCurrentPolygonNumber, 1);
	
	if (tmfPolygonObjects.length > 0) {
		document.getElementById('tmf-map-polygon-array').value = tmfConvertMultiObjectArrayWithKeysToString(tmfPolygonObjects);
	} 
	else {
		document.getElementById('tmf-map-polygon-array').value = '';
	}

	tmfPolygons[tmfCurrentPolygonNumber].setMap(null);
	tmfPolygons.splice(tmfCurrentPolygonNumber, 1);
	
	google.maps.event.clearInstanceListeners(tmfPolygon);
	tmfShowPolygonInfoWindowListener.splice(tmfCurrentPolygonNumber, 1);

	tmfRemovePolygonButtons();
}

function tmfDeletePolyline() { // Deleting existing polyline
	tmfCurrentPolylineNumber = document.getElementById('tmf-map-polyline-number').innerHTML;
	
	tmfPolylineObjects.splice(tmfCurrentPolylineNumber, 1);
	
	if (tmfPolylineObjects.length > 0) {
		document.getElementById('tmf-map-polyline-array').value = tmfConvertMultiObjectArrayWithKeysToString(tmfPolylineObjects);
	} 
	else {
		document.getElementById('tmf-map-polyline-array').value = '';
	}

	tmfPolylines[tmfCurrentPolylineNumber].setMap(null);
	tmfPolylines.splice(tmfCurrentPolylineNumber, 1);
	
	google.maps.event.clearInstanceListeners(tmfPolyline);
	tmfShowPolylineInfoWindowListener.splice(tmfCurrentPolylineNumber, 1);

	tmfRemovePolylineButtons();
}

function tmfGetObjectPath(tmfObjectPath) {
	var tmfPolylineVertices = [];
	for (var i = 0; i < tmfObjectPath.length; i++) {
        tmfPolylineVertices += tmfObjectPath.getAt(i).lat() + ',' + tmfObjectPath.getAt(i).lng() + ',';
    }
    tmfPolylineVertices = tmfPolylineVertices.substr(0, tmfPolylineVertices.length - 1);
    return tmfPolylineVertices; 
}

function tmfConvertMultiObjectArrayWithKeysToString(objectType) {
	var i, tmfResultingObjectArray = [];

    for (i = 0; i < objectType.length; i++) {
    	var tmfSingleObjectArray = [];
		for (var tmfKey in objectType[i]) {
		    if (objectType[i].hasOwnProperty(tmfKey)) {
		    	if (objectType[i]['tmfPolylineSource'] == 'gpx' && tmfKey == 'tmfPolylinePath') {
    				tmfSingleObjectArray.push(tmfKey + '¦' + '' + '¦');
    			}
    			else {	
		        	tmfSingleObjectArray.push(tmfKey + '¦' + objectType[i][tmfKey] + '¦');
		    	}
		    }
		};

        tmfResultingObjectArray = tmfResultingObjectArray + tmfSingleObjectArray;
		tmfResultingObjectArray = tmfResultingObjectArray + '|'; 
	}

	tmfResultingObjectArray = tmfResultingObjectArray.replace(/¦,/g, '¦');
	tmfResultingObjectArray = tmfResultingObjectArray.slice(0, -1);
    return tmfResultingObjectArray;
}

function tmfCancelUpdateMarker() { 
	tmfRemoveMarkerButtons();
}

function tmfCancelUpdateCircle() {
	tmfRemoveCircleButtons();
}

function tmfCancelUpdatePolygon() {
	// Restore original polygon path, in case it was changed
	var tmfPolygonPathPointsArray = tmfCreatePath(tmfPolygonObjects[document.getElementById('tmf-map-polygon-number').innerHTML].tmfPolygonPath);
	tmfPolygons[document.getElementById('tmf-map-polygon-number').innerHTML].setPath(tmfPolygonPathPointsArray);

	tmfRemovePolygonButtons();
}

function tmfCancelUpdatePolyline() {
	// Restore original polyline path, in case it was changed
	if (tmfPolylineObjects[document.getElementById('tmf-map-polyline-number').innerHTML].tmfPolylinePath != 1) {
		var tmfPolylinePathPointsArray = tmfCreatePath(tmfPolylineObjects[document.getElementById('tmf-map-polyline-number').innerHTML].tmfPolylinePath);
	}
	tmfPolylines[document.getElementById('tmf-map-polyline-number').innerHTML].setPath(tmfPolylinePathPointsArray);

	tmfRemovePolylineButtons();
}

function tmfRemoveMarkerButtons() {
	document.getElementById('tmf-existing-marker-buttons').style.display = "none";
	document.getElementById('tmf-add-single-marker-settings').style.display = "none";
	document.getElementById('tmf-new-marker-buttons').style.display = "none";

	tmfAddMarkerListener = google.maps.event.addListener(tmfTheMap, 'dblclick', tmfAddMarkerAndPanTo);

	var i;
	for (i = 0; i < tmfMarkerObjects.length; i++) {
		tmfMarkers[i].setOptions({
	    	draggable: false
	    });
	}
	tmfTurnOnAllObjectListeners();
}

function tmfRemoveCircleButtons() {
	document.getElementById('tmf-existing-circle-buttons').style.display = "none";
	document.getElementById('tmf-add-circle-settings').style.display = "none";
	document.getElementById('tmf-new-circle-buttons').style.display = "none";

	tmfAddCircleListener = google.maps.event.addListener(tmfTheMap, 'dblclick', tmfAddCircleAndPanTo);

	var i;
	for (i = 0; i < tmfCircleObjects.length; i++) {
		tmfCircles[i].setOptions({
	    	draggable: false,
	    	editable: false
	    });
	}
	tmfTurnOnAllObjectListeners();
}

function tmfRemovePolygonButtons() {
	document.getElementById('tmf-existing-polygon-buttons').style.display = "none";
	document.getElementById('tmf-add-polygon-settings').style.display = "none";
	document.getElementById('tmf-new-polygon-buttons').style.display = "none";
	
	tmfAddPolygonListener = google.maps.event.addListener(tmfTheMap, 'dblclick', tmfAddPolygonAndPanTo);
	google.maps.event.removeListener(addPolygonVertexListener);

	var i;
	for (i = 0; i < tmfPolygonObjects.length; i++) {
		tmfPolygons[i].setOptions({
	    	draggable: false,
	    	editable: false
	    });
	}
	tmfTurnOnAllObjectListeners();
}

function tmfRemovePolylineButtons() {
	document.getElementById('tmf-existing-polyline-buttons').style.display = "none";
	document.getElementById('tmf-add-polyline-settings').style.display = "none";
	document.getElementById('tmf-new-polyline-buttons').style.display = "none";
	document.getElementById('tmf-polyline-file-url-text').value = '';
	document.getElementById('tmf-polyline-file-contents').value = '';
	
	tmfAddPolylineListener = google.maps.event.addListener(tmfTheMap, 'dblclick', tmfAddPolylineAndPanTo);
	google.maps.event.removeListener(addPolylineVertexListener);

	for (var i = 0; i < tmfPolylineObjects.length; i++) {
		tmfPolylines[i].setOptions({
	    	draggable: false,
	    	editable: false
	    });
	}
	tmfTurnOnAllObjectListeners();

	document.getElementById('tmf-poyline-creation-method').style.display = "flex";
	document.getElementById('tmf-polyline-creation-text').style.display = "block";
	document.getElementById('tmf-create-polyline-help-text').style.display = "block";
	if (document.getElementById('tmf-poyline-creation-method-file').checked == true) {
	    document.getElementById('tmf-poyline-creation-method-file-button').style.display = "flex";
	} 
}


/**
 * Polyline chart
 */
function tmfIsPolylineChartSelected() {
	var tmfCurrentPolylineNumber = document.getElementById('tmf-map-polyline-number').innerHTML;
    if (document.getElementById('tmf-show-elevation-chart').checked) {
    	if (tmfPolylines[tmfCurrentPolylineNumber].getPath().length < 2) {
			alert('Only one point in the polyline. An elevation profile cannot be created with only one point.');
			document.getElementById('tmf-show-elevation-chart').checked = false;
			return;
		}

		if (document.getElementById('tmf-polyline-file-url-text').value) { // polyline from file
			tmfProfileArrayx = tmfPrepareProfileArray(document.getElementById('tmf-polyline-file-contents').value);
			google.charts.load('current', {'packages':['corechart']});
    		google.charts.setOnLoadCallback(function() {tmfPolylineDrawChart(tmfProfileArrayx, document.getElementById('tmf-chart-selected-color').style.backgroundColor, document.getElementById('tmf-chart-strokeweight').value, document.getElementById('tmf-chart-vaxis').value, document.getElementById('tmf-chart-min-height').value, document.getElementById('tmf-chart-max-height').value, document.getElementById('tmf-chart-fixed-height').value, document.getElementById('tmf-show-chart-meta-data').checked); });
		} else
		{ // polyline not from file
			tmfUpdatePolylineHeights();
		}

        tmfPolylineChartlineSelected();
	    tmfCheckToShowUpdateHeights(); 
    }
    else {
        tmfPolylineChartNotSelected();
    }
}

function tmfPolylineChartNotSelected() {
    document.getElementById('tmf-chart-settings').style.display = "none"; 
    document.getElementById('tmf-polyline-chart-' + tmfPostId).style.display = "none";
    
    document.getElementById('tmf-show-chart-meta-data').checked = false;
    tmfDisplayPolylineMetaData();
}

function tmfPolylineChartlineSelected() {
    document.getElementById('tmf-chart-settings').style.display = "block";
    document.getElementById('tmf-polyline-chart-' + tmfPostId).style.display = "block";

    tmfCheckToShowUpdateHeights();
}

function tmfCheckToShowUpdateHeights() {
	if (document.getElementById('tmf-polyline-file-url-text').value) {
    	document.getElementById('tmf-update-polyline-height').style.display = "none";
    } else
    {
    	document.getElementById('tmf-update-polyline-height').style.display = "block";
    }
}

function tmfPolylineChartSettingsChanged() {
	tmfChartOptions.lineWidth = document.getElementById('tmf-chart-strokeweight').value;
	tmfChartOptions.lineWidth = document.getElementById('tmf-chart-strokeweight').value;
	tmfChart.draw(tmfChartData, tmfChartOptions);
}

function tmfIsPolylineChartHeightAutoAdjusted() {
	if (document.getElementById('tmf-chart-vaxis').value == 'adjust') {
		document.getElementById('tmf-chart-height-adjust-settings').style.display = "flex";
		document.getElementById('tmf-chart-height-fixed-settings').style.display = "none";
		tmfChartMinAxisHeight = parseFloat(document.getElementById('tmf-chart-min-height').value);
		tmfChartMaxAxisHeight = parseFloat(document.getElementById('tmf-chart-max-height').value);
	    tmfChartHeightAutoAdjusted(); 
	}
	if (document.getElementById('tmf-chart-vaxis').value == 'fixed') {
		document.getElementById('tmf-chart-height-adjust-settings').style.display = "none";
		document.getElementById('tmf-chart-height-fixed-settings').style.display = "flex";
		tmfChartFixedAxisHeight = parseFloat(document.getElementById('tmf-chart-fixed-height').value);
	    tmfChartHeightNotAutoAdjusted();
	}
}

function tmfChartHeightAutoAdjusted() {
	tmfChartAxisHeight = tmfChartMinAxisHeight + ((tmfHighestElevation - tmfLowestElevation) / 5);
    if (tmfChartAxisHeight > tmfChartMaxAxisHeight ) {
        tmfChartAxisHeight = tmfChartMaxAxisHeight;
    } 
    else if (tmfChartAxisHeight < tmfChartMinAxisHeight ) {
        tmfChartAxisHeight = tmfChartMinAxisHeight;
    } 
    tmfChartOptions.height = tmfChartAxisHeight;
	tmfChart.draw(tmfChartData, tmfChartOptions);
}

function tmfChartHeightNotAutoAdjusted() {
	tmfChartAxisHeight = tmfChartFixedAxisHeight;
	tmfChartOptions.height = tmfChartAxisHeight;
	tmfChart.draw(tmfChartData, tmfChartOptions);
}

/**
 * Window onload
 */
window.onload = function() {
    tmfTurnOnEditMarkerListener();
    tmfTurnOnEditCircleListener();
    tmfTurnOnEditPolygonListener();
    tmfTurnOnEditPolylineListener();
}

function tmfSetMapLocationAndZoom() {
	var tmfMapCenter = tmfTheMap.getCenter();
    tmfTheBasicsObject['tmfMapCenterLat'] = tmfMapCenter.lat().toFixed(6);
    document.getElementById('tmf-map-center-lat').innerHTML = tmfTheBasicsObject['tmfMapCenterLat'];
	tmfTheBasicsObject['tmfMapCenterLon'] = tmfMapCenter.lng().toFixed(6);
    document.getElementById('tmf-map-center-lon').innerHTML = tmfTheBasicsObject['tmfMapCenterLon']; 
 
    tmfTheBasicsObject['tmfMapZoom'] = tmfTheMap.getZoom();
    document.getElementById('tmf-map-zoom').innerHTML = tmfTheBasicsObject['tmfMapZoom'];

    tmfUpdateTheBasicsString();
}