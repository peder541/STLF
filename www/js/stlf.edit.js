// JavaScript Document

var ACTIVITIES = [];

$(document).ready(function() { 

	$('ol,ul').on('keydown', function(event) {
		if (event.which == 8 || event.which == 46) {
			var $this = $(this);
			var $li = $this.closest('ol,ul').children('li');
			if ($li.index($li.last()) == 0) {
				if ($li.html() == '' || $li.html() == '<br>') {
					return false;
				}
			}
		}
	});
	
	$(document).on('click','[name="maturity[]"]',function(event) {
		switch ($(this).val()) {
			case 'no':
				if ($(this).prop('checked')) $('[name="maturity[]"]').prop('checked', 1).not('[value="no"]').parent().css('opacity','0.5');
				else $('[name="maturity[]"]').not('[value="no"]').parent().css('opacity','');
				break;
			default:
				if (!$(this).prop('checked')) {
					$('[name="maturity[]"]').not('[value="no"]').parent().css('opacity','');
					$('[value="no"]').filter('[name="maturity[]"]').prop('checked', 0);
				}
				break;
		}
	}).on('click','#save',function(event) {
		saveActivity();
	}).on('click','#discard',function(event) {
		discardActivity();
	});
	
	if (window.top.ACTIVITIES.length) {
		ACTIVITIES = window.top.ACTIVITIES;
		loadActivity(window.top.$('#name').html());	
	}
	else {
		$.ajax({
			async: true,
			dataType: "json",
			url: 'activities.json',
			mimeType: "application/json",
			success: function(result){
				ACTIVITIES = result;
			}
		});
		
		$.ajaxSetup({ cache: true });
		$.getScript('//connect.facebook.net/en_UK/all.js', function(){
				FB.init({
						appId: '226799687513796',
				});
				FB.getLoginStatus(function() {
					$.ajax({
						async: true,
						dataType: "json",
						url: 'https://www.okeebo.com/stlf/activities/?access_token=' + ((window.FB) ? FB.getAccessToken() : ''),
						mimeType: "application/json",
						success: function(result){
							ACTIVITIES = result;
						}
					});	
				});
		});
	}

});

function loadActivity(activity) {
	if (typeof(activity) === 'string') activity = stlfFilter('name',activity)[0];
	$('[name="index"]').val(stlfIndexOf(activity));
	$('#name').html(activity.name);
	$('[name="maturity[]"]').prop('checked', 0).parent().css('opacity','');
	if (activity.maturity) {
		for (var i in activity.maturity) $('[name="maturity[]"][value="' + activity.maturity[i] + '"]').prop('checked', 1);
	}
	else {
		$('[name="maturity[]"]').prop('checked', 1).not('[value="no"]').parent().css('opacity','0.5');
	}
	$('[name="outcomes[]"]').prop('checked', 0);
	for (var i in activity.outcomes) $('[name="outcomes[]"][value="' + activity.outcomes[i] + '"]').prop('checked', 1);
	$('[name="concept"][value="' + activity.concept + '"]').prop('checked', 1);
	$('#supplies').html(activity.supplies);
	$('#time').html(activity.time);
	$('#groupsize').html(activity.groupsize);
	$('#goal').html(activity.goal);
	
	if (activity.note) $('#note').html(activity.note).show();
	
	var info2 = [ 'facilitation', 'songs', 'alterations', 'debrief', 'characteristics', 'statements', 'verbal', 'questions' ];
	for (var s in info2) {
		if (activity[info2[s]]) {
			var $info2 = $('#' + info2[s]).empty();
			var data = activity[info2[s]];
			var openTag = '<li>';
			var closeTag = '</li>';
			if (!$.isArray(data)) {
				var elementClass = info2[s].substr(0,info2[s].length-1);
				openTag = '<li class="' + elementClass + '">';
				closeTag = '</li>';
				data = Object.keys(data);
				if (info2[s] == 'songs') data = data.sort();
			}			
			for (var k in data) $info2.append(openTag + data[k] + closeTag);
			$info2.add('[for="' + info2[s] + '"]').show();
		}
	}
	///// Need to figure out how to handle "Repeat-After-Me Songs" and "Human Connection"
	///// Also need to figure out how to handle "Similarities and Differences" and "Self Concept Quiz"
	///// Finally, need to figure out the best way to add the "info2" details to activities that don't already have them

}

function saveActivity() {
	var data = $('form').serializeArray();
	var activity = {};
	activity.name = '';
	for (var i in data) {
		if (data[i].name == 'index') var index = data[i].value;
		else if (data[i].name.slice(-2) == '[]') {
			var name = data[i].name.slice(0,-2);
			if (!activity[name]) activity[name] = [];
			activity[name].push(data[i].value);	
		}
		else activity[data[i].name] = data[i].value;
	}
	$('[contenteditable="true"]').each(function() {
		if (this.innerHTML) {
			var $this = $(this);
			if ($this.is('ul,ol')) {
				if (!activity[this.id]) activity[this.id] = [];
				$this.children('li').each(function(i,el) {
					activity[$this[0].id].push(el.innerHTML.replace(/(<br>)+$/g,''));
				});
			}
			else {
				activity[this.id] = this.innerHTML.replace(/(<br>)+$/g,'');
			}
		}
	});
	if (!activity.maturity) activity.maturity = ['depreciated'];
	else if (activity.maturity[0] == 'no') delete activity.maturity;
	ACTIVITIES[index] = activity;
	$.post('https://www.okeebo.com/stlf/activities/test.php?access_token=' + window.top.FB.getAccessToken() + '&index=' + index, $.param(activity)).always(function() {
		if (window.top != window.self) {
			window.top.loadActivities(ACTIVITIES);
			window.top.show(activity.name);
			window.top.$('body').css('overflow','').css('height','');
			window.top.$('iframe').remove();
		}
	});
	return activity;
}

function discardActivity() {
	loadActivity(ACTIVITIES[$('input[name="index"]').val()]);
	if (window.top != window.self) {
		window.top.$('body').css('overflow','');
		window.top.$('iframe').remove();
	}
}


// These functions are shared with stlf.js

function stlfIndexOf(activity,array) {
	if (typeof(array) === 'undefined') array = ACTIVITIES.slice(0);
	if (activity.length == 1) activity = activity[0];
	for (var i=0; i < array.length; ++i) {
		if (activity.name == array[i].name) {
			// What to do about activities with the same name?
			// Let's follow the convention that activities only have the same name if they are actually the "same activity" but with different content due to maturity
			if ($(activity.maturity).not(array[i].maturity).length == 0 && $(array[i].maturity).not(activity.maturity).length == 0) return i;
		}
	}
	return -1;
}
function stlfFilter(type,value,array) {
	if (typeof(array) === 'undefined') array = ACTIVITIES.slice(0);
	if (typeof(type) === 'object') {
		if (type.length == value.length) for (var i in type) array = stlfFilter(type[i],value[i],array);
		else if (type.length > value.length) {
			for (var i in type) {
				if (i < value.length) array = stlfFilter(type[i],value[i],array);
				else array = stlfSort(type,array);
			}
		}
		else { 
			console.log('Error: Filter condition array is smaller than filter value array.'); 
			return false;
		}
	}
	else if (typeof(type) === 'string') {
		if (typeof(value) !== 'object') {
			for (var j=0; j < array.length; ++j) if (array[j][type] != value) array.splice(j--,1);
		}
		else {
			for (var j=0; j < array.length; ++j) if (value.indexOf(array[j][type]) == -1) array.splice(j--,1);
		}
	}
	return array;
}