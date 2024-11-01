<?php 
/**
 *******************************************************
 * All following is related to the displaying of the map
 *******************************************************
 */

/**
 * Create the ShortCode
 */
add_shortcode('thewpmapfactory', 'tmf_themapfactoryshortcode');
function tmf_themapfactoryshortcode($atts) {
	static $tmf_shortcode_already_run = false;
	if ($tmf_shortcode_already_run != true) {
		$tmf_shortcode_already_run = true;	

		wp_enqueue_script( 'the_map_factory-common-display-map' );

		$tmf_license_google_status = 'valid';

	    $tmf_shortcode_atts = shortcode_atts( array(
	        'tmfmapid' => false,
	    ), $atts );

	    $tmf_post_id = $tmf_shortcode_atts['tmfmapid'];
	    $tmf_stored_meta = get_post_meta($tmf_post_id);

		if (!is_null($tmf_stored_meta['tmf-map-the-basics-object'])) {
			include(plugin_dir_path( __FILE__ ) . 'the_map_factory_functions.php');

			/* 
				Setup the Basics (uses JSON)
			*/
			if (isset($tmf_stored_meta['tmf-map-the-basics-object'][0])) { // Basics already exist
				$tmf_map_the_basics_json = $tmf_stored_meta['tmf-map-the-basics-object'][0];
				$tmf_map_the_basics_json = wp_kses($tmf_map_the_basics_json, array());
				$tmf_map_the_basics_array = json_decode($tmf_map_the_basics_json, true);
				
			}
		    if (!isset($tmf_stored_meta['tmf-map-the-basics-object'][0])) { // Basics does not yet exist
		    	$tmf_map_the_basics_json = tmf_map_template('basics');
		    	$tmf_map_the_basics_array = json_decode($tmf_map_the_basics_json, true);
		    }

			wp_localize_script( 'the_map_factory-common-display-map', 'tmfTheBasicsObject', $tmf_map_the_basics_array );

			/* 
				Setup the Placecard (uses JSON)
			*/
			if (isset($tmf_stored_meta['tmf-map-placecard-object'][0])) { // Placecard already exists
				$tmf_map_placecard_json = $tmf_stored_meta['tmf-map-placecard-object'][0];
				$tmf_map_placecard_json = wp_kses($tmf_map_placecard_json, array());
				$tmf_map_placecard_array = json_decode($tmf_map_placecard_json, true);
		    }

		    if (!isset($tmf_stored_meta['tmf-map-placecard-object'][0])) { // Placecard does not yet exist
		    	$tmf_map_placecard_json = tmf_map_template('placecard');
		    	$tmf_map_placecard_array = json_decode($tmf_map_placecard_json, true);
		    }

			wp_localize_script( 'the_map_factory-common-display-map', 'tmfPlacecardObject', $tmf_map_placecard_array ); 

			// Get marker array	and text tokens
			$tmf_svg_marker_array = tmfSvgArray();
			$tmf_text_tokens = tmfTextTokens();
			$tmf_frontend_variables = array(
				    'tmfSvgMarkerArray'	=> $tmf_svg_marker_array,
				    'tmfTextTokens'		=> $tmf_text_tokens,
				    'tmfPostId'			=> $tmf_post_id
				);
			wp_localize_script( 'the_map_factory-common-display-map', 'tmfFrontendVariables', $tmf_frontend_variables );

			// Get settings
			if (get_option( 'tmf_options' )) {
				$tmf_options = get_option( 'tmf_options' );
				$tmf_options = tmf_sanitize_data($tmf_options);
			} else
			{
				$tmf_options = array(
				    'tmf-thunderforest-key'		=> '',
				    'tmf-chart-units'			=> 'meters'
				);
			}

			$tmf_options['tmf-plugin-url'] = plugin_dir_url( __FILE__ );

			$tmf_backend_variables = array(
			    'tmfBackendThunderforestKey'	=> $tmf_options['tmf-thunderforest-key'],
			    'tmfChartUnits'					=> $tmf_options['tmf-chart-units'],
			    'tmfPluginUrl'					=> $tmf_options['tmf-plugin-url'],
			    'tmfLicenseStatus'				=> $tmf_license_google_status,
			    'tmfIsBackend'					=> 0
			); 
			wp_localize_script( 'the_map_factory-common-display-map', 'tmfBackendVariables', $tmf_backend_variables );
			
			if ( isset ( $tmf_options['tmf-googlemaps-key'] ) ) {
				wp_enqueue_script( 'google_js', 'https://maps.googleapis.com/maps/api/js?key=' . $tmf_options['tmf-googlemaps-key'] . '&callback=tmfInitialiseMap', '', '' );
			}
			else {
				wp_enqueue_script( 'google_js', 'https://maps.googleapis.com/maps/api/js?key=&callback=tmfInitialiseMap', '', '' );
			}

			$tmf_displayobjectstrings = 'tmf-hidden'; // "Trick" to easily show the object strings
			if ($tmf_options['tmf-thunderforest-key'] == '-1') {
				$tmf_displayobjectstrings = '';
			}

			// Build the strings for the objects and map and then return them. Don't echo shortcode html
			$tmf_stringtoreturn = tmf_display_map_object_strings($tmf_stored_meta, $tmf_displayobjectstrings);
			$tmf_stringtoreturn .= tmf_display_map($tmf_post_id); 
			return $tmf_stringtoreturn;
		}
	}
}

function tmf_display_map_object_strings($tmf_stored_meta_parsed, $tmf_displayobjectstrings_parsed) {
	$tmf_displaymapobjectstringtoreturn = '<div class="' . $tmf_displayobjectstrings_parsed . '">';
		$tmf_displaymapobjectstringtoreturn .= '<input class="tmf-form-input-field" name="tmf-map-marker-array" id="tmf-map-marker-array" style="width: 800px;" value="';
		if (isset($tmf_stored_meta_parsed['tmf-map-marker-array'][0])) {
			$tmf_displaymapobjectstringtoreturn .= esc_html__(do_shortcode(wp_kses_post($tmf_stored_meta_parsed['tmf-map-marker-array'][0])));
		}; // do_shortcode is added to display any possible captions
		$tmf_displaymapobjectstringtoreturn .= '" />';
	$tmf_displaymapobjectstringtoreturn .= '</div>';

	$tmf_displaymapobjectstringtoreturn .= '<div class="' . $tmf_displayobjectstrings_parsed . '">';
		$tmf_displaymapobjectstringtoreturn .= '<input class="tmf-form-input-field" name="tmf-map-circle-array" id="tmf-map-circle-array" style="width: 800px;" value="';
		if (isset($tmf_stored_meta_parsed['tmf-map-circle-array'][0])) {
			$tmf_displaymapobjectstringtoreturn .= esc_html__(do_shortcode(wp_kses_post($tmf_stored_meta_parsed['tmf-map-circle-array'][0])));
		}; // do_shortcode is added to display any possible captions
		$tmf_displaymapobjectstringtoreturn .= '" />';
	$tmf_displaymapobjectstringtoreturn .= '</div>';

	$tmf_displaymapobjectstringtoreturn .= '<div class="' . $tmf_displayobjectstrings_parsed . '">';
		$tmf_displaymapobjectstringtoreturn .= '<input class="tmf-form-input-field" name="tmf-map-polygon-array" id="tmf-map-polygon-array" style="width: 800px;" value="';
		if (isset($tmf_stored_meta_parsed['tmf-map-polygon-array'][0])) {
			$tmf_displaymapobjectstringtoreturn .= esc_html__(do_shortcode(wp_kses_post($tmf_stored_meta_parsed['tmf-map-polygon-array'][0])));
		}; // do_shortcode is added to display any possible captions
		$tmf_displaymapobjectstringtoreturn .= '" />';
	$tmf_displaymapobjectstringtoreturn .= '</div>';

	$tmf_displaymapobjectstringtoreturn .= '<div class="' . $tmf_displayobjectstrings_parsed . '">';
		$tmf_displaymapobjectstringtoreturn .= '<input class="tmf-form-input-field" name="tmf-map-polyline-array" style="width: 800px;" id="tmf-map-polyline-array" value="';

		if (isset($tmf_stored_meta_parsed['tmf-map-polyline-array'][0])) {
			if (!$tmf_stored_meta_parsed['tmf-map-polyline-array'][0] == '') {
				$tmfFinalObjectString = '';
				$tmfObjectArray = explode('|', wp_kses_post($tmf_stored_meta_parsed['tmf-map-polyline-array'][0]));

				for ($x = 0; $x < sizeof($tmfObjectArray); $x++) {
					$tmfSinglePolylineArray = explode('¦', $tmfObjectArray[$x]);
					array_pop($tmfSinglePolylineArray);
					$tmfSinglePolylineArrayWithKeys = array();
					for ($y = 0; $y < sizeof($tmfSinglePolylineArray); $y = $y + 2) {
						$key = str_replace(',', '', $tmfSinglePolylineArray[$y]);
						$tmfSinglePolylineArrayWithKeys[$key] = $tmfSinglePolylineArray[$y + 1];
					}

					if ($tmfSinglePolylineArrayWithKeys['tmfPolylineSource'] == 'gpx') { // If creating a polyline from gpx file then load contents of gpx file. Coords are then passed as .csv
						$tmfGpxFileContents = '';
						$tmfGpxFileContents = wp_remote_retrieve_body(wp_remote_get($tmfSinglePolylineArrayWithKeys['tmfPolylineFileUrl']));
						$tmfSinglePolylineArrayWithKeys['tmfPolylinePath'] = $tmfGpxFileContents; // If gpx file cannot be found then return empty
					}
					$tmfSinglePolylineString = '';
					foreach($tmfSinglePolylineArrayWithKeys as $key => $value) {
					    $tmfSinglePolylineString .= $key . '¦' . $value . '¦';
					} 
					$tmfFinalObjectString .= $tmfSinglePolylineString . '|';
				}
				$tmfFinalObjectString = rtrim($tmfFinalObjectString,'|');
				$tmf_displaymapobjectstringtoreturn .= esc_html__(do_shortcode($tmfFinalObjectString)); // do_shortcode is added to display any possible captions
			}
		}
		$tmf_displaymapobjectstringtoreturn .= '" />';
	$tmf_displaymapobjectstringtoreturn .= '</div>';

	return $tmf_displaymapobjectstringtoreturn;
} 

function tmf_display_map($tmf_post_id_parsed) {
	$tmf_stringtoreturnextend = '<div class="tmf-map-container" id="tmf-map-container-' . $tmf_post_id_parsed . '">';
		$tmf_stringtoreturnextend .= '<div id="tmf-placecard-container-outer" style="display: none;">';
			$tmf_stringtoreturnextend .= '<div class="tmf-placecard-container-mid">';
				$tmf_stringtoreturnextend .= '<div class="tmf-placecard-container-inner">';
					$tmf_stringtoreturnextend .= '<div class="tmf-placecard-left">';
						$tmf_stringtoreturnextend .= '<p id="tmf-placecard-business-name"></p>';
						$tmf_stringtoreturnextend .= '<p id="tmf-placecard-info"></p>';
						$tmf_stringtoreturnextend .= '<a id="tmf-placecard-view-large" target="_blank" id="A_41">' . __( "View larger map", "tmf_translation" ) . '</a>';
					$tmf_stringtoreturnextend .= '</div>';
					$tmf_stringtoreturnextend .= '<div class="tmf-placecard-right">';
						$tmf_stringtoreturnextend .= '<a id="tmf-placecard-direction-link" class="tmf-placecard-direction-link" target="_blank"
		              id="A_9">';
							$tmf_stringtoreturnextend .= '<div class="tmf-placecard-direction-icon"></div>';
							$tmf_stringtoreturnextend .= __( "Directions", "tmf_translation" );
						$tmf_stringtoreturnextend .= '</a>';
					$tmf_stringtoreturnextend .= '</div>';
				$tmf_stringtoreturnextend .= '</div>';
			$tmf_stringtoreturnextend .= '</div>';
		$tmf_stringtoreturnextend .= '</div>';
		$tmf_stringtoreturnextend .= '<div class="tmf-map" id="tmf-map-' . $tmf_post_id_parsed . '"></div>';
		$tmf_stringtoreturnextend .= '<div id="tmf-map-thumbnail-wrapper">';
			$tmf_stringtoreturnextend .= '<div id="tmf-map-thumbnail"></div>';
			$tmf_stringtoreturnextend .= '<div id="tmf-map-thumbnail-overlay">';
			$tmf_stringtoreturnextend .= '<div id="tmf-map-thumbnail-overlay-text"></div>';
			$tmf_stringtoreturnextend .= '</div>';
		$tmf_stringtoreturnextend .= '</div>';
	$tmf_stringtoreturnextend .= '</div>';
	$tmf_stringtoreturnextend .= '<div class="tmf-polyline-chart-meta-data-container" id="tmf-polyline-chart-meta-data-container-' . $tmf_post_id_parsed . '">';
		$tmf_stringtoreturnextend .= '<div class="tmf-polyline-chart" id="tmf-polyline-chart-' . $tmf_post_id_parsed . '"></div>';
		$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-container"  id="tmf-meta-data-container-' . $tmf_post_id_parsed . '" style="display: none;">'; 
			$tmf_stringtoreturnextend .= '<div class="tmf-meta-data" id="tmf-meta-data-' . $tmf_post_id_parsed . '">';
				$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-prompts" id="tmf-meta-data-prompts-' . $tmf_post_id_parsed . '">';
					$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-distance-prompt" id="tmf-meta-data-distance-prompt-' . $tmf_post_id_parsed . '">' . __("Distance: ", "tmf_translation") . '</div>';
					$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-ascent-prompt" id="tmf-meta-data-ascent-prompt-' . $tmf_post_id_parsed . '">' . __("Ascent: ", "tmf_translation") . '</div>';
					$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-descent-prompt" id="tmf-meta-data-descent-prompt-' . $tmf_post_id_parsed . '">' . __("Descent: ", "tmf_translation") . '</div>';
					$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-highest-prompt" id="tmf-meta-data-highest-prompt-' . $tmf_post_id_parsed . '">' . __("Highest point: ", "tmf_translation") . '</div>';
					$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-lowest-prompt" id="tmf-meta-data-lowest-prompt-' . $tmf_post_id_parsed . '">' . __("Lowest point: ", "tmf_translation") . '</div>';
				$tmf_stringtoreturnextend .= '</div>';
				$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-values" id="tmf-meta-data-values-' . $tmf_post_id_parsed . '">';
					$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-distance" id="tmf-meta-data-distance-' . $tmf_post_id_parsed . '"></div>';
					$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-ascent" id="tmf-meta-data-ascent-' . $tmf_post_id_parsed . '"></div>';
					$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-descent" id="tmf-meta-data-descent-' . $tmf_post_id_parsed . '"></div>';
					$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-highest" id="tmf-meta-data-highest-' . $tmf_post_id_parsed . '"></div>';
					$tmf_stringtoreturnextend .= '<div class="tmf-meta-data-lowest" id="tmf-meta-data-lowest-' . $tmf_post_id_parsed . '"></div>';
				$tmf_stringtoreturnextend .= '</div>';
			$tmf_stringtoreturnextend .= '</div>';
		$tmf_stringtoreturnextend .= '</div>';
	$tmf_stringtoreturnextend .= '</div>';

	return $tmf_stringtoreturnextend;
}