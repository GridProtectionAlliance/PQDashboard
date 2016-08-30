OpenLayers.Control.DragPopup = OpenLayers.Class(OpenLayers.Control, {
    down: false,
    popPnt: null,
    mapPnt: null,
    popup: null,
    docMouseUpProxy: null,

    /**
     * Constructor: OpenLayers.Control.DragPopup
     * Create a new control to drag a popup.
     *
     * Parameters:
     * @param {OpenLayers.Popup} popup
     * @param {Object} options
     */
    initialize: function(popup, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.popup = popup;
        this.popup.events.register('mousedown', this, this.mouseDown);
        this.popup.events.register('mouseup', this, this.mouseUp);
        this.popup.events.register('mousemove', this, this.mouseMove);
        // Define a function bound to this used to listen for
        // document mouseout events
        this.docMouseUpProxy = OpenLayers.Function.bind(this.mouseUp, this);
    },

    /**
     * Method: setMap
     * Set the map property for the control.
     *
     * Parameters: 
     * map - {<OpenLayers.Map>} The controls map.
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, [map]);
        this.map.events.register('mousemove', this, this.mouseMove);
    },
    
    mouseDown: function(evt) {
        if (evt.chartY < 10) {
            this.down = true;
            this.popup.groupDiv.style.opacity = ".5";
            this.popup.groupDiv.parentElement.style.opacity = ".5";
            this.popPnt = this.popup.events.getMousePosition(evt);
            OpenLayers.Event.observe(document, 'mouseup', this.docMouseUpProxy);
            OpenLayers.Event.stop(evt);
        }
    },

    mouseUp: function(evt) {
        //console.log('mouseUp');
        this.down = false;
        this.popup.groupDiv.style.opacity = "1";
        this.popup.groupDiv.parentElement.style.opacity = "1";
        OpenLayers.Event.stopObserving(document, 'mouseup', this.docMouseUpProxy);
        OpenLayers.Event.stop(evt);
    },
    
    mouseOut: function(evt) {
        //console.log('map.mouseOut');
        this.down = false;
        OpenLayers.Event.stop(evt);
    },
    
    mouseMove: function(evt) {
        //console.log('mouseMove');

        if (evt.chartY < 10) { // In Drag Area
            this.popup.groupDiv.style.cursor = 'move';
        } else {
            if (this.popup.groupDiv) {
                this.popup.groupDiv.style.cursor = 'auto';
            }
        }

        if (this.down) {
            var mapPntPx = this.map.events.getMousePosition(evt);
            mapPntPx = mapPntPx.add((this.popPnt.x*-1), (this.popPnt.y*-1));
            this.popup.lonlat = this.map.getLonLatFromViewPortPx(mapPntPx);

            //console.log('mouseMove:' + mapPntPx.x + ":" + mapPntPx.y);
            //console.log('mouseMove:' + this.popup.lonlat.lat + ":" + this.popup.lonlat.lon);

            this.popup.updatePosition();
            //this.popup.moveTo(mapPntPx);

        }
        OpenLayers.Event.stop(evt);
    },
   
    destroy: function() {
        // Remove listeners

        if (this.popup.events){
            this.popup.events.unregister('mousedown', this, this.mouseDown);
            this.popup.events.unregister('mouseup', this, this.mouseUp);
            this.popup.events.unregister('mousemove', this, this.mouseMove);
        }
        if (this.map.events) {
            this.map.events.unregister('mousemove', this, this.mouseMove);
        }

        // Clear object references
        this.popup = null;
        this.popPnt = null;
        // allow our superclass to tidy up
        OpenLayers.Control.prototype.destroy.apply(this, []);
    },

    /** @final @type String */
    CLASS_NAME: "OpenLayers.Control.DragPopup"
});