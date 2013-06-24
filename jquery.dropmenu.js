/*jslint devel: true, bitwise: true, regexp: true, browser: true, confusion: true, unparam: true, eqeq: true, white: true, nomen: true, plusplus: true, maxerr: 50, indent: 4 */
/*globals jQuery */

/*
 * Dropmenu
 *
 * Copyright (c) 2013 Martijn W. van der Lee
 * Licensed under the MIT.
 *
 * Requires jQuery and jQueryUI.
 *
 * Simple dropdown menu for buttons
 */

;(function($, undefined) {
	"use strict";

    $.widget("vanderlee.dropmenu", {
		options: {
            'items':			[],
			'closeOnSelect':	true,
			'showAnim':			'show',
			'duration':			'normal',
			'showOptions':		{},
			'render':			undefined,

			'select':			undefined
        },

        _create: function () {
			var that = this;

            that.widgetEventPrefix = 'dropmenu';
			
            that.menu		= null;

            that.element.click(function(e) {
                e.preventDefault();
				that.open();
            });

			// Click outside to close
            $(document).delegate('html', 'touchstart click', function (event) {
				if (!$(event.target).closest(that.element).is(that.element)
				 && !$(event.target).closest(that.menu).is(that.menu)) {
					that.close();
				}
            });

            return that;
        },

		_show: function(element) {
			if ($.effects && $.effects.effect[this.options.showAnim]) {
				element.show(this.options.showAnim, this.options.showOptions, this.options.duration);
			} else {
				element[this.options.showAnim || "show"](this.options.showAnim ? this.options.duration : null);
			}
		},

		_hide: function(element, callback) {
			element.stop();
			if ($.effects && ($.effects.effect[this.options.showAnim] || $.effects[this.options.showAnim])) {
				element.hide(this.options.showAnim, this.options.showOptions, this.options.duration, callback);
			} else {
				element[(this.options.showAnim === "slideDown" ? "slideUp" :
					(this.options.showAnim === "fadeIn" ? "fadeOut" : "hide"))]((this.options.showAnim ? this.options.duration : null), callback);
			}
		},

		open: function() {
			var that = this,
				items,
				content;
			
			if (!that.menu) {				
				that.menu = $('<div class="dropmenu"/>').hide().appendTo('body');
				that.menu.position({
					'of':	that.element,
					'my':	'left top',
					'at':	'left bottom'
				});

				content = $('<div class="dropdown-content"/>').appendTo(that.menu);
				
				if ($.isFunction(that.options.items)) {
					if (items = that.options.items.call(that, that, function(items) {
						that._addItems(content, items);
						that._show(that.menu);
					})) {
						that._addItems(content, items);
						that._show(that.menu);
					}
				} else {
					that._addItems(content, that.options.items);
					that._show(that.menu);
				}
			}
		},

		close: function() {
			var that = this;
			if (that.menu) {
				that._hide(that.menu, function() {
					that.menu.remove();
					that.menu = null;
				});
			}
		},

		_addItem: function(menu, item) {
			var that		= this,
				label		= item.label || item.name || '',
				render		= $.isFunction(item.render) ? item.render
							: $.isFunction(that.options.render) ? that.options.render
							: undefined,
				html		= render? render(item) : label,
				row			= $('<div class="dropmenu-item"/>').html(html).appendTo(menu),
				text		= render? '' : row.text(),
				selectable	= item.selectable ? item.selectable	: (item.items ? false : true),
				submenu,
				items,
				content;

			if (text !== '') {
				row.mouseenter(function () {
					if (this.offsetWidth < this.scrollWidth && !row.attr('title')) {
						row.attr('title', text);
					}
				});
			}
		
			if (item.items) {
				row.addClass('dropmenu-parent').hover(function() {
					submenu = $('<div class="dropmenu"/>').appendTo(row);
					submenu.css({
						'left':	row.outerWidth(),
						'top':	row.position().top
					});

					content = $('<div class="dropdown-content"/>').appendTo(submenu);

					if ($.isFunction(item.items)) {
						if (items = item.items.call(this, item, function(items) {
							that._addItems(content, items);
							that._show(submenu);
						})) {
							that._addItems(content, items);
							that._show(submenu);
						}
					} else {
						that._addItems(content, item.items);
						that._show(submenu);
					}
				}, function() {
					var oldSubmenu = submenu;
					that._hide(oldSubmenu, function() {
						oldSubmenu.remove();
					});					
				});
			}

			if (selectable !== false) {
				row.addClass('dropmenu-selectable');
				row.click(function() {
					if ($.isFunction(item.select)) {
						item.select.call(this, item);
					}
					that._trigger('select', null, item);

					if (that.options.closeOnSelect) {
						that.close();
					}
				});
			}
		},

		_addItems: function(menu, items) {
			var that = this;

			$.each(items, function(index, item) {
				if ($.isFunction(item)) {
					if (item = item.call(this, item, function(item) {
						that._addItem(menu, item);
					})) {
						that._addItem(menu, item);
					}
				} else {
					that._addItem(menu, item);
				}
			});
		}
    });
}(jQuery));
