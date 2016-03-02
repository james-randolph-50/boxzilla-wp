module.exports = (function($) {
	'use strict';


	/** TODO: Make strings translatable here */
	var $optionControls = $("#stb-box-options-controls");

	// sanity check, are we on the correct page?
	if( $optionControls.length === 0 ) {
		return;
	}

	var $manualTip = $optionControls.find('.stb-manual-tip');
	var EventEmitter = require('../_event-emitter.js');
	var events = new EventEmitter();
	var Option = require('./_option.js');
	var Designer = require('./_designer.js')($, Option, events);
	var rowTemplate = wp.template('rule-row-template');

	// events
	$optionControls.on('click', ".stb-add-rule", addRuleFields);
	$optionControls.on('click', ".stb-remove-rule", removeRule);
	$optionControls.on('change', ".stb-rule-condition", setContextualHelpers);
	$optionControls.find('.stb-auto-show-trigger').on('change', toggleTriggerOptions );

	$(window).load(function() {
		if( typeof(window.tinyMCE) === "undefined" ) {
			document.getElementById('notice-notinymce').style.display = 'block';
		}
	});

	// call contextual helper method for each row
	$('.stb-rule-row').each(setContextualHelpers);

	function toggleTriggerOptions() {
		$optionControls.find('.stb-trigger-options').toggle( this.value !== '' );
	}

	function removeRule() {
		$(this).parents('tr').remove();
	}

	function setContextualHelpers() {

		var $context = ( this.tagName.toLowerCase() === "tr" ) ? $(this) : $(this).parents('tr');
		var $condition = $context.find('.stb-rule-condition');

		// remove previously added helpers
		$context.find('.stb-helper').remove();

		var $valueInput = $context.find('.stb-rule-value');
		var $betterInput = $valueInput
			.clone()
			.removeAttr('name')
			.addClass('stb-helper')
			.insertAfter($valueInput)
			.show()
			.change(function() {
				$valueInput.get(0).value = this.value; //.val(this.value);
			});

		$valueInput.hide();
		$manualTip.hide();

		// change placeholder for textual help
		switch($condition.val()) {
			default:
				$betterInput.attr('placeholder', 'Enter a comma-separated list of values.');
				break;

			case '':
			case 'everywhere':
				$valueInput.val('');
				$betterInput.hide();
				break;

			case 'is_single':
			case 'is_post':
				$betterInput.attr('placeholder', "Enter a comma-separated list of post slugs or post ID's..");
				$betterInput.suggest(ajaxurl + "?action=stb_autocomplete&type=post", {multiple:true, multipleSep: ","});
				break;

			case 'is_page':
				$betterInput.attr('placeholder', "Enter a comma-separated list of page slugs or page ID's..");
				$betterInput.suggest(ajaxurl + "?action=stb_autocomplete&type=page", {multiple:true, multipleSep: ","});
				break;

			case 'is_post_type':
				$betterInput.attr('placeholder', "Enter a comma-separated list of post types.." );
				$betterInput.suggest(ajaxurl + "?action=stb_autocomplete&type=post_type", {multiple:true, multipleSep: ","});
				break;

			case 'is_url':
				$betterInput.attr('placeholder', 'Enter a comma-separated list of relative URLs, eg /contact/');
				break;

			case 'is_post_in_category':
				$betterInput.suggest(ajaxurl + "?action=stb_autocomplete&type=category", {multiple:true, multipleSep: ","});
				break;

			case 'manual':
				$betterInput.attr('placeholder', 'Example: is_single(1, 3)');
				$manualTip.show();
				break;
		}
	}

	function addRuleFields() {
		var data = {
			'key': $optionControls.find('.stb-rule-row').length
		};
		var html = rowTemplate(data);
		$(document.getElementById('stb-box-rules')).after(html);
		return false;
	}

	return {
		'Designer': Designer,
		'Option': Option,
		'events': events
	};

})(window.jQuery);