<?php
/**
 **************************************************************
 * All following is related to the creating / editing of a  map
 **************************************************************
 */
/**
 * Adds a meta box to the Map (post type) editing screen
 */
function tmf_custom_meta() {
    add_meta_box( 'tmf_meta', __( 'Create Your Map', 'tmf_translation' ), 'tmf_meta_callback', 'themapfactorymaps' );

	add_meta_box( 'tmf_shortcode', __( 'The WP Map Factory Shortcode', 'tmf_translation' ), 'tmf_shortcode_callback', 'themapfactorymaps', 'side' );

	remove_meta_box( 'slugdiv', 'themapfactorymaps', 'normal' ); // Remove slug from Screen Options in custom post type

}
add_action( 'add_meta_boxes', 'tmf_custom_meta' );

/**
 * Adds custom columns to the list of maps
 */
function tmf_edit_themapfactorymaps_columns( $columns ) {
	$tmfColumns = array(
		'cb' 				=> '&lt;input type="checkbox" />',
		'title' 			=> __( 'Map' ),
		'shortcodeposts' 	=> __( 'Shortcode for posts and pages' ),
		'shortcodetheme' 	=> __( 'Shortcode for theme and php files' ),
		'date' 				=> __( 'Date' )
	);
	return $tmfColumns;
}
add_filter( 'manage_edit-themapfactorymaps_columns', 'tmf_edit_themapfactorymaps_columns' ) ;

function tmf_manage_themapfactorymaps_columns( $column, $post_id ) {
	global $post;
	$tmfMapShortcode = $post_id;

	switch( $column ) {

		case 'shortcodeposts' :
			printf( __( '[thewpmapfactory tmfmapid="%s"]' ), $tmfMapShortcode );
			break;

		case 'shortcodetheme' :
			printf( __( 'echo do_shortcode(\'[thewpmapfactory tmfmapid="%s"]\')' ), $tmfMapShortcode );
			break;

		default :
			break;
	}
}
add_action( 'manage_themapfactorymaps_posts_custom_column', 'tmf_manage_themapfactorymaps_columns', 10, 2 );

function tmf_shortcode_callback() { 
	global $post; ?>
	<p>
    	<?php _e('To show this map in posts, pages or text widgets, copy and paste the shortcode below into the post, page or widget: ', 'tmf_translation'); ?>
    </p>
    <p class="tmf-form-helptext">
		<?php printf( __( '[thewpmapfactory tmfmapid="%s"]' ), $post->ID); ?>
    </p>
    <p>
    	<?php _e('If you want to show this map anywhere in your theme, simply copy and paste the code below into the relevant .php file (such as single.php): ', 'tmf_translation'); ?>
    </p>
    <p class="tmf-form-helptext">
		<?php printf( __( 'echo do_shortcode(\'[thewpmapfactory tmfmapid="%s"]\')' ), $post->ID); ?>
    </p>
    <?php
}

/**
 * Outputs the content of the meta box
 */
function tmf_meta_callback( $post ) {
	$tmf_license_google_status = 'valid';

	include(plugin_dir_path( __FILE__ ) . 'the_map_factory_functions.php');

	if (get_option( 'tmf_options' )) {
		$tmf_options = get_option( 'tmf_options' );
		$tmf_options = tmf_sanitize_data($tmf_options);
	} else
	{
		$tmf_options = array(
		    'tmf-thunderforest-key'		=> '',
		    'tmf-chart-units'			=> 'meters',
		    'tmf-cleanup-setting'		=> 'delete'
		);
	}

	$tmf_displayobjectstrings = 'tmf-hidden'; // "Trick" to easily show the object strings
	if ($tmf_options['tmf-thunderforest-key'] == '-1') {
		$tmf_displayobjectstrings = '';
	}

	$tmf_options['tmf-plugin-url'] = plugin_dir_url( __FILE__ );

	wp_enqueue_script( 'the-map-factory' );
	wp_enqueue_script( 'the_map_factory-common-display-map' );
	wp_enqueue_script( 'the-map-factory-backend-display-map' );
    
    wp_enqueue_media();
   	
   	wp_enqueue_script( 'meta-box-color-js');
   	wp_enqueue_style( 'wp-color-picker' );

   	wp_register_script( 'google-charts', 'https://www.gstatic.com/charts/loader.js');
	wp_enqueue_script( 'google-charts' );
	if ( isset ( $tmf_options['tmf-googlemaps-key'] ) ) {
		wp_enqueue_script( 'google_js', 'https://maps.googleapis.com/maps/api/js?key=' . $tmf_options['tmf-googlemaps-key'] . '&callback=tmfInitialiseMap', '', '', true );
	}
	else {
		wp_enqueue_script( 'google_js', 'https://maps.googleapis.com/maps/api/js?key=&callback=tmfInitialiseMap', '', '', true );
	}

	// Get marker array	
	$tmf_svg_marker_array = tmfSvgArray();
	$tmf_text_tokens = tmfTextTokens();
	$tmf_post_id = $post->ID;
	$tmf_frontend_variables = array(
	    'tmfSvgMarkerArray'				=> $tmf_svg_marker_array,
	    'tmfTextTokens'					=> $tmf_text_tokens,
	    'tmfPostId'						=> $tmf_post_id
	);
	wp_localize_script( 'the-map-factory-backend-display-map', 'tmfFrontendVariables', $tmf_frontend_variables );

	$tmf_backend_variables = array(
	    'tmfBackendThunderforestKey'	=> $tmf_options['tmf-thunderforest-key'],
	    'tmfChartUnits'					=> $tmf_options['tmf-chart-units'],
	    'tmfPluginUrl'					=> $tmf_options['tmf-plugin-url'],
	    'tmfLicenseStatus'				=> $tmf_license_google_status,
	    'tmfIsBackend'					=> 1
	);
	wp_localize_script( 'the-map-factory-backend-display-map', 'tmfBackendVariables', $tmf_backend_variables );

	wp_nonce_field( basename( __FILE__ ), 'tmf_nonce' );
    $tmf_stored_meta = get_post_meta( $post->ID ); ?>

    <div class="wrap">
	    <?php settings_errors();

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

		wp_localize_script( 'the-map-factory-backend-display-map', 'tmfTheBasicsObject', $tmf_map_the_basics_array ); ?>
		
		<div class="<?php echo $tmf_displayobjectstrings;?>">
	    	<input class="tmf-form-input-field" name="tmf-map-the-basics-object" id="tmf-map-the-basics-object" style="width: 800px;" value="<?php esc_html_e($tmf_map_the_basics_json); ?>" />
		</div>
	
		<?php 
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

		wp_localize_script( 'the-map-factory-backend-display-map', 'tmfPlacecardObject', $tmf_map_placecard_array ); ?>
		
		<div class="<?php echo $tmf_displayobjectstrings;?>">
			<input class="tmf-form-input-field" name="tmf-map-placecard-object" id="tmf-map-placecard-object" style="width: 800px;" value="<?php esc_html_e($tmf_map_placecard_json); ?>" />
		</div>

		<?php echo tmf_display_map_object_strings($tmf_stored_meta, $tmf_displayobjectstrings); ?>

		<div class="tmf_tab">
			<button class="tmf_tablinks active" type="button" onclick="tmftoggletabs(event, 'tmf_the_basics')" id="tmf_the_basics_id"><?php _e( 'The basics', 'tmf_translation' )?></button>
			<button class="tmf_tablinks" type="button" onclick="tmftoggletabs(event, 'tmf_placecard')" id="tmf_placecard_id"><?php _e( 'Place card', 'tmf_translation' )?></button>
			<button class="tmf_tablinks" type="button" onclick="tmftoggletabs(event, 'tmf_markers')" id="tmf_markers_id"><?php _e( 'Markers', 'tmf_translation' )?></button>
			<button class="tmf_tablinks" type="button" onclick="tmftoggletabs(event, 'tmf_circles')" id="tmf_circles_id"><?php _e( 'Circles', 'tmf_translation' )?></button>
			<button class="tmf_tablinks" type="button" onclick="tmftoggletabs(event, 'tmf_polygons')" id="tmf_polygons_id"><?php _e( 'Polygons', 'tmf_translation' )?></button>
			<button class="tmf_tablinks" type="button" onclick="tmftoggletabs(event, 'tmf_polylines')" id="tmf_polylines_id"><?php _e( 'Polylines', 'tmf_translation' )?></button>
		</div>

		<!-- 
			PAGE TAB: The Basics
		-->
		<div id="tmf_the_basics" class="tmf_tabcontent">
			<!--
				Map types
			-->
			<p class="tmf_subheading">
		    	<?php _e( 'Map types', 'tmf_translation' )?>
		    </p>

			<div class="tmf-settings-group">
				<div class="tmf-settings-group-lhs">
				    <?php _e( 'Map types to be available', 'tmf_translation' )?>
				</div>
				<div class="tmf-row-content">
			        <label for="tmf-map-type-google-roadmap">
			            <input type="checkbox" name="tmf-map-type-google-roadmap" id="tmf-map-type-google-roadmap" value="yes" <?php if ($tmf_map_the_basics_array["tmfMapTypeGoogleRoadmap"] == 'true') { echo 'checked';} ?> onchange="tmfTheBasicsChanged()" />
			            <?php _e( 'Google Maps - Roadmap', 'tmf_translation' )?>
			        </label>
			        <label for="tmf-map-type-google-terrain">
			            <input type="checkbox" name="tmf-map-type-google-terrain" id="tmf-map-type-google-terrain" value="yes" <?php if ($tmf_map_the_basics_array["tmfMapTypeGoogleRoadmapTerrain"] == 'true') { echo 'checked';} ?> onchange="tmfTheBasicsChanged()" />
			            <?php _e( 'Google Maps - Roadmap with terrain', 'tmf_translation' )?>
			        </label>
			        <label for="tmf-map-type-satellite">
			            <input type="checkbox" name="tmf-map-type-google-satellite" id="tmf-map-type-google-satellite" value="yes" <?php if ($tmf_map_the_basics_array["tmfMapTypeGoogleSatellite"] == 'true') { echo 'checked';} ?> onchange="tmfTheBasicsChanged()" />
			            <?php _e( 'Google Maps - Satellite', 'tmf_translation' )?>
			        </label>
			        <label for="tmf-map-type-google-hybrid">
			            <input type="checkbox" name="tmf-map-type-google-hybrid" id="tmf-map-type-google-hybrid" value="yes" <?php if ($tmf_map_the_basics_array["tmfMapTypeHybrid"] == 'true') { echo 'checked';} ?> onchange="tmfTheBasicsChanged()" />
			            <?php _e( 'Google Maps - Hybrid (satellite with labels)', 'tmf_translation' )?>
			        </label>
			        <label for="tmf-map-type-osm">
			            <input type="checkbox" name="tmf-map-type-osm" id="tmf-map-type-osm" value="yes" <?php if ($tmf_map_the_basics_array["tmfMapTypeOSM"] == 'true') { echo 'checked';} ?> onchange="tmfTheBasicsChanged()" />
			            <?php _e( 'Open Street Maps', 'tmf_translation' )?>
			        </label>
			        <label for="tmf-map-type-thunderforestocm">
			            <input type="checkbox" name="tmf-map-type-thunderforestocm" id="tmf-map-type-thunderforestocm" value="yes" <?php if ($tmf_map_the_basics_array["tmfMapTypeThunderforestocm"] == 'true') { echo 'checked';} ?> onchange="tmfTheBasicsChanged()" />
			            <?php _e( 'Thunderforest Open Cycle Map', 'tmf_translation' )?>
			        </label>
			        <label for="tmf-map-type-thunderforestlandscape">
			            <input type="checkbox" name="tmf-map-type-thunderforestlandscape" id="tmf-map-type-thunderforestlandscape" value="yes" <?php if ($tmf_map_the_basics_array["tmfMapTypeThunderforestlandscape"] == 'true') { echo 'checked';} ?> onchange="tmfTheBasicsChanged()" />
			            <?php _e( 'Thunderforest Landscape Map', 'tmf_translation' )?>
			        </label>
			        <label for="tmf-map-type-thunderforestoutdoors">
			            <input type="checkbox" name="tmf-map-type-thunderforestoutdoors" id="tmf-map-type-thunderforestoutdoors" value="yes" <?php if ($tmf_map_the_basics_array["tmfMapTypeThunderforestoutdoors"] == 'true') { echo 'checked';} ?> onchange="tmfTheBasicsChanged()" />
			            <?php _e( 'Thunderforest Outdoors Map', 'tmf_translation' )?>
			        </label>
			    </div>
			</div>

			<div class="tmf-settings-group" id="tmf-settings-map-type-group">
				<div class="tmf-settings-group-lhs">
				    <?php _e( 'How to toggle map types', 'tmf_translation' )?>
				</div>
			    <div class="tmf-row-content">
			        <select name="tmf-map-fit" id="tmf-map-display" onchange="tmfTheBasicsChanged()">
				    	<option value="THUMBNAIL" <?php if ($tmf_map_the_basics_array["tmfToggleType"] == 'THUMBNAIL') { echo 'selected';} ?>><?php _e( 'Thumbnail image', 'tmf_translation' )?></option>
				    	<option value="HORIZONTAL_BAR" <?php if ($tmf_map_the_basics_array["tmfToggleType"] == 'HORIZONTAL_BAR') { echo 'selected';} ?>><?php _e( 'Buttons', 'tmf_translation' )?></option>
				    	<option value="DROPDOWN_MENU" <?php if ($tmf_map_the_basics_array["tmfToggleType"] == 'DROPDOWN_MENU') { echo 'selected';} ?>><?php _e( 'Drop-down menu', 'tmf_translation' )?></option>
				    	<option value="NONE" <?php if ($tmf_map_the_basics_array["tmfToggleType"] == 'NONE') { echo 'selected';} ?>><?php _e( 'Don\'t allow', 'tmf_translation' )?></option>
				    </select>
			    </div>
			</div>

			<p class="tmf-form-helptext">
		    	<?php _e( 'If you choose to display a lot of map types it may be better to toggle the map types with a drop-down box or thumbnails - they take up less space.', 'tmf_translation' )?>
		    </p>

			<!--
		    -- Map position
		    -->
		    <p class="tmf_subheading">
		    	<?php _e( 'Map position', 'tmf_translation' )?>
		    </p>
		   	<div class="tmf-settings-group">
				<div class="tmf-settings-group-lhs">
			    	<?php _e( 'How to fit the map', 'tmf_translation' )?>
				</div>
			    <div class="tmf-row-content">
				    <label for="tmf-map-fit-radio">
			            <input type="radio" name="tmf-map-fit-radio" id="tmf-map-fit-manually" onchange="tmfTheBasicsChanged()" <?php if ($tmf_map_the_basics_array["tmfFitMethod"] == 'manual') { echo 'checked';} ?>>
			            <?php _e( 'Manually', 'tmf_translation' )?>
			        </label>
			        <label for="tmf-map-display-buttons">
			            <input type="radio" name="tmf-map-fit-radio" id="tmf-map-fit-all-onbjects" onchange="tmfTheBasicsChanged()" <?php if ($tmf_map_the_basics_array["tmfFitMethod"] == 'objects') { echo 'checked';} ?>>
			            <?php _e( 'To all objects', 'tmf_translation' )?>
			        </label>
				</div>
		    </div>
		    <p class="tmf-form-helptext">
		    	<?php _e( 'If you choose "To all objects" then the map will automatically fit to all markers, circles, polylines and polygons - you don\'t need to position the map manually. If you choose "Manually" you can pan and zoom the map to where you want. ', 'tmf_translation' )?>
		    </p>
		    <div id="tmf-map-manually-position-controls" <?php if ($tmf_map_the_basics_array["tmfFitMethod"] == 'objects') { echo 'style="display:none;"';} ?>>
			    <div id="tmf-settings-set-map-position-group" class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
					    <?php _e( 'Pan and zoom the map and once you are happy press the button to the right - this will set the current map position and zoom level.', 'tmf_translation' ); ?>
				    </div>
				    <div class="tmf-settings-group-rhs">
					    <div class="tmf-buttons-left">
					    	<input class="tmf-button" type="button" value="<?php _e( 'Set map position', 'tmf_translation' ) ?>" onclick="tmfSetMapLocationAndZoom()" />
					    </div>
					</div>
				</div>
				<div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
			        	<label for="tmf-map-center-manually"><?php _e( 'Map center and zoom', 'tmf_translation' ); ?></label>
			        </div>
				    <div class="tmf-settings-group-rhs">
				    	<div class="tmf-settings-group-rhs-spacer"><?php echo __('Latitude: ', 'tmf_translation');?><span id="tmf-map-center-lat"><?php esc_html_e($tmf_map_the_basics_array["tmfMapCenterLat"]);?></span>°</div>
				    	<div class="tmf-settings-group-rhs-spacer"><?php echo __('Longitude: ', 'tmf_translation'); ?><span id="tmf-map-center-lon"><?php esc_html_e($tmf_map_the_basics_array["tmfMapCenterLon"]); ?></span>°</div>
				    	<div><?php echo __( 'Zoom level: ', 'tmf_translation' ); ?><span id="tmf-map-zoom"><?php esc_html_e($tmf_map_the_basics_array["tmfMapZoom"]); ?></span></div>
					</div>
				</div>
			</div>

			<!--
		    -- Map controls
		    -->
		    <p class="tmf_subheading">
		    	<?php _e( 'Map controls', 'tmf_translation' )?>
		    </p>
		    <div class="tmf-settings-group">
			    <div class="tmf-settings-group-lhs">
				    <?php _e( 'Buttons to show in map', 'tmf_translation' )?>
				</div>
			    <div class="tmf-row-content">
				    <label for="tmf-map-center">
			        	<input type="checkbox" name="tmf-map-center" id="tmf-map-center" onchange="tmfTheBasicsChanged()" <?php if ($tmf_map_the_basics_array["tmfButtonCenter"] == 'true') { echo 'checked';} ?> /><?php _e( 'Center button', 'tmf_translation' )?>
			        </label>
				    <label for="tmf-map-fullscreen">
			        	<input type="checkbox" name="tmf-map-fullscreen" id="tmf-map-fullscreen" onchange="tmfTheBasicsChanged()" <?php if ($tmf_map_the_basics_array["tmfButtonFullScreen"] == 'true') { echo 'checked';} ?> /><?php _e( 'Full screen button', 'tmf_translation' )?>
			        </label>
				    <label for="tmf-map-streetview">
			        	<input type="checkbox" name="tmf-map-streetview" id="tmf-map-streetview" onchange="tmfTheBasicsChanged()" <?php if ($tmf_map_the_basics_array["tmfButtonStreetView"] == 'true') { echo 'checked';} ?> /><?php _e( 'Street view button', 'tmf_translation' )?>
			        </label>
				    <label for="tmf-map-zoombuttons">
			        	<input type="checkbox" name="tmf-map-zoombuttons" id="tmf-map-zoombuttons" onchange="tmfTheBasicsChanged()" <?php if ($tmf_map_the_basics_array["tmfButtonZoom"] == 'true') { echo 'checked';} ?> /><?php _e( 'Zoom buttons', 'tmf_translation' )?>
			        </label>
			    </div>
			 </div>

			 <!--
		    -- Map size
		    -->
		    <p class="tmf_subheading">
		    	<?php _e( 'Map size', 'tmf_translation' )?>
		    </p>
			<div class="tmf-settings-group">
			    <div class="tmf-settings-group-lhs">
			    	<label for="tmf-map-width"><?php _e( 'Map width', 'tmf_translation' )?></label>
				</div>
			    <div class="tmf-row-content">
			    	<div class="tmf-settings-group-rhs-spacer">
				    	<input class="tmf-form-input-field" type="number" name="tmf-map-width-pixel" id="tmf-map-width-pixel" value="<?php _e($tmf_map_the_basics_array["tmfMapWidthPixel"]); ?>" onchange="tmfTheBasicsChanged() "/>
				    </div>
				    <div class="tmf-settings-group-rhs-spacer">
				    	<input class="tmf-form-input-field" type="number" name="tmf-map-width-percentage" id="tmf-map-width-percentage" style="display: none;" value="<?php _e($tmf_map_the_basics_array["tmfMapWidthPercentage"]); ?>" onchange="tmfTheBasicsChanged()" />
				    </div>
			        <label for="tmf-map-width-pixel-radio" class="tmf-inline-block">
			            <input type="radio" name="tmf-map-width" id="tmf-map-width-pixel-radio" value="" onchange="tmfTheBasicsChanged()" <?php if ($tmf_map_the_basics_array["tmfMapWidthType"] == "pixel") { _e('checked'); } ?> />
			            <?php _e( 'Pixels', 'tmf_translation' )?>
			        </label>
				    <label for="tmf-map-width-percentage-radio" class="tmf-inline-block">
			            <input type="radio" name="tmf-map-width" id="tmf-map-width-percentage-radio" value="" onchange="tmfTheBasicsChanged()" <?php if ($tmf_map_the_basics_array["tmfMapWidthType"] == "percentage") { _e('checked'); } ?> />
			            <?php _e( 'Percentage', 'tmf_translation' )?>
			        </label>
			    </div>
			</div>
			<p class="tmf-form-helptext">
		    	<?php _e( 'If you choose percentage then the width of the map will be determined by the width of the element surrounding the map.', 'tmf_translation' ); ?>
		    </p>
			<div class="tmf-settings-group">
			    <div class="tmf-settings-group-lhs">
			    	<label for="tmf-map-height"><?php _e( 'Map height (pixels)', 'tmf_translation' )?></label>
				</div>
			    <div class="tmf-row-content">
			    	<div class="tmf-settings-group-rhs-spacer">
				    	<input class="tmf-form-input-field" type="number" name="tmf-map-height-pixel" id="tmf-map-height-pixel"value="<?php _e($tmf_map_the_basics_array["tmfMapHeightPixel"]); ?>" onchange="tmfTheBasicsChanged() "/>
				    </div>
				    <div class="tmf-settings-group-rhs-spacer" style="display: none!important"><!--NOTE! Map height by percentage currently disabled-->
				    	<input class="tmf-form-input-field" type="number" name="tmf-map-height-percentage" id="tmf-map-height-percentage" value="<?php _e($tmf_map_the_basics_array["tmfMapHeightPercentage"]); ?>" onchange="tmfTheBasicsChanged()" />
				    </div>
				    <label for="tmf-map-height-pixel-radio" class="tmf-inline-block" style="display: none!important">
			            <input type="radio" name="tmf-map-height" id="tmf-map-height-pixel-radio" value="" onchange="tmfTheBasicsChanged()" <?php if ($tmf_map_the_basics_array["tmfMapHeightType"] == "pixel") { _e('checked'); } ?> />
			            <?php _e( 'Pixels', 'tmf_translation' )?>
			        </label>
				    <label for="tmf-map-height-percentage-radio" class="tmf-inline-block" style="display: none!important">
			            <input type="radio" name="tmf-map-height" id="tmf-map-height-percentage-radio" value="" onchange="tmfTheBasicsChanged()" <?php if ($tmf_map_the_basics_array["tmfMapHeightType"] == "percentage") { _e('checked'); } ?> />
			            <?php _e( 'Percentage', 'tmf_translation' )?>
			        </label>
			    </div>
			</div>
		</div>

		<!-- 
			PAGE TAB: Place card 
		-->
		<div id="tmf_placecard" class="tmf_tabcontent" style="display:none;">
			<p class="tmf_subheading">
		    	<?php _e( 'Create place card', 'tmf_translation' )?>
		    </p>
		    <div class="tmf-settings-group">
				<div class="tmf-settings-group-lhs">
			    	<?php _e( 'Show place card in map', 'tmf_translation' )?>
				</div>
			    <div class="tmf-settings-group-rhs">
			        <label for="tmf-placecard">
			        	<input type="checkbox" name="tmf-placecard" id="tmf-placecard" value="no" onchange="tmfPlacecardUpdated()" <?php if($tmf_map_placecard_array['tmfPlaceCardDisplay'] == "true") {echo "checked"; }?>/>
			        </label>
			    </div>
			</div>
				 
		    <p class="tmf-form-helptext">
		    	<?php _e( 'Place cards are used to show off a business or particular location.', 'tmf_translation' ); ?>
		    </p>
		    <div id="tmf-placecard-texts" <?php if ($tmf_map_placecard_array['tmfPlaceCardDisplay'] == "false") { echo 'style="display: none;"'; } ?>>
			    <div class="tmf-settings-group"> 
					<div class="tmf-settings-group-lhs">
					    <?php _e( 'Business or location name', 'tmf_translation' )?>
					</div>
					<div class="tmf-settings-group-lhs">
						<textarea class="tmf-form-text-area" id="tmf-placecard-name" onchange="tmfPlacecardUpdated()"><?php esc_html_e($tmf_map_placecard_array['tmfPlacecardBusinessName']); ?></textarea>
					</div>
				</div>
				<div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
					    <?php _e( 'Business or location address', 'tmf_translation' )?>
					</div>
					<div class="tmf-settings-group-lhs">
						<textarea class="tmf-form-text-area" id="tmf-placecard-address" onchange="tmfPlacecardUpdated()"><?php esc_html_e($tmf_map_placecard_array['tmfPlacecardAddress']); ?></textarea>
					</div>
				</div>
				<p class="tmf_subheading">
			    	<?php _e( 'The "View larger map" link in the place card', 'tmf_translation' )?>
			    </p>
			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
				    	<?php _e( 'Use a different name for the "View larger map" link in the place card', 'tmf_translation' )?>
					</div>
				    <div class="tmf-settings-group-rhs">
				        <label for="tmf-placecard">
				        	<input type="checkbox" name="tmf-placecard" id="tmf-placecard-larger-map-name-checkbox" value="no" onchange="tmfPlacecardUpdated()" <?php if($tmf_map_placecard_array['tmfPlacecardName2Display'] == "true") {echo "checked"; }?>/>
				        </label>
				    </div>
			    </div>
			    <div id="tmf-placecard-larger-map-name-group" <?php if($tmf_map_placecard_array['tmfPlacecardName2Display'] == "false") {echo 'style="display: none;"'; }?>>
					<div class="tmf-settings-group"> 
						<div class="tmf-settings-group-lhs">
						    <?php _e( 'Name for the "View larger map" link in the place card', 'tmf_translation' )?>
						</div>
						<div class="tmf-settings-group-lhs">
							<textarea class="tmf-form-text-area" id="tmf-placecard-search-name" onchange="tmfPlacecardUpdated()"><?php esc_html_e($tmf_map_placecard_array['tmfPlacecardName2']); ?></textarea>
						</div>
					</div>
				</div>
				<p class="tmf_subheading">
			    	<?php _e( 'The "Directions" link in the place card', 'tmf_translation' )?>
			    </p>
				<div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
					    <?php _e( 'What to use as the "Directions" destination link', 'tmf_translation' )?>
					</div>
				    <div class="tmf-row-content">
				        <select name="tmf-placecard-directions-listbox" id="tmf-placecard-directions-listbox" onchange="tmfPlacecardUpdated()">
					    	<option value="0" <?php if ($tmf_map_placecard_array['tmfPlacecardAddressType'] == '0') { echo 'selected';} ?>><?php _e( 'Use Business or location address as above', 'tmf_translation' )?></option>
					    	<option value="1" <?php if ($tmf_map_placecard_array['tmfPlacecardAddressType'] == '1') { echo 'selected';} ?>><?php _e( 'Use different Business or location address', 'tmf_translation' )?></option>
					    	<option value="2" <?php if ($tmf_map_placecard_array['tmfPlacecardAddressType'] == '2') { echo 'selected';} ?>><?php _e( 'Double-click on map and use coordinates', 'tmf_translation' )?></option>
					    </select>
				    </div>
				</div>
				<div id="tmf-placecard-directions-name-group" <?php if ($tmf_map_placecard_array['tmfPlacecardAddressType'] == 0 || $tmf_map_placecard_array['tmfPlacecardAddressType'] == 2) { echo 'style="display: none;"'; } ?>>
					<div class="tmf-settings-group">
						<div class="tmf-settings-group-lhs">
						    <?php _e( 'Name for the "Directions" link in the place card', 'tmf_translation' )?>
						</div>
						<div class="tmf-settings-group-lhs">
							<textarea class="tmf-form-text-area" id="tmf-placecard-direction-name" onchange="tmfPlacecardUpdated()"><?php esc_html_e($tmf_map_placecard_array['tmfPlacecardAddress2']); ?></textarea>
						</div>
					</div>
				</div>
				<div id="tmf-placecard-directions-coord-group" <?php if ($tmf_map_placecard_array['tmfPlacecardAddressType'] == 0 || $tmf_map_placecard_array['tmfPlacecardAddressType'] == 1) { echo 'style="display: none;"'; } ?>>
				    <div class="tmf-settings-group">
						<div class="tmf-settings-group-lhs">
				        	<label for="tmf-placecard-lat"><?php _e( 'Coordinates for "Directions" link', 'tmf_translation' )?></label>
				        </div>
					    <div class="tmf-settings-group-rhs">
					    	<div class="tmf-settings-group-rhs-spacer"><?php echo __('Latitude: ', 'tmf_translation');?><span id="tmf-placecard-lat"><?php esc_html_e(number_format($tmf_map_placecard_array['tmfPlacecardAddressLat'], 6)); ?></span>°</div>
					    	<div><?php echo __('Longitude: ', 'tmf_translation'); ?><span id="tmf-placecard-lon"><?php esc_html_e(number_format($tmf_map_placecard_array['tmfPlacecardAddressLon'],6 )); ?></span>°</div>
						</div>
					</div>
					<p class="tmf-form-helptext">
				    	<?php _e( 'Double click in the map to set the coordinates for the "Directions" link.', 'tmf_translation' ); ?>
				    </p>
				</div>
			</div>
		</div>

		<!-- 
			PAGE TAB: Markers
		-->
		<div id="tmf_markers" class="tmf_tabcontent" style="display:none;">
			<p class="tmf_subheading">
		    	<?php _e( 'Adding and editing markers', 'tmf_translation' ); ?>
		    </p>
		    <p class="tmf-form-helptext">
	    		<?php _e( 'Add a marker by double-clicking on the map. Edit an existing marker by double-clicking on it.', 'tmf_translation' ); ?>
	    	</p>
		    <div class="tmf-hidden"><!--div-->
			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
		        		<label for="tmf-map-marker-number"><?php _e( 'Marker number', 'tmf_translation' )?></label>
		        	</div>
		        	<div class="tmf-settings-group-rhs">
			        	<span id="tmf-map-marker-number"></span>
			        </div>
			    </div>
			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
			        	<label for="tmf-map-marker-name"><?php _e( 'Marker name', 'tmf_translation' )?></label>
			        </div>
				    <div class="tmf-settings-group-rhs">
			        	<input class="tmf-form-input-field" name="tmf-map-marker-name" id="tmf-map-marker-name"/>
			    	</div>
			    </div>
			</div>

		    <div id="tmf-add-single-marker-settings" style="display: none;">
		    	<p class="tmf_subheading">
			    	<?php _e( 'Marker appearance', 'tmf_translation' )?>
			    </p>
			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
					    <?php _e( 'Marker source', 'tmf_translation' )?>
					</div>
				    <div class="tmf-row-content">
				    	<select name="tmf-marker-listbox" id="tmf-marker-listbox" onchange="tmfMarkerTypeSelected()">
					    	<option value="svg"><?php _e( 'Basic markers', 'tmf_translation' )?></option>
					    	<option value="png"><?php _e( 'Marker from image library', 'tmf_translation' )?></option>
					    	<option value="user"><?php _e( 'User image', 'tmf_translation' )?></option>
					    </select>
				    </div>
				</div>

	    		<?php
				$tmf_marker_colour_array = array('Blue', 'Green', 'Orange', 'Pink', 'Purple', 'Red', 'Yellow');
				$tmf_marker_category_array = array('Agriculture', 'Nature', 'Outdoor activities', 'Restaurants and hotels', 'Stores');
				$tmf_file_name_array = array();

				foreach ($tmf_marker_category_array as $tmf_marker_category) {
					$tmf_marker_category_trimmed = str_replace(' ', '', $tmf_marker_category);
					$tmf_image_file_array = list_files( __DIR__ . "/images/Red/" . $tmf_marker_category);				
					$$tmf_marker_category_trimmed = array(); 

					foreach ($tmf_image_file_array as $tmf_image_file) {
						$tmf_filename_start = strripos($tmf_image_file, '/') + 1;
						$tmf_filename = substr($tmf_image_file, $tmf_filename_start);
						//var_dump($tmf_filename);
						array_push($$tmf_marker_category_trimmed, $tmf_filename);
					}
				}?>

				<div id="tmf-marker-pngimage-settings"> <!--style="display: none;"-->
					<div class="tmf-settings-group">
						<div class="tmf-settings-group-lhs">
						    <?php _e( 'Marker color and category', 'tmf_translation' )?>
						</div>
					    <!--div class="tmf-row-content"-->
					   	<div class="tmf-settings-group-rhs">
					   		<div>
						        <select class="tmf-settings-group-rhs-spacer" name="tmf-png-marker-color" id="tmf-png-marker-color" onchange="tmfPngMarkerColorChanged()">
						        	<?php 
						        	foreach ($tmf_marker_colour_array as $tmf_marker_colour)  { 
						        		echo tmf_marker_color_option($tmf_marker_colour);
						        	} ?>
							    </select>
							</div>
							<div>
								<select name="tmf-png-marker-category" id="tmf-png-marker-category" onchange="tmfPngMarkerColorChanged()">
									<?php
									foreach ($tmf_marker_category_array as $tmf_marker_category)  { 
							    		echo tmf_marker_color_option($tmf_marker_category);
							    	} ?>
							    </select>
							</div>
						</div>
					</div>

					<p class="tmf-form-helptext small-margin-bottom">
					    <?php _e( 'Click an image below to use it as a marker.', 'tmf_translation' )?>
					</p>
					<div class="tmf-settings-group">
						<div class="tmf_marker_display tmf-row-content">
						<?php foreach ($tmf_marker_colour_array as $tmf_marker_colour)  {
							foreach ($tmf_marker_category_array as $tmf_marker_category)  {
								$tmf_marker_category_trimmed = str_replace(' ', '', $tmf_marker_category);
								echo '<div class="tmf-marker-block" id="', $tmf_marker_colour, '-', $tmf_marker_category_trimmed, '">';

								foreach ($$tmf_marker_category_trimmed as $tmf_marker_filename)  {
									$tmf_png_full_file_name = plugin_dir_url( __FILE__ ) . 'images/' . $tmf_marker_colour . '/' . $tmf_marker_category . '/' . $tmf_marker_filename;
									$tmf_marker_identifier = $tmf_marker_colour . '-' . $tmf_marker_category_trimmed . '-' . substr($tmf_marker_filename, 0, -4); ?>
									<span class="tmf-marker-image-container">
										<img class="tmf-marker-image" id="<?php echo $tmf_marker_identifier; ?>" src="<?php echo $tmf_png_full_file_name; ?>" onclick="tmfPngMarkerImageClicked('<?php echo $tmf_marker_identifier; ?>')">
									</span>
								<?php }
								echo '</div>';
							}
						} ?>
						</div>
						<div class="tmf-form-helptext">
						    <?php _e( 'All images above courtesy of ', 'tmf_translation' )?><a href="https://mapicons.mapsmarker.com" target="_blank">Maps Icons Collection</a>
						</div>
					</div>

					<div id="tmf-settings-group" style="display: none;">
						<div class="tmf-settings-group-lhs">
							<label for="tmf-marker-pngimageurl-src" id="tmf-marker-pngimageurl-label"><?php _e( 'Selected image url', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
			    			<input id="tmf-marker-pngimage-url" name="tmf-marker-pngimage-url" value="" /> 
			    		</div>
		    		</div>
		    		<div class="tmf-settings-group" id="tmf-marker-pngimage-anchor-settings">
		    			<div class="tmf-settings-group-lhs">
			    			<label for="tmf-marker-pngimage-url-anchor"><?php _e( 'Anchor', 'tmf_translation' )?></label>
			    		</div>
					    <div class="tmf-settings-group-rhs">
						    <div>
						    	<input class="tmf-form-input-field tmf-settings-group-rhs-spacer" type="number" name="tmf-marker-pngimage-anchor-x" id="tmf-marker-pngimage-anchor-x" onchange="tmfPngImagePropertyChanged()" />
						    </div>
						    <div>
						        <input class="tmf-form-input-field" type="number" name="tmf-marker-pngimage-anchor-y" id="tmf-marker-pngimage-anchor-y" onchange="tmfPngImagePropertyChanged()" />
						    </div>
						</div>
		    		</div>
		    	</div>

		    	<div id="tmf-marker-user-settings" style="display: none;">
		    		<div class="tmf-settings-group">
						<div class="tmf-settings-group-lhs">
							<label for="tmf-marker-url"><?php _e( 'Select the image file for the marker', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
						    <input id="tmf-marker-url-button" type="button" class="tmf-button" value="Select marker image" />
			   			    <input id="tmf-marker-url" type="hidden" name="tmf-marker-url" value="" />
						</div>
					</div>
					<div id="tmf-marker-png-image-settings" style="display: none;">
						<div class="tmf-settings-group">
							<div class="tmf-settings-group-lhs">
								<label for="tmf-marker-url-src" id="tmf-marker-url-label"><?php _e( 'Currently selected image', 'tmf_translation' )?></label>
							</div>
							<div class="tmf-settings-group-rhs">
				    			<img id="tmf-marker-url-src" max-width="40" max-height="40px">
				    			<span id="tmf-marker-url-text"></span>
				    		</div>
			    		</div>
			    		<div class="tmf-settings-group" id="tmf-marker-png-width-height-settings" style="display: none;">
							<div class="tmf-settings-group-lhs">
			    				<label for="tmf-marker-url-width"><?php _e( 'Image size (width and height)', 'tmf_translation' )?></label>
			    			</div>
						    <div class="tmf-settings-group-rhs">
							    <div>
							    	<input class="tmf-form-input-field tmf-settings-group-rhs-spacer" type="number" name="tmf-marker-url-width" id="tmf-marker-url-width" onchange="tmfPngMarkerGeneralPropertyChanged()" />
							    </div>
							    <div>
							        <input class="tmf-form-input-field" type="number" name="tmf-marker-url-height" id="tmf-marker-url-height" onchange="tmfPngMarkerGeneralPropertyChanged()" />
							    </div>
							</div>
			    		</div>
			    		<div class="tmf-settings-group" id="tmf-marker-png-origin-settings" style="display: none;">
			    			<div class="tmf-settings-group-lhs">
				    			<label for="tmf-marker-url-origin"><?php _e( 'Image origin (horizontal and vertical)', 'tmf_translation' )?></label>
				    		</div>
						    <div class="tmf-settings-group-rhs">
							    <div>
							    	<input class="tmf-form-input-field tmf-settings-group-rhs-spacer" type="number" name="tmf-marker-origin-x" id="tmf-marker-origin-x" onchange="tmfPngMarkerGeneralPropertyChanged()" />
							    </div>
							    <div>
							        <input class="tmf-form-input-field" type="number" name="tmf-marker-origin-y" id="tmf-marker-origin-y" onchange="tmfPngMarkerGeneralPropertyChanged()" />
							    </div>
							</div>
			    		</div>
			    		<div class="tmf-settings-group" id="tmf-marker-png-anchor-settings">
			    			<div class="tmf-settings-group-lhs">
				    			<label for="tmf-marker-url-anchor"><?php _e( 'Anchor', 'tmf_translation' )?></label>
				    		</div>
						    <div class="tmf-settings-group-rhs">
							    <div>
							    	<input class="tmf-form-input-field tmf-settings-group-rhs-spacer" type="number" name="tmf-marker-anchor-x" id="tmf-marker-anchor-x" onchange="tmfPngMarkerGeneralPropertyChanged()" />
							    </div>
							    <div>
							        <input class="tmf-form-input-field" type="number" name="tmf-marker-anchor-y" id="tmf-marker-anchor-y" onchange="tmfPngMarkerGeneralPropertyChanged()" />
							    </div>
							</div>
			    		</div>
			    	</div>
		    	</div>

		    	<div id="tmf-marker-svg-settings">
			    	<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
							<?php _e( 'WP Map Factory marker type', 'tmf_translation' )?>
						</div>
						<div class="tmf-settings-group-rhs">
						    <label for="tmf-marker-path"></label>
					        <select class="tmf-form-input-field" name="tmf-marker-path" id="tmf-marker-path" onchange="tmfSvgMarkerSelected()">
								<?php
								$tmf_svg_marker_array_length = sizeof($tmf_svg_marker_array);
					    		for ($x = 0; $x < $tmf_svg_marker_array_length; $x++) { 
					    			?>
					    			<option value="<?php echo $x; ?>"><?php echo $tmf_svg_marker_array[$x]['name']; ?></option>;
								<?php
								}
								?> 
					        </select>
					    </div>
					</div>
				   	<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
				        	<label for="tmf-marker-scale"><?php _e( 'Marker size', 'tmf_translation' )?></label>
					    </div>
					    <div class="tmf-settings-group-rhs">
					    	<input class="tmf-form-input-field" type="number" name="tmf-marker-scale" min="0.1" max="10" step="0.1" id="tmf-marker-scale" value="" onchange="tmfSvgMarkerPropertyChanged()"/>
					    </div>
					</div>
			    	<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
					    	<label for="tmf-marker-fill-color"><?php _e( 'Marker fill color and opacity', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
							<div id="tmf-marker-fill-selected-color" class="tmf-object-selected-color"></div>
							<div class="tmf-settings-group-rhs-spacer">
						    	<input name="tmf-marker-fill-color" id="tmf-marker-fill-color" type="text" class="tmf-marker-fill-color" value="" />
							</div>
							<div>
							    <select name="tmf-marker-fill-opacity" id="tmf-marker-fill-opacity" onchange="tmfSvgMarkerPropertyChanged()">
							    	<?php
							    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?> 
								</select>
							</div>
						</div>
					</div>
					<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
						    <label for="tmf-marker-stroke-color" ><?php _e( 'Marker stroke color, opacity and thickness', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
							<div id="tmf-marker-stroke-selected-color" class="tmf-object-selected-color"></div>
							<div class="tmf-settings-group-rhs-spacer">
							    <input name="tmf-marker-stroke-color" id="tmf-marker-stroke-color" type="text" class="tmf-marker-stroke-color" />
							</div>
							<div class="tmf-settings-group-rhs-spacer">
							    <select name="tmf-marker-stroke-opacity" id="tmf-marker-stroke-opacity" class="tmf-field-with-spaces" onchange="tmfSvgMarkerPropertyChanged()">
							    	<?php
							    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
							<div>
							    <select name="tmf-marker-stroke-weight" id="tmf-marker-stroke-weight" class="tmf-field-with-spaces" onchange="tmfSvgMarkerPropertyChanged()">
							    	<?php
							    	for ($x = 1; $x <= 12; $x += 1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
						</div>
					</div>
					<div class="tmf-settings-group" id="tmf-marker-png-anchor-settings">
		    			<div class="tmf-settings-group-lhs">
			    			<label for="tmf-marker-svg-anchor"><?php _e( 'Anchor', 'tmf_translation' )?></label>
			    		</div>
					    <div class="tmf-settings-group-rhs">
						    <div>
						    	<input class="tmf-form-input-field tmf-settings-group-rhs-spacer" type="number" name="tmf-marker-svg-anchor-x" id="tmf-marker-svg-anchor-x" onchange="tmfSvgMarkerPropertyChanged()" />
						    </div>
						    <div>
						        <input class="tmf-form-input-field" type="number" name="tmf-marker-svg-anchor-y" id="tmf-marker-svg-anchor-y" onchange="tmfSvgMarkerPropertyChanged()" />
						    </div>
						</div>
		    		</div>
				</div>

				<p class="tmf_subheading">
			    	<?php _e( 'Tool-tip', 'tmf_translation' )?>
			    </p>

				<div class="tmf-settings-group" id="tmf-marker-title">
					<div class="tmf-settings-group-lhs">
					    <?php _e( 'Tool-tip text', 'tmf_translation' )?>
					</div>
					<div class="tmf-settings-group-lhs">
						<textarea class="tmf-form-text-area" id="tmf-map-marker-title" onchange="tmfMarkerTitleTextChanged()"></textarea>
					</div>
				</div>
				<p class="tmf-form-helptext">
			    	<?php _e( 'Any text entered here will appear as a tool-tip when the mouse hovers over the marker.', 'tmf_translation' ); ?>
			    </p>

			    <p class="tmf_subheading">
			    	<?php _e( 'Info-window', 'tmf_translation' )?>
			    </p>

			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
					    <?php _e( 'Info-window text', 'tmf_translation' )?>
					</div>
					<div>
						<?php
						$content = '';
						$editor_id = 'tmf_mapmarker_infowindow_text';
						$settings = array(
							'textarea_rows' => '10'
						);
						wp_editor( $content, $editor_id, $settings ); ?>
					</div>
				</div>

				<p class="tmf-form-helptext" style="margin-top: 0;">
			    	<?php _e( 'Any text entered here will appear in an Info-window when the marker is clicked. You need to store or update the marker button to view the updated text. You can then click on the marker to see how it looks like.', 'tmf_translation'); ?>
			    </p>

			    <div class="tmf-settings-group">
		    		<div class="tmf-settings-group-lhs">
			        	<label for="tmf-marker-infowindow-width"><?php _e( 'Maximum Info-window width (px)', 'tmf_translation' )?></label>
				    </div>
				    <div class="tmf-settings-group-rhs">
				    	<input class="tmf-form-input-field" type="number" name="tmf-marker-infowindow-width" min="100" max="1000" step="1" id="tmf-marker-infowindow-width" value="" onchange="tmfSvgMarkerPropertyChanged()" />
				    </div>
				</div>

				<p class="tmf-form-helptext" style="margin-top: 0;">
			    	<?php _e( 'If you enter a value, this will be the maximum width of the Info-window. Leave blank for no maximum width.', 'tmf_translation'); ?>
			    </p>

		    	<div id="tmf-new-marker-buttons" class="tmf-buttons" style="display: none;">
			    	<input id="tmf-add-marker-button" class="tmf-button" type="button" value="<?php _e( 'Store new marker', 'tmf_translation' ) ?>" onclick="tmfAddMarker('add')" />
			    	<input id="tmf-cancel-add-marker-button" class="tmf-button" type="button" value="<?php _e( 'Cancel', 'tmf_translation' ) ?>" onclick="tmfCancelAddMarker()" />
			    </div>
			    <div id="tmf-existing-marker-buttons" class="tmf-buttons" style="display: none;">
			    	<input id="tmf-update-marker-button" class="tmf-button" type="button" value="<?php _e( 'Update marker', 'tmf_translation' ) ?>" onclick="tmfAddMarker('update')" />
			    	<input id="tmf-cancel-update-marker-button" class="tmf-button" type="button" value="<?php _e( 'Cancel', 'tmf_translation' ) ?>" onclick="tmfCancelUpdateMarker()" />
				    <input id="tmf-delete-marker-button" class="tmf-button" type="button" value="<?php _e( 'Delete marker', 'tmf_translation' ) ?>" onclick="tmfDeleteMarker()" />
				</div>
			</div>
		</div>

		<!-- 
			PAGE TAB: Circles
		-->
		<div id="tmf_circles" class="tmf_tabcontent" style="display:none;">
			<p class="tmf_subheading">
		    	<?php _e( 'Adding and editing circles', 'tmf_translation' )?>
		    </p>
		    <p class="tmf-form-helptext" id="tmf-create-marker-help-text">
		    	<?php _e( 'Add a circle by double-clicking on the map. Edit an existing circle by double-clicking on it.', 'tmf_translation' ); ?>
		    </p>
		    <div class="tmf-hidden"><!--div-->
			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
		        		<label for="tmf-map-circle-number"><?php _e( 'Circle number', 'tmf_translation' )?></label>
		        	</div>
		        	<div class="tmf-settings-group-rhs">
			        	<span id="tmf-map-circle-number"></span>
			        </div>
			    </div>
			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
			        	<label for="tmf-map-circle-name"><?php _e( 'Circle name', 'tmf_translation' )?></label>
			        </div>
				    <div class="tmf-settings-group-rhs">
			        	<input class="tmf-form-input-field" name="tmf-map-circle-name" id="tmf-map-circle-name"/>
			    	</div>
			    </div>
			</div>

		    <div id="tmf-add-circle-settings" style="display: none;">
		    	<p class="tmf_subheading">
			    	<?php _e( 'Circle appearance', 'tmf_translation' )?>
			    </p>
		    	<div id="tmf-circle-settings">
				   	<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
				        	<label for="tmf-circle-radius"><?php _e( 'Circle radius (m)', 'tmf_translation' )?></label>
					    </div>
					    <div class="tmf-settings-group-rhs">
					    	<input class="tmf-form-input-field" type="number" name="tmf-circle-radius" id="tmf-circle-radius" value="" onchange="tmfCircleGeneralPropertyChanged()"/>
					    </div>
					</div>
			    	<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
					    	<label for="tmf-circle-fill-color"><?php _e( 'Circle fill color and opacity', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
							<div id="tmf-circle-fill-selected-color" class="tmf-object-selected-color"></div>
							<div class="tmf-settings-group-rhs-spacer">
								<div id="tmf-circle-fill-color-container">
						    		<input name="tmf-circle-fill-color" id="tmf-circle-fill-color" type="text" class="tmf-circle-fill-color" value="" />
						    	</div>
							</div>
							<div>
							    <select name="tmf-circle-fill-opacity" id="tmf-circle-fill-opacity" onchange="tmfCircleGeneralPropertyChanged()">
							    	<?php
							    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?> 
								</select>
							</div>
						</div>
					</div>
					<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
						    <label for="tmf-circle-stroke-color" ><?php _e( 'Circle stroke color, opacity and thickness', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
							<div id="tmf-circle-stroke-selected-color" class="tmf-object-selected-color"></div>
							<div class="tmf-settings-group-rhs-spacer">
							    <input name="tmf-circle-stroke-color" id="tmf-circle-stroke-color" type="text" class="tmf-circle-stroke-color" />
							</div>
							<div class="tmf-settings-group-rhs-spacer">
							    <select name="tmf-circle-stroke-opacity" id="tmf-circle-stroke-opacity" class="tmf-field-with-spaces" onchange="tmfCircleGeneralPropertyChanged()">
							    	<?php
							    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
							<div>
							    <select name="tmf-circle-stroke-weight" id="tmf-circle-stroke-weight" class="tmf-field-with-spaces" onchange="tmfCircleGeneralPropertyChanged()">
							    	<?php
							    	for ($x = 1; $x <= 12; $x += 1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
						</div>
					</div>
				</div>

				<p class="tmf_subheading">
			    	<?php _e( 'Mouse hover', 'tmf_translation' )?>
			    </p>
				<div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
				    	<?php _e( 'Change appearance of circle when mouse hovers over circle', 'tmf_translation' )?>
					</div>
				    <div class="tmf-settings-group-rhs">
				        <label for="tmf-mouseover-is-active">
				        	<input type="checkbox" name="tmf-circle-mouseover" id="tmf-circle-mouseover" value="no" onchange="tmfCircleGeneralPropertyChanged()"/>
				        </label>
				    </div>
			    </div>
			    <div id="tmf-circle-mouseover-settings" style="display: none;">
					<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
					    	<label for="tmf-circle-mouseover-fill-color"><?php _e( 'Circle mouse hover fill color and opacity', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
							<div id="tmf-circle-mouseover-fill-selected-color" class="tmf-object-selected-color"></div>
							<div class="tmf-settings-group-rhs-spacer">
						    	<input name="tmf-circle-mouseover-fill-color" id="tmf-circle-mouseover-fill-color" type="text" class="tmf-circle-mouseover-fill-color" value="" />
							</div>
							<div>
							    <select name="tmf-circle-mouseover-fill-opacity" id="tmf-circle-mouseover-fill-opacity" onchange="tmfCircleGeneralPropertyChanged()">
							    	<?php
							    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?> 
								</select>
							</div>
						</div>
					</div>
					<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
						    <label for="tmf-circle-mouseover-stroke-color" ><?php _e( 'Circle mouse hover stroke color, opacity and thickness', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
							<div id="tmf-circle-mouseover-stroke-selected-color" class="tmf-object-selected-color"></div>
							<div class="tmf-settings-group-rhs-spacer">
							    <input name="tmf-circle-stroke-color" id="tmf-circle-mouseover-stroke-color" type="text" class="tmf-circle-mouseover-stroke-color" />
							</div>
							<div class="tmf-settings-group-rhs-spacer">
							    <select name="tmf-circle-mouseover-stroke-opacity" id="tmf-circle-mouseover-stroke-opacity" class="tmf-field-with-spaces" onchange="tmfCircleGeneralPropertyChanged()">
							    	<?php
							    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
							<div>
							    <select name="tmf-circle-mouseover-stroke-weight" id="tmf-circle-mouseover-stroke-weight" class="tmf-field-with-spaces" onchange="tmfCircleGeneralPropertyChanged()">
							    	<?php
							    	for ($x = 1; $x <= 12; $x += 1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
						</div>
					</div>
				</div>

			    <p class="tmf_subheading">
			    	<?php _e( 'Info-window', 'tmf_translation' )?>
			    </p>

			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
					    <?php _e( 'Info-window text', 'tmf_translation' )?>
					</div>
					<div>
						<?php
						$content = '';
						$editor_id = 'tmf_mapcircle_infowindow_text';
						$settings = array(
							'textarea_rows' => '10'
						);
						wp_editor( $content, $editor_id, $settings ); ?>
					</div>
				</div>

				<p class="tmf-form-helptext" style="margin-top: 0;">
			    	<?php _e( 'Any text entered here will appear in an Info-window when the circle is clicked. You need to store or update the circle to view the updated text. You can then click on the circle to see how it looks like.', 'tmf_translation'); ?>
			    </p>

			    <div class="tmf-settings-group">
		    		<div class="tmf-settings-group-lhs">
			        	<label for="tmf-circle-infowindow-width"><?php _e( 'Maximum Info-window width (px)', 'tmf_translation' )?></label>
				    </div>
				    <div class="tmf-settings-group-rhs">
				    	<input class="tmf-form-input-field" type="number" name="tmf-circle-infowindow-width" min="100" max="1000" step="1" id="tmf-circle-infowindow-width" value="" onchange="tmfCircleGeneralPropertyChanged()" />
				    </div>
				</div>

				<p class="tmf-form-helptext" style="margin-top: 0;">
			    	<?php _e( 'If you enter a value, this will be the maximum width of the Info-window. Leave blank for no maximum width.', 'tmf_translation'); ?>
			    </p>
				<div id="tmf-new-circle-buttons" class="tmf-buttons" style="display: none;">
			    	<input id="tmf-add-circle-button" class="tmf-button" type="button" value="<?php _e( 'Store new circle', 'tmf_translation' ) ?>" onclick="tmfAddCircle('add')" />
			    	<input id="tmf-cancel-add-circle-button" class="tmf-button" type="button" value="<?php _e( 'Cancel', 'tmf_translation' ) ?>" onclick="tmfCancelAddCircle()" />
			    </div>
			    <div id="tmf-existing-circle-buttons" class="tmf-buttons" style="display: none;">
			    	<input id="tmf-update-circle-button" class="tmf-button" type="button" value="<?php _e( 'Update circle', 'tmf_translation' ) ?>" onclick="tmfAddCircle('update')" />
			    	<input id="tmf-cancel-update-circle-button" class="tmf-button" type="button" value="<?php _e( 'Cancel', 'tmf_translation' ) ?>" onclick="tmfCancelUpdateCircle()" />
				    <input id="tmf-delete-circle-button" class="tmf-button" type="button" value="<?php _e( 'Delete circle', 'tmf_translation' ) ?>" onclick="tmfDeleteCircle()" />
				</div>
			</div>
		</div>

		<!-- 
			PAGE TAB: Polygons
		-->
		<div id="tmf_polygons" class="tmf_tabcontent" style="display:none;">
			<p class="tmf_subheading">
		    	<?php _e( 'Adding and editing polygons', 'tmf_translation' )?>
		    </p>
		    <p class="tmf-form-helptext" id="tmf-create-polygon-help-text">
		    	<?php _e( 'Double-click on the map to add a polygon and then single-click to add subsequent points. Edit an existing polygon by double-clicking on it.', 'tmf_translation' ); ?>
		    </p>
		    <div class="tmf-hidden">
			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
		        		<label for="tmf-map-polygon-number"><?php _e( 'Polygon number', 'tmf_translation' )?></label>
		        	</div>
		        	<div class="tmf-settings-group-rhs">
			        	<span id="tmf-map-polygon-number"></span>
			        </div>
			    </div>
			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
			        	<label for="tmf-map-polygon-name"><?php _e( 'Polygon name', 'tmf_translation' )?></label>
			        </div>
				    <div class="tmf-settings-group-rhs">
			        	<input class="tmf-form-input-field" name="tmf-map-polygon-name" id="tmf-map-polygon-name"/>
			    	</div>
			    </div>
			</div>

		    <div id="tmf-add-polygon-settings" style="display: none;">
		    	<p class="tmf_subheading">
			    	<?php _e( 'Polygon appearance', 'tmf_translation' )?>
			    </p>
		    	<div id="tmf-polygon-settings">
			    	<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
					    	<label for="tmf-polygon-fill-color"><?php _e( 'Polygon fill color and opacity', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
							<div id="tmf-polygon-fill-selected-color" class="tmf-object-selected-color"></div>
							<div class="tmf-settings-group-rhs-spacer">
						    	<input name="tmf-polygon-fill-color" id="tmf-polygon-fill-color" type="text" class="tmf-polygon-fill-color" value="" />
							</div>
							<div>
							    <select name="tmf-polygon-fill-opacity" id="tmf-polygon-fill-opacity" onchange="tmfPolygonGeneralPropertyChanged()">
							    	<?php
							    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?> 
								</select>
							</div>
						</div>
					</div>
					<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
						    <label for="tmf-polygon-stroke-color" ><?php _e( 'Polygon stroke color, opacity and thickness', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
							<div id="tmf-polygon-stroke-selected-color" class="tmf-object-selected-color"></div>
							<div class="tmf-settings-group-rhs-spacer">
							    <input name="tmf-polygon-stroke-color" id="tmf-polygon-stroke-color" type="text" class="tmf-polygon-stroke-color" />
							</div>
							<div class="tmf-settings-group-rhs-spacer">
							    <select name="tmf-polygon-stroke-opacity" id="tmf-polygon-stroke-opacity" class="tmf-field-with-spaces" onchange="tmfPolygonGeneralPropertyChanged()">
							    	<?php
							    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
							<div>
							    <select name="tmf-polygon-stroke-weight" id="tmf-polygon-stroke-weight" class="tmf-field-with-spaces" onchange="tmfPolygonGeneralPropertyChanged()">
							    	<?php
							    	for ($x = 1; $x <= 12; $x += 1) { ?>
							    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
						</div>
					</div>

					<p class="tmf_subheading">
				    	<?php _e( 'Mouse hover', 'tmf_translation' )?>
				    </p>
					<div class="tmf-settings-group">
						<div class="tmf-settings-group-lhs">
					    	<?php _e( 'Change color of polygon when mouse hovers over polygon', 'tmf_translation' )?>
						</div>
					    <div class="tmf-settings-group-rhs">
					        <label for="tmf-mouseover-is-active">
					        	<input type="checkbox" name="tmf-polygon-mouseover" id="tmf-polygon-mouseover" value="no" onchange="tmfPolygonGeneralPropertyChanged()"/>
					        </label>
					    </div>
				    </div>
				    <div id="tmf-polygon-mouseover-settings" style="display: none;">
						<div class="tmf-settings-group">
				    		<div class="tmf-settings-group-lhs">
						    	<label for="tmf-polygon-mouseover-fill-color"><?php _e( 'Polygon mouse hover fill color and opacity', 'tmf_translation' )?></label>
							</div>
							<div class="tmf-settings-group-rhs">
								<div id="tmf-polygon-mouseover-fill-selected-color" class="tmf-object-selected-color"></div>
								<div class="tmf-settings-group-rhs-spacer">
							    	<input name="tmf-polygon-mouseover-fill-color" id="tmf-polygon-mouseover-fill-color" type="text" class="tmf-polygon-mouseover-fill-color" value="" />
								</div>
								<div>
								    <select name="tmf-polygon-mouseover-fill-opacity" id="tmf-polygon-mouseover-fill-opacity" onchange="tmfPolygonGeneralPropertyChanged()">
								    	<?php
								    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
								    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
								    		</option>
										<?php
										}
										?> 
									</select>
								</div>
							</div>
						</div>
						<div class="tmf-settings-group">
				    		<div class="tmf-settings-group-lhs">
							    <label for="tmf-polygon-mouseover-stroke-color" ><?php _e( 'Polygon mouse hover stroke color, opacity and thickness', 'tmf_translation' )?></label>
							</div>
							<div class="tmf-settings-group-rhs">
								<div id="tmf-polygon-mouseover-stroke-selected-color" class="tmf-object-selected-color"></div>
								<div class="tmf-settings-group-rhs-spacer">
								    <input name="tmf-polygon-stroke-color" id="tmf-polygon-mouseover-stroke-color" type="text" class="tmf-polygon-mouseover-stroke-color" />
								</div>
								<div class="tmf-settings-group-rhs-spacer">
								    <select name="tmf-polygon-mouseover-stroke-opacity" id="tmf-polygon-mouseover-stroke-opacity" class="tmf-field-with-spaces" onchange="tmfPolygonGeneralPropertyChanged()">
								    	<?php
								    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
								    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
								    		</option>
										<?php
										}
										?>  
									</select>
								</div>
								<div>
								    <select name="tmf-polygon-mouseover-stroke-weight" id="tmf-polygon-mouseover-stroke-weight" class="tmf-field-with-spaces" onchange="tmfPolygonGeneralPropertyChanged()">
								    	<?php
								    	for ($x = 1; $x <= 12; $x += 1) { ?>
								    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
								    		</option>
										<?php
										}
										?>  
									</select>
								</div>
							</div>
						</div>
					</div>
				</div>

			    <p class="tmf_subheading">
			    	<?php _e( 'Info-window', 'tmf_translation' )?>
			    </p>

			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
					    <?php _e( 'Info-window text', 'tmf_translation' )?>
					</div>
					<div>
						<?php
						$content = '';
						$editor_id = 'tmf_mappolygon_infowindow_text';
						$settings = array(
							'textarea_rows' => '10'
						);
						wp_editor( $content, $editor_id, $settings ); ?>
					</div>
				</div>

				<p class="tmf-form-helptext" style="margin-top: 0;">
			    	<?php _e( 'Any text entered here will appear in an Info-window when the polygon is clicked. You need to store or update the polygon to view the updated text. You can then click on the polygon to see how it looks like.', 'tmf_translation'); ?>
			    </p>

			    <div class="tmf-settings-group">
		    		<div class="tmf-settings-group-lhs">
			        	<label for="tmf-polygon-infowindow-width"><?php _e( 'Maximum Info-window width (px)', 'tmf_translation' )?></label>
				    </div>
				    <div class="tmf-settings-group-rhs">
				    	<input class="tmf-form-input-field" type="number" name="tmf-polygon-infowindow-width" min="0" max="1000" step="1" id="tmf-polygon-infowindow-width" value="" onchange="tmfPolygonGeneralPropertyChanged()" />
				    </div>
				</div>

				<p class="tmf-form-helptext" style="margin-top: 0;">
			    	<?php _e( 'If you enter a value, this will be the maximum width of the Info-window. Leave blank for no maximum width.', 'tmf_translation'); ?>
			    </p>
				<div id="tmf-new-polygon-buttons" class="tmf-buttons" style="display: none;">
			    	<input id="tmf-add-polygon-button" class="tmf-button" type="button" value="<?php _e( 'Store new polygon', 'tmf_translation' ) ?>" onclick="tmfAddPolygon('add')" />
			    	<input id="tmf-cancel-add-polygon-button" class="tmf-button" type="button" value="<?php _e( 'Cancel', 'tmf_translation' ) ?>" onclick="tmfCancelAddPolygon()" />
			    </div>
			    <div id="tmf-existing-polygon-buttons" class="tmf-buttons" style="display: none;">
			    	<input id="tmf-update-polygon-button" class="tmf-button" type="button" value="<?php _e( 'Update polygon', 'tmf_translation' ) ?>" onclick="tmfAddPolygon('update')" />
			    	<input id="tmf-cancel-update-polygon-button" class="tmf-button" type="button" value="<?php _e( 'Cancel', 'tmf_translation' ) ?>" onclick="tmfCancelUpdatePolygon()" />
				    <input id="tmf-delete-polygon-button" class="tmf-button" type="button" value="<?php _e( 'Delete polygon', 'tmf_translation' ) ?>" onclick="tmfDeletePolygon()" />
				</div>
			</div>
		</div>

		<!-- 
			PAGE TAB: Polylines
		-->
		<div id="tmf_polylines" class="tmf_tabcontent" style="display:none;">
		    <div class="tmf-hidden">
				<div class="tmf-settings-group">
				    <div class="tmf-settings-group-lhs">
				    	<label for="tmf-polyline-file-contents"><?php _e( 'File contents', 'tmf_translation' )?></label>
				    </div>
				    <div class="tmf-settings-group-rhs">
				    	<input class="tmf-form-input-field" id="tmf-polyline-file-contents" />
				    </div>
				</div>
			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
		        		<label for="tmf-map-polyline-number"><?php _e( 'Polyline number', 'tmf_translation' )?></label>
		        	</div>
		        	<div class="tmf-settings-group-rhs">
			        	<span id="tmf-map-polyline-number"></span>
			        </div>
			    </div>
			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
			        	<label for="tmf-map-polyline-name"><?php _e( 'Polyline name', 'tmf_translation' )?></label>
			        </div>
				    <div class="tmf-settings-group-rhs">
			        	<input class="tmf-form-input-field" name="tmf-map-polyline-name" id="tmf-map-polyline-name"/>
			    	</div>
			    </div>
			    <div class="tmf-settings-group">
				    <div class="tmf-settings-group-lhs">
				    	<label for="tmf-polyline-file-url-text"><?php _e( 'Currently selected file', 'tmf_translation' )?></label>
				    </div>
				    <div class="tmf-settings-group-rhs">
				    	<input class="tmf-form-input-field" id="tmf-polyline-file-url-text" />
				    </div>
				</div>
			</div>

			<p id="tmf-polyline-creation-text" class="tmf_subheading">
		    	<?php _e( 'Adding and editing polylines', 'tmf_translation' )?>
		    </p>
		    <div id="tmf-poyline-creation-method" class="tmf-settings-group">
				<div class="tmf-settings-group-lhs">
				    <?php _e( 'How do you want to create a polyline?', 'tmf_translation' )?>
				</div>
			    <div class="tmf-row-content">
			    	<label for="tmf-poyline-creation-method-create">
			            <input type="radio" name="tmf-poyline-creation-method" id="tmf-poyline-creation-method-create" value="0" onchange="tmfMapPolylineCreationMethod()" checked>
			            <?php _e( 'By clicking on the map', 'tmf_translation' )?>
			        </label>
			        <label for="tmf-poyline-creation-method-file">
			            <input type="radio" name="tmf-poyline-creation-method" id="tmf-poyline-creation-method-file" value="1" onchange="tmfMapPolylineCreationMethod()">
			            <?php _e( 'From my own file', 'tmf_translation' )?>
			        </label>
			    </div>
			</div>

			<p class="tmf-form-helptext" id="tmf-create-polyline-help-text">
			    <?php _e( 'Double-click on the map to add a polyline and then single-click to add subsequent nodes. Edit an existing polyline by double-clicking on it.', 'tmf_translation' ); ?>
	    	</p>

			<div id="tmf-poyline-creation-method-file-button" class="tmf-settings-group" style="display: none;">
				<div class="tmf-settings-group-lhs">
					<label for="tmf-polyline-file-url"><?php _e( 'Select the file containing the polyline', 'tmf_translation' )?></label>
			    </div>
			    <div class="tmf-settings-group-rhs">
				    <input id="tmf-polyline-file-url-button" type="button" value="Select file" />
	   			    <input id="tmf-polyline-file-url" type="hidden" name="tmf-polyline-file-url" />
	   			</div>
			</div>

		    <div id="tmf-add-polyline-settings" style="display: none;">
		    	<p class="tmf_subheading">
			    	<?php _e( 'Polyline appearance', 'tmf_translation' )?>
			    </p>
			    <div class="tmf-settings-group">
		    		<div class="tmf-settings-group-lhs">
					    <label for="tmf-polyline-stroke-color" ><?php _e( 'Polyline stroke color, opacity and thickness', 'tmf_translation' )?></label>
					</div>
					<div class="tmf-settings-group-rhs">
						<div id="tmf-polyline-stroke-selected-color" class="tmf-object-selected-color"></div>
						<div class="tmf-settings-group-rhs-spacer">
						    <input name="tmf-polyline-stroke-color" type="text" class="tmf-polyline-stroke-color" />
						    <input id="tmf-polyline-stroke-color" type="hidden" />
						</div>
						<div class="tmf-settings-group-rhs-spacer">
						    <select name="tmf-polyline-stroke-opacity" id="tmf-polyline-stroke-opacity" class="tmf-field-with-spaces" onchange="tmfPolylinePropertyChanged()">
						    	<?php
						    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
						    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
						    		</option>
								<?php
								}
								?>  
							</select>
						</div>
						<div>
						    <select name="tmf-polyline-stroke-weight" id="tmf-polyline-stroke-weight" class="tmf-field-with-spaces" onchange="tmfPolylinePropertyChanged()">
						    	<?php
						    	for ($x = 1; $x <= 12; $x += 1) { ?>
						    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
						    		</option>
								<?php
								}
								?>  
							</select>
						</div>
					</div>
				</div>

				<!-- Polyline symbols-->
				<p class="tmf_subheading">
			    	<?php _e( 'Polyline symbols', 'tmf_translation' )?>
			    </p>
				<div class="tmf-settings-group">
		    		<div class="tmf-settings-group-lhs">
				    	<label for="tmf-polyline-symbol"><?php _e( 'Polyline symbols type', 'tmf_translation' )?></label>
					</div>
					<div class="tmf-settings-group-rhs">
					    <select name="tmf-polyline-symbol-type" id="tmf-polyline-symbol-type" onchange="tmfPolylinePropertyChanged()">
					    	<option value="none"><?php _e( 'None', 'tmf_translation' )?></option>
					    	<option value="3"><?php _e( 'Backward closed arrow', 'tmf_translation' )?></option>
					    	<option value="4"><?php _e( 'Backward open arrow', 'tmf_translation' )?></option>
					    	<option value="1"><?php _e( 'Forward closed arrow', 'tmf_translation' )?></option>
					    	<option value="2"><?php _e( 'Forward open arrow', 'tmf_translation' )?></option>
					    	<option value="0"><?php _e( 'Circle', 'tmf_translation' )?></option>
						</select>
					</div>
				</div>
				<div id ="tmf-polyline-symbol-settings" style="display: none;">
					<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
						    <label for="tmf-polyline-symbol-scale" ><?php _e( 'Polyline symbols scale', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
							<div class="tmf-settings-group-rhs-spacer">
							    <select name="tmf-polyline-symbol-scale" id="tmf-polyline-symbol-scale" class="tmf-field-with-spaces" onchange="tmfPolylinePropertyChanged()">
							    	<?php
							    	for ($x = 1; $x <= 20; $x += 1) { ?>
							    		<option value="<?php echo $x; ?>"<?php if ($x == 3) { echo ' selected';} ?>><?php echo $x;?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
						</div>
					</div>

					<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
					    	<label for="tmf-polyline-symbol-fill-color"><?php _e( 'Polyline symbols fill color and opacity', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
							<div id="tmf-polyline-symbol-fill-selected-color" class="tmf-object-selected-color" style="background-color: #ff0000"></div>
							<div class="tmf-settings-group-rhs-spacer">
						    	<input name="tmf-polyline-symbol-fill-color" type="text" class="tmf-polyline-symbol-fill-color" value="#ff0000" />
						    	<input id="tmf-polyline-symbol-fill-color" type="hidden" />
							</div>
							<div>
							    <select name="tmf-polyline-symbol-fill-opacity" id="tmf-polyline-symbol-fill-opacity" onchange="tmfPolylinePropertyChanged()">
							    	<?php
							    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
							    		<option value="<?php echo $x; ?>"<?php if ($x > 0.9) { echo ' selected';} ?>><?php echo $x; ?>
							    		</option>
									<?php
									}
									?> 
								</select>
							</div>
						</div>
					</div>
					<div class="tmf-settings-group">
			    		<div class="tmf-settings-group-lhs">
						    <label for="tmf-polyline-symbol-stroke-color" ><?php _e( 'Polyline symbols stroke color, opacity and thickness', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-settings-group-rhs">
							<div id="tmf-polyline-symbol-stroke-selected-color" class="tmf-object-selected-color" style="background-color: #ff0000"></div>
							<div class="tmf-settings-group-rhs-spacer">
							    <input name="tmf-polyline-symbol-stroke-color" type="text" class="tmf-polyline-symbol-stroke-color" />
							    <input id="tmf-polyline-symbol-stroke-color" type="hidden" />
							</div>
							<div class="tmf-settings-group-rhs-spacer">
							    <select name="tmf-polyline-symbol-stroke-opacity" id="tmf-polyline-symbol-stroke-opacity" class="tmf-field-with-spaces" onchange="tmfPolylinePropertyChanged()">
							    	<?php
							    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
							    		<option value="<?php echo $x; ?>"<?php if ($x > 0.9) { echo ' selected';} ?>><?php echo $x;?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
							<div>
							    <select name="tmf-polyline-symbol-stroke-weight" id="tmf-polyline-symbol-stroke-weight" class="tmf-field-with-spaces" onchange="tmfPolylinePropertyChanged()">
							    	<?php
							    	for ($x = 1; $x <= 12; $x += 1) { ?>
							    		<option value="<?php echo $x; ?>"<?php if ($x == 3) { echo ' selected';} ?>><?php echo $x; ?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
						</div>
					</div>

					<div class="tmf-settings-group">
						<div class="tmf-settings-group-lhs">
					    	<label for="tmf-polyline-symbol-offset-repeat"><?php _e( 'Polyline symbols offset', 'tmf_translation' )?></label>
						</div>
						<div class="tmf-row-content">
							<div class="tmf-settings-group-rhs-spacer">
						    	<input class="tmf-form-input-field" type="number" name="tmf-polyline-symbol-offset-percentage-value" id="tmf-polyline-symbol-offset-percentage-value" value="20" onchange="tmfPolylinePropertyChanged()" />
						    </div>	
						    <div class="tmf-settings-group-rhs-spacer">
						    	<input class="tmf-form-input-field" type="number" name="tmf-polyline-symbol-offset-pixel-value" id="tmf-polyline-symbol-offset-pixel-value" value="50" style="display: none;" onchange="tmfPolylinePropertyChanged()" />
						    </div>		
						    <label for="tmf-polyline-symbol-percentage" class="tmf-inline-block">
					            <input type="radio" name="tmf-polyline-symbol-offset" id="tmf-polyline-symbol-offset-percentage-radio" value="0" onchange="tmfPolylinePropertyChanged()" checked />
					            <?php _e( 'Percentage', 'tmf_translation' )?>
					        </label>
					        <label for="tmf-polyline-symbol-offset-pixel-radio" class="tmf-inline-block">
					            <input type="radio" name="tmf-polyline-symbol-offset" id="tmf-polyline-symbol-offset-pixel-radio" value="1" onchange="tmfPolylinePropertyChanged()" />
					            <?php _e( 'Pixels', 'tmf_translation' )?>
					        </label>
					    </div>
					</div>
					<div class="tmf-settings-group">
					    <div class="tmf-settings-group-lhs">
					    	<label for="tmf-polyline-symbol-offset-repeat"><?php _e( 'Polyline symbols repeat', 'tmf_translation' )?></label>
						</div>
					    <div class="tmf-row-content">
					    	<div class="tmf-settings-group-rhs-spacer">
						    	<input class="tmf-form-input-field" type="number" name="tmf-polyline-symbol-repeat-percentage-value" id="tmf-polyline-symbol-repeat-percentage-value"value="20" onchange="tmfPolylinePropertyChanged() "/>
						    </div>
						    <div class="tmf-settings-group-rhs-spacer">
						    	<input class="tmf-form-input-field" type="number" name="tmf-polyline-symbol-repeat-pixel-value" id="tmf-polyline-symbol-repeat-pixel-value" style="display: none;"value="50" onchange="tmfPolylinePropertyChanged()" />
						    </div>
						    <label for="tmf-polyline-symbol-percentage" class="tmf-inline-block">
					            <input type="radio" name="tmf-polyline-symbol-repeat" id="tmf-polyline-symbol-repeat-percentage-radio" value="" onchange="tmfPolylinePropertyChanged()" checked>
					            <?php _e( 'Percentage', 'tmf_translation' )?>
					        </label>
					        <label for="tmf-polyline-symbol-repeat-pixel-radio" class="tmf-inline-block">
					            <input type="radio" name="tmf-polyline-symbol-repeat" id="tmf-polyline-symbol-repeat-pixel-radio" value="" onchange="tmfPolylinePropertyChanged()" />
					            <?php _e( 'Pixels', 'tmf_translation' )?>
					        </label>
					    </div>
					</div>
				</div>

				<!-- Polyline mouse hover-->
		    	<div id="tmf-polyline-settings">
		    		<p class="tmf_subheading">
				    	<?php _e( 'Mouse hover', 'tmf_translation' )?>
				    </p>
					<div class="tmf-settings-group">
						<div class="tmf-settings-group-lhs">
					    	<?php _e( 'Change color and symbols of polyline when mouse hovers over polyline', 'tmf_translation' )?>
						</div>
					    <div class="tmf-settings-group-rhs">
					        <label for="tmf-mouseover-is-active">
					        	<input type="checkbox" name="tmf-polyline-mouseover" id="tmf-polyline-mouseover" value="no" onchange="tmfPolylinePropertyChanged()"/>
					        </label>
					    </div>
				    </div>

			    	<div class="tmf-settings-group" id="tmf-polyline-mouseover-settings" style="display: none;">
			    		<div class="tmf-settings-group">
				    		<div class="tmf-settings-group-lhs">
							    <label for="tmf-polyline-mouseover-stroke-color" ><?php _e( 'Polyline mouse hover stroke color, opacity and thickness', 'tmf_translation' )?></label>
							</div>
							<div class="tmf-settings-group-rhs">
								<div id="tmf-polyline-mouseover-stroke-selected-color" class="tmf-object-selected-color"></div>
								<div class="tmf-settings-group-rhs-spacer">
								    <input name="tmf-polyline-mouseover-stroke-color" type="text" class="tmf-polyline-mouseover-stroke-color" />
								    <input id="tmf-polyline-mouseover-stroke-color" type="hidden" />
								</div>
								<div class="tmf-settings-group-rhs-spacer">
								    <select name="tmf-polyline-mouseover-stroke-opacity" id="tmf-polyline-mouseover-stroke-opacity" class="tmf-field-with-spaces" onchange="tmfPolylinePropertyChanged()">
								    	<?php
								    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
								    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
								    		</option>
										<?php
										}
										?>  
									</select>
								</div>
								<div>
								    <select name="tmf-polyline-mouseover-stroke-weight" id="tmf-polyline-mouseover-stroke-weight" class="tmf-field-with-spaces" onchange="tmfPolylinePropertyChanged()">
								    	<?php
								    	for ($x = 1; $x <= 12; $x += 1) { ?>
								    		<option value="<?php echo $x; ?>"><?php echo $x; ?>
								    		</option>
										<?php
										}
										?>  
									</select>
								</div>
							</div>
						</div>
			    		<div class="tmf-settings-group">
				    		<div class="tmf-settings-group-lhs">
						    	<label for="tmf-polyline-mouseover-symbol"><?php _e( 'Polyline mouse hover symbol', 'tmf_translation' )?></label>
							</div>
							<div class="tmf-settings-group-rhs">
							    <select name="tmf-polyline-mouseover-symbol-type" id="tmf-polyline-mouseover-symbol-type" onchange="tmfPolylinePropertyChanged()">
							    	<option value="none"><?php _e( 'None', 'tmf_translation' )?></option>
							    	<option value="3"><?php _e( 'Backward closed arrow', 'tmf_translation' )?></option>
							    	<option value="4"><?php _e( 'Backward open arrow', 'tmf_translation' )?></option>
							    	<option value="1"><?php _e( 'Forward closed arrow', 'tmf_translation' )?></option>
							    	<option value="2"><?php _e( 'Forward open arrow', 'tmf_translation' )?></option>
							    	<option value="0"><?php _e( 'Circle', 'tmf_translation' )?></option>
								</select>
							</div>
						</div>

						<div class="tmf-settings-group" id="tmf-polyline-mouseover-symbol-settings" style="display: none;">
							<div class="tmf-settings-group">
					    		<div class="tmf-settings-group-lhs">
								    <label for="tmf-polyline-mouseover-symbol-scale" ><?php _e( 'Polyline mouse hover symbol scale', 'tmf_translation' )?></label>
								</div>
								<div class="tmf-settings-group-rhs">
									<div class="tmf-settings-group-rhs-spacer">
									    <select name="tmf-polyline-mouseover-symbol-scale" id="tmf-polyline-mouseover-symbol-scale" class="tmf-field-with-spaces" onchange="tmfPolylinePropertyChanged()">
									    	<?php
									    	for ($x = 1; $x <= 20; $x += 1) { ?>
									    		<option value="<?php echo $x; ?>"<?php if ($x == 3) { echo ' selected';} ?>><?php echo $x;?>
									    		</option>
											<?php
											}
											?>  
										</select>
									</div>
								</div>
							</div>
							<div class="tmf-settings-group">
					    		<div class="tmf-settings-group-lhs">
							    	<label for="tmf-polyline-mouseover-symbol-fill-color"><?php _e( 'Polyline mouse hover symbol fill color and opacity', 'tmf_translation' )?></label>
								</div>
								<div class="tmf-settings-group-rhs">
									<div id="tmf-polyline-mouseover-symbol-fill-selected-color" class="tmf-object-selected-color"></div>
									<div class="tmf-settings-group-rhs-spacer">
								    	<input name="tmf-polyline-mouseover-symbol-fill-color" type="text" class="tmf-polyline-mouseover-symbol-fill-color" />
								    	<input id="tmf-polyline-mouseover-symbol-fill-color" type="hidden" />
									</div>
									<div>
									    <select name="tmf-polyline-mouseover-symbol-fill-opacity" id="tmf-polyline-mouseover-symbol-fill-opacity" onchange="tmfPolylinePropertyChanged()">
									    	<?php
									    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
									    		<option value="<?php echo $x; ?>"<?php if ($x > 0.9) { echo ' selected';} ?>><?php echo $x; ?>
									    		</option>
											<?php
											}
											?> 
										</select>
									</div>
								</div>
							</div>
							<div class="tmf-settings-group">
					    		<div class="tmf-settings-group-lhs">
								    <label for="tmf-polyline-mouseover-symbol-stroke-color" ><?php _e( 'Polyline mouse hover symbol stroke color, opacity and thickness', 'tmf_translation' )?></label>
								</div>
								<div class="tmf-settings-group-rhs">
									<div id="tmf-polyline-mouseover-symbol-stroke-selected-color" class="tmf-object-selected-color"></div>
									<div class="tmf-settings-group-rhs-spacer">
									    <input name="tmf-polyline-mouseover-symbol-stroke-color" type="text" class="tmf-polyline-mouseover-symbol-stroke-color" />
									    <input id="tmf-polyline-mouseover-symbol-stroke-color" type="hidden" />
									</div>
									<div class="tmf-settings-group-rhs-spacer">
									    <select name="tmf-polyline-mouseover-symbol-stroke-opacity" id="tmf-polyline-mouseover-symbol-stroke-opacity" class="tmf-field-with-spaces" onchange="tmfPolylinePropertyChanged()">
									    	<?php
									    	for ($x = 0; $x <= 1; $x += 0.1) { ?>
									    		<option value="<?php echo $x; ?>"<?php if ($x > 0.9) { echo ' selected';} ?>><?php echo $x;?>
									    		</option>
											<?php
											}
											?>  
										</select>
									</div>
									<div>
									    <select name="tmf-polyline-mouseover-symbol-stroke-weight" id="tmf-polyline-mouseover-symbol-stroke-weight" class="tmf-field-with-spaces" onchange="tmfPolylinePropertyChanged()">
									    	<?php
									    	for ($x = 1; $x <= 12; $x += 1) { ?>
									    		<option value="<?php echo $x; ?>"<?php if ($x == 3) { echo ' selected';} ?>><?php echo $x; ?>
									    		</option>
											<?php
											}
											?>  
										</select>
									</div>
								</div>
							</div>
						
							<div class="tmf-settings-group">
								<div class="tmf-settings-group-lhs">
							    	<label for="tmf-polyline-mouseover-symbol-offset-repeat"><?php _e( 'Polyline mouse hover symbols offset', 'tmf_translation' )?></label>
								</div>
								<div class="tmf-row-content">
									<div class="tmf-settings-group-rhs-spacer">
								    	<input class="tmf-form-input-field" type="number" name="tmf-polyline-mouseover-symbol-offset-percentage-value" id="tmf-polyline-mouseover-symbol-offset-percentage-value" value="20" onchange="tmfPolylinePropertyChanged()" />
								    </div>	
								    <div class="tmf-settings-group-rhs-spacer">
								    	<input class="tmf-form-input-field" type="number" name="tmf-polyline-mouseover-symbol-offset-pixel-value" id="tmf-polyline-mouseover-symbol-offset-pixel-value" value="50" style="display: none;" onchange="tmfPolylinePropertyChanged()" />
								    </div>		
								    <label for="tmf-polyline-mouseover-symbol-percentage" class="tmf-inline-block">
							            <input type="radio" name="tmf-polyline-mouseover-symbol-offset" id="tmf-polyline-mouseover-symbol-offset-percentage-radio" onchange="tmfPolylinePropertyChanged()" checked>
							            <?php _e( 'Percentage', 'tmf_translation' )?>
							        </label>
							        <label for="tmf-polyline-mouseover-symbol-offset-pixel-radio" class="tmf-inline-block">
							            <input type="radio" name="tmf-polyline-mouseover-symbol-offset" id="tmf-polyline-mouseover-symbol-offset-pixel-radio" onchange="tmfPolylinePropertyChanged()">
							            <?php _e( 'Pixels', 'tmf_translation' )?>
							        </label>
							    </div>
							</div>
							<div class="tmf-settings-group">
							    <div class="tmf-settings-group-lhs">
							    	<label for="tmf-polyline-mouseover-symbol-offset-repeat"><?php _e( 'Polyline mouse hover symbols repeat', 'tmf_translation' )?></label>
								</div>
							    <div class="tmf-row-content">
							    	<div class="tmf-settings-group-rhs-spacer">
								    	<input class="tmf-form-input-field" type="number" name="tmf-polyline-mouseover-symbol-repeat-percentage-value" id="tmf-polyline-mouseover-symbol-repeat-percentage-value"value="20" />
								    </div>
								    <div class="tmf-settings-group-rhs-spacer">
								    	<input class="tmf-form-input-field" type="number" name="tmf-polyline-mouseover-symbol-repeat-pixel-value" id="tmf-polyline-mouseover-symbol-repeat-pixel-value" style="display: none;"value="50" />
								    </div>
								    <label for="tmf-polyline-mouseover-symbol-percentage" class="tmf-inline-block">
							            <input type="radio" name="tmf-polyline-mouseover-symbol-repeat" id="tmf-polyline-mouseover-symbol-repeat-percentage-radio" value="" onchange="tmfPolylinePropertyChanged()" checked>
							            <?php _e( 'Percentage', 'tmf_translation' )?>
							        </label>
							        <label for="tmf-polyline-mouseover-symbol-repeat-pixel-radio" class="tmf-inline-block">
							            <input type="radio" name="tmf-polyline-mouseover-symbol-repeat" id="tmf-polyline-mouseover-symbol-repeat-pixel-radio" value="" onchange="tmfPolylinePropertyChanged()" />
							            <?php _e( 'Pixels', 'tmf_translation' )?>
							        </label>
							    </div>
							</div>
						</div>
					</div>
				</div>

			    <p class="tmf_subheading">
			    	<?php _e( 'Info-window', 'tmf_translation' )?>
			    </p>

			    <div class="tmf-settings-group">
					<div class="tmf-settings-group-lhs">
					    <?php _e( 'Info-window text', 'tmf_translation' )?>
					</div>
					<div>
						<?php
						$content = '';
						$editor_id = 'tmf_mappolyline_infowindow_text';
						$settings = array(
							'textarea_rows' => '10'
						);
						wp_editor( $content, $editor_id, $settings ); ?>
					</div>
				</div>

				<p class="tmf-form-helptext" style="margin-top: 0;">
			    	<?php _e( 'Any text entered here will appear in an Info-window when the polyline is clicked. You need to store or update the poyline to view the updated text. You can then click on the polyline to see how it looks like.', 'tmf_translation'); ?>
			    </p>

			    <div class="tmf-settings-group">
		    		<div class="tmf-settings-group-lhs">
			        	<label for="tmf-polyline-infowindow-width"><?php _e( 'Maximum Info-window width (px)', 'tmf_translation' )?></label>
				    </div>
				    <div class="tmf-settings-group-rhs">
				    	<input class="tmf-form-input-field" type="number" name="tmf-polyline-infowindow-width" min="0" max="1000" step="1" id="tmf-polyline-infowindow-width" value="" onchange="tmfPolylinePropertyChanged()" />
				    </div>
				</div>

				<p class="tmf-form-helptext" style="margin-top: 0;">
			    	<?php _e( 'If you enter a value, this will be the maximum width of the Info-window. Leave blank for no maximum width.', 'tmf_translation'); ?>
			    </p>

				<!-- Polyline elevation chart settings -->
				<p class="tmf_subheading">
			    	<?php _e( 'Polyline elevation chart settings', 'tmf_translation' )?>
			    </p>
			    <div class="tmf-settings-group">
			    	<div class="tmf-settings-group-lhs">
					    <?php _e( 'Show elevation chart of the polyline', 'tmf_translation' )?>
					</div>
					<div class="tmf-settings-group-rhs">
				        <label for="tmf-show-elevation-chart">
				        	<input type="checkbox" name="tmf-show-elevation-chart" id="tmf-show-elevation-chart" onchange="tmfIsPolylineChartSelected()" value="no" />
				        </label>
				    </div>
			    </div>

			    <div id="tmf-chart-settings" style="display: none;">
					<div class="tmf-settings-group">
						<div class="tmf-settings-group-lhs">
					    	<label for="tmf-chart-color"><?php _e( 'Chart line color & thickness', 'tmf_translation' )?></label>
					    </div>
					    <div id="tmf-chart-selected-color" class="tmf-object-selected-color"></div>
					    <div class="tmf-settings-group-rhs">
						    <div>
						    	<input name="tmf-chart-color" type="text" class="tmf-chart-color" />
						    	<input id="tmf-chart-color" type="hidden" />
						    </div>
						    <div>
							    <select name="tmf-chart-strokeweight" id="tmf-chart-strokeweight" class="tmf-field-with-spaces" onchange="tmfPolylineChartSettingsChanged()">
							    	<?php
							    	for ($x = 0; $x <= 12; $x += 1) { ?>
							    		<option value="<?php echo $x; ?>"<?php if ($x == 3) { echo ' selected';} ?>><?php echo $x;?>
							    		</option>
									<?php
									}
									?>  
								</select>
							</div>
						</div>
					</div>

					<div class="tmf-settings-group" id="tmf-chart-height-settings">
						<div class="tmf-settings-group-lhs">
						    <?php _e( 'Height of the chart\'s vertical axis', 'tmf_translation' )?>
						</div>
						<div class="tmf-settings-group-rhs" style="display: block;">
					        <label for="tmf-chart-vaxis"></label>
					        <select name="tmf-chart-vaxis" id="tmf-chart-vaxis" onchange="tmfIsPolylineChartHeightAutoAdjusted()">
					        	<option value="adjust" selected><?php _e( 'Adjust depending on height difference', 'tmf_translation' )?></option>;
								<option value="fixed" selected><?php _e( 'Fixed height', 'tmf_translation' )?></option>
					        </select>
					    </div>
				    </div>

				    <div class="tmf-settings-group" id="tmf-chart-height-adjust-settings" style="display: none;">
						<div class="tmf-settings-group-lhs">
					        <label for="tmf-chart-min-max-height"><?php _e( 'Chart min and max height (pixels)', 'tmf_translation' )?></label>
					    </div>
					    <div class="tmf-settings-group-rhs">
					        <input class="tmf-form-input-field" type="number" name="tmf-chart-min-height" id="tmf-chart-min-height" value="200" onchange="tmfIsPolylineChartHeightAutoAdjusted()" />
					        <input class="tmf-form-input-field tmf-field-with-spaces" type="number" name="tmf-chart-max-height" id="tmf-chart-max-height" value="600" onchange="tmfIsPolylineChartHeightAutoAdjusted()" />
						</div>
				    </div>
				    <div class="tmf-settings-group" id="tmf-chart-height-fixed-settings">
					    <div class="tmf-settings-group-lhs">
					        <label for="tmf-chart-fixed-height"><?php _e( 'Chart height (pixels)', 'tmf_translation' )?></label>
					    </div>
					    <div class="tmf-settings-group-rhs">
						    <input class="tmf-form-input-field" type="number" name="tmf-chart-fixed-height" id="tmf-chart-fixed-height" value="400" onchange="tmfIsPolylineChartHeightAutoAdjusted()" />
						</div>
					</div>
					<div id="tmf-update-polyline-height" class="tmf-buttons">
				    	<input id="tmf-add-polyline-button" class="tmf-button" type="button" value="<?php _e( 'Update polyline heights', 'tmf_translation' ) ?>" onclick="tmfUpdatePolylineHeights()" />
				    </div>

				    <div class="tmf-settings-group" id="tmf-chart-meta-data">
						<div class="tmf-settings-group-lhs">
						    <?php _e( 'Show polyline meta-data', 'tmf_translation' )?>
						</div>
						<div class="tmf-settings-group-rhs" style="display: block;">
					        <label for="tmf-show-chart-meta-data">
					        	<input type="checkbox" name="tmf-show-chart-meta-data" id="tmf-show-chart-meta-data" onchange="tmfDisplayPolylineMetaData()" />
					        </label>
					    </div>
				    </div>
				</div>

				<div id="tmf-new-polyline-buttons" class="tmf-buttons" style="display: none;">
			    	<input id="tmf-add-polyline-button" class="tmf-button" type="button" value="<?php _e( 'Store new polyline', 'tmf_translation' ) ?>" onclick="tmfAddPolyline('add')" />
			    	<input id="tmf-cancel-add-polyline-button" class="tmf-button" type="button" value="<?php _e( 'Cancel', 'tmf_translation' ) ?>" onclick="tmfCancelAddPolyline()" />
			    </div>
			    <div id="tmf-existing-polyline-buttons" class="tmf-buttons" style="display: none;">
			    	<input id="tmf-update-polyline-button" class="tmf-button" type="button" value="<?php _e( 'Update polyline', 'tmf_translation' ) ?>" onclick="tmfAddPolyline('update')" />
			    	<input id="tmf-cancel-update-polyline-button" class="tmf-button" type="button" value="<?php _e( 'Cancel', 'tmf_translation' ) ?>" onclick="tmfCancelUpdatePolyline()" />
				    <input id="tmf-delete-polyline-button" class="tmf-button" type="button" value="<?php _e( 'Delete polyline', 'tmf_translation' ) ?>" onclick="tmfDeletePolyline()" />
				</div>
			</div>
		</div>

		<!-- Sample map-->
		<p class="tmf_subheading">
			<?php _e( 'Example map', 'tmf_translation' )?>
	    </p>
	    <p class="tmf-form-helptext">
	    	<?php esc_html_e( 'This is how your map will look.', 'tmf_translation' )?>
	    </p>

	    <div id="tmf-map-container-backend">
		    <?php echo tmf_display_map($tmf_post_id); ?>
		</div>

		<br><br>
		<p class="tmf-form-helptext" style="display: none;">
	    	<?php _e( 'The meta-data is wrapped in 3 divs. All data is wrapped in the "tmf-meta-data" class. The left hand column is wrapped in the "tmf-meta-data-column-one" class. The right hand column is wrapped in the "tmf-meta-data-column-two" class. You can change the style of the meta-data by editing the css settings of these classes.', 'tmf_translation' )?>
	    </p>
	</div>
	<?php
}

/**
 * Saves the custom meta input
 */
function tmf_meta_save( $post_id ) {
    $tmf_is_autosave = wp_is_post_autosave( $post_id );
    $tmf_is_revision = wp_is_post_revision( $post_id );
    $tmf_is_valid_nonce = ( isset( $_POST[ 'tmf_nonce' ] ) && wp_verify_nonce( $_POST[ 'tmf_nonce' ], basename( __FILE__ ) ) ) ? 'true' : 'false';

    $tmf_allowed_html = array();

    if( $tmf_is_autosave || $tmf_is_revision || !$tmf_is_valid_nonce ) {
        return;
    }

	if( isset( $_POST[ 'tmf-map-the-basics-object' ] ) ) {
	    update_post_meta( $post_id, 'tmf-map-the-basics-object', sanitize_text_field( $_POST[ 'tmf-map-the-basics-object' ] ) );
	}

	if( isset( $_POST[ 'tmf-map-placecard-object' ] ) ) {
	    update_post_meta( $post_id, 'tmf-map-placecard-object', wp_kses( $_POST[ 'tmf-map-placecard-object' ], $tmf_allowed_html ));
	}

	if( isset( $_POST[ 'tmf-map-marker-array' ] ) ) {
	    update_post_meta( $post_id, 'tmf-map-marker-array', wp_kses_post( $_POST[ 'tmf-map-marker-array' ] ) );
	}

	if( isset( $_POST[ 'tmf-map-circle-array' ] ) ) {
	    update_post_meta( $post_id, 'tmf-map-circle-array', wp_kses_post( $_POST[ 'tmf-map-circle-array' ] ) );
	}

	if( isset( $_POST[ 'tmf-map-polygon-array' ] ) ) {
	    update_post_meta( $post_id, 'tmf-map-polygon-array', wp_kses_post($_POST[ 'tmf-map-polygon-array' ] ) );
	}

	if( isset( $_POST[ 'tmf-map-polyline-array' ] ) ) {
	    update_post_meta( $post_id, 'tmf-map-polyline-array', wp_kses_post($_POST[ 'tmf-map-polyline-array' ] ) );
	} 
}
add_action( 'save_post', 'tmf_meta_save' );