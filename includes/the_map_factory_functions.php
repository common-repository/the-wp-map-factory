<?php 
 
function tmf_sanitize_data($tmf_input) {
    $tmf_output = array();
    foreach ($tmf_input as $key => $value) {
        if (isset( $tmf_input[$key])) {
            $tmf_output[$key] = sanitize_text_field($tmf_input[$key]);    
        }
    }
    return $tmf_output;
}

function tmf_map_template($object_type) {
	switch ($object_type) {
		case 'basics':
			$tmf_map_template = '{
				"tmfPluginVersion":"' . __(TMF_CSS_VERSION) . '",
				"tmfToggleType":"DROPDOWN_MENU",
				"tmfFitMethod":"manual",
				"tmfButtonCenter":"true",
				"tmfButtonFullScreen":"true",
				"tmfButtonStreetView":"true",
				"tmfButtonZoom":"true",
				"tmfMapCenterLat":"37.4220",
				"tmfMapCenterLon":"-122.0841",
				"tmfMapZoom":"10",
				"tmfMapTypeGoogleRoadmap":"true",
				"tmfMapTypeGoogleSatellite":"true",
				"tmfMapTypeHybrid":"true",
				"tmfMapTypeGoogleRoadmapTerrain":"true",
				"tmfMapTypeOSM":"false",
				"tmfMapTypeThunderforestocm":"false",
				"tmfMapTypeThunderforestlandscape":"false",
				"tmfMapTypeThunderforestoutdoors":"false",
				"tmfMapWidthType":"pixel",
				"tmfMapWidthPixel":"600",
				"tmfMapWidthPercentage":"100",
				"tmfMapHeightType":"pixel",
				"tmfMapHeightPixel":"600",
				"tmfMapHeightPercentage":"100"
			}';
		break;
		
		case 'placecard':
			$tmf_map_template = '{
				"tmfPluginVersion":"' . __(TMF_CSS_VERSION) . '",
				"tmfPlaceCardDisplay":"false",
				"tmfPlacecardBusinessName":"Google",
				"tmfPlacecardAddress":"1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",
				"tmfPlacecardName2Display":"false",
				"tmfPlacecardName2":"Enter different name",
				"tmfPlacecardAddressType":"0",
				"tmfPlacecardAddress2":"Enter different address",
				"tmfPlacecardAddressLat":"37.4220",
				"tmfPlacecardAddressLon":"-122.0841"
			}'; 
		break;

		default:
		break;
	}
	return $tmf_map_template;
}


function tmfSvgArray() {
    $tmf_svg_array = array(
    	array(
    		'name' 		=> 'Standard pin',
    		'geometry' 	=> 'M 48,44 c -5,0 -9,-4 -9,-9 0,-5 4,-9 9,-9 5,0 9,4 9,9 0,5 -4,9 -9,9 z m 0,-30 c -6.9,0 -13.4,3.4 -17.3,9.2 -3.9,5.7 -4.7,13 -2.2,19.5 l 9.5,21 8.2,17.2 c 0.3,0.7 1,1.1 1.8,1.1 0.8,0 1.5,-0.4 1.8,-1.1 L 58,63.7 67.5,42.7 C 70,36.2 69.2,28.9 65.3,23.2 61.4,17.4 54.9,14 48,14 Z',
    		'anchorx' 	=> 48,
    		'anchory' 	=> 88
    	),
    	array(
    		'name' 		=> 'Drawing pin',
    		'geometry' 	=> 'M 47.1 81.1 L 61.4 66.8 L 81.7 83.3 C 82.1 83.7 82.8 83.6 83.2 83.2 C 83.6 82.8 83.6 82.2 83.3 81.7 L 66.8 61.5 L 81.1 47.2 C 82.2 46.1 82.5 44.5 82 43 C 81.5 41.5 80.1 40.5 78.6 40.4 C 74.6 40 69.7 41.3 64.7 44 L 43.5 27 C 45.3 23.5 46.1 19.6 45.8 15.7 C 45.4 12.9 41.9 11.4 40 13.3 L 13.3 40 C 11.4 41.9 12.9 45.4 15.7 45.8 C 19.6 46.1 23.5 45.4 27 43.5 L 44 64.7 C 41.3 69.7 40.1 74.6 40.4 78.6 C 40.5 80.1 41.5 81.5 43 82 C 44.4 82.6 46 82.2 47.1 81.1 Z',
    		'anchorx' 	=> 86,
    		'anchory' 	=> 88
    	),
    	array(
    		'name' 		=> 'Flag',
    		'geometry' 	=> 'M 23 8.1 C 21.3 8.1 20 9.4 20 11.1 L 20 88.1 L 26 88.1 L 26 11.1 C 26 9.4 24.7 8.1 23 8.1 Z M 42.7 7.9 C 33.9 7.9 30 10.8 30 10.8 L 30 43.9 C 30 43.9 33.8 41 42.7 41 C 53.3 41 63.7 46.8 76 41.2 L 76 8.1 C 60.5 12.7 53.3 7.9 42.7 7.9 Z',
    		'anchorx' 	=> 24,
    		'anchory' 	=> 90
    	),
    	array(
    		'name' 		=> 'Hiking sign',
    		'geometry' 	=> 'M 74.2 44 L 51 44 L 51 11 C 51 9.3 49.7 8 48 8 C 46.3 8 45 9.3 45 11 L 45 20 L 22 20 C 16.7 25.4 11.9 30.1 11.8 30 L 21.8 40 L 45 40 L 45 88 L 51 88 L 51 64 L 74 64 C 79.3 58.6 84.1 53.9 84.2 54 L 74.2 44 Z',
    		'anchorx' 	=> 48,
    		'anchory' 	=> 90
    	),
    	array(
    		'name' 		=> 'Camera',
    		'geometry' 	=> 'M48 73C38 73 30 65 30 55 30 45 38 37 48 37 58 37 66 45 66 55 66 65 58 73 48 73ZM28 41 16 41 16 33 28 33 28 41ZM84 25 64 25 58 15 38 15 32 25 12 25C9.8 25 8 26.8 8 29L8 77C8 79.2 9.8 81 12 81L84 81C86.2 81 88 79.2 88 77L88 29C88 26.8 86.2 25 84 25Z M48 45C42.4 45 38 49.4 38 55 38 60.6 42.4 65 48 65 53.6 65 58 60.6 58 55 58 49.4 53.6 45 48 45ZM48 69C40.2 69 34 62.8 34 55 34 47.2 40.2 41 48 41 55.8 41 62 47.2 62 55 62 62.8 55.8 69 48 69Z',
    		'anchorx' 	=> 48,
    		'anchory' 	=> 90
    	),
    );
    return $tmf_svg_array;
}


function tmfTextTokens() {
	$tmf_text_tokens = array(
		'tmfTokenFitIcon'   		=> __('Center map', 'tmf_translation'),
		'tmfTokenKm'       			=> __('km', 'tmf_translation'),
		'tmfTokenMiles'     		=> __('miles', 'tmf_translation'),
		'tmfTokenMeters'    		=> __('m', 'tmf_translation'),
		'tmfTokenFeet'     			=> __('ft', 'tmf_translation'),
		'tmfTokenElevationM'     	=> __('Elevation (m)', 'tmf_translation'),
		'tmfTokenElevationF'     	=> __('Elevation (ft)', 'tmf_translation'),
		'tmfTokenDistanceKm'     	=> __('Distance (km)', 'tmf_translation'),
		'tmfTokenDistanceMiles'  	=> __('Distance (miles)', 'tmf_translation'),
		'tmfTokenNewMarker'  		=> __('Cancel the creation or store the new marker being created.', 'tmf_translation'),
		'tmfTokenEditMarker'  		=> __('Cancel the editing or store the marker being edited.', 'tmf_translation'),
		'tmfTokenNewCircle'  		=> __('Cancel the creation or store the new circle being created.', 'tmf_translation'),
		'tmfTokenEditCircle'  		=> __('Cancel the editing or store the circle being edited.', 'tmf_translation'),
		'tmfTokenNewPolygon'  		=> __('Cancel the creation or store the new polygon being created.', 'tmf_translation'),
		'tmfTokenEditPolygon'  		=> __('Cancel the editing or store the polygon being edited.', 'tmf_translation'),
		'tmfTokenNewPoyline'  		=> __('Cancel the creation or store the new polyline being created.', 'tmf_translation'),
		'tmfTokenEditPolyline'  	=> __('Cancel the editing or store the polyline being edited.', 'tmf_translation'),
		'tmfTokenMediaUploaderTitle' => __('Choose Image File', 'tmf_translation'),
		'tmfTokenMediaUploaderText' => __('Choose Image', 'tmf_translation'),
		'tmfTokenChooseFile' 		=> __('Choose File Containing the Polyline', 'tmf_translation'),
		'tmfTokenChoosePolyline' 	=> __('Choose Polyline', 'tmf_translation'),
		'tmfTokenThunderforestCycle' 		=> __('Show Thunderforest Open Cycle Map', 'tmf_translation'),
		'tmfTokenThunderforestLandscape' 	=> __('Show Thunderforest Landscape Map', 'tmf_translation'),
		'tmfTokenThunderforestOutdoors' 	=> __('Show Thunderforest Outdoors Map', 'tmf_translation'),
		'roadmap'		 	=> __('Roadmap', 'tmf_translation'),
		'satellite'			=> __('Satellite', 'tmf_translation'),
		'hybrid'			=> __('Hybrid', 'tmf_translation'),
		'terrain'			=> __('Terrain', 'tmf_translation'),
		'OSM1'				=> __('Open Street Map', 'tmf_translation'),
		'OSM2' 	=> __('Cycle', 'tmf_translation'),
		'OSM3'	=> __('Landscape', 'tmf_translation'),
		'OSM4'	=> __('Outdoors', 'tmf_translation')
	);
	return $tmf_text_tokens;
}

function tmf_marker_color_option($tmf_marker_color_option_color) {
	$tmf_tmf_marker_color_option_html = '';
	$tmf_tmf_marker_color_option_html = '<option value="' . __($tmf_marker_color_option_color) . '">' . __($tmf_marker_color_option_color) . '</option>';

	return $tmf_tmf_marker_color_option_html;
}