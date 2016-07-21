function CustomMarker(latlng, map, args) {
	this.latlng = latlng;	
	this.args = args;
	this.setMap(map);	
}

CustomMarker.prototype = new google.maps.OverlayView();

CustomMarker.prototype.draw = function() {
	
	var self = this;
	
	var div = this.div;
	
	if (!div) {
	
		div = this.div = document.createElement('div');
		
		div.className = 'spark_pie';
		
		//div.style.position = 'absolute';
		//div.style.cursor = 'pointer';
		//div.style.width = '20px';
		//div.style.height = '20px';
		//div.style.background = 'blue';
//	    marker_name: value.name,

		if (typeof (self.args.marker_name) !== 'undefined') {
		    div.marker_name = self.args.marker_name;
		}		
		
		if (typeof (self.args.div_id) !== 'undefined') {
		    div.id = self.args.div_id;
		}
		
		if (typeof(self.args.marker_id) !== 'undefined') {
			div.marker_id = self.args.marker_id;
		}

		if (typeof (self.args.marker_status) !== 'undefined') {
		    div.marker_status = self.args.marker_status;
		}

		google.maps.event.addDomListener(div, "click", function(event) {

		    if (!event.ctrlKey) {
			    $('#siteList').multiselect("uncheckAll");
			}

			if ($('#siteList').multiselect("option").multiple) {

			    $('#siteList').multiselect("widget").find(":checkbox").each(function () {
			        if (this.value == event.currentTarget.marker_id) {
			            this.click();
			        }

			    });

			    selectsitesincharts();

			} else {
			    $('#siteList').multiselect("widget").find(":radio[value='" + event.currentTarget.marker_id + "']").each(function () { this.click(); });
			    $('#siteList').multiselect('refresh');
			}
		});
		
		var panes = this.getPanes();
		panes.overlayImage.appendChild(div);

		if (typeof(self.args.drawListener) !== 'undefined') {
		    self.args.drawListener();
		}
	}
	
	var point = this.getProjection().fromLatLngToDivPixel(this.latlng);
	
	if (point) {
		div.style.left = (point.x - 10) + 'px';
		div.style.top = (point.y - 20) + 'px';
	}
};

CustomMarker.prototype.remove = function() {
	if (this.div) {
		//this.div.parentNode.removeChild(this.div);
	    $("#" + this.div.id).remove(); //= null;
	}	
};

CustomMarker.prototype.getPosition = function() {
	return this.latlng;	
};

CustomMarker.prototype.show = function () {
    if (this.div) {
        this.div.style.visibility = 'visible';
    }
};

CustomMarker.prototype.hide = function () {
    if (this.div) {
        this.div.style.visibility = 'hidden';
    }
};

CustomMarker.prototype.toggle = function () {
    if (this.div) {
        if (this.div.style.visibility == 'hidden') {
            this.show();
        } else {
            this.hide();
        }
    }
};