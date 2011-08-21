// remap jQuery to $
(function($){})(window.jQuery);


function datechange() {
  $('#datelabel').text($('#event_date').datewheel('date') + '');
}

/* trigger when page is ready */
$(document).ready(function (){
  $('#event_date').bind('datewheel.changing', datechange);
  $('#event_date').bind('datewheel.changed', datechange);
  $('#event_date').datewheel({date:new Date(2014, 3, 14, 15, 30)});
});


/* optional triggers

$(window).load(function() {
	
});

$(window).resize(function() {
	
});

*/