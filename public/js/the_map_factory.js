function tmftoggletabs(tmf_evt, tmfClickedTab) {
    var i, tmf_tabcontent, tmf_tablinks;

    if (document.getElementById('tmf-new-marker-buttons').style.display == "block") {
        alert(tmfFrontendVariables.tmfTextTokens.tmfTokenNewMarker);
        return;
    }
    if (document.getElementById('tmf-existing-marker-buttons').style.display == "block") {
        alert(tmfFrontendVariables.tmfTextTokens.tmfTokenEditMarker);
        return;
    }
    if (document.getElementById('tmf-new-circle-buttons').style.display == "block") {
        alert(tmfFrontendVariables.tmfTextTokens.tmfTokenNewCircle);
        return;
    }
    if (document.getElementById('tmf-existing-circle-buttons').style.display == "block") {
        alert(tmfFrontendVariables.tmfTextTokens.tmfTokenEditCircle);
        return;
    }
    if (document.getElementById('tmf-new-polygon-buttons').style.display == "block") {
        alert(tmfFrontendVariables.tmfTextTokens.tmfTokenNewPolygon);
        return;
    }
    if (document.getElementById('tmf-existing-polygon-buttons').style.display == "block") {
        alert(tmfFrontendVariables.tmfTextTokens.tmfTokenEditPolygon);
        return;
    }
    if (document.getElementById('tmf-new-polyline-buttons').style.display == "block") {
        alert(tmfFrontendVariables.tmfTextTokens.tmfTokenNewPoyline);
        return;
    }
    if (document.getElementById('tmf-existing-polyline-buttons').style.display == "block") {
        alert(tmfFrontendVariables.tmfTextTokens.tmfTokenEditPolyline);
        return;
    }

    
    tmf_tabcontent = document.getElementsByClassName('tmf_tabcontent');
    for (i = 0; i < tmf_tabcontent.length; i++) {
        tmf_tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName('tmf_tablinks');
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tmfClickedTab).style.display = "block";
    //tmf_evt.currentTarget.className += " active";
    document.getElementById(tmfClickedTab + '_id').className += " active";

    switch(tmfClickedTab) {
        case "tmf_placecard":
            if (document.getElementById('tmf-placecard-directions-listbox').value == 2) {
                tmfTheMap.setOptions({
                    disableDoubleClickZoom: true,
                });
                tmfAddPlacecardListener = google.maps.event.addListener(tmfTheMap, 'dblclick', tmfSetPlacecardLocation);
            } else
            {
                tmfTheMap.setOptions({
                    disableDoubleClickZoom: false,
                });
            }

            if (tmfAddCircleListener) {
                google.maps.event.removeListener(tmfAddCircleListener);
            }

            if (tmfAddPolygonListener) {
                google.maps.event.removeListener(tmfAddPolygonListener);
            }

            if (tmfAddPolylineListener) {
                google.maps.event.removeListener(tmfAddPolylineListener);
            }

            break;

        case "tmf_markers":
            tmfAddMarkerListener = google.maps.event.addListener(tmfTheMap, 'dblclick', tmfAddMarkerAndPanTo);

            if (tmfAddPlacecardListener) {
                google.maps.event.removeListener(tmfAddPlacecardListener);
            }

            if (tmfAddCircleListener) {
                google.maps.event.removeListener(tmfAddCircleListener);
            }

            if (tmfAddPolygonListener) {
                google.maps.event.removeListener(tmfAddPolygonListener);
            }

            if (tmfAddPolylineListener) {
                google.maps.event.removeListener(tmfAddPolylineListener);
            }

            tmfTheMap.setOptions({
                disableDoubleClickZoom: true,
            });

            break;

        case "tmf_circles":
            tmfAddCircleListener = google.maps.event.addListener(tmfTheMap, 'dblclick', tmfAddCircleAndPanTo);

            if (tmfAddPlacecardListener) {
                google.maps.event.removeListener(tmfAddPlacecardListener);
            }

            if (tmfAddMarkerListener) {
                google.maps.event.removeListener(tmfAddMarkerListener);
            }

            if (tmfAddPolygonListener) {
                google.maps.event.removeListener(tmfAddPolygonListener);
            }

            if (tmfAddPolylineListener) {
                google.maps.event.removeListener(tmfAddPolylineListener);
            }

            tmfTheMap.setOptions({
                disableDoubleClickZoom: true,
            });

            break;

        case "tmf_polygons":
            tmfAddPolygonListener = google.maps.event.addListener(tmfTheMap, 'dblclick', tmfAddPolygonAndPanTo);

            if (tmfAddPlacecardListener) {
                google.maps.event.removeListener(tmfAddPlacecardListener);
            }

            if (tmfAddMarkerListener) {
                google.maps.event.removeListener(tmfAddMarkerListener);
            }

            if (tmfAddCircleListener) {
                google.maps.event.removeListener(tmfAddCircleListener);
            }

            if (tmfAddPolylineListener) {
                google.maps.event.removeListener(tmfAddPolylineListener);
            }

            tmfTheMap.setOptions({
                disableDoubleClickZoom: true,
            });

            break;

        case "tmf_polylines":
            tmfAddPolylineListener = google.maps.event.addListener(tmfTheMap, 'dblclick', tmfAddPolylineAndPanTo);

            if (tmfAddPlacecardListener) {
                google.maps.event.removeListener(tmfAddPlacecardListener);
            }

            if (tmfAddMarkerListener) {
                google.maps.event.removeListener(tmfAddMarkerListener);
            }

            if (tmfAddCircleListener) {
                google.maps.event.removeListener(tmfAddCircleListener);
            }

            if (tmfAddPolygonListener) {
                google.maps.event.removeListener(tmfAddPolygonListener);
            }

            tmfTheMap.setOptions({
                disableDoubleClickZoom: true,
            });

            break;

        default:
            if (tmfAddPlacecardListener) {
                google.maps.event.removeListener(tmfAddPlacecardListener);
            }

            if (tmfAddMarkerListener) {
                google.maps.event.removeListener(tmfAddMarkerListener);
            }

            if (tmfAddCircleListener) {
                google.maps.event.removeListener(tmfAddCircleListener);
            }

            if (tmfAddPolygonListener) {
                google.maps.event.removeListener(tmfAddPolygonListener);
            }

            if (tmfAddPolylineListener) {
                google.maps.event.removeListener(tmfAddPolylineListener);
            }

            tmfTheMap.setOptions({
                disableDoubleClickZoom: false,
            });
    }
}


// Select polyline from media library
jQuery(document).ready(function($) {
    var mediaUploader;

    $('#tmf-polyline-file-url-button').click(function(e) {
        e.preventDefault();
        if (mediaUploader) {
                mediaUploader.open();
            return;
        }

        mediaUploader = wp.media.frames.file_frame = wp.media({
            title: tmfFrontendVariables.tmfTextTokens.tmfTokenChooseFile, 
            button: {
                text: tmfFrontendVariables.tmfTextTokens.tmfTokenChoosePolyline
            }, multiple: false 
        });

        mediaUploader.on('select', function() {
            attachment = mediaUploader.state().get('selection').first().toJSON();

            var tmfPolylineFileName = attachment.url;
            document.getElementById('tmf-polyline-file-url-text').value = tmfPolylineFileName; 

            var fileContents = tmfLoadPolylineFileFromUrlBackend(attachment.url);
            $('#tmf-polyline-file-url').val(attachment.url);
        });

        mediaUploader.open();
    });
});

// Select image from media library
jQuery(document).ready(function($) {
    var mediaUploader;

    $('#tmf-marker-url-button').click(function(e) {
        e.preventDefault();
        // If the uploader object has already been created, reopen the dialog
        if (mediaUploader) {
                mediaUploader.open();
            return;
        }

        // Extend the wp.media object
        mediaUploader = wp.media.frames.file_frame = wp.media({
            title: tmfFrontendVariables.tmfTextTokens.tmfTokenMediaUploaderTitle,
            button: {
                text: tmfFrontendVariables.tmfTextTokens.tmfTokenMediaUploaderText
            }, multiple: false 
        });

        // When a file is selected, grab the URL and set it as the text field's value
        mediaUploader.on('select', function() {
            document.getElementById('tmf-marker-png-image-settings').style.display = "block";
            attachment = mediaUploader.state().get('selection').first().toJSON();

            var tmfMarkerFileName = attachment.url;
            tmfMarkerFileName = tmfMarkerFileName.substr(tmfMarkerFileName.lastIndexOf('/') + 1, 50);
            
            $('#tmf-marker-url-text').text(tmfMarkerFileName);
            $('#tmf-marker-url').val(attachment.url);
            $("#tmf-marker-url-src").attr("src", attachment.url);

            document.getElementById('tmf-marker-url-width').value = attachment.width;
            document.getElementById('tmf-marker-url-height').value = attachment.height;

            tmfUserImageSelected();
        });

        // Open the uploader dialog
        mediaUploader.open();
    });
});

/*jQuery(document).ready(function($) {
    $(function() {
        $('#tmf-placecard-favourites-link').click(function() {
            if (window.sidebar && window.sidebar.addPanel) { // Mozilla Firefox Bookmark
                window.sidebar.addPanel(document.title, window.location.href, '');
            } else if (window.external && ('AddFavorite' in window.external)) { // IE Favorite
                window.external.AddFavorite(location.href, document.title);
            } else if (window.opera && window.print) { // Opera Hotlist
                this.title = document.title;
                return true;
            } else { // webkit - safari/chrome
                alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
            }
        });
    });
});*/