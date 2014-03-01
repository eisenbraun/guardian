Guardian jQuery Plugin
========

*Copyright (c) 2014, Michael Eisenbraun*

Guardian is a all-purpose form validation jQuery plugin. It was designed to be flexible and easy to extend to meet any need.

## Installation
Guardian requires jQuery 1.7.2 or higher. 
 
`<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>`
`<script src="js/jquery.guardian-1.0.min.js"></script>`

Initialize Guardian:

`$(document).ready(function() { $('#example').guardian(); });`

CSS: (optional)

`<link rel="stylesheet" href="css/guardian.css">`

HTML: 

`<form id="contactForm">
	<input 
		type="text" 
		name="Address" 
		id="Address" 
		class="text" 
		tabindex="3" value="" 
		required="" 
		data-pattern="alphaNum" 
		data-error-message="Address is required"
	>
</form>`

## Full Documentation
Visit <http://jquery.michaeleisenbraun.com/guardian> for full documentation. 
