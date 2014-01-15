// JavaScript Document

var concept_index = 0;
var mobile = 0;
var top = 0;
var list;

function stlfSort(type,array) {
	if (typeof(array) === 'undefined') array = ACTIVITIES.slice(0);
	if (typeof(type) === 'object') for (var i in type) array = stlfSort(type[i],array);
	else if (typeof(type === 'string')) array.sort(function(a,b) { 
		if (a[type] > b[type]) return 1;
		else return -1;
	});
	return array;
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
function move(direction) {
	var name = $('h2').html();
	var activity = stlfFilter('name',name)[0];
	var index = list.indexOf(activity);
	if (typeof(direction) === 'number') {
		var new_activity = list[index+direction];
		if (!new_activity) {
			if (direction > 0) new_activity = list[0];
			else new_activity = list[list.length-1];
		}
		show(new_activity.name);
	}
}
function change_concept(direction) {
	direction = parseInt(direction,10);
	var new_index = concept_index + direction;
	if (new_index == CONCEPTS.length) new_index = 0;
	if (new_index < 0) new_index = CONCEPTS.length - 1;
	concept_index = new_index;
	if (concept_index) browse(['concept','name'],[CONCEPTS[concept_index]]);
	else browse('name');
	$('#filter').html(CONCEPTS[concept_index].replace(/\s/g,'&nbsp;'))
}
function select_concepts() {
	$('.activity').remove();
	$('#home,#sort').hide();
	$('#ok,#cancel').show();
	var $h2 = $('h2');
	$h2.before('<p id="select_concepts">Select which activity types you want listed:</p>');
	var concepts = [];
	for (var j in list) concepts.push(list[j].concept);
	for (var i in CONCEPTS) if (i != 0) $h2.before('<button class="concept' +(concepts.indexOf(CONCEPTS[i]) == -1 ? '' : ' checked')+ '">' + CONCEPTS[i] + '</button>');
	
}

function console_list(type,value) {
	var list;
	if (typeof(value) === 'undefined') list = stlfSort(type);
	else list = stlfFilter(type,value);
	for (var i in list) console.log(list[i].name);
}
function browse(type,value) {
	$('body').attr('class','catalog');
	$('.activity').remove();
	$('h1,#browse,.info').hide();
	$('#home,#sort').show();
	if (type) {
		if (typeof(value) === 'undefined') list = stlfSort(type);
		else list = stlfFilter(type,value);
	}
	var $h2 = $('h2');
	for (var i in list) $h2.before('<button type="button" class="activity">' + list[i].name + '</button>');
}
function appHome() {
	$('body').attr('class','front');
	$('.activity').remove();
	$('h1,#browse').show();
	$('#home,.info,#sort').hide();
}

function show(name) {
	$('body').attr('class','detail');
	$('.activity').remove();
	$('#browse,.info').show();
	$('#home,#sort,.info2').hide();
	$(window).scrollTop(0);
	var activity = stlfFilter('name',name)[0];
		
	$('#name').html(activity.name);
	$('#outcomes').empty();
	for (var i in activity.outcomes) $('#outcomes').append('<li>' + activity.outcomes[i] + '</li>');
	$('#concept').html(activity.concept);
	$('#supplies').html(activity.supplies);
	$('#time').html(activity.time);
	$('#groupsize').html(activity.groupsize);
	$('#goal').html(activity.goal);
	$('#facilitation').empty();
	for (var j in activity.facilitation) $('#facilitation').append('<li>' + activity.facilitation[j] + '</li>');
	if (activity.debrief) {
		$('#debrief').empty();
		for (var k in activity.debrief) $('#debrief').append('<li>' + activity.debrief[k] + '</li>');
		$('#debrief,[for="debrief"]').show();
	}
	if (activity.alterations) {
		$('#alterations').empty();
		for (var k in activity.alterations) $('#alterations').append('<li>' + activity.alterations[k] + '</li>');
		$('#alterations,[for="alterations"]').show();
	}
	if (activity.songs) {
		$('#songs').empty();
		var songs = Object.keys(activity.songs).sort();
		for (var k in songs) $('#songs').append('<li><button class="song">' + songs[k] + '</button></li>');
		$('#songs,[for="songs"]').show();
	}
}

function song_info(song) {
	var activity = stlfFilter('name','Repeat-After-Me Songs')[0];
	var data = activity.songs[song];
	$('.info').hide();
	$('#name').html(song).show();
	$('#browse').html('Songs');
	$('#name').after('<div id="lyrics"></div>');
	$('body').attr('class','song_info');
	for (var l in data) $('#lyrics').append(data[l] + '<br>');
	$(window).scrollTop(0);
	$('#browse').one('click',function(event) {
		$('#browse').html('Browse');
		$('#lyrics').remove();
		show('Repeat-After-Me Songs');
		$(window).scrollTop($('#songs').offset().top);
		return false;
	});
}

function change_song(direction) {
	var activity = stlfFilter('name','Repeat-After-Me Songs')[0];
	var songs = Object.keys(activity.songs).sort();
	var index = songs.indexOf($('#name').html()) + direction;
	if (index == songs.length) index = 0;
	if (index < 0) index = songs.length - 1;
	var song = songs[index];
	var data = activity.songs[song];
	$('#name').html(song).show();
	$('#browse').html('Songs');
	$('#lyrics').empty();
	$('body').attr('class','song_info');
	for (var l in data) $('#lyrics').append(data[l] + '<br>');
}

$(document).ready(function() {
	$(window).on('touchstart',function(event) {
		if (mobile_timer) clearTimeout(mobile_timer);
		mobile = 1;
		top = $(window).scrollTop();
	})
	.on('touchend',function(event) {
		mobile_timer = setTimeout('mobile = 0;',400);
	})
	.on('scroll',function(event) {
		if (mobile) $('button').removeClass('active');
	});
	$(document).on('click','button',function(event) {
		switch(event.target.id) {
			case 'browse':	
				if (list) browse();
				else browse('name');
				break;
			case 'home':
				appHome();
				break;
			case 'sort':
				select_concepts();
				break;
			case 'cancel':
				$('.concept,#select_concepts').remove();
				$('#ok,#cancel').hide();
				browse();
				break;
			case 'ok':
				var concepts = [];
				$('.concept.checked').each(function() {
					concepts.push(this.innerHTML);
				});
				$('.concept,#select_concepts').remove();
				$('#ok,#cancel').hide();
				browse(['concept','name'],[concepts]);
				break;
			default:
				var $this = $(this);
				if ($this.hasClass('activity')) show(this.innerHTML);
				if ($this.hasClass('song')) song_info(this.innerHTML);
				break;
		}
	})
	.on('tap','button',function(event) {
			var $this = $(this);
			if ($this.hasClass('concept')) {
				if ($this.hasClass('checked')) $this.removeClass('checked').addClass('unchecked');
				else $this.removeClass('unchecked').addClass('checked');
			}
	})
	.on('touchstart mousedown','button',function(event) {
		$('button').not($(this).addClass('active')).removeClass('active');
	})
	.on('touchmove',function(event) {
		if (top != $(window).scrollTop()) $('button').removeClass('active');
	})
	.on('mouseenter','button',function(event) {
		if (!mobile) $(this).addClass('hover');
	})
	.on('mouseleave','button',function(event) {
		$(this).removeClass('hover');
	})
	.on('mouseup',function(event) {
		$('button').removeClass('active');
	});
	$('body').on('keydown swipe',function(event) { 
		var appScreen = $('body').attr('class');
		if (appScreen == 'front') return true;
		var direction;
		if (!event.which) {
			if (event.touches.length == 0) {
				if (event.direction == 'right') direction = -1;
				if (event.direction == 'left') direction = 1;
			}
		}
		else if (event.which == 37 || event.which == 39) direction = event.which - 38;
		if (direction) {
			if (appScreen == 'detail') move(direction);
			else if (appScreen == 'song_info') change_song(direction);
			//else change_concept(direction);
		}
	});
});


///// FOR UMN RELATED PROJECTS, NOT RELEVANT TO STLF /////
$(document).ready(function() {
    $('input').on('input',function(event) {
		lookupX500(this.value);
		//lookupName(this.value);
	});
});
function lookupX500(x500) {
	$.get('https://www.okeebo.com/test/email/lookup.php?x500=' + x500,function(data) {
		var d = $('<html />').html(data);
		var name = d.find('h2');
		if (name.index() != -1) $('.outer').html(name.html());
	});
}
function lookupName(name) {
	if (typeof(xhr) !== 'undefined' && xhr.readyState != 4) xhr.abort();
	xhr = $.get('https://www.okeebo.com/test/email/lookup.php?name=' + name).done(function(data) {
		var d = $('<html />').html(data);
		var name = d.find('h2');
		if (name.index() != -1) $('.outer').html(name.html());
		else $('.outer').html(d.find('table'));
	});
}