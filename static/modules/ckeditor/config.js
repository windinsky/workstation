/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	var uploadUrl = '/image/upload';
	//config.filebrowserUploadUrl = uploadUrl + '?Type=File';
	config.filebrowserImageUploadUrl = uploadUrl;
	config.extraPlugins = 'image';
	config.simpleuploads_acceptedExtensions ='gif|jpeg|jpg|pdf|png';
	config.extraAllowedContent = "h3 blockquote ul li";
	//config.skin = 'moono-dark';
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
};
