/**
 * PUI Object 
 */
var PUI = {
    
    zindex : 1000,
    
    gridColumns: {
        '1': 'ui-grid-col-12',
        '2': 'ui-grid-col-6',
        '3': 'ui-grid-col-4',
        '4': 'ui-grid-col-3',
        '6': 'ui-grid-col-2',
        '12': 'ui-grid-col-11'
    },
    
    charSet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        
    /**
     *  Aligns container scrollbar to keep item in container viewport, algorithm copied from jquery-ui menu widget
     */
    scrollInView: function(container, item) {        
        var borderTop = parseFloat(container.css('borderTopWidth')) || 0,
        paddingTop = parseFloat(container.css('paddingTop')) || 0,
        offset = item.offset().top - container.offset().top - borderTop - paddingTop,
        scroll = container.scrollTop(),
        elementHeight = container.height(),
        itemHeight = item.outerHeight(true);

        if(offset < 0) {
            container.scrollTop(scroll + offset);
        }
        else if((offset + itemHeight) > elementHeight) {
            container.scrollTop(scroll + offset - elementHeight + itemHeight);
        }
    },
    
    generateRandomId: function() {
        var id = '';
        for (var i = 1; i <= 10; i++) {
            var randPos = Math.floor(Math.random() * this.charSet.length);
            id += this.charSet[randPos];
        }
        return id;
    },
    
    isIE: function(version) {
        return (this.browser.msie && parseInt(this.browser.version, 10) === version);
    },
    
    escapeRegExp: function(text) {
        return text.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    },

    escapeHTML: function(value) {
        return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    },
    
    escapeClientId: function(id) {
        return "#" + id.replace(/:/g,"\\:");
    },
    
    clearSelection: function() {
        if(window.getSelection) {
            if(window.getSelection().empty) {
                window.getSelection().empty();
            } else if(window.getSelection().removeAllRanges) {
                window.getSelection().removeAllRanges();
            }
        } else if(document.selection && document.selection.empty) {
                document.selection.empty();
        }
    },
            
    inArray: function(arr, item) {
        for(var i = 0; i < arr.length; i++) {
            if(arr[i] === item) {
                return true;
            }
        }

        return false;
    },
    
    calculateScrollbarWidth: function() {
        if(!this.scrollbarWidth) {
            if(this.browser.msie) {
                var $textarea1 = $('<textarea cols="10" rows="2"></textarea>')
                        .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
                    $textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>')
                        .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');
                this.scrollbarWidth = $textarea1.width() - $textarea2.width();
                $textarea1.add($textarea2).remove();
            }
            else {
                var $div = $('<div />')
                    .css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 })
                    .prependTo('body').append('<div />').find('div')
                        .css({ width: '100%', height: 200 });
                this.scrollbarWidth = 100 - $div.width();
                $div.parent().remove();
            }
        }

        return this.scrollbarWidth;
    },
    
    //adapted from jquery browser plugin
    resolveUserAgent: function() {
        var matched, browser;

        jQuery.uaMatch = function( ua ) {
          ua = ua.toLowerCase();

          var match = /(opr)[\/]([\w.]+)/.exec( ua ) ||
              /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
              /(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec( ua ) ||
              /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
              /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
              /(msie) ([\w.]+)/.exec( ua ) ||
              ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec( ua ) ||
              ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
              [];

          var platform_match = /(ipad)/.exec( ua ) ||
              /(iphone)/.exec( ua ) ||
              /(android)/.exec( ua ) ||
              /(windows phone)/.exec( ua ) ||
              /(win)/.exec( ua ) ||
              /(mac)/.exec( ua ) ||
              /(linux)/.exec( ua ) ||
              /(cros)/i.exec( ua ) ||
              [];

          return {
              browser: match[ 3 ] || match[ 1 ] || "",
              version: match[ 2 ] || "0",
              platform: platform_match[ 0 ] || ""
          };
        };

        matched = jQuery.uaMatch( window.navigator.userAgent );
        browser = {};

        if ( matched.browser ) {
          browser[ matched.browser ] = true;
          browser.version = matched.version;
          browser.versionNumber = parseInt(matched.version);
        }

        if ( matched.platform ) {
          browser[ matched.platform ] = true;
        }

        // These are all considered mobile platforms, meaning they run a mobile browser
        if ( browser.android || browser.ipad || browser.iphone || browser[ "windows phone" ] ) {
          browser.mobile = true;
        }

        // These are all considered desktop platforms, meaning they run a desktop browser
        if ( browser.cros || browser.mac || browser.linux || browser.win ) {
          browser.desktop = true;
        }

        // Chrome, Opera 15+ and Safari are webkit based browsers
        if ( browser.chrome || browser.opr || browser.safari ) {
          browser.webkit = true;
        }

        // IE11 has a new token so we will assign it msie to avoid breaking changes
        if ( browser.rv )
        {
          var ie = "msie";

          matched.browser = ie;
          browser[ie] = true;
        }

        // Opera 15+ are identified as opr
        if ( browser.opr )
        {
          var opera = "opera";

          matched.browser = opera;
          browser[opera] = true;
        }

        // Stock Android browsers are marked as Safari on Android.
        if ( browser.safari && browser.android )
        {
          var android = "android";

          matched.browser = android;
          browser[android] = true;
        }

        // Assign the name and platform variable
        browser.name = matched.browser;
        browser.platform = matched.platform;

        this.browser = browser;
        $.browser = browser;
    },
    
    getGridColumn: function(number) {
        return this.gridColumns[number + ''];
    },
    
    executeFunctionByName: function(functionName /*, args */) {
        var args = [].slice.call(arguments).splice(1),
        context = window,
        namespaces = functionName.split("."),
        func = namespaces.pop();
        for(var i = 0; i < namespaces.length; i++) {
          context = context[namespaces[i]];
        }
        return context[func].apply(this, args);
    },
    
    resolveObjectByName: function(name) {
        if(name) {
            var parts = name.split(".");
            for(var i = 0, len = parts.length, obj = window; i < len; ++i) {
                obj = obj[parts[i]];
            }
            return obj;
        }
        else {
            return null;
        }
    },

    getCookie : function(name) {
        return $.cookie(name);
    },

    setCookie : function(name, value, cfg) {
        $.cookie(name, value, cfg);
    },

    deleteCookie: function(name, cfg) {
        $.removeCookie(name, cfg);
    }

};

PUI.resolveUserAgent();
/**
 * PrimeUI Carousel widget
 */
(function() {

    $.widget("primeui.puicarousel", {
       
       options: {
            datasource: null,
            numVisible: 3,
            firstVisible: 0,
            headerText: null,
            effectDuration: 500,
            circular :false,
            breakpoint: 560,
            itemContent: null,
            responsive: true,
            autoplayInterval: 0,
            easing: 'easeInOutCirc',
            pageLinks: 3,
            style: null,
            styleClass: null,
            template: null,
            enhanced: false
        },
       
        _create: function() {
            this.id = this.element.attr('id');
            if(!this.id) {
                this.id = this.element.uniqueId().attr('id');
            }

            if(!this.options.enhanced) {
                this.element.wrap('<div class="ui-carousel ui-widget ui-widget-content ui-corner-all"><div class="ui-carousel-viewport"></div></div>');
            }

            this.container = this.element.parent().parent();
            this.element.addClass('ui-carousel-items');
            this.viewport = this.element.parent();
            this.container.prepend('<div class="ui-carousel-header ui-widget-header"><div class="ui-carousel-header-title"></div></div>');
            this.header = this.container.children('.ui-carousel-header');
            this.header.append('<span class="ui-carousel-button ui-carousel-next-button fa fa-arrow-circle-right"></span>' +
                '<span class="ui-carousel-button ui-carousel-prev-button fa fa-arrow-circle-left"></span>');
                
            if(this.options.headerText) {
                this.header.children('.ui-carousel-header-title').html(this.options.headerText);
            }
            
            if(this.options.styleClass) {
                this.container.addClass(this.options.styleClass);
            }

            if(this.options.style) {
                this.container.attr('style', this.options.style);
            }
            
            if(this.options.datasource)
                this._loadData();
            else
                this._render();
        },

        _destroy: function() {
            this._unbindEvents();
            this.header.remove();
            this.items.removeClass('ui-carousel-item ui-widget-content ui-corner-all').css('width','auto');
            this.element.removeClass('ui-carousel-items').css('left','auto');

            if(!this.options.enhanced) {
                this.element.unwrap().unwrap();
            }

            if(this.options.datasource) {
                this.items.remove();
            }
        },
        
        _loadData: function() {
            if($.isArray(this.options.datasource))
                this._render(this.options.datasource);
            else if($.type(this.options.datasource) === 'function')
                this.options.datasource.call(this, this._render);
        },
        
        _updateDatasource: function(value) {
            this.options.datasource = value;
            this.element.children().remove();
            this.header.children('.ui-carousel-page-links').remove();
            this.header.children('select').remove();
            this._loadData();
        },
        
        _render: function(data) {
            this.data = data;
            
            if(this.data) {
                for(var i = 0; i < data.length; i++) {
                    var itemContent = this._createItemContent(data[i]);
                    if($.type(itemContent) === 'string')
                        this.element.append('<li>' + itemContent + '</li>');
                    else
                        this.element.append($('<li></li>').wrapInner(itemContent));
                }
            }
            
            this.items = this.element.children('li');
            this.items.addClass('ui-carousel-item ui-widget-content ui-corner-all');
            this.itemsCount = this.items.length;
            this.columns = this.options.numVisible;
            this.first = this.options.firstVisible;
            this.page = parseInt(this.first/this.columns);
            this.totalPages = Math.ceil(this.itemsCount/this.options.numVisible);
            
            this._renderPageLinks();
            
            this.prevNav = this.header.children('.ui-carousel-prev-button');
            this.nextNav = this.header.children('.ui-carousel-next-button');
            this.pageLinks = this.header.find('> .ui-carousel-page-links > .ui-carousel-page-link');
            this.dropdown = this.header.children('.ui-carousel-dropdown');
            this.mobileDropdown = this.header.children('.ui-carousel-mobiledropdown');
            
            this._bindEvents();
            
            if(this.options.responsive) {
                this.refreshDimensions();
            }
            else {
                this.calculateItemWidths();
                this.container.width(this.container.width());
                this.updateNavigators();
            }        
        },
        
        _renderPageLinks: function() {
            if(this.totalPages <= this.options.pageLinks) {
                this.pageLinksContainer = $('<div class="ui-carousel-page-links"></div>');
                for(var i = 0; i < this.totalPages; i++) {
                    this.pageLinksContainer.append('<a href="#" class="ui-carousel-page-link fa fa-circle-o"></a>');
                }
                this.header.append(this.pageLinksContainer);
            }
            else {
                this.dropdown = $('<select class="ui-carousel-dropdown ui-widget ui-state-default ui-corner-left"></select>');
                for(var i = 0; i < this.totalPages; i++) {
                    var pageNumber = (i+1);
                    this.dropdown.append('<option value="' + pageNumber + '">' + pageNumber + '</option>');
                }
                this.header.append(this.dropdown);
            }
            
            if(this.options.responsive) {
                this.mobileDropdown = $('<select class="ui-carousel-mobiledropdown ui-widget ui-state-default ui-corner-left"></select>');
                for(var i = 0; i < this.itemsCount; i++) {
                    var pageNumber = (i+1);
                    this.mobileDropdown.append('<option value="' + pageNumber + '">' + pageNumber + '</option>');
                }
                this.header.append(this.mobileDropdown);
            }
        },
        
        calculateItemWidths: function() {
            var firstItem = this.items.eq(0);
            if(firstItem.length) {
                var itemFrameWidth = firstItem.outerWidth(true) - firstItem.width();    //sum of margin, border and padding
                this.items.width((this.viewport.innerWidth() - itemFrameWidth * this.columns) / this.columns);
            }
        },
    
        refreshDimensions: function() {
            var win = $(window);
            if(win.width() <= this.options.breakpoint) {
                this.columns = 1;
                this.calculateItemWidths(this.columns);
                this.totalPages = this.itemsCount;
                this.mobileDropdown.show();
                this.pageLinks.hide();
            }
            else {
                this.columns = this.options.numVisible;
                this.calculateItemWidths();
                this.totalPages = Math.ceil(this.itemsCount / this.options.numVisible);
                this.mobileDropdown.hide();
                this.pageLinks.show();
            }

            this.page = parseInt(this.first / this.columns);
            this.updateNavigators();
            this.element.css('left', (-1 * (this.viewport.innerWidth() * this.page)));
        },

        _bindEvents: function() {
            var $this = this;
            
            if(this.eventsBound) {
                return;
            }

            this.prevNav.on('click.puicarousel', function() {
                if($this.page !== 0) {
                    $this.setPage($this.page - 1);
                }
                else if($this.options.circular) {
                    $this.setPage($this.totalPages - 1);
                }
            });

            this.nextNav.on('click.puicarousel', function() {
                var lastPage = ($this.page === ($this.totalPages - 1));

                if(!lastPage) {
                    $this.setPage($this.page + 1);
                }
                else if($this.options.circular) {
                    $this.setPage(0);
                }
            });

            if($.swipe) {
                this.element.swipe({
                    swipe:function(event, direction) {
                        if(direction === 'left') {
                            if($this.page === ($this.totalPages - 1)) {
                                if($this.options.circular)
                                    $this.setPage(0);
                            }
                            else {
                                $this.setPage($this.page + 1);
                            }
                        }
                        else if(direction === 'right') {
                            if($this.page === 0) {
                                if($this.options.circular)
                                    $this.setPage($this.totalPages - 1);
                            }
                            else {
                                $this.setPage($this.page - 1);
                            }
                        }
                    }
                });
            }

            if(this.pageLinks.length) {
                this.pageLinks.on('click.puicarousel', function(e) {
                    $this.setPage($(this).index());
                    e.preventDefault();
                });
            }

            this.header.children('select').on('change.puicarousel', function() {
                $this.setPage(parseInt($(this).val()) - 1);
            });

            if(this.options.autoplayInterval) {
                this.options.circular = true;
                this.startAutoplay();
            }

            if(this.options.responsive) {
                var resizeNS = 'resize.' + this.id;
                $(window).off(resizeNS).on(resizeNS, function() {
                    $this.refreshDimensions();
                });
            }
            
            this.eventsBound = true;
        },

        _unbindEvents: function() {
            this.prevNav.off('click.puicarousel');
            this.nextNav.off('click.puicarousel');
            if(this.pageLinks.length) {
                this.pageLinks.off('click.puicarousel');
            }
            this.header.children('select').off('change.puicarousel');

            if(this.options.autoplayInterval) {
                this.stopAutoplay();
            }

            if(this.options.responsive) {
                $(window).off('resize.' + this.id)
            }
        },

        updateNavigators: function() {
            if(!this.options.circular) {
                if(this.page === 0) {
                    this.prevNav.addClass('ui-state-disabled');
                    this.nextNav.removeClass('ui-state-disabled');   
                }
                else if(this.page === (this.totalPages - 1)) {
                    this.prevNav.removeClass('ui-state-disabled');
                    this.nextNav.addClass('ui-state-disabled');
                }
                else {
                    this.prevNav.removeClass('ui-state-disabled');
                    this.nextNav.removeClass('ui-state-disabled');   
                }
            }

            if(this.pageLinks.length) {
                this.pageLinks.filter('.fa-dot-circle-o').removeClass('fa-dot-circle-o');
                this.pageLinks.eq(this.page).addClass('fa-dot-circle-o');
            }

            if(this.dropdown.length) {
                this.dropdown.val(this.page + 1);
            }

            if(this.mobileDropdown.length) {
                this.mobileDropdown.val(this.page + 1);
            }
        },

        setPage: function(p) {      
            if(p !== this.page && !this.element.is(':animated')) {
                var $this = this;

                this.element.animate({
                    left: -1 * (this.viewport.innerWidth() * p)
                    ,easing: this.options.easing
                }, 
                {
                    duration: this.options.effectDuration,
                    easing: this.options.easing,
                    complete: function() {
                        $this.page = p;
                        $this.first = $this.page * $this.columns;
                        $this.updateNavigators();
                        $this._trigger('pageChange', null, {'page':p});
                    }
                });
            }
        },

        startAutoplay: function() {
            var $this = this;

            this.interval = setInterval(function() {
                if($this.page === ($this.totalPages - 1))
                    $this.setPage(0);
                else
                    $this.setPage($this.page + 1);
            }, this.options.autoplayInterval);
        },

        stopAutoplay: function() {
            clearInterval(this.interval);
        },
                
        _setOption: function(key, value) {
            if(key === 'datasource')
                this._updateDatasource(value);
            else
                $.Widget.prototype._setOption.apply(this, arguments);
        },
        
        _createItemContent: function(obj) {
            if(this.options.template) {
                var template = this.options.template.html();
                Mustache.parse(template);
                return Mustache.render(template, obj);
            }
            else {
                return this.options.itemContent.call(this, obj);
            }
        }

    });
    
})();
/**
 * PrimeUI Dialog Widget
 */
(function() {

    $.widget("primeui.puidialog", {
       
        options: {
            draggable: true,
            resizable: true,
            location: 'center',
            minWidth: 150,
            minHeight: 25,
            height: 'auto',
            width: '300px',
            visible: false,
            modal: false,
            showEffect: null,
            hideEffect: null,
            effectOptions: {},
            effectSpeed: 'normal',
            closeOnEscape: true,
            rtl: false,
            closable: true,
            minimizable: false,
            maximizable: false,
            appendTo: null,
            buttons: null,
            responsive: false,
            title: null,
            enhanced: false
        },
        
        _create: function() {
            this.id = this.element.attr('id');
            if(!this.id) {
                this.id = this.element.uniqueId().attr('id');
            }
            
            //container
            if(!this.options.enhanced) {
                this.element.addClass('ui-dialog ui-widget ui-widget-content ui-helper-hidden ui-corner-all ui-shadow')
                        .contents().wrapAll('<div class="ui-dialog-content ui-widget-content" />');

                //header
                var title = this.options.title||this.element.attr('title');
                this.element.prepend('<div class="ui-dialog-titlebar ui-widget-header ui-helper-clearfix ui-corner-top">' +
                                '<span id="' + this.element.attr('id') + '_label" class="ui-dialog-title">' + title + '</span>')
                                .removeAttr('title');

                //footer
                if(this.options.buttons) {
                    this.footer = $('<div class="ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"></div>').appendTo(this.element);
                    for(var i = 0; i < this.options.buttons.length; i++) {
                        var buttonMeta = this.options.buttons[i],
                        button = $('<button type="button"></button>').appendTo(this.footer);
                        if(buttonMeta.text) {
                            button.text(buttonMeta.text);
                        }
                        
                        button.puibutton(buttonMeta);
                    }  
                }

                if(this.options.rtl) {
                    this.element.addClass('ui-dialog-rtl');
                }
            }
            
            //elements
            this.content = this.element.children('.ui-dialog-content');
            this.titlebar = this.element.children('.ui-dialog-titlebar');
            
            if(!this.options.enhanced) {
                if(this.options.closable) {
                    this._renderHeaderIcon('ui-dialog-titlebar-close', 'fa-close');
                }
                
                if(this.options.maximizable) {
                    this._renderHeaderIcon('ui-dialog-titlebar-maximize', 'fa-sort');
                }
                
                if(this.options.minimizable) {
                    this._renderHeaderIcon('ui-dialog-titlebar-minimize', 'fa-minus');
                }
            }
            
            //icons
            this.icons = this.titlebar.children('.ui-dialog-titlebar-icon');
            this.closeIcon = this.titlebar.children('.ui-dialog-titlebar-close');
            this.minimizeIcon = this.titlebar.children('.ui-dialog-titlebar-minimize');
            this.maximizeIcon = this.titlebar.children('.ui-dialog-titlebar-maximize');
            
            this.blockEvents = 'focus.puidialog mousedown.puidialog mouseup.puidialog keydown.puidialog keyup.puidialog';            
            this.parent = this.element.parent();
            
            //size
            this.element.css({'width': this.options.width, 'height': 'auto'});
            this.content.height(this.options.height);

            //events
            this._bindEvents();

            if(this.options.draggable) {
                this._setupDraggable();
            }

            if(this.options.resizable) {
                this._setupResizable();
            }

            if(this.options.appendTo) {
                this.element.appendTo(this.options.appendTo);
            }
            
            if(this.options.responsive) {
                this.resizeNS = 'resize.' + this.id;
            }

            //docking zone
            if($(document.body).children('.ui-dialog-docking-zone').length === 0) {
                $(document.body).append('<div class="ui-dialog-docking-zone"></div>');
            }

            //aria
            this._applyARIA();

            if(this.options.visible) {
                this.show();
            }
        },

        _destroy: function() {
            //restore dom
            if(!this.options.enhanced) {
                this.element.removeClass('ui-dialog ui-widget ui-widget-content ui-helper-hidden ui-corner-all ui-shadow');

                if(this.options.buttons) {
                    this.footer.children('button').puibutton('destroy');
                    this.footer.remove();
                }

                if(this.options.rtl) {
                    this.element.removeClass('ui-dialog-rtl');
                }

                var title = this.titlebar.children('.ui-dialog-title').text()||this.options.title;
                if(title) {
                    this.element.attr('title', title);
                }
                this.titlebar.remove();

                this.content.contents().unwrap();
            }

            //remove events
            this._unbindEvents();

            if(this.options.draggable) {
                this.element.draggable('destroy');
            }

            if(this.options.resizable) {
                this.element.resizable('destroy');
            }

            if(this.options.appendTo) {
                this.element.appendTo(this.parent);
            }
            
            this._unbindResizeListener();

            if(this.options.modal) {
                this._disableModality();
            }

            this._removeARIA();
            this.element.css({
                'width': 'auto',
                'height': 'auto'
            });
        },
        
        _renderHeaderIcon: function(styleClass, icon) {
            this.titlebar.append('<a class="ui-dialog-titlebar-icon ' + styleClass + ' ui-corner-all" href="#" role="button">' +
                                '<span class="fa fa-fw ' + icon + '"></span></a>');
        },
        
        _enableModality: function() {
            var $this = this,
            doc = $(document);

            this.modality = $('<div id="' + this.element.attr('id') + '_modal" class="ui-widget-overlay ui-dialog-mask"></div>').appendTo(document.body)
                                .css('z-index', this.element.css('z-index') - 1);

            //Disable tabbing out of modal dialog and stop events from targets outside of dialog
            doc.on('keydown.puidialog',
                    function(event) {
                        if(event.keyCode == $.ui.keyCode.TAB) {
                            var tabbables = $this.content.find(':tabbable'), 
                            first = tabbables.filter(':first'), 
                            last = tabbables.filter(':last');

                            if(event.target === last[0] && !event.shiftKey) {
                                first.focus(1);
                                return false;
                            } 
                            else if (event.target === first[0] && event.shiftKey) {
                                last.focus(1);
                                return false;
                            }
                        }
                    })
                    .bind(this.blockEvents, function(event) {
                        if ($(event.target).zIndex() < $this.element.zIndex()) {
                            return false;
                        }
                    });
        },

        _disableModality: function() {
            if(this.modality) {
                this.modality.remove();
                this.modality = null;
            }
            
            $(document).off(this.blockEvents).off('keydown.dialog');
        },

        show: function() {
            if(this.element.is(':visible')) {
                return;
            }

            if(!this.positionInitialized) {
                this._initPosition();
            }
            
            this._trigger('beforeShow', null);

            if(this.options.showEffect) {
                var $this = this;

                this.element.show(this.options.showEffect, this.options.effectOptions, this.options.effectSpeed, function() {
                    $this._postShow();
                });
            }    
            else {
                this.element.show();

                this._postShow();
            }

            this._moveToTop();

            if(this.options.modal) {
                this._enableModality();
            }
        },

        _postShow: function() {   
            //execute user defined callback
            this._trigger('afterShow', null);

            this.element.attr({
                'aria-hidden': false,
                'aria-live': 'polite'
            });

            this._applyFocus();
            
            if(this.options.responsive) {
                this._bindResizeListener();
            }
        },

        hide: function() {   
            if(this.element.is(':hidden')) {
                return;
            }
            
            this._trigger('beforeHide', null);

            if(this.options.hideEffect) {
                var _self = this;

                this.element.hide(this.options.hideEffect, this.options.effectOptions, this.options.effectSpeed, function() {
                    _self._postHide();
                });
            }
            else {
                this.element.hide();

                this._postHide();
            }

            if(this.options.modal) {
                this._disableModality();
            }
        },
        
        _postHide: function() {
            //execute user defined callback
            this._trigger('afterHide', null);

            this.element.attr({
                'aria-hidden': true,
                'aria-live': 'off'
            });
            
            if(this.options.responsive) {
                this._unbindResizeListener();
            }
        },

        _applyFocus: function() {
            this.element.find(':not(:submit):not(:button):input:visible:enabled:first').focus();
        },

        _bindEvents: function() {   
            var $this = this;
            this.element.on('mousedown.puidialog', function(e) {
                if(!$(e.target).data('ui-widget-overlay')) { 
                  $this._moveToTop();
                }
             });

            this.icons.mouseover(function() {
                $(this).addClass('ui-state-hover');
            }).mouseout(function() {
                $(this).removeClass('ui-state-hover');
            });

            this.closeIcon.on('click.puidialog', function(e) {
                $this.hide();
                $this._trigger('clickClose');
                e.preventDefault();
            });

            this.maximizeIcon.click(function(e) {
                $this.toggleMaximize();
                e.preventDefault();
            });

            this.minimizeIcon.click(function(e) {
                $this.toggleMinimize();
                e.preventDefault();
            });

            if(this.options.closeOnEscape) {
                $(document).on('keydown.dialog_' + this.id, function(e) {
                    var keyCode = $.ui.keyCode,
                    active = parseInt($this.element.css('z-index'), 10) === PUI.zindex;

                    if(e.which === keyCode.ESCAPE && $this.element.is(':visible') && active) {
                        $this.hide();
                        $this._trigger('hideWithEscape');
                    }
                });
            }
        },

        _unbindEvents: function() {
            this.element.off('mousedown.puidialog');
            this.icons.off();
            $(document).off('keydown.dialog_' + this.id);
        },

        _setupDraggable: function() {    
            this.element.draggable({
                cancel: '.ui-dialog-content, .ui-dialog-titlebar-close',
                handle: '.ui-dialog-titlebar',
                containment : 'document'
            });
        },

        _setupResizable: function() {
            var $this = this;
            
            this.element.resizable({
                minWidth : this.options.minWidth,
                minHeight : this.options.minHeight,
                alsoResize : this.content,
                containment: 'document',
                start: function(event, ui) {
                    $this.element.data('offset', $this.element.offset());
                },
                stop: function(event, ui) {
                    var offset = $this.element.data('offset');

                    $this.element.css('position', 'fixed');
                    $this.element.offset(offset);
                }
            });

            this.resizers = this.element.children('.ui-resizable-handle');
        },

        _initPosition: function() {
            //reset
            this.element.css({left:0,top:0});

            if(/(center|left|top|right|bottom)/.test(this.options.location)) {
                this.options.location = this.options.location.replace(',', ' ');

                this.element.position({
                            my: 'center',
                            at: this.options.location,
                            collision: 'fit',
                            of: window,
                            //make sure dialog stays in viewport
                            using: function(pos) {
                                var l = pos.left < 0 ? 0 : pos.left,
                                t = pos.top < 0 ? 0 : pos.top;

                                $(this).css({
                                    left: l,
                                    top: t
                                });
                            }
                        });
            }
            else {
                var coords = this.options.position.split(','),
                x = $.trim(coords[0]),
                y = $.trim(coords[1]);

                this.element.offset({
                    left: x,
                    top: y
                });
            }

            this.positionInitialized = true;
        },

        _moveToTop: function() {
            this.element.css('z-index',++PUI.zindex);
        },

        toggleMaximize: function() {
            if(this.minimized) {
                this.toggleMinimize();
            }

            if(this.maximized) {
                this.element.removeClass('ui-dialog-maximized');
                this._restoreState();

                this.maximizeIcon.removeClass('ui-state-hover');
                this.maximized = false;
            }
            else {
                this._saveState();

                var win = $(window);

                this.element.addClass('ui-dialog-maximized').css({
                    'width': win.width() - 6,
                    'height': win.height()
                }).offset({
                    top: win.scrollTop(),
                    left: win.scrollLeft()
                });

                //maximize content
                this.content.css({
                    width: 'auto',
                    height: 'auto'
                });

                this.maximizeIcon.removeClass('ui-state-hover');
                this.maximized = true;
                this._trigger('maximize');
            }
        },

        toggleMinimize: function() {
            var animate = true,
            dockingZone = $(document.body).children('.ui-dialog-docking-zone');

            if(this.maximized) {
                this.toggleMaximize();
                animate = false;
            }

            var $this = this;

            if(this.minimized) {
                this.element.appendTo(this.parent).removeClass('ui-dialog-minimized').css({'position':'fixed', 'float':'none'});
                this._restoreState();
                this.content.show();
                this.minimizeIcon.removeClass('ui-state-hover').children('.fa').removeClass('fa-plus').addClass('fa-minus');
                this.minimized = false;

                if(this.options.resizable) {
                    this.resizers.show();
                }
                
                if(this.footer) {
                    this.footer.show();
                }
            }
            else {
                this._saveState();

                if(animate) {
                    this.element.effect('transfer', {
                                    to: dockingZone,
                                    className: 'ui-dialog-minimizing'
                                 }, 500,
                                    function() {
                                        $this._dock(dockingZone);
                                        $this.element.addClass('ui-dialog-minimized');
                                    });
                } 
                else {
                    this._dock(dockingZone);
                }
            }
        },

        _dock: function(zone) {
            this.element.appendTo(zone).css('position', 'static');
            this.element.css({'height':'auto', 'width':'auto', 'float': 'left'});
            this.content.hide();
            this.minimizeIcon.removeClass('ui-state-hover').children('.fa').removeClass('fa-minus').addClass('fa-plus');
            this.minimized = true;

            if(this.options.resizable) {
                this.resizers.hide();
            }
            
            if(this.footer) {
                this.footer.hide();
            }
            
            zone.css('z-index',++PUI.zindex);

            this._trigger('minimize');
        },

        _saveState: function() {
            this.state = {
                width: this.element.width(),
                height: this.element.height()
            };

            var win = $(window);
            this.state.offset = this.element.offset();
            this.state.windowScrollLeft = win.scrollLeft();
            this.state.windowScrollTop = win.scrollTop();
        },

        _restoreState: function() {
            this.element.width(this.state.width).height(this.state.height);
            
            var win = $(window);
            this.element.offset({
                    top: this.state.offset.top + (win.scrollTop() - this.state.windowScrollTop),
                    left: this.state.offset.left + (win.scrollLeft() - this.state.windowScrollLeft)
            });
        },

        _applyARIA: function() {
            this.element.attr({
                'role': 'dialog',
                'aria-labelledby': this.element.attr('id') + '_title',
                'aria-hidden': !this.options.visible
            });

            this.titlebar.children('a.ui-dialog-titlebar-icon').attr('role', 'button');
        },

        _removeARIA: function() {
            this.element.removeAttr('role').removeAttr('aria-labelledby').removeAttr('aria-hidden')
                            .removeAttr('aria-live').removeAttr('aria-hidden');
        },
        
        _bindResizeListener: function() {
            var $this = this;
            $(window).on(this.resizeNS, function(e) {
                if(e.target === window) {
                    $this._initPosition();
                }
            });
        },

        _unbindResizeListener: function() {
            $(window).off(this.resizeNS);
        },

        _setOption: function(key, value) {
            if(key === 'visible') {
                if(value)
                    this.show();
                else
                    this.hide();
            }
            else {
                $.Widget.prototype._setOption.apply(this, arguments);
            }
        }
    });
})();
/**
 * PrimeUI dropdown widget
 */
(function() {

    $.widget("primeui.puidropdown", {

        options: {
            effect: 'fade',
            effectSpeed: 'normal',
            filter: false,
            filterMatchMode: 'startsWith',
            caseSensitiveFilter: false,
            filterFunction: null,
            data: null,
            content: null,
            scrollHeight: 200,
            appendTo: 'body',
            editable: false,
            value: null,
            style: null,
            styleClass: null
        },

        _create: function() {
            this.id = this.element.attr('id');
            if(!this.id) {
                this.id = this.element.uniqueId().attr('id');
            }
            
            if(!this.options.enhanced) {
                if(this.options.data) {
                    if($.isArray(this.options.data)) {
                        this._generateOptionElements(this.options.data);
                    }
                    else {
                        if($.type(this.options.data) === 'function') {
                            this.options.data.call(this, this._onRemoteOptionsLoad);
                            return;
                        }
                        else {
                            if($.type(this.options.data) === 'string') {
                                var $this = this,
                                dataURL = this.options.data;
                                
                                var loader = function() {
                                    $.ajax({
                                        type: 'GET',
                                        url: dataURL,
                                        dataType: "json",
                                        context: $this,
                                        success: function (response) {
                                            this._onRemoteOptionsLoad(response);
                                        }
                                    });
                                };
                                loader.call(this);
                            }
                        }
                        return;
                    }
                }
                
                this._render();
            }
            else {
                this.choices = this.element.children('option');
                this.container = this.element.closest('.ui-dropdown');
                this.focusElementContainer = this.container.children('.ui-helper-hidden-accessible:last');
                this.focusElement = this.focusElementContainer.children('input');
                this.label = this.container.children('.ui-dropdown-label');
                this.menuIcon = this.container.children('.ui-dropdown-trigger');
                this.panel = this.container.children('.ui-dropdown-panel');
                this.itemsWrapper = this.panel.children('.ui-dropdown-items-wrapper');
                this.itemsContainer = this.itemsWrapper.children('ul');
                this.itemsContainer.addClass('ui-dropdown-items ui-dropdown-list ui-widget-content ui-widget ui-corner-all ui-helper-reset');
                this.items = this.itemsContainer.children('li').addClass('ui-dropdown-item ui-dropdown-list-item ui-corner-all');

                var $this = this;
                this.items.each(function(i) {
                    $(this).data('label', $this.choices.eq(i).text());
                });

                if(this.options.filter) {
                    this.filterContainer = this.panel.children('.ui-dropdown-filter-container');
                    this.filterInput = this.filterContainer.children('input');
                }
            }

            this._postRender();
        },
        
        _render: function() {
            this.choices = this.element.children('option');
            this.element.attr('tabindex', '-1').wrap('<div class="ui-dropdown ui-widget ui-state-default ui-corner-all ui-helper-clearfix" />')
                .wrap('<div class="ui-helper-hidden-accessible" />');

            this.container = this.element.closest('.ui-dropdown');
            this.focusElementContainer = $('<div class="ui-helper-hidden-accessible"><input type="text" /></div>').appendTo(this.container);
            this.focusElement = this.focusElementContainer.children('input');
            this.label = this.options.editable ? $('<input type="text" class="ui-dropdown-label ui-inputtext ui-corner-all"">')
                : $('<label class="ui-dropdown-label ui-inputtext ui-corner-all"/>');
            this.label.appendTo(this.container);
            this.menuIcon = $('<div class="ui-dropdown-trigger ui-state-default ui-corner-right"><span class="fa fa-fw fa-caret-down"></span></div>')
                .appendTo(this.container);

            //panel
            this.panel = $('<div class="ui-dropdown-panel ui-widget-content ui-corner-all ui-helper-hidden ui-shadow" />');
            this.itemsWrapper = $('<div class="ui-dropdown-items-wrapper" />').appendTo(this.panel);
            this.itemsContainer = $('<ul class="ui-dropdown-items ui-dropdown-list ui-widget-content ui-widget ui-corner-all ui-helper-reset"></ul>')
                .appendTo(this.itemsWrapper);

            this.optGroupsSize = this.itemsContainer.children('li.puiselectonemenu-item-group').length;

            if(this.options.filter) {
                this.filterContainer = $('<div class="ui-dropdown-filter-container" />').prependTo(this.panel);
                this.filterInput = $('<input type="text" autocomplete="off" class="ui-dropdown-filter ui-inputtext ui-widget ui-state-default ui-corner-all" />')
                    .appendTo(this.filterContainer);
                this.filterContainer.append('<span class="fa fa-search"></span>');
            }

            this._generateItems();
        },
        
        _postRender: function() {
            if(this.options.style) {
                this.container.attr('style', this.options.style);
            }

            if(this.options.styleClass) {
                this.container.addClass(this.options.styleClass);
            }

            this.disabled = this.element.prop('disabled')||this.options.disabled;

            if(this.options.appendTo === 'self')
                this.panel.appendTo(this.container);
            else
                this.panel.appendTo(this.options.appendTo);

            if(this.options.scrollHeight && this.panel.outerHeight() > this.options.scrollHeight) {
                this.itemsWrapper.height(this.options.scrollHeight);
            }

            var $this = this;

            //preselection via value option
            if(this.options.value) {
                this.choices.filter('[value="'+this.options.value+'"]').prop('selected', true);
            }

            var selectedOption = this.choices.filter(':selected');

            //disable options
            this.choices.filter(':disabled').each(function() {
                $this.items.eq($(this).index()).addClass('ui-state-disabled');
            });

            //triggers
            this.triggers = this.options.editable ? this.menuIcon : this.container.children('.ui-dropdown-trigger, .ui-dropdown-label');

            //activate selected
            if(this.options.editable) {
                var customInputVal = this.label.val();

                //predefined input
                if(customInputVal === selectedOption.text()) {
                    this._highlightItem(this.items.eq(selectedOption.index()));
                }
                //custom input
                else {
                    this.items.eq(0).addClass('ui-state-highlight');
                    this.customInput = true;
                    this.customInputVal = customInputVal;
                }
            }
            else {
                this._highlightItem(this.items.eq(selectedOption.index()));
            }

            if(!this.disabled) {
                this._bindEvents();
                this._bindConstantEvents();
            }
        },
        
        _onRemoteOptionsLoad: function(data) {
            this._generateOptionElements(data);
            this._render();
            this._postRender();
        },
        
        _generateOptionElements: function(data) {
            for(var i = 0; i < data.length; i++) {
                var choice = data[i];
                if(choice.label)
                    this.element.append('<option value="' + choice.value + '">' + choice.label + '</option>');
                else
                    this.element.append('<option value="' + choice + '">' + choice + '</option>');
            }
        },

        _generateItems: function() {
            for(var i = 0; i < this.choices.length; i++) {
                var option = this.choices.eq(i),
                    optionLabel = option.text(),
                    content = this.options.content ? this.options.content.call(this, this.options.data[i]) : optionLabel;

                this.itemsContainer.append('<li data-label="' + optionLabel + '" class="ui-dropdown-item ui-dropdown-list-item ui-corner-all">' + content + '</li>');
            }

            this.items = this.itemsContainer.children('.ui-dropdown-item');
        },

        _bindEvents: function() {
            var $this = this;

            this.items.filter(':not(.ui-state-disabled)').each(function(i, item) {
                $this._bindItemEvents($(item));
            });

            this.triggers.on('mouseenter.puidropdown', function() {
                    if(!$this.container.hasClass('ui-state-focus')) {
                        $this.container.addClass('ui-state-hover');
                        $this.menuIcon.addClass('ui-state-hover');
                    }
                })
                .on('mouseleave.puidropdown', function() {
                    $this.container.removeClass('ui-state-hover');
                    $this.menuIcon.removeClass('ui-state-hover');
                })
                .on('click.puidropdown', function(e) {
                    if($this.panel.is(":hidden")) {
                        $this._show();
                    }
                    else {
                        $this._hide();

                        $this._revert();
                    }

                    $this.container.removeClass('ui-state-hover');
                    $this.menuIcon.removeClass('ui-state-hover');
                    $this.focusElement.trigger('focus.puidropdown');
                    e.preventDefault();
                });

            this.focusElement.on('focus.puidropdown', function() {
                    $this.container.addClass('ui-state-focus');
                    $this.menuIcon.addClass('ui-state-focus');
                })
                .on('blur.puidropdown', function() {
                    $this.container.removeClass('ui-state-focus');
                    $this.menuIcon.removeClass('ui-state-focus');
                });

            if(this.options.editable) {
                this.label.on('change.ui-dropdown', function() {
                    $this._triggerChange(true);
                    $this.customInput = true;
                    $this.customInputVal = $(this).val();
                    $this.items.filter('.ui-state-highlight').removeClass('ui-state-highlight');
                    $this.items.eq(0).addClass('ui-state-highlight');
                });
            }

            this._bindKeyEvents();

            if(this.options.filter) {
                this._setupFilterMatcher();

                this.filterInput.puiinputtext();

                this.filterInput.on('keyup.ui-dropdown', function() {
                    $this._filter($(this).val());
                });
            }
        },

        _bindItemEvents: function(item) {
            var $this = this;

            item.on('mouseover.puidropdown', function() {
                    var el = $(this);

                    if(!el.hasClass('ui-state-highlight'))
                        $(this).addClass('ui-state-hover');
                })
                .on('mouseout.puidropdown', function() {
                    $(this).removeClass('ui-state-hover');
                })
                .on('click.puidropdown', function() {
                    $this._selectItem($(this));
                });
        },

        _bindConstantEvents: function() {
            var $this = this;

            $(document.body).on('mousedown.ui-dropdown-' + this.id, function (e) {
                if($this.panel.is(":hidden")) {
                    return;
                }

                var offset = $this.panel.offset();
                if (e.target === $this.label.get(0) ||
                    e.target === $this.menuIcon.get(0) ||
                    e.target === $this.menuIcon.children().get(0)) {
                    return;
                }

                if (e.pageX < offset.left ||
                    e.pageX > offset.left + $this.panel.width() ||
                    e.pageY < offset.top ||
                    e.pageY > offset.top + $this.panel.height()) {

                    $this._hide();
                    $this._revert();
                }
            });

            this.resizeNS = 'resize.' + this.id;
            this._unbindResize();
            this._bindResize();
        },

        _bindKeyEvents: function() {
            var $this = this;

            this.focusElement.on('keydown.puidropdown', function(e) {
                var keyCode = $.ui.keyCode,
                    key = e.which,
                    activeItem;

                switch(key) {
                    case keyCode.UP:
                    case keyCode.LEFT:
                        activeItem = $this._getActiveItem();
                        var prev = activeItem.prevAll(':not(.ui-state-disabled,.ui-selectonemenu-item-group):first');

                        if(prev.length == 1) {
                            if($this.panel.is(':hidden')) {
                                $this._selectItem(prev);
                            }
                            else {
                                $this._highlightItem(prev);
                                PUI.scrollInView($this.itemsWrapper, prev);
                            }
                        }

                        e.preventDefault();
                        break;

                    case keyCode.DOWN:
                    case keyCode.RIGHT:
                        activeItem = $this._getActiveItem();
                        var next = activeItem.nextAll(':not(.ui-state-disabled,.ui-selectonemenu-item-group):first');

                        if(next.length == 1) {
                            if($this.panel.is(':hidden')) {
                                if(e.altKey) {
                                    $this._show();
                                } else {
                                    $this._selectItem(next);
                                }
                            }
                            else {
                                $this._highlightItem(next);
                                PUI.scrollInView($this.itemsWrapper, next);
                            }
                        }

                        e.preventDefault();
                        break;

                    case keyCode.ENTER:
                    case keyCode.NUMPAD_ENTER:
                        if($this.panel.is(':hidden')) {
                            $this._show();
                        }
                        else {
                            $this._selectItem($this._getActiveItem());
                        }

                        e.preventDefault();
                        break;

                    case keyCode.TAB:
                        if($this.panel.is(':visible')) {
                            $this._revert();
                            $this._hide();
                        }
                        break;

                    case keyCode.ESCAPE:
                        if($this.panel.is(':visible')) {
                            $this._revert();
                            $this._hide();
                        }
                        break;

                    default:
                        var k = String.fromCharCode((96 <= key && key <= 105)? key-48 : key),
                            currentItem = $this.items.filter('.ui-state-highlight');

                        //Search items forward from current to end and on no result, search from start until current
                        var highlightItem = $this._search(k, currentItem.index() + 1, $this.options.length);
                        if(!highlightItem) {
                            highlightItem = $this._search(k, 0, currentItem.index());
                        }

                        if(highlightItem) {
                            if($this.panel.is(':hidden')) {
                                $this._selectItem(highlightItem);
                            }
                            else {
                                $this._highlightItem(highlightItem);
                                PUI.scrollInView($this.itemsWrapper, highlightItem);
                            }
                        }

                        break;
                }
            });
        },

        _unbindEvents: function() {
            this.items.off('mouseover.puidropdown mouseout.puidropdown click.puidropdown');
            this.triggers.off('mouseenter.puidropdown mouseleave.puidropdown click.puidropdown');
            this.focusElement.off('keydown.puidropdown focus.puidropdown blur.puidropdown');

            if(this.options.editable) {
                this.label.off('change.puidropdown');
            }

            if(this.options.filter) {
                this.filterInput.off('keyup.ui-dropdown');
            }

            $(document.body).off('mousedown.ui-dropdown-' + this.id);
            this._unbindResize();
        },

        _selectItem: function(item, silent) {
            var selectedOption = this.choices.eq(this._resolveItemIndex(item)),
                currentOption = this.choices.filter(':selected'),
                sameOption = selectedOption.val() == currentOption.val(),
                shouldChange = null;

            if(this.options.editable) {
                shouldChange = (!sameOption)||(selectedOption.text() != this.label.val());
            }
            else {
                shouldChange = !sameOption;
            }

            if(shouldChange) {
                this._highlightItem(item);
                this.element.val(selectedOption.val());

                this._triggerChange();

                if(this.options.editable) {
                    this.customInput = false;
                }
            }

            if(!silent) {
                this.focusElement.trigger('focus.puidropdown');
            }

            if(this.panel.is(':visible')) {
                this._hide();
            }
        },

        _highlightItem: function(item) {
            this.items.filter('.ui-state-highlight').removeClass('ui-state-highlight');

            if(item.length) {
                item.addClass('ui-state-highlight');
                
                this._setLabel(item.data('label'));
            }
            else {
                this._setLabel('&nbsp;');
            }
        },

        _triggerChange: function(edited) {
            this.changed = false;
            var selectedOption = this.choices.filter(':selected');

            if(this.options.change) {
                this._trigger('change', null, {
                    value: selectedOption.val(),
                    index: selectedOption.index()
                });
            }

            if(!edited) {
                this.value = this.choices.filter(':selected').val();
            }
        },

        _resolveItemIndex: function(item) {
            if(this.optGroupsSize === 0) {
                return item.index();
            }
            else {
                return item.index() - item.prevAll('li.ui-dropdown-item-group').length;
            }
        },

        _setLabel: function(value) {
            if(this.options.editable) {
                this.label.val(value);
            }
            else {
                if(value === '&nbsp;') {
                    this.label.html('&nbsp;');
                }
                else {
                    this.label.text(value);
                }
            }
        },

        _bindResize: function() {
            var $this = this;

            $(window).bind(this.resizeNS, function(e) {
                if($this.panel.is(':visible')) {
                    $this._alignPanel();
                }
            });
        },

        _unbindResize: function() {
            $(window).unbind(this.resizeNS);
        },

        _alignPanelWidth: function() {
            if(!this.panelWidthAdjusted) {
                var jqWidth = this.container.outerWidth();
                if(this.panel.outerWidth() < jqWidth) {
                    this.panel.width(jqWidth);
                }

                this.panelWidthAdjusted = true;
            }
        },

        _alignPanel: function() {
            if(this.panel.parent().is(this.container)) {
                this.panel.css({
                        left: '0px',
                        top: this.container.outerHeight() + 'px'
                    })
                    .width(this.container.outerWidth());
            }
            else {
                this._alignPanelWidth();
                this.panel.css({left:'', top:''}).position({
                    my: 'left top',
                    at: 'left bottom',
                    of: this.container,
                    collision: 'flipfit'
                });
            }
        },

        _show: function() {
            this._alignPanel();

            this.panel.css('z-index', ++PUI.zindex);

            if(this.options.effect !== 'none') {
                this.panel.show(this.options.effect, {}, this.options.effectSpeed);
            }
            else {
                this.panel.show();
            }
            this.preShowValue = this.choices.filter(':selected');
        },

        _hide: function() {
            this.panel.hide();
        },

        _revert: function() {
            if(this.options.editable && this.customInput) {
                this._setLabel(this.customInputVal);
                this.items.filter('.ui-state-active').removeClass('ui-state-active');
                this.items.eq(0).addClass('ui-state-active');
            }
            else {
                this._highlightItem(this.items.eq(this.preShowValue.index()));
            }
        },

        _getActiveItem: function() {
            return this.items.filter('.ui-state-highlight');
        },

        _setupFilterMatcher: function() {
            this.filterMatchers = {
                'startsWith': this._startsWithFilter,
                'contains': this._containsFilter,
                'endsWith': this._endsWithFilter,
                'custom': this.options.filterFunction
            };

            this.filterMatcher = this.filterMatchers[this.options.filterMatchMode];
        },

        _startsWithFilter: function(value, filter) {
            return value.indexOf(filter) === 0;
        },

        _containsFilter: function(value, filter) {
            return value.indexOf(filter) !== -1;
        },

        _endsWithFilter: function(value, filter) {
            return value.indexOf(filter, value.length - filter.length) !== -1;
        },

        _filter: function(value) {
            this.initialHeight = this.initialHeight||this.itemsWrapper.height();
            var filterValue = this.options.caseSensitiveFilter ? $.trim(value) : $.trim(value).toLowerCase();

            if(filterValue === '') {
                this.items.filter(':hidden').show();
            }
            else {
                for(var i = 0; i < this.choices.length; i++) {
                    var option = this.choices.eq(i),
                        itemLabel = this.options.caseSensitiveFilter ? option.text() : option.text().toLowerCase(),
                        item = this.items.eq(i);

                    if(this.filterMatcher(itemLabel, filterValue))
                        item.show();
                    else
                        item.hide();
                }
            }

            if(this.itemsContainer.height() < this.initialHeight) {
                this.itemsWrapper.css('height', 'auto');
            }
            else {
                this.itemsWrapper.height(this.initialHeight);
            }

            this._alignPanel();
        },

        _search: function(text, start, end) {
            for(var i = start; i  < end; i++) {
                var option = this.choices.eq(i);

                if(option.text().indexOf(text) === 0) {
                    return this.items.eq(i);
                }
            }

            return null;
        },

        getSelectedValue: function() {
            return this.element.val();
        },

        getSelectedLabel: function() {
            return this.choices.filter(':selected').text();
        },

        selectValue : function(value) {
            var option = this.choices.filter('[value="' + value + '"]');

            this._selectItem(this.items.eq(option.index()), true);
        },

        addOption: function(option, val) {
            var value, label;

            //backward compatibility for key-value parameters
            if(val !== undefined && val !== null) {
                value = val;
                label = option;
            }
            //key-value as properties of option object
            else {
                value = (option.value !== undefined && option.value !== null) ? option.value : option;
                label = (option.label !== undefined && option.label !== null) ? option.label : option;
            }

            var content = this.options.content ? this.options.content.call(this, option) : label,
                item = $('<li data-label="' + label + '" class="ui-dropdown-item ui-dropdown-list-item ui-corner-all">' + content + '</li>'),
                optionElement = $('<option value="' + value + '">' + label + '</option>');

            optionElement.appendTo(this.element);
            this._bindItemEvents(item);
            item.appendTo(this.itemsContainer);
            this.items.push(item[0]);
            this.choices = this.element.children('option');

            // If this is the first option, it is the default selected one
            if (this.items.length === 1) {
                this.selectValue(value);
                this._highlightItem(item);
            }
        },

        removeAllOptions: function() {
            this.element.empty();
            this.itemsContainer.empty();
            this.items.length = 0;
            this.choices.length = 0;
            this.element.val('');
            this.label.text('');
        },

        _setOption: function (key, value) {
            if (key === 'data' || key === 'options') {
                this.options.data = value;
                this.removeAllOptions();

                for(var i = 0; i < this.options.data.length; i++) {
                    this.addOption(this.options.data[i]);
                }

                if(this.options.scrollHeight && this.panel.outerHeight() > this.options.scrollHeight) {
                    this.itemsWrapper.height(this.options.scrollHeight);
                }
            }
            else if(key === 'value') {
                this.options.value = value;
                this.choices.prop('selected', false);
                var selectedOption = this.choices.filter('[value="'+this.options.value+'"]');
                if(selectedOption.length) {
                    selectedOption.prop('selected', true);
                    this._highlightItem(this.items.eq(selectedOption.index()));
                }
            }
            else {
                $.Widget.prototype._setOption.apply(this, arguments);
            }
        },

        disable: function() {
            this._unbindEvents();
            this.label.addClass('ui-state-disabled');
            this.menuIcon.addClass('ui-state-disabled');
        },

        enable: function() {
            this._bindEvents();
            this.label.removeClass('ui-state-disabled');
            this.menuIcon.removeClass('ui-state-disabled');
        },

        getEditableText: function() {
            return this.label.val();
        },

        _destroy: function() {
            this._unbindEvents();
            if(!this.options.enhanced) {
                this.panel.remove();
                this.label.remove();
                this.menuIcon.remove();
                this.focusElementContainer.remove();
                this.element.unwrap().unwrap();
            }
            else {
                if(this.options.appendTo == 'body') {
                    this.panel.appendTo(this.container);
                }

                if(this.options.style) {
                    this.container.removeAttr('style');
                }

                if(this.options.styleClass) {
                    this.container.removeClass(this.options.styleClass);
                }
            }
        }
    });

})();
/**
 * PrimeUI Lightbox Widget
 */
(function() {

    $.widget("primeui.puigalleria", {
       
        options: {
            panelWidth: 600,
            panelHeight: 400,
            frameWidth: 60,
            frameHeight: 40,
            activeIndex: 0,
            showFilmstrip: true,
            autoPlay: true,
            transitionInterval: 4000,
            effect: 'fade',
            effectSpeed: 250,
            effectOptions: {},
            showCaption: true,
            customContent: false
        },
        
        _create: function() {
            this.element.addClass('ui-galleria ui-widget ui-widget-content ui-corner-all');
            this.panelWrapper = this.element.children('ul');
            this.panelWrapper.addClass('ui-galleria-panel-wrapper');
            this.panels = this.panelWrapper.children('li');
            this.panels.addClass('ui-galleria-panel ui-helper-hidden');
                        
            this.element.width(this.options.panelWidth);
            this.panelWrapper.width(this.options.panelWidth).height(this.options.panelHeight);
            this.panels.width(this.options.panelWidth).height(this.options.panelHeight);

            if(this.options.showFilmstrip) {
                this._renderStrip();
                this._bindEvents();
            }
            
            if(this.options.customContent) {
                this.panels.children('img').hide();
                this.panels.children('div').addClass('ui-galleria-panel-content');
            }
            
            //show first
            var activePanel = this.panels.eq(this.options.activeIndex);
            activePanel.removeClass('ui-helper-hidden');
            if(this.options.showCaption) {
                this._showCaption(activePanel);
            }
            
            this.element.css('visibility', 'visible');

            if(this.options.autoPlay) {
                this.startSlideshow();
            }
        },

        _destroy: function() {
            this.stopSlideshow();
            this._unbindEvents();
            this.element.removeClass('ui-galleria ui-widget ui-widget-content ui-corner-all').removeAttr('style');
            this.panelWrapper.removeClass('ui-galleria-panel-wrapper').removeAttr('style');
            this.panels.removeClass('ui-galleria-panel ui-helper-hidden').removeAttr('style');
            this.strip.remove();
            this.stripWrapper.remove();
            this.element.children('.fa').remove();
            if(this.options.showCaption) {
                this.caption.remove();
            }
            this.panels.children('img').show();
        },
        
        _renderStrip: function() {
            var frameStyle = 'style="width:' + this.options.frameWidth + "px;height:" + this.options.frameHeight + 'px;"';

            this.stripWrapper = $('<div class="ui-galleria-filmstrip-wrapper"></div>')
                    .width(this.element.width() - 50)
                    .height(this.options.frameHeight)
                    .appendTo(this.element);

            this.strip = $('<ul class="ui-galleria-filmstrip"></div>').appendTo(this.stripWrapper);

            for(var i = 0; i < this.panels.length; i++) {
                var image = this.panels.eq(i).children('img'),
                frameClass = (i == this.options.activeIndex) ? 'ui-galleria-frame ui-galleria-frame-active' : 'ui-galleria-frame',
                frameMarkup = '<li class="'+ frameClass + '" ' + frameStyle + '>' +
                '<div class="ui-galleria-frame-content" ' + frameStyle + '>' +
                '<img src="' + image.attr('src') + '" class="ui-galleria-frame-image" ' + frameStyle + '/>' +
                '</div></li>';

                this.strip.append(frameMarkup);
            }

            this.frames = this.strip.children('li.ui-galleria-frame');

            //navigators
            this.element.append('<div class="ui-galleria-nav-prev fa fa-fw fa-chevron-circle-left" style="bottom:' + (this.options.frameHeight / 2) + 'px"></div>' + 
                '<div class="ui-galleria-nav-next fa fa-fw fa-chevron-circle-right" style="bottom:' + (this.options.frameHeight / 2) + 'px"></div>');

            //caption
            if(this.options.showCaption) {
                this.caption = $('<div class="ui-galleria-caption"></div>').css({
                    'bottom': this.stripWrapper.outerHeight() + 10,
                    'width': this.panelWrapper.width()
                    }).appendTo(this.element);
            }
        },
        
        _bindEvents: function() {
            var $this = this;

            this.element.children('div.ui-galleria-nav-prev').on('click.puigalleria', function() {
                if($this.slideshowActive) {
                    $this.stopSlideshow();
                }

                if(!$this.isAnimating()) {
                    $this.prev();
                }
            });

            this.element.children('div.ui-galleria-nav-next').on('click.puigalleria', function() {
                if($this.slideshowActive) {
                    $this.stopSlideshow();
                }

                if(!$this.isAnimating()) {
                    $this.next();
                }
            });

            this.strip.children('li.ui-galleria-frame').on('click.puigalleria', function() {
                if($this.slideshowActive) {
                    $this.stopSlideshow();
                }

                $this.select($(this).index(), false);
            });
        },

        _unbindEvents: function() {
            this.element.children('div.ui-galleria-nav-prev').off('click.puigalleria');
            this.element.children('div.ui-galleria-nav-next').off('click.puigalleria');
            this.strip.children('li.ui-galleria-frame').off('click.puigalleria');
        },

        startSlideshow: function() {
            var $this = this;

            this.interval = window.setInterval(function() {
                $this.next();
            }, this.options.transitionInterval);

            this.slideshowActive = true;
        },

        stopSlideshow: function() {
            if(this.interval) {
                window.clearInterval(this.interval);
            }

            this.slideshowActive = false;
        },

        isSlideshowActive: function() {
            return this.slideshowActive;
        },

        select: function(index, reposition) {
            if(index !== this.options.activeIndex) {
                if(this.options.showCaption) {
                    this._hideCaption();
                }

                var oldPanel = this.panels.eq(this.options.activeIndex),
                newPanel = this.panels.eq(index);

                //content
                oldPanel.hide(this.options.effect, this.options.effectOptions, this.options.effectSpeed);
                newPanel.show(this.options.effect, this.options.effectOptions, this.options.effectSpeed);

                if (this.options.showFilmstrip) {
                    var oldFrame = this.frames.eq(this.options.activeIndex),
                        newFrame = this.frames.eq(index);

                    //frame
                    oldFrame.removeClass('ui-galleria-frame-active').css('opacity', '');
                    newFrame.animate({opacity:1.0}, this.options.effectSpeed, null, function() {
                       $(this).addClass('ui-galleria-frame-active');
                    });

                    //viewport
                    if( (reposition === undefined || reposition === true) ) {
                        var frameLeft = newFrame.position().left,
                            stepFactor = this.options.frameWidth + parseInt(newFrame.css('margin-right'), 10),
                            stripLeft = this.strip.position().left,
                            frameViewportLeft = frameLeft + stripLeft,
                            frameViewportRight = frameViewportLeft + this.options.frameWidth;

                        if(frameViewportRight > this.stripWrapper.width()) {
                            this.strip.animate({left: '-=' + stepFactor}, this.options.effectSpeed, 'easeInOutCirc');
                        } else if(frameViewportLeft < 0) {
                            this.strip.animate({left: '+=' + stepFactor}, this.options.effectSpeed, 'easeInOutCirc');
                        }
                    }
                }

                //caption
                if(this.options.showCaption) {
                    this._showCaption(newPanel);
                }

                this.options.activeIndex = index;
            }
        },
        
        _hideCaption: function() {
            this.caption.slideUp(this.options.effectSpeed);
        },
        
        _showCaption: function(panel) {
            var image = panel.children('img');
            this.caption.html('<h4>' + image.attr('title') + '</h4><p>' + image.attr('alt') + '</p>').slideDown(this.options.effectSpeed);
        },

        prev: function() {
            if(this.options.activeIndex !== 0) {
                this.select(this.options.activeIndex - 1);
            }
        },

        next: function() {
            if(this.options.activeIndex !== (this.panels.length - 1)) {
                this.select(this.options.activeIndex + 1);
            } 
            else {
                this.select(0, false);
                this.strip.animate({left: 0}, this.options.effectSpeed, 'easeInOutCirc');
            }
        },

        isAnimating: function() {
            return this.strip.is(':animated');
        }
    });
})();
/**
 * PrimeFaces Growl Widget
 */
(function() {

    $.widget("primeui.puigrowl", {

        options: {
            sticky: false,
            life: 3000,
            messages: null,
            appendTo: document.body
        },

        _create: function() {
            var container = this.element;
            this.originalParent = this.element.parent();

            container.addClass("ui-growl ui-widget");

            if(this.options.appendTo) {
                container.appendTo(this.options.appendTo);
            }

            if(this.options.messages) {
                this.show(this.options.messages);
            }
        },

        show: function(msgs) {
            var $this = this;

            this.element.css('z-index', ++PUI.zindex);

            this.clear();

            if(msgs && msgs.length) {
                $.each(msgs, function(i, msg) {
                    $this._renderMessage(msg);
                });
            }
        },

        clear: function() {
            var messageElements = this.element.children('div.ui-growl-item-container');
            for(var i = 0; i < messageElements.length; i++) {
                this._unbindMessageEvents(messageElements.eq(i));
            }

            messageElements.remove();
        },

        _renderMessage: function(msg) {
            var markup = '<div class="ui-growl-item-container ui-state-highlight ui-corner-all ui-helper-hidden" aria-live="polite">';
            markup += '<div class="ui-growl-item ui-shadow">';
            markup += '<div class="ui-growl-icon-close fa fa-close" style="display:none"></div>';
            markup += '<span class="ui-growl-image fa fa-2x ' + this._getIcon(msg.severity) + ' ui-growl-image-' + msg.severity + '"/>';
            markup += '<div class="ui-growl-message">';
            markup += '<span class="ui-growl-title">' + msg.summary + '</span>';
            markup += '<p>' + (msg.detail||'') + '</p>';
            markup += '</div><div style="clear: both;"></div></div></div>';

            var message = $(markup);

            this._bindMessageEvents(message);
            message.appendTo(this.element).fadeIn();
        },

        _removeMessage: function(message) {
            message.fadeTo('normal', 0, function() {
                message.slideUp('normal', 'easeInOutCirc', function() {
                    message.remove();
                });
            });
        },

        _bindMessageEvents: function(message) {
            var $this = this,
                sticky = this.options.sticky;

            message.on('mouseover.puigrowl', function() {
                    var msg = $(this);

                    if(!msg.is(':animated')) {
                        msg.find('div.ui-growl-icon-close:first').show();
                    }
                })
                .on('mouseout.puigrowl', function() {
                    $(this).find('div.ui-growl-icon-close:first').hide();
                });

            //remove message on click of close icon
            message.find('div.ui-growl-icon-close').on('click.puigrowl',function() {
                $this._removeMessage(message);

                if(!sticky) {
                    window.clearTimeout(message.data('timeout'));
                }
            });

            if(!sticky) {
                this._setRemovalTimeout(message);
            }
        },

        _unbindMessageEvents: function(message) {
            var $this = this,
                sticky = this.options.sticky;

            message.off('mouseover.puigrowl mouseout.puigrowl');
            message.find('div.ui-growl-icon-close').off('click.puigrowl');
            if(!sticky) {
                var timeout = message.data('timeout');
                if(timeout) {
                    window.clearTimeout(timeout);
                }
            }
        },

        _setRemovalTimeout: function(message) {
            var $this = this;

            var timeout = window.setTimeout(function() {
                $this._removeMessage(message);
            }, this.options.life);

            message.data('timeout', timeout);
        },

        _getIcon: function(severity) {
            switch(severity) {
                case 'info':
                    return 'fa-info-circle';
                    break;

                case 'warn':
                    return 'fa-warning';
                    break;

                case 'error':
                    return 'fa-close';
                    break;

                default:
                    return 'fa-info-circle';
                    break;
            }
        },

        _setOption: function(key, value) {
            if(key === 'value' || key === 'messages') {
                this.show(value);
            }
            else {
                $.Widget.prototype._setOption.apply(this, arguments);
            }
        },

        _destroy: function() {
            this.clear();
            this.element.removeClass("ui-growl ui-widget");

            if(this.options.appendTo) {
                this.element.appendTo(this.originalParent);
            }
        }
    });
})();
/**
 * PrimeUI Switch Widget
 */
(function() {

    $.widget("primeui.puiswitch", {

        options: {
            onLabel: 'On',
            offLabel: 'Off',
            checked: false,
            change: null,
            enhanced: false
        },

        _create: function() {
            if(!this.options.enhanced) {
                this.element.wrap('<div class="ui-inputswitch ui-widget ui-widget-content ui-corner-all"></div>');
                this.container = this.element.parent();

                this.element.wrap('<div class="ui-helper-hidden-accessible"></div>');
                this.container.prepend('<div class="ui-inputswitch-off"></div>' +
                    '<div class="ui-inputswitch-on ui-state-active"></div>' +
                    '<div class="ui-inputswitch-handle ui-state-default"></div>');

                this.onContainer = this.container.children('.ui-inputswitch-on');
                this.offContainer = this.container.children('.ui-inputswitch-off');
                this.onContainer.append('<span>'+ this.options.onLabel +'</span>');
                this.offContainer.append('<span>'+ this.options.offLabel +'</span>');
            }
            else {
                this.container = this.element.closest('.ui-inputswitch');
                this.onContainer = this.container.children('.ui-inputswitch-on');
                this.offContainer = this.container.children('.ui-inputswitch-off');
            }

            this.onLabel = this.onContainer.children('span');
            this.offLabel = this.offContainer.children('span');
            this.handle = this.container.children('.ui-inputswitch-handle');

            var	onContainerWidth = this.onContainer.width(),
                offContainerWidth = this.offContainer.width(),
                spanPadding	= this.offLabel.innerWidth() - this.offLabel.width(),
                handleMargins = this.handle.outerWidth() - this.handle.innerWidth();

            var containerWidth = (onContainerWidth > offContainerWidth) ? onContainerWidth : offContainerWidth,
                handleWidth = containerWidth;

            this.handle.css({'width':handleWidth});
            handleWidth = this.handle.width();

            containerWidth = containerWidth + handleWidth + 6;

            var labelWidth = containerWidth - handleWidth - spanPadding - handleMargins;

            this.container.css({'width': containerWidth });
            this.onLabel.width(labelWidth);
            this.offLabel.width(labelWidth);

            //position
            this.offContainer.css({ width: this.container.width() - 5 });
            this.offset = this.container.width() - this.handle.outerWidth();

            //default value
            if(this.element.prop('checked')||this.options.checked) {
                this.handle.css({ 'left': this.offset});
                this.onContainer.css({ 'width': this.offset});
                this.offLabel.css({ 'margin-right': -this.offset});
            }
            else {
                this.onContainer.css({ 'width': 0 });
                this.onLabel.css({'margin-left': -this.offset});
            }

            if(!this.element.prop('disabled')) {
                this._bindEvents();
            }
        },

        _bindEvents: function() {
            var $this = this;

            this.container.on('click.puiswitch', function(e) {
                $this.toggle();
                $this.element.trigger('focus');
            });

            this.element.on('focus.puiswitch', function(e) {
                    $this.handle.addClass('ui-state-focus');
                })
                .on('blur.puiswitch', function(e) {
                    $this.handle.removeClass('ui-state-focus');
                })
                .on('keydown.puiswitch', function(e) {
                    var keyCode = $.ui.keyCode;
                    if(e.which === keyCode.SPACE) {
                        e.preventDefault();
                    }
                })
                .on('keyup.puiswitch', function(e) {
                    var keyCode = $.ui.keyCode;
                    if(e.which === keyCode.SPACE) {
                        $this.toggle();

                        e.preventDefault();
                    }
                })
                .on('change.puiswitch', function(e) {
                    if($this.element.prop('checked')||$this.options.checked)
                        $this._checkUI();
                    else
                        $this._uncheckUI();

                    $this._trigger('change', e, {checked: $this.options.checked});
                });
        },

        _unbindEvents: function() {
            this.container.off('click.puiswitch');
            this.element.off('focus.puiswitch blur.puiswitch keydown.puiswitch keyup.puiswitch change.puiswitch');
        },

        _destroy: function() {
            this._unbindEvents();

            if(!this.options.enhanced) {
                this.onContainer.remove();
                this.offContainer.remove();
                this.handle.remove();
                this.element.unwrap().unwrap();
            }
            else {
                this.container.css('width', 'auto');
                this.onContainer.css('width', 'auto');
                this.onLabel.css('width', 'auto').css('margin-left', 0);
                this.offContainer.css('width', 'auto');
                this.offLabel.css('width', 'auto').css('margin-left', 0);
            }
        },

        toggle: function() {
            if(this.element.prop('checked')||this.options.checked)
                this.uncheck();
            else
                this.check();
        },

        check: function() {
            this.options.checked = true;
            this.element.prop('checked', true).trigger('change');
        },

        uncheck: function() {
            this.options.checked = false;
            this.element.prop('checked', false).trigger('change');
        },

        _checkUI: function() {
            this.onContainer.animate({width:this.offset}, 200);
            this.onLabel.animate({marginLeft:0}, 200);
            this.offLabel.animate({marginRight:-this.offset}, 200);
            this.handle.animate({left:this.offset}, 200);
        },

        _uncheckUI: function() {
            this.onContainer.animate({width:0}, 200);
            this.onLabel.animate({marginLeft:-this.offset}, 200);
            this.offLabel.animate({marginRight:0}, 200);
            this.handle.animate({left:0}, 200);
        },

        _setOption: function(key, value) {
            if(key === 'checked') {
                if(value)
                    this.check();
                else
                    this.uncheck();
            }
            else {
                $.Widget.prototype._setOption.apply(this, arguments);
            }
        },
    });

})();
/**
 * PrimeUI inputtext widget
 */
(function() {

    $.widget("primeui.puiinputtext", {
       
        options: {
            disabled: false
        },
       
        _create: function() {
            var input = this.element,
            disabled = input.prop('disabled');

            //visuals
            input.addClass('ui-inputtext ui-widget ui-state-default ui-corner-all');
            
            if(input.prop('disabled'))
                input.addClass('ui-state-disabled');
            else if(this.options.disabled)
                this.disable();
            else
                this._enableMouseEffects();
        },
        
        _destroy: function() {
            this.element.removeClass('ui-inputtext ui-widget ui-state-default ui-state-disabled ui-state-hover ui-state-focus ui-corner-all');
            this._disableMouseEffects();
        },

        _enableMouseEffects: function () {
            var input = this.element;

            input.on('mouseover.puiinputtext', function() {
                input.addClass('ui-state-hover');
            })
            .on('mouseout.puiinputtext', function() {
                input.removeClass('ui-state-hover');
            })
            .on('focus.puiinputtext', function() {
                input.addClass('ui-state-focus');
            })
            .on('blur.puiinputtext', function() {
                input.removeClass('ui-state-focus');
            });
        },

        _disableMouseEffects: function () {
            this.element.off('mouseover.puiinputtext mouseout.puiinputtext focus.puiinputtext blur.puiinputtext');
        },

        disable: function () {
            this.element.prop('disabled', true);
            this.element.addClass('ui-state-disabled');
            this.element.removeClass('ui-state-focus ui-state-hover');
            this._disableMouseEffects();
        },

        enable: function () {
            this.element.prop('disabled', false);
            this.element.removeClass('ui-state-disabled');
            this._enableMouseEffects();
        },

        _setOption: function(key, value) {
            if(key === 'disabled') {
                if(value)
                    this.disable();
                else
                    this.enable();
            }
            else {
                $.Widget.prototype._setOption.apply(this, arguments);
            }
        }
        
    });
    
})();
/**
 * PrimeUI Lightbox Widget
 */
(function() {

    $.widget("primeui.puilightbox", {

        options: {
            iframeWidth: 640,
            iframeHeight: 480,
            iframe: false
        },

        _create: function() {
            this.id = this.element.attr('id');
            if(!this.id) {
                this.id = this.element.uniqueId().attr('id');
            }

            this.options.mode = this.options.iframe ? 'iframe' : (this.element.children('div').length == 1) ? 'inline' : 'image';

            var dom = '<div class="ui-lightbox ui-widget ui-helper-hidden ui-corner-all ui-shadow">';
            dom += '<div class="ui-lightbox-content-wrapper">';
            dom += '<a class="ui-state-default ui-lightbox-nav-left ui-corner-right ui-helper-hidden"><span class="fa fa-fw fa-caret-left"></span></a>';
            dom += '<div class="ui-lightbox-content ui-corner-all"></div>';
            dom += '<a class="ui-state-default ui-lightbox-nav-right ui-corner-left ui-helper-hidden"><span class="fa fa-fw fa-caret-right"></span></a>';
            dom += '</div>';
            dom += '<div class="ui-lightbox-caption ui-widget-header"><span class="ui-lightbox-caption-text"></span>';
            dom += '<a class="ui-lightbox-close ui-corner-all" href="#"><span class="fa fa-fw fa-close"></span></a><div style="clear:both" /></div>';
            dom += '</div>';

            this.panel = $(dom).appendTo(document.body);
            this.contentWrapper = this.panel.children('.ui-lightbox-content-wrapper');
            this.content = this.contentWrapper.children('.ui-lightbox-content');
            this.caption = this.panel.children('.ui-lightbox-caption');
            this.captionText = this.caption.children('.ui-lightbox-caption-text');
            this.closeIcon = this.caption.children('.ui-lightbox-close');

            if(this.options.mode === 'image') {
                this._setupImaging();
            }
            else if(this.options.mode === 'inline') {
                this._setupInline();
            }
            else if(this.options.mode === 'iframe') {
                this._setupIframe();
            }

            this._bindCommonEvents();

            this.links.data('puilightbox-trigger', true).find('*').data('puilightbox-trigger', true);
            this.closeIcon.data('puilightbox-trigger', true).find('*').data('puilightbox-trigger', true);
        },

        _bindCommonEvents: function() {
            var $this = this;

            this.closeIcon.on('hover.ui-lightbox', function() {
                    $(this).toggleClass('ui-state-hover');
                })
                .on('click.ui-lightbox', function(e) {
                    $this.hide();
                    e.preventDefault();
                });

            //hide when outside is clicked
            $(document.body).on('click.ui-lightbox-' + this.id, function (e) {
                if($this.isHidden()) {
                    return;
                }

                //do nothing if target is the link
                var target = $(e.target);
                if(target.data('puilightbox-trigger')) {
                    return;
                }

                //hide if mouse is outside of lightbox
                var offset = $this.panel.offset();
                if(e.pageX < offset.left ||
                    e.pageX > offset.left + $this.panel.width() ||
                    e.pageY < offset.top ||
                    e.pageY > offset.top + $this.panel.height()) {

                    $this.hide();
                }
            });

            //sync window resize
            $(window).on('resize.ui-lightbox-' + this.id, function() {
                if(!$this.isHidden()) {
                    $(document.body).children('.ui-widget-overlay').css({
                        'width': $(document).width(),
                        'height': $(document).height()
                    });
                }
            });
        },

        _destroy: function() {
            this.links.removeData('puilightbox-trigger').find('*').removeData('puilightbox-trigger');
            this._unbindEvents();
            this.panel.remove();
            if(this.modality) {
                this._disableModality();
            }
        },

        _unbindEvents: function() {
            this.closeIcon.off('hover.ui-lightbox click.ui-lightbox');
            $(document.body).off('click.ui-lightbox-' + this.id);
            $(window).off('resize.ui-lightbox-' + this.id)
            this.links.off('click.ui-lightbox');
            if(this.options.mode === 'image') {
                this.imageDisplay.off('load.ui-lightbox');
                this.navigators.off('hover.ui-lightbox click.ui-lightbox');
            }
        },

        _setupImaging: function() {
            var $this = this;

            this.links = this.element.children('a');
            this.content.append('<img class="ui-helper-hidden"></img>');
            this.imageDisplay = this.content.children('img');
            this.navigators = this.contentWrapper.children('a');

            this.imageDisplay.on('load.ui-lightbox', function() {
                var image = $(this);

                $this._scaleImage(image);

                //coordinates to center overlay
                var leftOffset = ($this.panel.width() - image.width()) / 2,
                    topOffset = ($this.panel.height() - image.height()) / 2;

                //resize content for new image
                $this.content.removeClass('ui-lightbox-loading').animate({
                        width: image.width(),
                        height: image.height()
                    },
                    500,
                    function() {
                        //show image
                        image.fadeIn();
                        $this._showNavigators();
                        $this.caption.slideDown();
                    });

                $this.panel.animate({
                    left: '+=' + leftOffset,
                    top: '+=' + topOffset
                }, 500);
            });

            this.navigators.on('hover.ui-lightbox', function() {
                    $(this).toggleClass('ui-state-hover');
                })
                .on('click.ui-lightbox', function(e) {
                    var nav = $(this),
                        index;

                    $this._hideNavigators();

                    if(nav.hasClass('ui-lightbox-nav-left')) {
                        index = $this.current === 0 ? $this.links.length - 1 : $this.current - 1;

                        $this.links.eq(index).trigger('click');
                    }
                    else {
                        index = $this.current == $this.links.length - 1 ? 0 : $this.current + 1;

                        $this.links.eq(index).trigger('click');
                    }

                    e.preventDefault();
                });

            this.links.on('click.ui-lightbox', function(e) {
                var link = $(this);

                if($this.isHidden()) {
                    $this.content.addClass('ui-lightbox-loading').width(32).height(32);
                    $this.show();
                }
                else {
                    $this.imageDisplay.fadeOut(function() {
                        //clear for onload scaling
                        $(this).css({
                            'width': 'auto',
                            'height': 'auto'
                        });

                        $this.content.addClass('ui-lightbox-loading');
                    });

                    $this.caption.slideUp();
                }

                window.setTimeout(function() {
                    $this.imageDisplay.attr('src', link.attr('href'));
                    $this.current = link.index();

                    var title = link.attr('title');
                    if(title) {
                        $this.captionText.html(title);
                    }
                }, 1000);


                e.preventDefault();
            });
        },

        _scaleImage: function(image) {
            var win = $(window),
                winWidth = win.width(),
                winHeight = win.height(),
                imageWidth = image.width(),
                imageHeight = image.height(),
                ratio = imageHeight / imageWidth;

            if(imageWidth >= winWidth && ratio <= 1){
                imageWidth = winWidth * 0.75;
                imageHeight = imageWidth * ratio;
            }
            else if(imageHeight >= winHeight){
                imageHeight = winHeight * 0.75;
                imageWidth = imageHeight / ratio;
            }

            image.css({
                'width':imageWidth + 'px',
                'height':imageHeight + 'px'
            });
        },

        _setupInline: function() {
            this.links = this.element.children('a');
            this.inline = this.element.children('div').addClass('ui-lightbox-inline');
            this.inline.appendTo(this.content).show();
            var $this = this;

            this.links.on('click.ui-lightbox', function(e) {
                $this.show();

                var title = $(this).attr('title');
                if(title) {
                    $this.captionText.html(title);
                    $this.caption.slideDown();
                }

                e.preventDefault();
            });
        },

        _setupIframe: function() {
            var $this = this;
            this.links = this.element;
            this.iframe = $('<iframe frameborder="0" style="width:' + this.options.iframeWidth + 'px;height:' +
                this.options.iframeHeight + 'px;border:0 none; display: block;"></iframe>').appendTo(this.content);

            if(this.options.iframeTitle) {
                this.iframe.attr('title', this.options.iframeTitle);
            }

            this.element.click(function(e) {
                if(!$this.iframeLoaded) {
                    $this.content.addClass('ui-lightbox-loading').css({
                        width: $this.options.iframeWidth,
                        height: $this.options.iframeHeight
                    });

                    $this.show();

                    $this.iframe.on('load', function() {
                            $this.iframeLoaded = true;
                            $this.content.removeClass('ui-lightbox-loading');
                        })
                        .attr('src', $this.element.attr('href'));
                }
                else {
                    $this.show();
                }

                var title = $this.element.attr('title');
                if(title) {
                    $this.caption.html(title);
                    $this.caption.slideDown();
                }

                e.preventDefault();
            });
        },

        show: function() {
            this.center();

            this.panel.css('z-index', ++PUI.zindex).show();

            if(!this.modality) {
                this._enableModality();
            }

            this._trigger('show');
        },

        hide: function() {
            this.panel.fadeOut();
            this._disableModality();
            this.caption.hide();

            if(this.options.mode === 'image') {
                this.imageDisplay.hide().attr('src', '').removeAttr('style');
                this._hideNavigators();
            }

            this._trigger('hide');
        },

        center: function() {
            var win = $(window),
                left = (win.width() / 2 ) - (this.panel.width() / 2),
                top = (win.height() / 2 ) - (this.panel.height() / 2);

            this.panel.css({
                'left': left,
                'top': top
            });
        },

        _enableModality: function() {
            this.modality = $('<div class="ui-widget-overlay"></div>')
                .css({
                    'width': $(document).width(),
                    'height': $(document).height(),
                    'z-index': this.panel.css('z-index') - 1
                })
                .appendTo(document.body);
        },

        _disableModality: function() {
            this.modality.remove();
            this.modality = null;
        },

        _showNavigators: function() {
            this.navigators.zIndex(this.imageDisplay.zIndex() + 1).show();
        },

        _hideNavigators: function() {
            this.navigators.hide();
        },

        isHidden: function() {
            return this.panel.is(':hidden');
        },

        showURL: function(opt) {
            if(opt.width) {
                this.iframe.attr('width', opt.width);
            }
            if(opt.height) {
                this.iframe.attr('height', opt.height);
            }

            this.iframe.attr('src', opt.src);

            this.show();
        }
    });
})();
/**
 * PrimeUI BaseMenu widget
 */
(function() {

    $.widget("primeui.puibasemenu", {

        options: {
            popup: false,
            trigger: null,
            my: 'left top',
            at: 'left bottom',
            triggerEvent: 'click'
        },

        _create: function() {
            if(this.options.popup) {
                this._initPopup();
            }
        },

        _initPopup: function() {
            var $this = this;

            this.element.closest('.ui-menu').addClass('ui-menu-dynamic ui-shadow').appendTo(document.body);

            if($.type(this.options.trigger) === 'string') {
                this.options.trigger =  $(this.options.trigger);
            }

            this.positionConfig = {
                my: this.options.my,
                at: this.options.at,
                of: this.options.trigger
            };

            this.options.trigger.on(this.options.triggerEvent + '.ui-menu', function(e) {
                if($this.element.is(':visible')) {
                    $this.hide();
                }
                else {
                    $this.show();
                }

                e.preventDefault();
            });

            //hide overlay on document click
            $(document.body).on('click.ui-menu-' + this.id, function (e) {
                var popup = $this.element.closest('.ui-menu');
                if(popup.is(":hidden")) {
                    return;
                }

                //do nothing if mousedown is on trigger
                var target = $(e.target);
                if(target.is($this.options.trigger.get(0))||$this.options.trigger.has(target).length > 0) {
                    return;
                }

                //hide if mouse is outside of overlay except trigger
                var offset = popup.offset();
                if(e.pageX < offset.left ||
                    e.pageX > offset.left + popup.width() ||
                    e.pageY < offset.top ||
                    e.pageY > offset.top + popup.height()) {

                    $this.hide(e);
                }
            });

            //Hide overlay on resize
            $(window).on('resize.ui-menu-' + this.id, function() {
                if($this.element.closest('.ui-menu').is(':visible')) {
                    $this.align();
                }
            });
        },

        show: function() {
            this.align();
            this.element.closest('.ui-menu').css('z-index', ++PUI.zindex).show();
        },

        hide: function() {
            this.element.closest('.ui-menu').fadeOut('fast');
        },

        align: function() {
            this.element.closest('.ui-menu').css({left:'', top:''}).position(this.positionConfig);
        },

        _destroy: function() {
            if(this.options.popup) {
                $(document.body).off('click.ui-menu-' + this.id);
                $(window).off('resize.ui-menu-' + this.id);
                this.options.trigger.off(this.options.triggerEvent + '.ui-menu');
            }
        }
    });
})();

/**
 * PrimeUI Menu widget
 */
(function() {

    $.widget("primeui.puimenu", $.primeui.puibasemenu, {

        options: {
            enhanced: false
        },

        _create: function() {
            var $this = this;

            this.id = this.element.attr('id');
            if(!this.id) {
                this.id = this.element.uniqueId().attr('id');
            }

            if(!this.options.enhanced) {
                this.element.wrap('<div class="ui-menu ui-widget ui-widget-content ui-corner-all ui-helper-clearfix"></div>');
            }

            this.container = this.element.parent();
            this.originalParent = this.container.parent();

            this.element.addClass('ui-menu-list ui-helper-reset');

            this.element.children('li').each(function() {
                var listItem = $(this);

                if(listItem.children('h3').length > 0) {
                    listItem.addClass('ui-widget-header ui-corner-all');
                }
                else {
                    listItem.addClass('ui-menuitem ui-widget ui-corner-all');
                    var menuitemLink = listItem.children('a'),
                        icon = menuitemLink.data('icon');

                    menuitemLink.addClass('ui-menuitem-link ui-corner-all');

                    if($this.options.enhanced)
                        menuitemLink.children('span').addClass('ui-menuitem-text');
                    else
                        menuitemLink.contents().wrap('<span class="ui-menuitem-text" />');

                    if(icon) {
                        menuitemLink.prepend('<span class="ui-menuitem-icon fa fa-fw ' + icon + '"></span>');
                    }
                }
            });

            this.menuitemLinks = this.element.find('.ui-menuitem-link:not(.ui-state-disabled)');

            this._bindEvents();

            this._super();
        },

        _bindEvents: function() {
            var $this = this;

            this.menuitemLinks.on('mouseenter.ui-menu', function(e) {
                    $(this).addClass('ui-state-hover');
                })
                .on('mouseleave.ui-menu', function(e) {
                    $(this).removeClass('ui-state-hover');
                });

            if(this.options.popup) {
                this.menuitemLinks.on('click.ui-menu', function() {
                    $this.hide();
                });
            }
        },

        _unbindEvents: function() {
            this.menuitemLinks.off('mouseenter.ui-menu mouseleave.ui-menu');
            if(this.options.popup) {
                this.menuitemLinks.off('click.ui-menu');
            }
        },

        _destroy: function() {
            this._super();

            var $this = this;
            this._unbindEvents();

            this.element.removeClass('ui-menu-list ui-helper-reset');
            this.element.children('li.ui-widget-header').removeClass('ui-widget-header ui-corner-all');
            this.element.children('li:not(.ui-widget-header)').removeClass('ui-menuitem ui-widget ui-corner-all')
                .children('a').removeClass('ui-menuitem-link ui-corner-all').each(function() {
                var link = $(this);
                link.children('.ui-menuitem-icon').remove();

                if($this.options.enhanced)
                    link.children('.ui-menuitem-text').removeClass('ui-menuitem-text');
                else
                    link.children('.ui-menuitem-text').contents().unwrap();
            });

            if(this.options.popup) {
                this.container.appendTo(this.originalParent);
            }

            if(!this.options.enhanced) {
                this.element.unwrap();
            }
        }
    });
})();

/**
 * PrimeUI BreadCrumb Widget
 */
(function() {

    $.widget("primeui.puibreadcrumb", {

        _create: function() {
            var $this = this;

            if(!this.options.enhanced) {
                this.element.wrap('<div class="ui-breadcrumb ui-module ui-widget ui-widget-header ui-helper-clearfix ui-corner-all" role="menu">');
            }
            this.element.children('li').each(function(index) {
                var listItem = $(this);
                listItem.attr('role', 'menuitem');
                var menuitemLink = listItem.children('a');
                menuitemLink.addClass('ui-menuitem-link');

                if($this.options.enhanced)
                    menuitemLink.children('span').addClass('ui-menuitem-text');
                else
                    menuitemLink.contents().wrap('<span class="ui-menuitem-text" />');

                if(index > 0) {
                    listItem.before('<li class="ui-breadcrumb-chevron fa fa-chevron-right"></li>');
                }
                else {
                    listItem.before('<li class="fa fa-home"></li>');
                }
            });
        },

        _destroy: function() {
            var $this = this;
            if(!this.options.enhanced) {
                this.unwrap();
            }
            this.element.children('li.ui-breadcrumb-chevron,.fa-home').remove();
            this.element.children('li').each(function() {
                var listItem = $(this),
                    link = listItem.children('a');

                link.removeClass('ui-menuitem-link');
                if($this.options.enhanced)
                    link.children('.ui-menuitem-text').removeClass('ui-menuitem-text');
                else
                    link.children('.ui-menuitem-text').contents().unwrap();
            });
        }
    });
})();

/*
 * PrimeUI TieredMenu Widget
 */
(function() {

    $.widget("primeui.puitieredmenu", $.primeui.puibasemenu, {

        options: {
            autoDisplay: true
        },

        _create: function() {
            var $this = this;

            this.id = this.element.attr('id');
            if(!this.id) {
                this.id = this.element.uniqueId().attr('id');
            }

            if(!this.options.enhanced) {
                this.element.wrap('<div class="ui-tieredmenu ui-menu ui-widget ui-widget-content ui-corner-all ui-helper-clearfix"></div>');
            }

            this.container = this.element.parent();
            this.originalParent = this.container.parent();

            this.element.addClass('ui-menu-list ui-helper-reset');

            this.element.find('li').each(function() {
                var listItem = $(this),
                    menuitemLink = listItem.children('a'),
                    icon = menuitemLink.data('icon');

                menuitemLink.addClass('ui-menuitem-link ui-corner-all');

                if($this.options.enhanced)
                    menuitemLink.children('span').addClass('ui-menuitem-text');
                else
                    menuitemLink.contents().wrap('<span class="ui-menuitem-text" />');

                if(icon) {
                    menuitemLink.prepend('<span class="ui-menuitem-icon fa fa-fw ' + icon + '"></span>');
                }

                listItem.addClass('ui-menuitem ui-widget ui-corner-all');

                if(listItem.children('ul').length > 0) {
                    var submenuIcon = listItem.parent().hasClass('ui-menu-child') ? 'fa-caret-right' : $this._getRootSubmenuIcon();
                    listItem.addClass('ui-menu-parent');
                    listItem.children('ul').addClass('ui-widget-content ui-menu-list ui-corner-all ui-helper-clearfix ui-menu-child ui-shadow');

                    menuitemLink.prepend('<span class="ui-submenu-icon fa fa-fw ' + submenuIcon + '"></span>');
                }
            });

            this.links = this.element.find('.ui-menuitem-link:not(.ui-state-disabled)');

            this._bindEvents();

            this._super();
        },


        _bindEvents: function() {
            this._bindItemEvents();

            this._bindDocumentHandler();
        },

        _bindItemEvents: function() {
            var $this = this;

            this.links.on('mouseenter.ui-menu', function() {
                var link = $(this),
                    menuitem = link.parent(),
                    autoDisplay = $this.options.autoDisplay;

                var activeSibling = menuitem.siblings('.ui-menuitem-active');
                if(activeSibling.length === 1) {
                    $this._deactivate(activeSibling);
                }

                if(autoDisplay||$this.active) {
                    if(menuitem.hasClass('ui-menuitem-active')) {
                        $this._reactivate(menuitem);
                    }
                    else {
                        $this._activate(menuitem);
                    }
                }
                else {
                    $this._highlight(menuitem);
                }
            });

            if(this.options.autoDisplay === false) {
                this.rootLinks = this.element.find('> .ui-menuitem > .ui-menuitem-link');
                this.rootLinks.data('primeui-tieredmenu-rootlink', this.id).find('*').data('primeui-tieredmenu-rootlink', this.id);

                this.rootLinks.on('click.ui-menu', function(e) {
                    var link = $(this),
                        menuitem = link.parent(),
                        submenu = menuitem.children('ul.ui-menu-child');

                    if(submenu.length === 1) {
                        if(submenu.is(':visible')) {
                            $this.active = false;
                            $this._deactivate(menuitem);
                        }
                        else {
                            $this.active = true;
                            $this._highlight(menuitem);
                            $this._showSubmenu(menuitem, submenu);
                        }
                    }
                });
            }

            this.element.parent().find('ul.ui-menu-list').on('mouseleave.ui-menu', function(e) {
                if($this.activeitem) {
                    $this._deactivate($this.activeitem);
                }

                e.stopPropagation();
            });
        },

        _bindDocumentHandler: function() {
            var $this = this;

            $(document.body).on('click.ui-menu-' + this.id, function(e) {
                var target = $(e.target);
                if(target.data('primeui-tieredmenu-rootlink') === $this.id) {
                    return;
                }

                $this.active = false;

                $this.element.find('li.ui-menuitem-active').each(function() {
                    $this._deactivate($(this), true);
                });
            });
        },

        _unbindEvents: function() {
            this.links.off('mouseenter.ui-menu');
            if(this.options.autoDisplay === false) {
                this.rootLinks.off('click.ui-menu');
            }
            this.element.parent().find('ul.ui-menu-list').off('mouseleave.ui-menu');
            $(document.body).off('click.ui-menu-' + this.id);
        },

        _deactivate: function(menuitem, animate) {
            this.activeitem = null;
            menuitem.children('a.ui-menuitem-link').removeClass('ui-state-hover');
            menuitem.removeClass('ui-menuitem-active');

            if(animate) {
                menuitem.children('ul.ui-menu-child:visible').fadeOut('fast');
            }
            else {
                menuitem.children('ul.ui-menu-child:visible').hide();
            }
        },

        _activate: function(menuitem) {
            this._highlight(menuitem);

            var submenu = menuitem.children('ul.ui-menu-child');
            if(submenu.length === 1) {
                this._showSubmenu(menuitem, submenu);
            }
        },

        _reactivate: function(menuitem) {
            this.activeitem = menuitem;
            var submenu = menuitem.children('ul.ui-menu-child'),
                activeChilditem = submenu.children('li.ui-menuitem-active:first'),
                _self = this;

            if(activeChilditem.length === 1) {
                _self._deactivate(activeChilditem);
            }
        },

        _highlight: function(menuitem) {
            this.activeitem = menuitem;
            menuitem.children('a.ui-menuitem-link').addClass('ui-state-hover');
            menuitem.addClass('ui-menuitem-active');
        },

        _showSubmenu: function(menuitem, submenu) {
            submenu.css({
                'left': menuitem.outerWidth(),
                'top': 0,
                'z-index': ++PUI.zindex
            });

            submenu.show();
        },

        _getRootSubmenuIcon: function() {
            return 'fa-caret-right';
        },

        _destroy: function() {
            this._super();

            var $this = this;
            this._unbindEvents();

            this.element.removeClass('ui-menu-list ui-helper-reset');
            this.element.find('li').removeClass('ui-menuitem ui-widget ui-corner-all ui-menu-parent').each(function() {
                var listItem = $(this),
                link = listItem.children('a');

                link.removeClass('ui-menuitem-link ui-corner-all').children('.fa').remove();

                if($this.options.enhanced)
                    link.children('.ui-menuitem-text').removeClass('ui-menuitem-text');
                else
                    link.children('.ui-menuitem-text').contents().unwrap();

                listItem.children('ul').removeClass('ui-widget-content ui-menu-list ui-corner-all ui-helper-clearfix ui-menu-child ui-shadow');
            });

            if(this.options.popup) {
                this.container.appendTo(this.originalParent);
            }

            if(!this.options.enhanced) {
                this.element.unwrap();
            }
        }

    });

})();

/**
 * PrimeUI Menubar Widget
 */
(function() {

    $.widget("primeui.puimenubar", $.primeui.puitieredmenu, {

        options: {
            autoDisplay: true,
            enhanced: false
        },

        _create: function() {
            this._super();

            if(!this.options.enhanced) {
                this.element.parent().removeClass('ui-tieredmenu').addClass('ui-menubar');
            }
        },

        _showSubmenu: function(menuitem, submenu) {
            var win = $(window),
                submenuOffsetTop = null,
                submenuCSS = {
                    'z-index': ++PUI.zindex
                };

            if(menuitem.parent().hasClass('ui-menu-child')) {
                submenuCSS.left = menuitem.outerWidth();
                submenuCSS.top = 0;
                submenuOffsetTop = menuitem.offset().top - win.scrollTop();
            }
            else {
                submenuCSS.left = 0;
                submenuCSS.top = menuitem.outerHeight();
                submenuOffsetTop = menuitem.offset().top + submenuCSS.top - win.scrollTop();
            }

            //adjust height within viewport
            submenu.css('height', 'auto');
            if((submenuOffsetTop + submenu.outerHeight()) > win.height()) {
                submenuCSS.overflow = 'auto';
                submenuCSS.height = win.height() - (submenuOffsetTop + 20);
            }

            submenu.css(submenuCSS).show();
        },

        _getRootSubmenuIcon: function() {
            return 'fa-caret-down';
        }
    });

})();

/*
 * PrimeUI SlideMenu Widget
 */
(function() {

    $.widget("primeui.puislidemenu", $.primeui.puibasemenu, {

        _create: function() {
            this.id = this.element.attr('id');
            if(!this.id) {
                this.id = this.element.uniqueId().attr('id');
            }

            this._render();

            //elements
            this.rootList = this.element;
            this.content = this.element.parent();
            this.wrapper = this.content.parent();
            this.container = this.wrapper.parent();
            this.originalParent = this.container.parent();
            this.submenus = this.container.find('ul.ui-menu-list');

            this.links = this.element.find('a.ui-menuitem-link:not(.ui-state-disabled)');
            this.backward = this.wrapper.children('div.ui-slidemenu-backward');

            //config
            this.stack = [];
            this.jqWidth = this.container.width();

            if(!this.options.popup) {
                var $this = this;
                setTimeout(function() {
                    $this._applyDimensions();
                }, 100);

            }

            this._bindEvents();

            this._super();
        },

        _render: function() {
            var $this = this;

            if(!this.options.enhanced) {
                this.element.wrap('<div class="ui-menu ui-slidemenu ui-widget ui-widget-content ui-corner-all"></div>')
                    .wrap('<div class="ui-slidemenu-wrapper"></div>')
                    .wrap('<div class="ui-slidemenu-content"></div>');

                this.element.parent().after('<div class="ui-slidemenu-backward ui-widget-header ui-corner-all"><span class="fa fa-fw fa-caret-left"></span>Back</div>');
            }
            this.element.addClass('ui-menu-list ui-helper-reset');

            this.element.find('li').each(function() {
                var listItem = $(this),
                    menuitemLink = listItem.children('a'),
                    icon = menuitemLink.data('icon');

                menuitemLink.addClass('ui-menuitem-link ui-corner-all');

                if($this.options.enhanced)
                    menuitemLink.children('span').addClass('ui-menuitem-text');
                else
                    menuitemLink.contents().wrap('<span class="ui-menuitem-text" />');

                if(icon) {
                    menuitemLink.prepend('<span class="ui-menuitem-icon fa fa-fw ' + icon + '"></span>');
                }

                listItem.addClass('ui-menuitem ui-widget ui-corner-all');

                if(listItem.children('ul').length) {
                    listItem.addClass('ui-menu-parent');
                    listItem.children('ul').addClass('ui-widget-content ui-menu-list ui-corner-all ui-helper-clearfix ui-menu-child ui-shadow');
                    menuitemLink.prepend('<span class="ui-submenu-icon fa fa-fw fa-caret-right"></span>');
                }
            });
        },

        _destroy: function() {
            this._super();
            this._unbindEvents();

            var $this = this;

            this.element.removeClass('ui-menu-list ui-helper-reset');
            this.element.find('li').removeClass('ui-menuitem ui-widget ui-corner-all ui-menu-parent').each(function() {
                var listItem = $(this),
                link = listItem.children('a');

                link.removeClass('ui-menuitem-link ui-corner-all').children('.fa').remove();

                if($this.options.enhanced)
                    link.children('.ui-menuitem-text').removeClass('ui-menuitem-text');
                else
                    link.children('.ui-menuitem-text').contents().unwrap();

                listItem.children('ul').removeClass('ui-widget-content ui-menu-list ui-corner-all ui-helper-clearfix ui-menu-child ui-shadow');
            });

            if(this.options.popup) {
                this.container.appendTo(this.originalParent);
            }

            if(!this.options.enhanced) {
                this.content.next('.ui-slidemenu-backward').remove();
                this.element.unwrap().unwrap().unwrap();
            }
        },

        _bindEvents: function() {
            var $this = this;

            this.links.on('mouseenter.ui-menu',function() {
                    $(this).addClass('ui-state-hover');
                })
                .on('mouseleave.ui-menu',function() {
                    $(this).removeClass('ui-state-hover');
                })
                .on('click.ui-menu',function() {
                    var link = $(this),
                        submenu = link.next();

                    if(submenu.length == 1) {
                        $this._forward(submenu);
                    }
                });

            this.backward.on('click.ui-menu',function() {
                $this._back();
            });
        },

        _unbindEvents: function() {
            this.links.off('mouseenter.ui-menu mouseleave.ui-menu click.ui-menu');
            this.backward.off('click.ui-menu');
        },

        _forward: function(submenu) {
            var $this = this;

            this._push(submenu);

            var rootLeft = -1 * (this._depth() * this.jqWidth);

            submenu.show().css({
                left: this.jqWidth
            });

            this.rootList.animate({
                left: rootLeft
            }, 500, 'easeInOutCirc', function() {
                if($this.backward.is(':hidden')) {
                    $this.backward.fadeIn('fast');
                }
            });
        },

        _back: function() {
            if(!this.rootList.is(':animated')) {
                var $this = this,
                    last = this._pop(),
                    depth = this._depth();

                var rootLeft = -1 * (depth * this.jqWidth);

                this.rootList.animate({
                    left: rootLeft
                }, 500, 'easeInOutCirc', function() {
                    if(last) {
                        last.hide();
                    }

                    if(depth === 0) {
                        $this.backward.fadeOut('fast');
                    }
                });
            }
        },

        _push: function(submenu) {
            this.stack.push(submenu);
        },

        _pop: function() {
            return this.stack.pop();
        },

        _last: function() {
            return this.stack[this.stack.length - 1];
        },

        _depth: function() {
            return this.stack.length;
        },

        _applyDimensions: function() {
            this.submenus.width(this.container.width());
            this.wrapper.height(this.rootList.outerHeight(true) + this.backward.outerHeight(true));
            this.content.height(this.rootList.outerHeight(true));
            this.rendered = true;
        },

        show: function() {
            this.align();
            this.container.css('z-index', ++PUI.zindex).show();

            if(!this.rendered) {
                this._applyDimensions();
            }
        }
    });

})();

/**
 * PrimeUI Context Menu Widget
 */
(function() {

    $.widget("primeui.puicontextmenu", $.primeui.puitieredmenu, {

        options: {
            autoDisplay: true,
            target: null,
            event: 'contextmenu'
        },

        _create: function() {
            this._super();
            this.element.parent().removeClass('ui-tieredmenu').
                    addClass('ui-contextmenu ui-menu-dynamic ui-shadow');

            var $this = this;

            if(this.options.target) {
                if($.type(this.options.target) === 'string') {
                    this.options.target =  $(this.options.target);
                }
            }
            else {
                this.options.target = $(document);
            }

            if(!this.element.parent().parent().is(document.body)) {
                this.element.parent().appendTo('body');
            }

            if(this.options.target.hasClass('ui-datatable')) {
                $this._bindDataTable();
            }
            else {
                this.options.target.on(this.options.event + '.ui-contextmenu', function(e){
                    $this.show(e);
                });
            }
        },

        _bindItemEvents: function() {
            this._super();

            var $this = this;

            //hide menu on item click
            this.links.on('click.ui-contextmenu', function() {
                $this._hide();
            });
        },

        _bindDocumentHandler: function() {
            var $this = this;

            //hide overlay when document is clicked
            $(document.body).on('click.ui-contextmenu.' + this.id, function (e) {
                if($this.element.parent().is(":hidden")) {
                    return;
                }

                $this._hide();
            });
        },

        _bindDataTable: function() {
            var rowSelector = '#' + this.options.target.attr('id') + ' tbody.ui-datatable-data > tr.ui-widget-content:not(.ui-datatable-empty-message)',
            event = this.options.event + '.ui-datatable',
            $this = this;

            $(document).off(event, rowSelector)
                        .on(event, rowSelector, null, function(e) {
                            $this.options.target.puidatatable('onRowRightClick', event, $(this));
                            $this.show(e);
                        });
        },

        _unbindDataTable: function() {
            $(document).off(this.options.event + '.ui-datatable',
                        '#' + this.options.target.attr('id') + ' tbody.ui-datatable-data > tr.ui-widget-content:not(.ui-datatable-empty-message)');
        },

        _unbindEvents: function() {
            this._super();

            this.options.target.off(this.options.event + '.ui-contextmenu');
            this.links.off('click.ui-contextmenu');
            $(document.body).off('click.ui-contextmenu.' + this.id);

            if(this.options.target.hasClass('ui-datatable')) {
                this._unbindDataTable();
            }
        },

        show: function(e) {
            //hide other contextmenus if any
            $(document.body).children('.ui-contextmenu:visible').hide();

            var win = $(window),
            left = e.pageX,
            top = e.pageY,
            width = this.element.parent().outerWidth(),
            height = this.element.parent().outerHeight();

            //collision detection for window boundaries
            if((left + width) > (win.width())+ win.scrollLeft()) {
                left = left - width;
            }
            if((top + height ) > (win.height() + win.scrollTop())) {
                top = top - height;
            }

            if(this.options.beforeShow) {
                this.options.beforeShow.call(this);
            }

            this.element.parent().css({
                'left': left,
                'top': top,
                'z-index': ++PUI.zindex
            }).show();

            e.preventDefault();
            e.stopPropagation();
        },

        _hide: function() {
            var $this = this;

            //hide submenus
            this.element.parent().find('li.ui-menuitem-active').each(function() {
                $this._deactivate($(this), true);
            });

            this.element.parent().fadeOut('fast');
        },

        isVisible: function() {
            return this.element.parent().is(':visible');
        },

        getTarget: function() {
            return this.jqTarget;
        },

        _destroy: function() {
            var $this = this;
            this._unbindEvents();

            this.element.removeClass('ui-menu-list ui-helper-reset');
            this.element.find('li').removeClass('ui-menuitem ui-widget ui-corner-all ui-menu-parent').each(function() {
                var listItem = $(this),
                link = listItem.children('a');

                link.removeClass('ui-menuitem-link ui-corner-all').children('.fa').remove();

                if($this.options.enhanced)
                    link.children('.ui-menuitem-text').removeClass('ui-menuitem-text');
                else
                    link.children('.ui-menuitem-text').contents().unwrap();

                listItem.children('ul').removeClass('ui-widget-content ui-menu-list ui-corner-all ui-helper-clearfix ui-menu-child ui-shadow');
            });

            this.container.appendTo(this.originalParent);

            if(!this.options.enhanced) {
                this.element.unwrap();
            }
        }

    });

})();


/*
 * PrimeUI MegaMenu Widget
 */
(function() {

    $.widget("primeui.puimegamenu", $.primeui.puibasemenu, {

        options: {
            autoDisplay: true,
            orientation:'horizontal',
            enhanced: false
        },

        _create: function() {
            this.id = this.element.attr('id');
            if(!this.id) {
                this.id = this.element.uniqueId().attr('id');
            }

            this._render();

            this.rootList = this.element.children('ul');
            this.rootLinks = this.rootList.children('li').children('a');
            this.subLinks = this.element.find('.ui-megamenu-panel a.ui-menuitem-link');
            this.keyboardTarget = this.element.children('.ui-helper-hidden-accessible');

            this._bindEvents();
            this._bindKeyEvents();
        },

        _render: function() {
            var $this = this;

            if(!this.options.enhanced) {
                this.element.prepend('<div tabindex="0" class="ui-helper-hidden-accessible"></div>');
                this.element.addClass('ui-menu ui-menubar ui-megamenu ui-widget ui-widget-content ui-corner-all ui-helper-clearfix');
                if(this._isVertical()) {
                    this.element.addClass('ui-megamenu-vertical');
                }
            }

            this.element.children('ul').addClass('ui-menu-list ui-helper-reset');

            this.element.find('li').each(function(){
                var listItem = $(this),
                    menuitemLink = listItem.children('a'),
                    icon = menuitemLink.data('icon');

                menuitemLink.addClass('ui-menuitem-link ui-corner-all');

                if($this.options.enhanced)
                    menuitemLink.children('span').addClass('ui-menuitem-text');
                else
                    menuitemLink.contents().wrap('<span class="ui-menuitem-text" />');

                if(icon) {
                    menuitemLink.prepend('<span class="ui-menuitem-icon fa fa-fw ' + icon + '"></span>');
                }

                listItem.addClass('ui-menuitem ui-widget ui-corner-all');
                listItem.parent().addClass('ui-menu-list ui-helper-reset');

                if(listItem.children('h3').length) {
                    listItem.addClass('ui-widget-header ui-corner-all');
                    listItem.removeClass('ui-widget ui-menuitem');
                }
                else if(listItem.children('div').length) {
                    var submenuIcon = $this._isVertical() ? 'fa-caret-right' : 'fa-caret-down';
                    listItem.addClass('ui-menu-parent');
                    listItem.children('div').addClass('ui-megamenu-panel ui-widget-content ui-menu-list ui-corner-all ui-helper-clearfix ui-menu-child ui-shadow');
                    menuitemLink.addClass('ui-submenu-link').prepend('<span class="ui-submenu-icon fa fa-fw ' + submenuIcon + '"></span>');
                }
            });
        },

        _destroy: function() {
            var $this = this;
            this._unbindEvents();
            if(!this.options.enhanced) {
                this.element.children('.ui-helper-hidden-accessible').remove();
                this.element.removeClass('ui-menu ui-menubar ui-megamenu ui-widget ui-widget-content ui-corner-all ui-helper-clearfix ui-megamenu-vertical');
            }

            this.element.find('li').each(function(){
                var listItem = $(this),
                    menuitemLink = listItem.children('a');

                menuitemLink.removeClass('ui-menuitem-link ui-corner-all');

                if($this.options.enhanced)
                    menuitemLink.children('span').removeClass('ui-menuitem-text');
                else
                    menuitemLink.contents().unwrap();

                menuitemLink.children('.ui-menuitem-icon').remove();

                listItem.removeClass('ui-menuitem ui-widget ui-corner-all')
                    .parent().removeClass('ui-menu-list ui-helper-reset');

                if(listItem.children('h3').length) {
                    listItem.removeClass('ui-widget-header ui-corner-all');
                }
                else if(listItem.children('div').length) {
                    var submenuIcon = $this._isVertical() ? 'fa-caret-right' : 'fa-caret-down';
                    listItem.removeClass('ui-menu-parent');
                    listItem.children('div').removeClass('ui-megamenu-panel ui-widget-content ui-menu-list ui-corner-all ui-helper-clearfix ui-menu-child ui-shadow');
                    menuitemLink.removeClass('ui-submenu-link').children('.ui-submenu-icon').remove();
                }
            });
        },

        _bindEvents: function() {
            var $this = this;
      
            this.rootLinks.on('mouseenter.ui-megamenu', function(e) {
                var link = $(this),
                menuitem = link.parent();
                
                var current = menuitem.siblings('.ui-menuitem-active');
                if(current.length > 0) {
                    current.find('li.ui-menuitem-active').each(function() {
                        $this._deactivate($(this));
                    });
                    $this._deactivate(current, false);
                }
                
                if($this.options.autoDisplay||$this.active) {
                    $this._activate(menuitem);
                }
                else {
                    $this._highlight(menuitem);
                }
                
            });
            
            if(this.options.autoDisplay === false) {
                this.rootLinks.data('primefaces-megamenu', this.id).find('*').data('primefaces-megamenu', this.id)
                
                this.rootLinks.on('click.ui-megamenu', function(e) {
                    var link = $(this),
                    menuitem = link.parent(),
                    submenu = link.next();

                    if(submenu.length === 1) {
                        if(submenu.is(':visible')) {
                            $this.active = false;
                            $this._deactivate(menuitem, true);
                        }
                        else {                                        
                            $this.active = true;
                            $this._activate(menuitem);
                        }
                    }
                    
                    e.preventDefault();
                });
            }
            else {
                this.rootLinks.filter('.ui-submenu-link').on('click.ui-megamenu', function(e) {
                    e.preventDefault();
                });
            }

            this.subLinks.on('mouseenter.ui-megamenu', function() {
                if($this.activeitem && !$this.isRootLink($this.activeitem)) {
                    $this._deactivate($this.activeitem);    
                } 
                $this._highlight($(this).parent());
            })
            .on('mouseleave.ui-megamenu', function() {
                if($this.activeitem && !$this.isRootLink($this.activeitem)) {
                    $this._deactivate($this.activeitem);    
                }
                $(this).removeClass('ui-state-hover');
            });
            
            this.rootList.on('mouseleave.ui-megamenu', function(e) {
                var activeitem = $this.rootList.children('.ui-menuitem-active');
                if(activeitem.length === 1) {
                    $this._deactivate(activeitem, false);
                }
            });
            
            this.rootList.find('> li.ui-menuitem > ul.ui-menu-child').on('mouseleave.ui-megamenu', function(e) {            
                e.stopPropagation();
            });
            
            $(document.body).on('click.' + this.id, function(e) {
                var target = $(e.target);
                if(target.data('primefaces-megamenu') === $this.id) {
                    return;
                }
                
                $this.active = false;
                $this._deactivate($this.rootList.children('li.ui-menuitem-active'), true);
            });
        },

        _unbindEvents: function() {
            this.rootLinks.off('mouseenter.ui-megamenu mouselave.ui-megamenu click.ui-megamenu');
            this.subLinks.off('mouseenter.ui-megamenu mouselave.ui-megamenu');
            this.rootList.off('mouseleave.ui-megamenu');
            this.rootList.find('> li.ui-menuitem > ul.ui-menu-child').off('mouseleave.ui-megamenu');
            $(document.body).off('click.' + this.id);
        },

        _isVertical: function () {
            if(this.options.orientation === 'vertical')
                return true;
            else
                return false;
        },

        _deactivate: function(menuitem, animate) {
            var link = menuitem.children('a.ui-menuitem-link'),
                submenu = link.next();

            menuitem.removeClass('ui-menuitem-active');
            link.removeClass('ui-state-hover');
            this.activeitem = null;

            if(submenu.length > 0) {
                if(animate)
                    submenu.fadeOut('fast');
                else
                    submenu.hide();
            }
        },

        _activate: function(menuitem) {
            var submenu = menuitem.children('.ui-megamenu-panel'),
                $this = this;

            $this._highlight(menuitem);

            if(submenu.length > 0) {
                $this._showSubmenu(menuitem, submenu);
            }
        },

        _highlight: function(menuitem) {
            var link = menuitem.children('a.ui-menuitem-link');

            menuitem.addClass('ui-menuitem-active');
            link.addClass('ui-state-hover');
            this.activeitem = menuitem;
        },

        _showSubmenu: function(menuitem, submenu) {
            var pos = null;

            if(this._isVertical()) {
                pos = {
                    my: 'left top',
                    at: 'right top',
                    of: menuitem,
                    collision: 'flipfit'
                };
            }
            else {
                pos = {
                    my: 'left top',
                    at: 'left bottom',
                    of: menuitem,
                    collision: 'flipfit'
                };
            }

            submenu.css({
                'z-index': ++PUI.zindex
            });

            submenu.show().position(pos);
        },

        _bindKeyEvents: function() {
            var $this = this;

            this.keyboardTarget.on('focus.ui-megamenu', function(e) {
                    $this._highlight($this.rootLinks.eq(0).parent());
                })
                .on('blur.ui-megamenu', function() {
                    $this._reset();
                })
                .on('keydown.ui-megamenu', function(e) {
                    var currentitem = $this.activeitem;
                    if(!currentitem) {
                        return;
                    }

                    var isRootLink = $this._isRootLink(currentitem),
                        keyCode = $.ui.keyCode;

                    switch(e.which) {
                        case keyCode.LEFT:
                            if(isRootLink && !$this._isVertical()) {
                                var prevItem = currentitem.prevAll('.ui-menuitem:first');
                                if(prevItem.length) {
                                    $this._deactivate(currentitem);
                                    $this._highlight(prevItem);
                                }

                                e.preventDefault();
                            }
                            else {
                                if(currentitem.hasClass('ui-menu-parent') && currentitem.children('.ui-menu-child').is(':visible')) {
                                    $this._deactivate(currentitem);
                                    $this._highlight(currentitem);
                                }
                                else {
                                    var parentItem = currentitem.closest('.ui-menu-child').parent();
                                    if(parentItem.length) {
                                        $this._deactivate(currentitem);
                                        $this._deactivate(parentItem);
                                        $this._highlight(parentItem);
                                    }
                                }
                            }
                            break;

                        case keyCode.RIGHT:
                            if(isRootLink && !$this._isVertical()) {
                                var nextItem = currentitem.nextAll('.ui-menuitem:visible:first');
                                if(nextItem.length) {
                                    $this._deactivate(currentitem);
                                    $this._highlight(nextItem);
                                }

                                e.preventDefault();
                            }
                            else {
                                if(currentitem.hasClass('ui-menu-parent')) {
                                    var submenu = currentitem.children('.ui-menu-child');
                                    if(submenu.is(':visible')) {
                                        $this._highlight(submenu.find('.ui-menu-list:visible > .ui-menuitem:visible:first'));
                                    }
                                    else {
                                        $this._activate(currentitem);
                                    }
                                }
                            }
                            break;

                        case keyCode.UP:
                            if(!isRootLink || $this._isVertical()) {
                                var prevItem = $this._findPrevItem(currentitem);
                                if(prevItem.length) {
                                    $this._deactivate(currentitem);
                                    $this._highlight(prevItem);
                                }
                            }

                            e.preventDefault();
                            break;

                        case keyCode.DOWN:
                            if(isRootLink && !$this._isVertical()) {
                                var submenu = currentitem.children('.ui-menu-child');
                                if(submenu.is(':visible')) {
                                    var firstMenulist = $this._getFirstMenuList(submenu);
                                    $this._highlight(firstMenulist.children('.ui-menuitem:visible:first'));
                                }
                                else {
                                    $this._activate(currentitem);
                                }
                            }
                            else {
                                var nextItem = $this._findNextItem(currentitem);
                                if(nextItem.length) {
                                    $this._deactivate(currentitem);
                                    $this._highlight(nextItem);
                                }
                            }

                            e.preventDefault();
                            break;

                        case keyCode.ENTER:
                        case keyCode.NUMPAD_ENTER:
                            var currentLink = currentitem.children('.ui-menuitem-link');
                            currentLink.trigger('click');
                            $this.element.blur();
                            var href = currentLink.attr('href');
                            if(href && href !== '#') {
                                window.location.href = href;
                            }
                            $this._deactivate(currentitem);
                            e.preventDefault();
                            break;

                        case keyCode.ESCAPE:
                            if(currentitem.hasClass('ui-menu-parent')) {
                                var submenu = currentitem.children('.ui-menu-list:visible');
                                if(submenu.length > 0) {
                                    submenu.hide();
                                }
                            }
                            else {
                                var parentItem = currentitem.closest('.ui-menu-child').parent();
                                if(parentItem.length) {
                                    $this._deactivate(currentitem);
                                    $this._deactivate(parentItem);
                                    $this._highlight(parentItem);
                                }
                            }
                            e.preventDefault();
                            break;
                    }
                });
        },

        _findPrevItem: function(menuitem) {
            var previtem = menuitem.prev('.ui-menuitem');

            if(!previtem.length) {
                var prevSubmenu = menuitem.closest('ul.ui-menu-list').prev('.ui-menu-list');

                if(!prevSubmenu.length) {
                    prevSubmenu = menuitem.closest('div').prev('div').children('.ui-menu-list:visible:last');
                }

                if(prevSubmenu.length) {
                    previtem = prevSubmenu.find('li.ui-menuitem:visible:last');
                }
            }
            return previtem;
        },

        _findNextItem: function(menuitem) {
            var nextitem = menuitem.next('.ui-menuitem');

            if(!nextitem.length) {
                var nextSubmenu = menuitem.closest('ul.ui-menu-list').next('.ui-menu-list');
                if(!nextSubmenu.length) {
                    nextSubmenu = menuitem.closest('div').next('div').children('.ui-menu-list:visible:first');
                }

                if(nextSubmenu.length) {
                    nextitem = nextSubmenu.find('li.ui-menuitem:visible:first');
                }
            }
            return nextitem;
        },

        _getFirstMenuList: function(submenu) {
            return submenu.find('.ui-menu-list:not(.ui-state-disabled):first');
        },

        _isRootLink: function(menuitem) {
            var submenu = menuitem.closest('ul');
            return submenu.parent().hasClass('ui-menu');
        },

        _reset: function() {
            var $this = this;
            this.active = false;

            this.element.find('li.ui-menuitem-active').each(function() {
                $this._deactivate($(this), true);
            });
        },
        
        isRootLink: function(menuitem) {
            var submenu = menuitem.closest('ul');
            return submenu.parent().hasClass('ui-menu');
        }

    });

})();

/**
 * PrimeUI PanelMenu Widget
 */
(function() {

    $.widget("primeui.puipanelmenu", $.primeui.puibasemenu, {

        options: {
            stateful: false,
            enhanced: false
        },

        _create: function() {
            this.id = this.element.attr('id');
            if(!this.id) {
                this.id = this.element.uniqueId().attr('id');
            }

            this.panels = this.element.children('div');

            this._render();

            this.headers = this.element.find('> .ui-panelmenu-panel > div.ui-panelmenu-header:not(.ui-state-disabled)');
            this.contents = this.element.find('> .ui-panelmenu-panel > .ui-panelmenu-content');
            this.menuitemLinks = this.contents.find('.ui-menuitem-link:not(.ui-state-disabled)');
            this.treeLinks = this.contents.find('.ui-menu-parent > .ui-menuitem-link:not(.ui-state-disabled)');

            this._bindEvents();

            if(this.options.stateful) {
                this.stateKey = 'panelMenu-' + this.id;
            }

            this._restoreState();
        },

        _render: function() {
            var $this = this;

            if(!this.options.enhanced) {
                this.element.addClass('ui-panelmenu ui-widget');
            }
            this.panels.addClass('ui-panelmenu-panel');

            this.element.find('li').each(function(){
                var listItem = $(this),
                    menuitemLink = listItem.children('a'),
                    icon = menuitemLink.data('icon');

                menuitemLink.addClass('ui-menuitem-link ui-corner-all')

                if($this.options.enhanced)
                    menuitemLink.children('span').addClass('ui-menuitem-text');
                else
                    menuitemLink.contents().wrap('<span class="ui-menuitem-text" />');

                if(icon) {
                    menuitemLink.prepend('<span class="ui-menuitem-icon fa fa-fw ' + icon + '"></span>');
                }

                if(listItem.children('ul').length) {
                    listItem.addClass('ui-menu-parent');
                    menuitemLink.prepend('<span class="ui-panelmenu-icon fa fa-fw fa-caret-right"></span>');
                    listItem.children('ul').addClass('ui-helper-hidden');

                    if(icon) {
                        menuitemLink.addClass('ui-menuitem-link-hasicon');
                    }
                }

                listItem.addClass('ui-menuitem ui-widget ui-corner-all');
                listItem.parent().addClass('ui-menu-list ui-helper-reset');
            });

            //headers
            this.panels.children(':first-child').attr('tabindex', '0').each(function () {
                var header = $(this),
                    headerLink = header.children('a'),
                    icon = headerLink.data('icon');

                if(icon) {
                    headerLink.addClass('ui-panelmenu-headerlink-hasicon').prepend('<span class="ui-menuitem-icon fa fa-fw ' + icon + '"></span>');
                }

                header.addClass('ui-widget ui-panelmenu-header ui-state-default ui-corner-all').prepend('<span class="ui-panelmenu-icon fa fa-fw fa-caret-right"></span>');
            });

            //contents
            this.panels.children(':last-child').attr('tabindex', '0').addClass('ui-panelmenu-content ui-widget-content ui-helper-hidden');
        },

        _destroy: function() {
            var $this = this;
            this._unbindEvents();

            if(!this.options.enhanced) {
                this.element.removeClass('ui-panelmenu ui-widget');
            }

            this.panels.removeClass('ui-panelmenu-panel');
            this.headers.removeClass('ui-widget ui-panelmenu-header ui-state-default ui-state-hover ui-state-active ui-corner-all ui-corner-top').removeAttr('tabindex');
            this.contents.removeClass('ui-panelmenu-content ui-widget-content ui-helper-hidden').removeAttr('tabindex')
            this.contents.find('ul').removeClass('ui-menu-list ui-helper-reset ui-helper-hidden');

            this.headers.each(function () {
                var header = $(this),
                    headerLink = header.children('a');

                header.children('.fa').remove();
                headerLink.removeClass('ui-panelmenu-headerlink-hasicon');
                headerLink.children('.fa').remove();
            });

            this.element.find('li').each(function(){
                var listItem = $(this),
                    menuitemLink = listItem.children('a');

                menuitemLink.removeClass('ui-menuitem-link ui-corner-all ui-menuitem-link-hasicon');

                if($this.options.enhanced)
                    menuitemLink.children('span').removeClass('ui-menuitem-text');
                else
                    menuitemLink.contents().unwrap();

                menuitemLink.children('.fa').remove();

                listItem.removeClass('ui-menuitem ui-widget ui-corner-all ui-menu-parent')
                    .parent().removeClass('ui-menu-list ui-helper-reset ui-helper-hidden ');
            });
        },

        _unbindEvents: function() {
            this.headers.off('mouseover.ui-panelmenu mouseout.ui-panelmenu click.ui-panelmenu');
            this.menuitemLinks.off('mouseover.ui-panelmenu mouseout.ui-panelmenu click.ui-panelmenu');
            this.treeLinks.off('click.ui-panelmenu');
            this._unbindKeyEvents();
        },

        _bindEvents: function() {
            var $this = this;

            this.headers.on('mouseover.ui-panelmenu', function() {
                var element = $(this);
                if(!element.hasClass('ui-state-active')) {
                    element.addClass('ui-state-hover');
                }
            }).on('mouseout.ui-panelmenu', function() {
                var element = $(this);
                if(!element.hasClass('ui-state-active')) {
                    element.removeClass('ui-state-hover');
                }
            }).on('click.ui-panelmenu', function(e) {
                var header = $(this);

                if(header.hasClass('ui-state-active'))
                    $this._collapseRootSubmenu($(this));
                else
                    $this._expandRootSubmenu($(this), false);

                $this._removeFocusedItem();
                header.focus();
                e.preventDefault();
            });

            this.menuitemLinks.on('mouseover.ui-panelmenu', function() {
                $(this).addClass('ui-state-hover');
            }).on('mouseout.ui-panelmenu', function() {
                $(this).removeClass('ui-state-hover');
            }).on('click.ui-panelmenu', function(e) {
                var currentLink = $(this);
                $this._focusItem(currentLink.closest('.ui-menuitem'));

                var href = currentLink.attr('href');
                if(href && href !== '#') {
                    window.location.href = href;
                }
                e.preventDefault();
            });

            this.treeLinks.on('click.ui-panelmenu', function(e) {
                var link = $(this),
                    submenu = link.parent(),
                    submenuList = link.next();

                if(submenuList.is(':visible')) {
                    if(link.children('span.fa-caret-down').length) {
                        link.children('span.fa-caret-down').removeClass('fa-caret-down').addClass('fa-caret-right');
                    }
                    $this._collapseTreeItem(submenu);
                }
                else {
                    if(link.children('span.fa-caret-right').length) {
                        link.children('span.fa-caret-right').removeClass('fa-caret-right').addClass('fa-caret-down');
                    }

                    $this._expandTreeItem(submenu, false);
                }

                e.preventDefault();
            });

            this._bindKeyEvents();
        },

        _bindKeyEvents: function() {
            var $this = this;

            if(PUI.isIE()) {
                this.focusCheck = false;
            }

            this.headers.on('focus.panelmenu', function(){
                    $(this).addClass('ui-menuitem-outline');
                })
                .on('blur.panelmenu', function(){
                    $(this).removeClass('ui-menuitem-outline ui-state-hover');
                })
                .on('keydown.panelmenu', function(e) {
                    var keyCode = $.ui.keyCode,
                        key = e.which;

                    if(key === keyCode.SPACE || key === keyCode.ENTER || key === keyCode.NUMPAD_ENTER) {
                        $(this).trigger('click');
                        e.preventDefault();
                    }
                });

            this.contents.on('mousedown.panelmenu', function(e) {
                if($(e.target).is(':not(:input:enabled)')) {
                    e.preventDefault();
                }
            }).on('focus.panelmenu', function(){
                if(!$this.focusedItem) {
                    $this._focusItem($this._getFirstItemOfContent($(this)));
                    if(PUI.isIE()) {
                        $this.focusCheck = false;
                    }
                }
            }).on('keydown.panelmenu', function(e) {
                if(!$this.focusedItem) {
                    return;
                }

                var keyCode = $.ui.keyCode;

                switch(e.which) {
                    case keyCode.LEFT:
                        if($this._isExpanded($this.focusedItem)) {
                            $this.focusedItem.children('.ui-menuitem-link').trigger('click');
                        }
                        else {
                            var parentListOfItem = $this.focusedItem.closest('ul.ui-menu-list');

                            if(parentListOfItem.parent().is(':not(.ui-panelmenu-content)')) {
                                $this._focusItem(parentListOfItem.closest('li.ui-menuitem'));
                            }
                        }

                        e.preventDefault();
                        break;

                    case keyCode.RIGHT:
                        if($this.focusedItem.hasClass('ui-menu-parent') && !$this._isExpanded($this.focusedItem)) {
                            $this.focusedItem.children('.ui-menuitem-link').trigger('click');
                        }
                        e.preventDefault();
                        break;

                    case keyCode.UP:
                        var itemToFocus = null,
                            prevItem = $this.focusedItem.prev();

                        if(prevItem.length) {
                            itemToFocus = prevItem.find('li.ui-menuitem:visible:last');
                            if(!itemToFocus.length) {
                                itemToFocus = prevItem;
                            }
                        }
                        else {
                            itemToFocus = $this.focusedItem.closest('ul').parent('li');
                        }

                        if(itemToFocus.length) {
                            $this._focusItem(itemToFocus);
                        }

                        e.preventDefault();
                        break;

                    case keyCode.DOWN:
                        var itemToFocus = null,
                            firstVisibleChildItem = $this.focusedItem.find('> ul > li:visible:first');

                        if(firstVisibleChildItem.length) {
                            itemToFocus = firstVisibleChildItem;
                        }
                        else if($this.focusedItem.next().length) {
                            itemToFocus = $this.focusedItem.next();
                        }
                        else {
                            if($this.focusedItem.next().length === 0) {
                                itemToFocus = $this._searchDown($this.focusedItem);
                            }
                        }

                        if(itemToFocus && itemToFocus.length) {
                            $this._focusItem(itemToFocus);
                        }

                        e.preventDefault();
                        break;

                    case keyCode.ENTER:
                    case keyCode.NUMPAD_ENTER:
                    case keyCode.SPACE:
                        var currentLink = $this.focusedItem.children('.ui-menuitem-link');
                        //IE fix
                        setTimeout(function(){
                            currentLink.trigger('click');
                        },1);
                        $this.element.blur();

                        var href = currentLink.attr('href');
                        if(href && href !== '#') {
                            window.location.href = href;
                        }
                        e.preventDefault();
                        break;

                    case keyCode.TAB:
                        if($this.focusedItem) {
                            if(PUI.isIE()) {
                                $this.focusCheck = true;
                            }
                            $(this).focus();
                        }
                        break;
                }
            }).on('blur.panelmenu', function(e) {
                if(PUI.isIE() && !$this.focusCheck) {
                    return;
                }

                $this._removeFocusedItem();
            });

            var clickNS = 'click.' + this.id;
            //remove focusedItem when document is clicked
            $(document.body).off(clickNS).on(clickNS, function(event) {
                if(!$(event.target).closest('.ui-panelmenu').length) {
                    $this._removeFocusedItem();
                }
            });
        },

        _unbindKeyEvents: function() {
            this.headers.off('focus.panelmenu blur.panelmenu keydown.panelmenu');
            this.contents.off('mousedown.panelmenu focus.panelmenu keydown.panelmenu blur.panelmenu');
            $(document.body).off('click.' + this.id);
        },

        _isExpanded: function(item) {
            return item.children('ul.ui-menu-list').is(':visible');
        },

        _searchDown: function(item) {
            var nextOfParent = item.closest('ul').parent('li').next(),
                itemToFocus = null;

            if(nextOfParent.length) {
                itemToFocus = nextOfParent;
            }
            else if(item.closest('ul').parent('li').length === 0){
                itemToFocus = item;
            }
            else {
                itemToFocus = this._searchDown(item.closest('ul').parent('li'));
            }

            return itemToFocus;
        },

        _getFirstItemOfContent: function(content) {
            return content.find('> .ui-menu-list > .ui-menuitem:visible:first-child');
        },

        _collapseRootSubmenu: function(header) {
            var panel = header.next();

            header.attr('aria-expanded', false).removeClass('ui-state-active ui-corner-top').addClass('ui-state-hover ui-corner-all');
            header.children('span.fa').removeClass('fa-caret-down').addClass('fa-caret-right');
            panel.attr('aria-hidden', true).slideUp('normal', 'easeInOutCirc');

            this._removeAsExpanded(panel);
        },

        _expandRootSubmenu: function(header, restoring) {
            var panel = header.next();

            header.attr('aria-expanded', true).addClass('ui-state-active ui-corner-top').removeClass('ui-state-hover ui-corner-all');
            header.children('span.fa').removeClass('fa-caret-right').addClass('fa-caret-down');

            if(restoring) {
                panel.attr('aria-hidden', false).show();
            }
            else {
                panel.attr('aria-hidden', false).slideDown('normal', 'easeInOutCirc');

                this._addAsExpanded(panel);
            }
        },

        _restoreState: function() {
            var expandedNodeIds = null;

            if(this.options.stateful) {
                expandedNodeIds = PUI.getCookie(this.stateKey);
            }

            if(expandedNodeIds) {
                this._collapseAll();
                this.expandedNodes = expandedNodeIds.split(',');

                for(var i = 0 ; i < this.expandedNodes.length; i++) {
                    var element = $(PUI.escapeClientId(this.expandedNodes[i]));
                    if(element.is('div.ui-panelmenu-content'))
                        this._expandRootSubmenu(element.prev(), true);
                    else if(element.is('li.ui-menu-parent'))
                        this._expandTreeItem(element, true);
                }
            }
            else {
                this.expandedNodes = [];
                var activeHeaders = this.headers.filter('.ui-state-active'),
                    activeTreeSubmenus = this.element.find('.ui-menu-parent > .ui-menu-list:not(.ui-helper-hidden)');

                for(var i = 0; i < activeHeaders.length; i++) {
                    this.expandedNodes.push(activeHeaders.eq(i).next().attr('id'));
                }

                for(var i = 0; i < activeTreeSubmenus.length; i++) {
                    this.expandedNodes.push(activeTreeSubmenus.eq(i).parent().attr('id'));
                }
            }
        },

        _collapseAll: function() {
            this.headers.filter('.ui-state-active').each(function() {
                var header = $(this);
                header.removeClass('ui-state-active').next().addClass('ui-helper-hidden');
            });

            this.element.find('.ui-menu-parent > .ui-menu-list:not(.ui-helper-hidden)').each(function() {
                $(this).addClass('ui-helper-hidden');
            });
        },

        _removeAsExpanded: function(element) {
            var id = element.attr('id');

            this.expandedNodes = $.grep(this.expandedNodes, function(value) {
                return value != id;
            });

            this._saveState();
        },

        _addAsExpanded: function(element) {
            this.expandedNodes.push(element.attr('id'));

            this._saveState();
        },

        _removeFocusedItem: function() {
            if(this.focusedItem) {
                this._getItemText(this.focusedItem).removeClass('ui-menuitem-outline');
                this.focusedItem = null;
            }
        },

        _focusItem: function(item) {
            this._removeFocusedItem();
            this._getItemText(item).addClass('ui-menuitem-outline').focus();
            this.focusedItem = item;
        },

        _getItemText: function(item) {
            return item.find('> .ui-menuitem-link > span.ui-menuitem-text');
        },

        _expandTreeItem: function(submenu, restoring) {
            var submenuLink = submenu.find('> .ui-menuitem-link');

            submenuLink.find('> .ui-menuitem-text').attr('aria-expanded', true);
            submenu.children('.ui-menu-list').show();

            if(!restoring) {
                this._addAsExpanded(submenu);
            }
        },

        _collapseTreeItem: function(submenu) {
            var submenuLink = submenu.find('> .ui-menuitem-link');

            submenuLink.find('> .ui-menuitem-text').attr('aria-expanded', false);
            submenu.children('.ui-menu-list').hide();

            this._removeAsExpanded(submenu);
        },

        _removeAsExpanded: function(element) {
            var id = element.attr('id');

            this.expandedNodes = $.grep(this.expandedNodes, function(value) {
                return value != id;
            });

            this._saveState();
        },

        _addAsExpanded: function(element) {
            this.expandedNodes.push(element.attr('id'));

            this._saveState();
        },

        _saveState: function() {
            if(this.options.stateful) {
                var expandedNodeIds = this.expandedNodes.join(',');

                PUI.setCookie(this.stateKey, expandedNodeIds, {path:'/'});
            }
        },

        _clearState: function() {
            if(this.options.stateful) {
                PUI.deleteCookie(this.stateKey, {path:'/'});
            }
        }

    });

})();

/**
 * PrimeUI password widget
 */
(function() {

    $.widget("primeui.puipassword", {
        
        options: {
            promptLabel: 'Please enter a password',
            weakLabel: 'Weak',
            mediumLabel: 'Medium',
            strongLabel: 'Strong',
            inline: false
        },
       
        _create: function() {
            this.id = this.element.attr('id');
            if(!this.id) {
                this.id = this.element.uniqueId().attr('id');
            }

            this.element.puiinputtext().addClass('ui-password');
            
            if(!this.element.prop(':disabled')) {
                var panelMarkup = '<div class="ui-password-panel ui-widget ui-state-highlight ui-corner-all ui-helper-hidden">';
                panelMarkup += '<div class="ui-password-meter" style="background-position:0pt 0pt">&nbsp;</div>';
                panelMarkup += '<div class="ui-password-info">' + this.options.promptLabel + '</div>';
                panelMarkup += '</div>';

                this.panel = $(panelMarkup).insertAfter(this.element);
                this.meter = this.panel.children('div.ui-password-meter');
                this.infoText = this.panel.children('div.ui-password-info');

                if(this.options.inline) {
                    this.panel.addClass('ui-password-panel-inline');
                } else {
                    this.panel.addClass('ui-password-panel-overlay').appendTo('body');
                }

                this._bindEvents();
            }
        },
        
        _destroy: function() {
            this.element.puiinputtext('destroy').removeClass('ui-password');
            this._unbindEvents();
            this.panel.remove();
            $(window).off('resize.' + this.id);
        },
        
        _bindEvents: function() {
            var $this = this;
            
            this.element.on('focus.puipassword', function() {
                $this.show();
            })
            .on('blur.puipassword', function() {
                $this.hide();
            })
            .on('keyup.puipassword', function() {
                var value = $this.element.val(),
                label = null,
                meterPos = null;

                if(value.length === 0) {
                    label = $this.options.promptLabel;
                    meterPos = '0px 0px';
                }
                else {
                    var score = $this._testStrength($this.element.val());

                    if(score < 30) {
                        label = $this.options.weakLabel;
                        meterPos = '0px -10px';
                    }
                    else if(score >= 30 && score < 80) {
                        label = $this.options.mediumLabel;
                        meterPos = '0px -20px';
                    } 
                    else if(score >= 80) {
                        label = $this.options.strongLabel;
                        meterPos = '0px -30px';
                    }
                }

                $this.meter.css('background-position', meterPos);
                $this.infoText.text(label);
            });

            if(!this.options.inline) {
                var resizeNS = 'resize.' + this.id;
                $(window).off(resizeNS).on(resizeNS, function() {
                    if($this.panel.is(':visible')) {
                        $this.align();
                    }
                });
            }
        },

        _unbindEvents: function() {
            this.element.off('focus.puipassword blur.puipassword keyup.puipassword');
        },
        
        _testStrength: function(str) {
            var grade = 0, 
            val = 0, 
            $this = this;

            val = str.match('[0-9]');
            grade += $this._normalize(val ? val.length : 1/4, 1) * 25;

            val = str.match('[a-zA-Z]');
            grade += $this._normalize(val ? val.length : 1/2, 3) * 10;

            val = str.match('[!@#$%^&*?_~.,;=]');
            grade += $this._normalize(val ? val.length : 1/6, 1) * 35;

            val = str.match('[A-Z]');
            grade += $this._normalize(val ? val.length : 1/6, 1) * 30;

            grade *= str.length / 8;

            return grade > 100 ? 100 : grade;
        },

        _normalize: function(x, y) {
            var diff = x - y;

            if(diff <= 0) {
                return x / y;
            }
            else {
                return 1 + 0.5 * (x / (x + y/4));
            }
        },

        align: function() {
            this.panel.css({
                left:'', 
                top:'',
                'z-index': ++PUI.zindex
            })
            .position({
                my: 'left top',
                at: 'right top',
                of: this.element
            });
        },

        show: function() {
            if(!this.options.inline) {
                this.align();

                this.panel.fadeIn();
            }
            else {
                this.panel.slideDown(); 
            }        
        },

        hide: function() {
            if(this.options.inline) {
                this.panel.slideUp();
            }
            else {
                this.panel.fadeOut();
            }
        },

        disable: function () {
            this.element.puiinputtext('disable');
            this._unbindEvents();
        },

        enable: function () {
            this.element.puiinputtext('enable');
            this._bindEvents();
        },

        _setOption: function(key, value) {
            if(key === 'disabled') {
                if(value)
                    this.disable();
                else
                    this.enable();
            }
            else {
                $.Widget.prototype._setOption.apply(this, arguments);
            }
        }

    });
    
})();
/**
 * PrimeUI ColResize widget
 */
(function() {

    $.widget("primeui.puicolresize", {

        options: {
            mode: 'fit'
        },

        _create: function() {
            this.element.addClass('ui-datatable-resizable');
            this.thead = this.element.find('> .ui-datatable-tablewrapper > table > thead');
            this.thead.find('> tr > th').addClass('ui-resizable-column');
            this.resizerHelper = $('<div class="ui-column-resizer-helper ui-state-highlight"></div>').appendTo(this.element);
            this.addResizers();

            var resizers = this.thead.find('> tr > th > span.ui-column-resizer'),
            $this = this;

            setTimeout(function() {
                $this.fixColumnWidths();
            }, 5);

            resizers.draggable({
                axis: 'x',
                start: function(event, ui) {
                    ui.helper.data('originalposition', ui.helper.offset());

                    var height = $this.options.scrollable ? $this.scrollBody.height() : $this.thead.parent().height() - $this.thead.height() - 1;
                    $this.resizerHelper.height(height);
                    $this.resizerHelper.show();
                },
                drag: function(event, ui) {
                    $this.resizerHelper.offset({
                        left: ui.helper.offset().left + ui.helper.width() / 2,
                        top: $this.thead.offset().top + $this.thead.height()
                    });
                },
                stop: function(event, ui) {
                    ui.helper.css({
                        'left': '',
                        'top': '0px',
                        'right': '0px'
                    });

                    $this.resize(event, ui);
                    $this.resizerHelper.hide();

                    if($this.options.mode === 'expand') {
                        setTimeout(function() {
                            $this._trigger('colResize', null, {element: ui.helper.parent().get(0)});
                        }, 5);
                    }
                    else {
                        $this._trigger('colResize', null, {element: ui.helper.parent().get(0)});
                    }
                },
                containment: this.element
            });
        },

        resize: function(event, ui) {
            var columnHeader, nextColumnHeader, change = null, newWidth = null, nextColumnWidth = null,
            expandMode = (this.options.mode === 'expand'),
            table = this.thead.parent(),
            columnHeader = ui.helper.parent(),
            nextColumnHeader = columnHeader.next();

            change = (ui.position.left - ui.originalPosition.left),
            newWidth = (columnHeader.width() + change),
            nextColumnWidth = (nextColumnHeader.width() - change);

            if((newWidth > 15 && nextColumnWidth > 15) || (expandMode && newWidth > 15)) {
                if(expandMode) {
                    table.width(table.width() + change);
                    setTimeout(function() {
                        columnHeader.width(newWidth);
                    }, 1);
                }
                else {
                    columnHeader.width(newWidth);
                    nextColumnHeader.width(nextColumnWidth);
                }
            }
        },

        addResizers: function() {
            var resizableColumns = this.thead.find('> tr > th.ui-resizable-column');
            resizableColumns.prepend('<span class="ui-column-resizer">&nbsp;</span>');

            if(this.options.columnResizeMode === 'fit') {
                resizableColumns.filter(':last-child').children('span.ui-column-resizer').hide();
            }
        },

        fixColumnWidths: function() {
            if(!this.columnWidthsFixed) {
                this.element.find('> .ui-datatable-tablewrapper > table > thead > tr > th').each(function() {
                    var col = $(this);
                    col.width(col.width());
                });

                this.columnWidthsFixed = true;
            }
        },

        _destroy: function() {
            this.element.removeClass('ui-datatable-resizable');
            this.thead.find('> tr > th').removeClass('ui-resizable-column');
            this.resizerHelper.remove();
            this.thead.find('> tr > th > span.ui-column-resizer').draggable('destroy').remove();
        }
    });
})();

/**
 * PrimeUI ColReorder widget
 */
(function() {

    $.widget("primeui.puicolreorder", {

        _create: function() {
            var $this = this;

            this.thead = this.element.find('> .ui-datatable-tablewrapper > table > thead');
            this.tbody = this.element.find('> .ui-datatable-tablewrapper > table > tbody');
            this.dragIndicatorTop = $('<span class="fa fa-arrow-down" style="position:absolute"/></span>').hide().appendTo(this.element);
            this.dragIndicatorBottom = $('<span class="fa fa-arrow-up" style="position:absolute"/></span>').hide().appendTo(this.element);

            this.thead.find('> tr > th').draggable({
                appendTo: 'body',
                opacity: 0.75,
                cursor: 'move',
                scope: this.id,
                cancel: ':input,.ui-column-resizer',
                drag: function(event, ui) {
                    var droppable = ui.helper.data('droppable-column');

                    if(droppable) {
                        var droppableOffset = droppable.offset(),
                            topArrowY = droppableOffset.top - 10,
                            bottomArrowY = droppableOffset.top + droppable.height() + 8,
                            arrowX = null;

                        //calculate coordinates of arrow depending on mouse location
                        if(event.originalEvent.pageX >= droppableOffset.left + (droppable.width() / 2)) {
                            var nextDroppable = droppable.next();
                            if(nextDroppable.length == 1)
                                arrowX = nextDroppable.offset().left - 9;
                            else
                                arrowX = droppable.offset().left + droppable.innerWidth() - 9;

                            ui.helper.data('drop-location', 1);     //right
                        }
                        else {
                            arrowX = droppableOffset.left  - 9;
                            ui.helper.data('drop-location', -1);    //left
                        }

                        $this.dragIndicatorTop.offset({
                            'left': arrowX,
                            'top': topArrowY - 3
                        }).show();

                        $this.dragIndicatorBottom.offset({
                            'left': arrowX,
                            'top': bottomArrowY - 3
                        }).show();
                    }
                },
                stop: function(event, ui) {
                    //hide dnd arrows
                    $this.dragIndicatorTop.css({
                        'left':0,
                        'top':0
                    }).hide();

                    $this.dragIndicatorBottom.css({
                        'left':0,
                        'top':0
                    }).hide();
                },
                helper: function() {
                    var header = $(this),
                    helper = $('<div class="ui-widget ui-state-default" style="padding:4px 10px;text-align:center;"></div>');

                    helper.width(header.width());
                    helper.height(header.height());

                    helper.html(header.html());

                    return helper.get(0);
                }
            })
            .droppable({
                hoverClass:'ui-state-highlight',
                tolerance:'pointer',
                scope: this.id,
                over: function(event, ui) {
                    ui.helper.data('droppable-column', $(this));
                },
                drop: function(event, ui) {
                    var draggedColumnHeader = ui.draggable,
                        droppedColumnHeader =  $(this),
                        dropLocation = ui.helper.data('drop-location');

                    $this._trigger('colReorder', null, {
                        dragIndex: draggedColumnHeader.index(),
                        dropIndex: droppedColumnHeader.index(),
                        dropSide: dropLocation
                    });
                }
            });
        },

        _destroy: function() {
            this.dragIndicatorTop.remove();
            this.dragIndicatorBottom.remove();
            this.thead.find('> tr > th').draggable('destroy').droppable('destroy');
        }
    });

})();


/**
 * PrimeUI TableScroll widget
 */
(function() {

    $.widget("primeui.puitablescroll", {

        options: {
            scrollHeight: null,
            scrollWidth: null
        },

        _create: function() {
            this.id = PUI.generateRandomId();
            this.scrollHeader = this.element.children('.ui-datatable-scrollable-header');
            this.scrollBody = this.element.children('.ui-datatable-scrollable-body');
            this.scrollHeaderBox = this.scrollHeader.children('.ui-datatable-scrollable-header-box');
            this.bodyTable = this.scrollBody.children('table');
            this.percentageScrollHeight = this.options.scrollHeight && (this.options.scrollHeight.indexOf('%') !== -1);
            this.percentageScrollWidth = this.options.scrollWidth && (this.options.scrollWidth.indexOf('%') !== -1);
            var $this = this,
                scrollBarWidth = this.getScrollbarWidth() + 'px';

            if(this.options.scrollHeight) {
                if(this.percentageScrollHeight)
                    this.adjustScrollHeight();
                else
                    this.scrollBody.css('max-height', this.options.scrollHeight + 'px');

                this.scrollHeaderBox.css('margin-right', scrollBarWidth);
            }

            if(this.options.scrollWidth) {
                if(this.percentageScrollWidth)
                    this.adjustScrollWidth();
                else
                    this.setScrollWidth(parseInt(this.options.scrollWidth));
            }

            this.scrollBody.on('scroll.dataTable', function() {
                var scrollLeft = $this.scrollBody.scrollLeft();
                $this.scrollHeaderBox.css('margin-left', -scrollLeft);
            });

            this.scrollHeader.on('scroll.dataTable', function() {
                $this.scrollHeader.scrollLeft(0);
            });

            $(window).on('resize.' + this.id, function() {
                if($this.element.is(':visible')) {
                    if($this.percentageScrollHeight)
                        $this.adjustScrollHeight();

                    if($this.percentageScrollWidth)
                        $this.adjustScrollWidth();
                }
            });
        },

        _destroy: function() {
            $(window).off('resize.' + this.id);
            this.scrollHeader.off('scroll.dataTable');
            this.scrollBody.off('scroll.dataTable');
        },

        adjustScrollHeight: function() {
            var relativeHeight = this.element.parent().parent().innerHeight() * (parseInt(this.options.scrollHeight) / 100),
                tableHeaderHeight = this.element.children('.ui-datatable-header').outerHeight(true),
                tableFooterHeight = this.element.children('.ui-datatable-footer').outerHeight(true),
                scrollersHeight = (this.scrollHeader.outerHeight(true) + this.scrollFooter.outerHeight(true)),
                paginatorsHeight = this.paginator ? this.paginator.getContainerHeight(true) : 0,
                height = (relativeHeight - (scrollersHeight + paginatorsHeight + tableHeaderHeight + tableFooterHeight));

            this.scrollBody.css('max-height', height + 'px');
        },

        adjustScrollWidth: function() {
            var width = parseInt((this.element.parent().parent().innerWidth() * (parseInt(this.options.scrollWidth) / 100)));
            this.setScrollWidth(width);
        },

        setOuterWidth: function(element, width) {
            var diff = element.outerWidth() - element.width();
            element.width(width - diff);
        },

        setScrollWidth: function(width) {
            var $this = this;
            this.element.children('.ui-widget-header').each(function() {
                $this.setOuterWidth($(this), width);
            });
            this.scrollHeader.width(width);
            this.scrollBody.css('margin-right', 0).width(width);
        },

        getScrollbarWidth: function() {
            if(!this.scrollbarWidth) {
                this.scrollbarWidth = PUI.calculateScrollbarWidth();
            }

            return this.scrollbarWidth;
        }
    });
})();