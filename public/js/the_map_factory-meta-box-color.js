jQuery(document).ready(function($) {
    $('.tmf-chart-color').wpColorPicker({
    	change: function(event, ui) {
    		tmfChartOptions.colors[0] = ui.color.toString();
  			tmfChart.draw(tmfChartData, tmfChartOptions);
            document.getElementById('tmf-chart-color').value = ui.color.toString();
            document.getElementById('tmf-chart-selected-color').style.backgroundColor = ui.color.toString();
  		}
    });

    $('.tmf-marker-fill-color').wpColorPicker({
    	change: function(event, ui) {
            var tmfCurrentMarkerNumber = document.getElementById('tmf-map-marker-number').innerHTML;
		    var tmfSelectedMarkerFillColor = ui.color.toString();
        
            var x = tmfMarkers[tmfCurrentMarkerNumber].getIcon();
            x.fillColor = tmfSelectedMarkerFillColor;
            tmfMarkers[tmfCurrentMarkerNumber].setIcon(x);

            document.getElementById('tmf-marker-fill-selected-color').style.backgroundColor = tmfSelectedMarkerFillColor;
  		}
    });

    $('.tmf-marker-stroke-color').wpColorPicker({
    	change: function(event, ui) {
		    var tmfCurrentMarkerNumber = document.getElementById('tmf-map-marker-number').innerHTML;
            var tmfSelectedMarkerStrokeColor = ui.color.toString();

            var x = tmfMarkers[tmfCurrentMarkerNumber].getIcon();
            x.strokeColor = tmfSelectedMarkerStrokeColor;
            tmfMarkers[tmfCurrentMarkerNumber].setIcon(x);

            document.getElementById('tmf-marker-stroke-selected-color').style.backgroundColor = tmfSelectedMarkerStrokeColor;
  		}
    });

    $('.tmf-circle-fill-color').wpColorPicker({
        change: function(event, ui) {
            var tmfCurrentCircleNumber = document.getElementById('tmf-map-circle-number').innerHTML;
            var tmfSelectedCircleFillColor = ui.color.toString();
        
            tmfCircles[tmfCurrentCircleNumber].setOptions({
                fillColor: tmfSelectedCircleFillColor
            });
            document.getElementById('tmf-circle-fill-selected-color').style.backgroundColor = tmfSelectedCircleFillColor;
        }
    });

    $('.tmf-circle-stroke-color').wpColorPicker({
        change: function(event, ui) {
            var tmfCurrentCircleNumber = document.getElementById('tmf-map-circle-number').innerHTML;
            var tmfSelectedCircleStrokeColor = ui.color.toString();
        
            tmfCircles[tmfCurrentCircleNumber].setOptions({
                strokeColor: tmfSelectedCircleStrokeColor
            });
            document.getElementById('tmf-circle-stroke-selected-color').style.backgroundColor = tmfSelectedCircleStrokeColor;
        }
    });

    $('.tmf-circle-mouseover-fill-color').wpColorPicker({
        change: function(event, ui) {
            var tmfSelectedCircleMouseOverFillColor = ui.color.toString();
            document.getElementById('tmf-circle-mouseover-fill-selected-color').style.backgroundColor = tmfSelectedCircleMouseOverFillColor;
        }
    });

    $('.tmf-circle-mouseover-stroke-color').wpColorPicker({
        change: function(event, ui) {
            var tmfSelectedCircleMouseOverStrokeColor = ui.color.toString();
            document.getElementById('tmf-circle-mouseover-stroke-selected-color').style.backgroundColor = tmfSelectedCircleMouseOverStrokeColor;
        }
    });

        $('.tmf-polygon-fill-color').wpColorPicker({
        change: function(event, ui) {
            var tmfCurrentPolygonNumber = document.getElementById('tmf-map-polygon-number').innerHTML;
            var tmfSelectedPolygonFillColor = ui.color.toString();
        
            tmfPolygons[tmfCurrentPolygonNumber].setOptions({
                fillColor: tmfSelectedPolygonFillColor
            });
            document.getElementById('tmf-polygon-fill-selected-color').style.backgroundColor = tmfSelectedPolygonFillColor;
        }
    });

    $('.tmf-polygon-stroke-color').wpColorPicker({
        change: function(event, ui) {
            var tmfCurrentPolygonNumber = document.getElementById('tmf-map-polygon-number').innerHTML;
            var tmfSelectedPolygonStrokeColor = ui.color.toString();
        
            tmfPolygons[tmfCurrentPolygonNumber].setOptions({
                strokeColor: tmfSelectedPolygonStrokeColor
            });
            document.getElementById('tmf-polygon-stroke-selected-color').style.backgroundColor = tmfSelectedPolygonStrokeColor;
        }
    });

    $('.tmf-polygon-mouseover-fill-color').wpColorPicker({
        change: function(event, ui) {

            var tmfSelectedPolygonMouseOverFillColor = ui.color.toString();
            document.getElementById('tmf-polygon-mouseover-fill-selected-color').style.backgroundColor = tmfSelectedPolygonMouseOverFillColor;
        }
    });

    $('.tmf-polygon-mouseover-stroke-color').wpColorPicker({
        change: function(event, ui) {
            var tmfSelectedPolygonMouseOverStrokeColor = ui.color.toString();
            document.getElementById('tmf-polygon-mouseover-stroke-selected-color').style.backgroundColor = tmfSelectedPolygonMouseOverStrokeColor;
        }
    });

    $('.tmf-polyline-stroke-color').wpColorPicker({
        change: function(event, ui) {
            document.getElementById('tmf-polyline-stroke-color').value = ui.color.toString();
            document.getElementById('tmf-polyline-stroke-selected-color').style.backgroundColor = ui.color.toString();
            tmfPolylinePropertyChanged();
        }
    });

    $('.tmf-polyline-symbol-fill-color').wpColorPicker({
        change: function(event, ui) {
            document.getElementById('tmf-polyline-symbol-fill-color').value = ui.color.toString();
            document.getElementById('tmf-polyline-symbol-fill-selected-color').style.backgroundColor = ui.color.toString();
            tmfPolylinePropertyChanged();
        }
    });

    $('.tmf-polyline-symbol-stroke-color').wpColorPicker({
        change: function(event, ui) {
            document.getElementById('tmf-polyline-symbol-stroke-color').value = ui.color.toString();
            document.getElementById('tmf-polyline-symbol-stroke-selected-color').style.backgroundColor = ui.color.toString();
            tmfPolylinePropertyChanged();
        }
    });

    $('.tmf-polyline-mouseover-stroke-color').wpColorPicker({
        change: function(event, ui) {
            document.getElementById('tmf-polyline-mouseover-stroke-color').value = ui.color.toString();
            document.getElementById('tmf-polyline-mouseover-stroke-selected-color').style.backgroundColor = ui.color.toString();
            tmfPolylinePropertyChanged();
        }
    });

    $('.tmf-polyline-mouseover-symbol-fill-color').wpColorPicker({
        change: function(event, ui) {
            document.getElementById('tmf-polyline-mouseover-symbol-fill-color').value = ui.color.toString();
            document.getElementById('tmf-polyline-mouseover-symbol-fill-selected-color').style.backgroundColor = ui.color.toString();
            tmfPolylinePropertyChanged();
        }
    });

    $('.tmf-polyline-mouseover-symbol-stroke-color').wpColorPicker({
        change: function(event, ui) {
            document.getElementById('tmf-polyline-mouseover-symbol-stroke-color').value = ui.color.toString();
            document.getElementById('tmf-polyline-mouseover-symbol-stroke-selected-color').style.backgroundColor = ui.color.toString();
            tmfPolylinePropertyChanged();
        }
    });
});