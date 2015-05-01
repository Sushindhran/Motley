var React = require('react');

var Main = React.createClass({
	render: function() {
		return (
			<div className="container-fluid">
				<script src="http://maps.google.com/maps/api/js?sensor=true"></script>
				<script src="{{{webPath}}}/heatmapjs/heatmap.js"></script>
				<script src="{{{webPath}}}/heatmapjs/gmaps-heatmap.js"></script>
				<div id="map-canvas" style="height:100%"></div>
				<script>
					// map center
					var myLatlng = new google.maps.LatLng(33.2, -95.1667);
					// map options,
					var myOptions = {
					zoom: 5,
					center: myLatlng
					};
					// standard map
					map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
					// heatmap layer
					heatmap = new HeatmapOverlay(map,
            {
	            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
	            "radius": 5,
	            "maxOpacity": 5,
	            // scales the radius based on map zoom
	            "scaleRadius": true,
	            // if set to false the heatmap uses the global maximum for colorization
	            // if activated: uses the data maximum within the current map boundaries
	            //   (there will always be a red spot with useLocalExtremas true)
	            "useLocalExtrema": true,
	            // which field name in your data represents the latitude - default "lat"
	            latField: 'lat',
	            // which field name in your data represents the longitude - default "lng"
	            lngField: 'lng',
	            // which field name in your data represents the data value - default "value"
	            valueField: 'count'
	            }
					);
					//heatmap.setData({{{data}}});
				</script>
			</div>
		);
	}
});