<?php
/*
Plugin Name:  The WP Map Factory
Plugin URI:   https://www.thewpmapfactory.com/
Description:  The easy way to create Google maps within Wordpress. The WP Map Factory plugin allows any number of maps to be easily created.
Version:      2.0.0
Author:       The WP Map Factory
License:      GPL2
License URI:  https://www.gnu.org/licenses/gpl-2.0.html
Text Domain:  tmf_translation
Domain Path:  /languages
*/

if (!defined('ABSPATH')) {
	die( 'Invalid request.' );
}

define( 'TMF_JAVASCRIPT_VERSION', '2.0.0' );
define( 'TMF_CSS_VERSION', '2.0.0' );

include_once( plugin_dir_path( __FILE__ ) . 'includes/the_map_factory_backend.php');
include_once( plugin_dir_path( __FILE__ ) . 'includes/the_map_factory_frontend.php');


/**
 *****************************************************************************
 * Following registers and enqueues scripts and style for frontend of plugin
 *****************************************************************************
 */
/**
 * Register and enqueue scripts and styles
 */
add_action( 'wp_enqueue_scripts', 'tmf_register_script' );
function tmf_register_script() {
	wp_register_script( 'the_map_factory-common-display-map', plugin_dir_url( __FILE__ ) . 'public/js/the_map_factory-common-display-map.js', '', TMF_JAVASCRIPT_VERSION, true );

	wp_register_style( 'the-map-factory-frontend-display-map-css', plugin_dir_url( __FILE__ ) . 'public/css/themapfactoryfrontenddisplaymap.css','' ,TMF_CSS_VERSION );
	wp_enqueue_style( 'the-map-factory-frontend-display-map-css' );

	wp_register_script( 'google-charts', 'https://www.gstatic.com/charts/loader.js');
	wp_enqueue_script( 'google-charts' );
}


/**
 *****************************************************************************
 * Following registers and enqueues scripts and style for admin side of plugin
 *****************************************************************************
 */
/**
 * Register and enqueue scripts and styles
 */
add_action( 'admin_enqueue_scripts', 'tmf_create_edit_map_enqueue' );
function tmf_create_edit_map_enqueue() {
    global $typenow;
    if( $typenow == 'themapfactorymaps' ) {
    	wp_register_script( 'the-map-factory', plugin_dir_url( __FILE__ ) . 'public/js/the_map_factory.js', array(), TMF_JAVASCRIPT_VERSION, true );
        wp_register_script( 'the-map-factory-backend-display-map', plugin_dir_url( __FILE__ ) . 'public/js/the_map_factory-backend-display-map.js', '', TMF_JAVASCRIPT_VERSION, true );
        wp_register_script( 'the_map_factory-common-display-map', plugin_dir_url( __FILE__ ) . 'public/js/the_map_factory-common-display-map.js', '', TMF_JAVASCRIPT_VERSION, true );
        
       	wp_register_script( 'meta-box-color-js', plugin_dir_url( __FILE__ ) . 'public/js/the_map_factory-meta-box-color.js', array( 'wp-color-picker' ) ); 
    	wp_enqueue_style( 'wp-color-picker' ); 
    }
}


/**
 **************************************************************
 * All following is related to the admin settings of the plugin
 **************************************************************
 */

/**
 * top level menu
 */
add_action( 'admin_menu', 'tmf_settings_page' );
function tmf_settings_page() {
 // add top level menu page
	add_submenu_page(
		'edit.php?post_type=themapfactorymaps',
		'The WP Map Factory Settings',
		'Settings',
		'manage_options',
		'tmf_settings',
		'tmf_settings_page_html'
	);
}
 

/**
 * top level menu: callback functions
 */
function tmf_settings_page_html() {
	// check user capabilities
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	if ( isset( $_GET['settings-updated'] ) ) {
		add_settings_error( 'tmf_messages', 'tmf_message', __( 'Settings Saved', 'tmf_translation' ), 'updated' );
	}

	// show error/update messages
	settings_errors( 'tmf_messages' ); 	?>

	<div class="wrap">
		<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
		<form method="post" action="options.php">
			<?
			settings_fields('tmf_settings');
			do_settings_sections('tmf_settings');
			submit_button('Save Settings');
			?>
		</form>
	</div>
	<?php
}


/**
 * Register Settings and API keys...
 */
add_action( 'admin_init', 'tmf_settings_init' );
function tmf_settings_init() {
	if (get_option('tmf_settings' == false)) {  
        add_option('tmf_settings');
    }

	add_settings_section(
		'tmf_section_settings',
		__( 'Map Keys', 'tmf_translation' ),
		'tmf_section_settings_cb',
		'tmf_settings'
	);

	add_settings_field(
		'tmf_googlemapsapi_key', 
		__( 'Google maps API key', 'tmf_translation' ),
		'tmf_googlemapsapi_key_cb',
		'tmf_settings',
		'tmf_section_settings',
		[
			'label_for' 		=> 'tmf_googlemapsapi_key',
			'class' 			=> 'tmf_row',
			'tmf_custom_data' 	=> 'custom',
		]
	);

	add_settings_field(
		'tmf_thunderforestapi_key', 
		__( 'Thunderforest API key', 'tmf_translation' ),
		'tmf_thunderforestapi_key_cb',
		'tmf_settings',
		'tmf_section_settings',
		[
			'label_for' 		=> 'tmf_thunderforestapi_key',
			'class' 			=> 'tmf_row',
			'tmf_custom_data' 	=> 'custom',
		]
	);

	register_setting( 
		'tmf_settings', 
		'tmf_options',
		'tmf_validate__settings_input'
	);
}

function tmf_validate__settings_input($tmf_input) {
    $tmf_output = array();
	if (is_array($tmf_input)) {
	    foreach ($tmf_input as $tmf_input_key => $tmf_input_value) {
	        if (isset( $tmf_input[$tmf_input_key])) {
	            $tmf_output[$tmf_input_key] = sanitize_text_field($tmf_input[$tmf_input_key]);    
	        }
	    }
	}
    return apply_filters('tmf_validate__settings_input', $tmf_output, $tmf_input);
}


/* 
 * Settings and API section text
 */
function tmf_section_settings_cb( $args ) {
	?>
	<p id="<?php echo esc_attr( $args['id'] ); ?>"><?php esc_html_e( 'You must enter a Google Maps API key below. You only need to enter a Thunderforest key if you want to use Thunderforest maps.', 'tmf_translation' ); ?></p>
	<?php
}
 

/*
 * Google maps API callback - get the value of the setting we've registered with register_setting()
 */
function tmf_googlemapsapi_key_cb( $args ) {
	$tmf_options = get_option( 'tmf_options' );

	?>
    <div class="tmf-settings-group-rhs">
    	<input class="tmf-form-input-field-wide" type="text" name="tmf_options[tmf-googlemaps-key]" value="<?php if ( isset ( $tmf_options['tmf-googlemaps-key'] ) ) echo sanitize_text_field($tmf_options['tmf-googlemaps-key']); ?>" />
	</div>
	<p class="tmf-form-helptext">
		<?php _e( 'If you\'re not sure how to obtain a Google Maps API key, read more <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank">here</a>.', 'tmf_translation' ); ?>
	</p>
	<?php
}


/*
 * Thunderforest API callback - get the value of the setting we've registered with register_setting()
 */
function tmf_thunderforestapi_key_cb( $args ) {
	$tmf_options = get_option( 'tmf_options' );

	?>
    <div class="tmf-settings-group-rhs">
		<input class="tmf-form-input-field-wide" type="text" name="tmf_options[tmf-thunderforest-key]" value="<?php if ( isset ( $tmf_options['tmf-thunderforest-key'] ) ) echo sanitize_text_field($tmf_options['tmf-thunderforest-key']); ?>" />
	</div>
	<p class="tmf-form-helptext">
		<?php _e( 'If you\'re not sure how to obtain a Thunderforest API key, read more <a href="https://www.thunderforest.com/docs/apikeys/" target="_blank">here</a>.', 'tmf_translation' ); ?>
	</p>
	<?php
}


/**
 * Configure units...
 */
add_action( 'admin_init', 'tmf_units_setting_init' );
function tmf_units_setting_init() {
	if (get_option('tmf_settings' == false)) {  
        add_option('tmf_settings');
    }

	add_settings_section(
		'tmf_section_units_setting',
		__( 'Settings', 'tmf_translation' ),
		'',
		'tmf_settings'
	);

	add_settings_field(
		'tmf_units_setting', 
		__( 'Units setting', 'tmf_translation' ),
		'tmf_section_units_settings_cb',
		'tmf_settings',
		'tmf_section_units_setting',
		[
			'label_for' 		=> 'tmf_units_setting',
			'class' 			=> 'tmf_row',
			'tmf_custom_data' 	=> 'custom',
		]
	);

	add_settings_field(
		'tmf_cleanup_setting', 
		__( 'Uninstall behaviour', 'tmf_translation' ),
		'tmf_section_cleanup_settings_cb',
		'tmf_settings',
		'tmf_section_units_setting',
		[
			'label_for' 		=> 'tmf_cleanup_setting',
			'class' 			=> 'tmf_row',
			'tmf_custom_data' 	=> 'custom',
		]
	);

	register_setting(
		'tmf_settings', 
		'tmf_units_setting',
		'tmf_validate__settings_input'
	);
} 

function tmf_section_units_settings_cb( $args ) {
	$tmf_options = get_option( 'tmf_options' ); ?>
    <div class="tmf-settings-group-rhs">
        <select name="tmf_options[tmf-chart-units]" id="tmf-chart-units">
	    	<option value="meters" 
	    	<?php if ( $tmf_options['tmf-chart-units'] == 'meters') {
	    		echo 'selected'; 
	    	} ?>
	    	><?php _e( 'Meters', 'tmf_translation' )?></option>';
			
			<option value="feet" 
			<?php if ( $tmf_options['tmf-chart-units']  == 'feet') {
				echo 'selected';
			} ?>
			><?php _e( 'Feet', 'tmf_translation' )?></option>';
		</select>
	</div>

	<p class="tmf-form-helptext">
		<?php esc_html_e( 'Chooses the unit type you want to be displayed for polyline distances and heights.', 'tmf_translation' ); ?>
	</p>
	<?php
}

function tmf_section_cleanup_settings_cb( $args ) {
	$tmf_options = get_option( 'tmf_options' ); ?>
    <div class="tmf-settings-group-rhs">
        <select name="tmf_options[tmf-cleanup-setting]" id="tmf-cleanup-setting">
	    	<option value="delete" 
	    	<?php if ( $tmf_options['tmf-cleanup-setting'] == 'delete') {
	    		echo 'selected'; 
	    	} ?>
	    	><?php _e( 'Delete all maps and settings', 'tmf_translation' )?></option>';
			
			<option value="keep" 
			<?php if ( $tmf_options['tmf-cleanup-setting']  == 'keep') {
				echo 'selected';
			} ?>
			><?php _e( 'Keep all maps and settings', 'tmf_translation' )?></option>';
		</select>
	</div>
	<?php
}


/**
* Create the Map post type
*/ 
add_action( 'init', 'mapfactory_post_type' );
function mapfactory_post_type() {
// Set UI labels for Custom Post Type
    $labels = array(
        'name' 				  	=> __( 'Maps' ),
        'singular_name' 	  	=> __( 'Map' ),
        'menu_name'           	=> __( 'Maps' ),
        'parent_item_colon'   	=> __( 'Parent Map' ),
        'all_items'           	=> __( 'All Maps' ),
        'view_item'           	=> __( 'View Map' ),
        'add_new_item'        	=> __( 'Add New Map' ),
        'add_new'             	=> __( 'Add New' ),
        'edit_item'           	=> __( 'Edit Map' ),
        'update_item'         	=> __( 'Update Map' ),
        'search_items'        	=> __( 'Search Map' ),
        'not_found'           	=> __( 'Not Found' ),
        'not_found_in_trash'  	=> __( 'Not found in Trash' ),
    );
     
// Set other options for Custom Post Type     
    $args = array(
        'label'               	=> __( 'maps' ),
        'description'         	=> __( 'The WP Map Factory Maps' ),
        'labels'              	=> $labels,
        'supports'            	=> array( 'title' ),
        'public'              	=> true,
        'show_in_nav_menus'   	=> false,
        'has_archive'         	=> true,
        'menu_icon'           	=> 'dashicons-location-alt',
    );
     
    // Registering your Custom Post Type
    register_post_type( 'themapfactorymaps', $args );
}


/**
 * Adds the map factory stylesheet when appropriate
 */
add_action( 'admin_print_styles', 'tmf_admin_styles' );
function tmf_admin_styles(){
    global $typenow;
    if( $typenow == 'themapfactorymaps' ) {
    	wp_enqueue_style( 'tmf_frontend', plugin_dir_url( __FILE__ ) . 'public/css/themapfactoryfrontenddisplaymap.css', '', TMF_CSS_VERSION );
        wp_enqueue_style( 'tmf_meta_box_styles', plugin_dir_url( __FILE__ ) . 'public/css/themapfactorybackend.css', '', TMF_CSS_VERSION );
    }
}

/**
 * Show extra links in the Plugins page
 */
add_action( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'tmf_plugin_action_links' );
function tmf_plugin_action_links( $tmf_links ) {
	$tmf_links = array_merge( 
		array('<a href="' . esc_url( admin_url( '/edit.php?post_type=themapfactorymaps&page=tmf_settings' ) ) . '">' . __( 'Settings', 'textdomain' ) . '</a>'),
		$tmf_links 
	);
	return $tmf_links;
}

/**
 * Allow upload of gpx files
 */
add_filter( 'upload_mimes', 'tmf_custom_mime_types' );
function tmf_custom_mime_types( $tmf_mimes ) {
    $tmf_mimes['gpx'] = 'application/octet-stream';
    //unset($tmf_mimes['gpx']);
	return $tmf_mimes;
}

add_filter( 'wp_check_filetype_and_ext', 'tmf_check_file_types', 10, 4 );
function tmf_check_file_types( $types, $file, $filename, $mimes ) {
    if (false !== strpos($filename, '.gpx')) {
        $types['ext'] = 'gpx';
        $types['type'] = 'application/octet-stream';
    }
    return $types;
}

/**
 * Terms and conditions texts
 */
add_shortcode('thewpmapfactoryterms', 'tmf_themapfactoryshortcodeterms');
function tmf_themapfactoryshortcodeterms($atts) {
	$tmf_legal_atts = shortcode_atts( array(
	        'tmflegalpageid' => false,
	    ), $atts );

    $tmf_legalpage_id = $tmf_legal_atts['tmflegalpageid'];
	$page_object = get_page( $tmf_legalpage_id );
	echo $page_object->post_content;
}

/**
 * Uninstall
 */
register_uninstall_hook(__FILE__, 'tmf_uninstallandcleanup');
function tmf_uninstallandcleanup() {
	$tmf_options = get_option('tmf_options');
	if ( $tmf_options['tmf-cleanup-setting']  != 'keep') {
		delete_option('tmf_options');
		$tmf_allmapfactorymaps = get_posts(
			array(
				'post_type'		=>	'themapfactorymaps',
				'numberposts'	=>	-1
			) 
		);
		foreach ($tmf_allmapfactorymaps as $tmf_eachmapfactorymap) {
			wp_delete_post( $tmf_eachmapfactorymap->ID, true );
		}
	}
}