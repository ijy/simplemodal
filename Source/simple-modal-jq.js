/**
********************************************************************************
* Simple Modal jQ
*-------------------------------------------------------------------------------
- SIMPLE MODAL jQ is a small plugin to create modal windows. It can be used to generate alert or confirm messages with few lines of code. Confirm configuration involves the use of callbacks to be applied to affirmative action. It can work in asynchronous mode and retrieve content from external pages or getting the inline content. SIMPLE MODAL is not a lightbox although the possibility to hide parts of its layout may partially make it similar.
********************************************************************************
*/

(function($) {

	$.fn.SimpleModal = function(options) {
		
		// Set plugin globals and default values
		var buttons = [];
		
		// Set plugin default options
		var defaults = {
		      onAppend:			function() {}, // Callback inject in DOM // **WATCH**
		      offsetTop:		null,
		      overlayOpacity:	.3,
		      overlayColor:		"#000000",
		      width:			400,
		      draggable:		true,
		      keyEsc:			true,
		      overlayClick:		true,
		      closeButton:		true, // X close button
		      hideHeader:		false, 
		      hideFooter:		false,
		      btn_ok:			"OK", // Label
		      btn_cancel:		"Cancel", // Label
		      template:	"<div class=\"simple-modal-header\"> \
		          <h1>{_TITLE_}</h1> \
		        </div> \
		        <div class=\"simple-modal-body\"> \
		          <div class=\"contents\">{_CONTENTS_}</div> \
		        </div> \
		        <div class=\"simple-modal-footer\"></div>"
		};
		  
		init : function(options) {
		
			// Extend & overwrite the default options with those passed in
			var options = $.extend(defaults, options);
		},
		
		show : function() {
			
			// If no options are passed in then set as empty
			if(!options) options = {};
			
				// Display the overlay
				this.__overlay("show");
				
				// Switch :: type of modal
				switch(options.model){
			      
					// Require title && contents && callback
					case "confirm":
					
						// Add button confirm
						// **WATCH**
						this.addButton(this.options.btn_ok, "btn primary btn-margin", function(){
							
							// Add error handling in here later
							// try { options.callback() } catch(err){};
							this.hide();
						})
						
						// Add button cancel
						this.addButton(this.options.btn_cancel, "btn secondary");
						
						// Rendering
						var node = this.__drawWindow(options);
						
						// Add Esc Behaviour
						this.__addEscBehaviour();
								
					break;
					
					// Require title && contents (define the action buttons externally)
					case "modal":
					
						// Rendering
						var node = this.__drawWindow(options);
						
						// Add Esc Behaviour
						this.__addEscBehaviour();
								
					break;
					
					// Require title && url contents (define the action buttons externally)
					case "modal-ajax":
					
						// Rendering
						var node = this.__drawWindow(options);
						
						this.__loadContents ({
					        "url": options.param.url || "",
					        "onRequestComplete": options.param.onRequestComplete || Function
					  	})
					  
					break;
					
					// Require title && contents
					default:
	
						// Add button
						this.addButton(this.options.btn_ok, "btn primary");
						
						// Rendering
						var node = this.__drawWindow(options);
						
						// Add Esc Behaviour
						this.__addEscBehaviour();
								
					break;
					
				// Set the custom width of the Modal
				node.css({ 'width', 'this.options.width' });
				
				// Hide Header &&/|| Footer
				if(this.options.hideHeader) node.addClass('hide-header');
				if(this.options.hideFooter) node.addClass('hide-footer');
				
				// Add Button X
				if(this.options.closeButton) { 
					this.__addCloseButton();
				}
				
				// Enabled Drag Window
				// Will require jQuery UI for this so will comment out for now...
				/*if(this.options.draggable) {
				
					var headDrag = node.$(".simple-modal-header");
					new Drag(node, { handle:headDrag });
					
					// Set handle cursor
					headDrag.setStyle("cursor", "move")
					node.addClass("draggable");
				} */
				
				// Resize Stage
				this.__display();
			        
		}, // end 'show'
		
		hide : function() {
			
			// Add error handling here later
			/*try {
				if( typeof(this.request) == "object" ) this.request.cancel();
			} catch(err) {}*/
			
			this.__overlay('hide');
			return;
		},
		
		__drawWindow : function(options) {
		
			// Set the node & CSS class
			var node = $("div#simple-modal").addClass("simple-modal");
			
			// Add it to the DOM (at the bottom)
			body.appendTo('body');
			    
			// Set the contents
			var html = this.__template(this.options.template, {"_TITLE_":options.title || "Untitled", "_CONTENTS_":options.contents || ""});
			
			node.html(html);
			
			// Add all buttons
			this.__injectAllButtons();
			
			// Callback (onAppend set in 'Defaults')
			this.options.onAppend();
			
			return node;
		},
		
		addButton : function(label, cssClass, clickEvent) {
			
			var btn = $('<a></a>').attr({
				"title" : label,
				"text"  : label,
				"class" : cssClass
			});
			
			// This _should_ either act on the callback function passed or hide the modal window (not the button itself)
			// **WATCH**
			btn.click(function() {
				$.proxy((clickEvent || this.hide), this)   
			});
		
			this.buttons.push(btn);
			return btn;
		},
		
		__injectAllButtons : function() {
			
			this.buttons.each(function(i) { 
				i.appendTo(".simple-modal-footer");
			});
			
			return;
		},
		
		__addCloseButton : function() {

			// Create a close button represented with an 'X'
			var btn-close = $("<a></a>").attr({
				"class" : "close",
				"href"  : "#",
				"html"  : "x"
			});
			
			// Add this button to the top of the modal window
			btn-close.prependTo(".simple-modal");
			
			// Prevent default action & hide the modal window
			btn-close.click(function(e) {
				e.preventDefault;
				$.proxy(e, this).hide();
			});
			
			return btn-close;
		},
		
		__overlay : function(status) {
			
			switch(status) {
			
				case 'show':
				
					// Hide if already displaying (?)
					this.__overlay('hide');
					
					var overlay = $('<div></div>').attr({
						"id" : "simple-modal-overlay"
					});
					
					overlay.appendTo('body').css('background-color', 'this.options.overlayColor');
					
					// Fade out first then fade in to opacity level set in options
					overlay.fadeOut('slow').fadeTo('slow', this.options.overlayOpacity);
					
					// If Overlay is clicked
					if (this.options.overlayClick) {
						overlay.click(function(e) {
							e.stopPropogation();
							this.hide();
						}
					}
					
					// Dynamic resizing
					// [HELP]
					this.__resize = this.__display.bind(this);
					window.addEvent("resize", this.__resize );
					
				break;
			
				case 'hide':
				
					// Remove Event Resize
					//window.removeEvent("resize", this._display);
					
					// Remove Event Resize
					window.removeEvent("keydown", this._removeSM);
					
					// Remove Overlay
					try{
					  $('simple-modal-overlay').destroy();
					}
					catch(err){}
					// Remove Modal
					try{
					  $('simple-modal').destroy();
					}
					catch(err){}
				
				break;
				
				}
				
				return;
				
			
			// Mootools
			switch(status) {
			case 'show':
				this._overlay('hide');
				var overlay = new Element("div", {"id":"simple-modal-overlay"});
				overlay.inject( $$("body")[0] );
				overlay.setStyle("background-color", this.options.overlayColor);
				overlay.fade("hide").fade(this.options.overlayOpacity);
				
				// Behaviour
				if(this.options.overlayClick) {
					overlay.addEvent("click", function(e){
						if(e) e.stop();
						this.hide();
					}.bind(this))
				}
				
				// Add Control Resize
				this.__resize = this._display.bind(this);
				window.addEvent("resize", this.__resize );
				
			break;
			
			case 'hide':
			    // Remove Event Resize
			    window.removeEvent("resize", this._display);
			    // Remove Event Resize
			    window.removeEvent("keydown", this._removeSM);
			    
			    // Remove Overlay
			    try{
			      $('simple-modal-overlay').destroy();
			    }
			    catch(err){}
			    // Remove Modal
			    try{
			      $('simple-modal').destroy();
			    }
			    catch(err){}
			break;
			}
			return;
			
		},
		
		__loadContents : function() {
			
		},
		
		__display : function() {
		
		},
		
		__addEscapeBehaviour : function() {
		
		},
		
		__template : function() {
		
		}
		
	};
	
})(jQuery);