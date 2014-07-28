/*
 * STLF Activities Guide JavaScript
 * author: Ben Pedersen
 *
 */

var concept_index = 0;
var mobile = 0;
var top = 0;
var list;
var mobile_timer;

var ACTIVITIES = [];
var CONCEPTS = [
	'All Activities',
	/*
	// Old Activites
	'Diversity',
	'Icebreakers and Energizers',
	'Leadership',
	'Positive Affirmation/Recognition',
	'Reflection',
	*/
	/*  New Categories:	*/
	'Icebreakers',
	'Reflective',
	'Team Builders',
	'Transitions'
];

function stlfSort(type,array) {
	if (typeof(array) === 'undefined') array = ACTIVITIES.slice(0);
	if (typeof(type) === 'object') for (var i in type) array = stlfSort(type[i],array);
	else if (typeof(type === 'string')) array.sort(function(a,b) { 
		if (a[type] > b[type]) return 1;
		else return -1;
	});
	return array;
}
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
	else if (type == 'songs' || type == 'statements') {
		for (var j=0; j < array.length; ++j) if (!array[j][type] || array[j][type].length) array.splice(j--,1);
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
	if (!list) list = stlfSort('name');
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
	$('body').attr('class','settings');
	$('.activity').remove();
	$('#home,#addNewActivity,#sort').hide();
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
	$('#bluebar').css('margin-top','');
	$('body').attr('class','catalog');
	$('.activity').remove();
	$('h1,#browse,.info,#edit,#fb-login').hide();
	$('#home,#addNewActivity,#sort').show();
	if (type) {
		if (typeof(value) === 'undefined') list = stlfSort(type);
		else list = stlfFilter(type,value);
	}
	var $h2 = $('h2');
	for (var i in list) $h2.before('<button type="button" class="activity">' + list[i].name + '</button>');
}
function appHome() {
	$('.activity').remove();
	$('#home,.info,#edit,#addNewActivity,#sort').hide();
	$('body').attr('class','front');
	$('h1,#browse,#fb-login').show();
	resize_front();
}

function resize_front() {
	var space = window.innerHeight - $('h1').outerHeight() - $('#bluebar').outerHeight() - 43;
	space /= 3;
	$('h1').css('margin-top',Math.min(Math.max(window.innerHeight/6,space-10),125));
	$('#bluebar').css('margin-top',space+20);
	if ($('#fb-login').index() != -1) {
		$('#fb-login').css('margin-top',($(window).height() - ($('#bluebar').offset().top + $('#bluebar').outerHeight()) - $('#fb-login').outerHeight()) / 2);
	}
}

function show(name) {
	$('#bluebar').css('margin-top','');
	$('body').attr('class','detail');
	$('.activity').remove();
	$('#browse,.info,#edit').show();
	$('#home,#addNewActivity,#sort,.info2').hide();
	$(window).scrollTop(0);
	var activity = (typeof(name) === 'object') ? name : stlfFilter('name',name)[0];
		
	$('#name').html(activity.name);
	$('#outcomes').empty();
	for (var i in activity.outcomes) $('#outcomes').append('<li>' + activity.outcomes[i] + '</li>');
	$('#concept').html(activity.concept);
	$('#supplies').html(activity.supplies);
	$('#time').html(activity.time);
	$('#groupsize').html(activity.groupsize);
	$('#goal').html(activity.goal);
	
	if (activity.note) $('#note').html(activity.note);
	else $('[for="note"],#note').hide();
	
	var info2 = [ 'facilitation', 'songs', 'alterations', 'debrief', 'characteristics', 'statements', 'verbal', 'questions' ];
	for (var s in info2) {
		if (activity[info2[s]]) {
			var $info2 = $('#' + info2[s]).empty();
			var data = activity[info2[s]];
			var openTag = '<li>';
			var closeTag = '</li>';
			if (!$.isArray(data)) {
				var elementClass = info2[s].substr(0,info2[s].length-1);
				openTag = '<li class="' + elementClass + '"><button class="' + elementClass + '">';
				closeTag = '</button></li>';
				data = Object.keys(data);
				if (info2[s] == 'songs') data = data.sort();
			}			
			for (var k in data) $info2.append(openTag + data[k] + closeTag);
			$info2.add('[for="' + info2[s] + '"]').show();
		}
	}
	if (activity.table) {
		$('label[for="table"]').html(activity.table.title).show();
		$('#table').empty().show();
		for (var i=0; i<activity.table.rows; ++i) $('#table').append('<tr></tr>');
		for (var c in activity.table.columns) {
			$('#table tr').each(function(index) {
				$(this).append('<td>' + ((index == 0) ? activity.table.columns[c] : ' ') + '</td>');
			});
		}
	}
	if (activity.doc) {
		$('label[for="doc"],#doc').show();
		$('#doc').html(activity.doc[0]).attr('href',activity.doc[1]);
	}
}

function song_info(song) {
	var activity = stlfFilter('songs')[0];
	var data = activity.songs[song];
	$('.info').hide();
	$('#name').html(song).add('#edit').show();
	$('#browse').html('Songs');
	$('#name').after('<div id="lyrics"></div>');
	$('body').attr('class','song_info');
	for (var l in data) $('#lyrics').append(data[l] + '<br>');
	$(window).scrollTop(0);
}

function change_song(direction) {
	var activity = stlfFilter('songs')[0];
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
	$(window).scrollTop(0);
}

function statement_info(statement) {
	var activity = stlfFilter('statements')[0];
	var data = activity.statements[statement];
	$('.info').hide();
	$('#name').html(statement).css('text-align','left').add('#edit').show();
	$('#browse').html('Statements').css('width','auto');
	$('#name').after('<div id="lyrics"></div>');
	$('body').attr('class','statement_info');
	$('#lyrics').append(data);
	$(window).scrollTop(0);
}

function change_statement(direction) {
	var activity = stlfFilter('statements')[0];
	var statements = Object.keys(activity.statements);
	var index = statements.indexOf($('#name').html()) + direction;
	if (index == statements.length) index = 0;
	if (index < 0) index = statements.length - 1;
	var statement = statements[index];
	var data = activity.statements[statement];
	$('#name').html(statement).show();
	$('#browse').html('Statements');
	$('#lyrics').empty();
	$('body').attr('class','statement_info');
	$('#lyrics').append(data);
	$(window).scrollTop(0);
}

function updateStatusCallback(response, ghost) {
	switch (response.status) {
		case 'connected':
			$('#fb-login').remove();
			fetchActivities(FB.getAccessToken());
			$.get('https://www.okeebo.com/stlf/activities/access.php?access_token=' + FB.getAccessToken(), function(result) {
				if (result.replace(/\s+/g,'') == 'NationalStaff') {
					result = '<a href="https://www.okeebo.com/stlf/nash" target="_blank">National Staff</a>';
					$('#bluebar').append('<button id="edit">Edit</button>');
					$('#bluebar').append('<button id="addNewActivity">Add New Activity</button>');
				}
				$('body').append('<div id="fb-login">Access: ' + result + '</div>');
				if ($('body').attr('class') == 'front') resize_front();
				else $('#fb-login').hide();
			});
			break;
		default:
			/* Login Method 1 (auto) */
			$('body').append('<div id="fb-login"><button>Log in</button></div>');
			if ($('body').attr('class') == 'front') resize_front();
			else $('#fb-login').hide();
			/**/
			/* Login Method 2 (ask) 
			if (!ghost) FB.login(function(response) { updateStatusCallback(response, true); });
			/**/
			break;
	}
}

function fetchActivities(access_token, local_file_flag) {
	var url = 'https://www.okeebo.com/stlf/activities/';
	if (access_token) {
		if (local_file_flag) url = access_token;
		else url += '?access_token=' + access_token;
	}
	$.ajax({
		async: true,
		dataType: "json",
		url: url,
		mimeType: "application/json",
		success: function(result){
			loadActivities(result);
			window.localStorage.setItem('activities',JSON.stringify(result));
		},
		error: function(result){
			if (!local_file_flag && ACTIVITIES.length == 0) {
				fetchActivities('activities.json', true);
			}
		}
	});
}

function loadActivities(result) {
	if (result) {
		if (typeof(result) === 'string') result = JSON.parse(result);
		ACTIVITIES = result;
		if (list) {
			var concepts = [];
			var temp = [];
			for (var j in list) temp.push(list[j].concept);
			for (var i in CONCEPTS) if (i != 0) if (temp.indexOf(CONCEPTS[i]) != -1) concepts.push(CONCEPTS[i]);
			list = stlfFilter(['concept','name'],[concepts]);
		}
		else list = stlfSort('name');
		if ($('body').attr('class') == 'catalog') browse();
	}
}

function editActivity(newActivity) {
	if (newActivity) {
		$('#name').html('');	
	}
	$('body').append('<iframe src="stlf.edit.html' + ($('body').attr('class') != 'detail' ? '#' + $('body').attr('class') : '') + '"></iframe>');
	$('iframe').on('load', function() {
		$('body').css('overflow','hidden');
	}).css('top',$(window).scrollTop());
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
	})
	.on('resize',function(event) {
		if ($('body').attr('class') == 'front') resize_front();
	});
	$(document).on('click','button',function(event) {
		switch(event.target.id) {
			case 'browse':	
				if (['song_info','statement_info'].indexOf($('body').attr('class')) == -1) {
					if (list) browse();
					else browse('name');
				}
				else {
					$('#browse').html('Browse').css('width','');
					$('#lyrics').remove();
					if ($('body').attr('class') == 'song_info') {
						show(stlfFilter('songs')[0]);
						$(window).scrollTop($('label[for="songs"]').offset().top);
					}
					else {
						$('#name').css('text-align','');
						show(stlfFilter('statements')[0]);
						$(window).scrollTop($('label[for="statements"]').offset().top);
					}
				}
				break;
			case 'home':
				appHome();
				break;
			case 'edit':
				editActivity();
				break;
			case 'addNewActivity':
				editActivity(true);
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
				// Apple Standalone App return to last screen
				if (window.navigator.standalone) {
					window.localStorage.setItem('concepts',JSON.stringify(concepts));
				}
				break;
			default:
				var $this = $(this);
				if ($this.parent().is('#fb-login')) {
					/* Login Method 1 (auto) */
					FB.Event.unsubscribe('auth.statusChange', updateStatusCallback);
					FB.Event.subscribe('auth.statusChange', updateStatusCallback);
					if (window.navigator && window.navigator.standalone) {
						var url = 'https://www.facebook.com/dialog/oauth';
						url += '?client_id=226799687513796';
						url += '&redirect_uri=' + document.location.href;
						url += '&scope=public_profile';
						window.open(url, '', null); 
					}
					else {
						FB.login(null, { scope: 'public_profile' });
					}
					/**/
					/* Login Method 2 (ask) 
					FB.getLoginStatus(updateStatusCallback);
					/**/
				}
				else if ($this.hasClass('activity')) show(this.innerHTML);
				else if ($this.hasClass('song')) song_info(this.innerHTML);
				else if ($this.hasClass('statement')) statement_info(this.innerHTML);
				break;
		}
		// Apple Standalone App return to last screen
		if (window.navigator.standalone) {
			window.localStorage.setItem('screen',$('body').attr('class'));
			window.localStorage.setItem('data',$('#name').html());
		}
	})
	.on('tap','button',function(event) {
		var $this = $(this);
		if ($this.hasClass('concept')) {
			if ($this.hasClass('checked')) $this.removeClass('checked').addClass('unchecked');
			else $this.removeClass('unchecked').addClass('checked');
		}
		// Apple Standalone App return to last screen
		if (window.navigator.standalone) {
			window.localStorage.setItem('screen',$('body').attr('class'));
			window.localStorage.setItem('data',$('#name').html());
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
	})
	.on('keydown swipe',function(event) { 
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
			else if (appScreen == 'statement_info') change_statement(direction);
			//else change_concept(direction);
			
			// Apple Standalone App return to last screen
			if (window.navigator.standalone) {
				window.localStorage.setItem('data',$('#name').html());
			}
		}
	});
	
	if ($('body').attr('class') == 'front') resize_front();

	$('#browse').one('click',function(event) {
		document.addEventListener('backbutton', onBackKeyDown, false);
	});
	
	/* Phonegap */
	document.addEventListener('deviceready',function() {
		FB.init({
			appId: '226799687513796',
			nativeInterface: CDV.FB,
			useCachedDialogs: false
		});
		FB.getLoginStatus(updateStatusCallback);
	});
	/**/
	/* Online *//*
	$.ajaxSetup({ cache: true });
	$.getScript('//connect.facebook.net/en_UK/all.js', function(){
		FB.init({
			appId: '226799687513796',
		});
		//	Login Method 1 (auto)
		FB.getLoginStatus(updateStatusCallback);
		//
		// Login Method 2 (ask) 
		//$('body').append('<div id="fb-login"><button>Log in</button></div>');
		//resize_front();
		//
	});
	/**/
	
	fetchActivities();
	loadActivities(window.localStorage.getItem('activities'));
	
	// Apple Standalone App return to last screen
	if (window.navigator.standalone) {
		var concepts = window.localStorage.getItem('concepts');
		if (concepts) browse(['concept','name'],[JSON.parse(concepts)]);
		else browse('name');
		var appScreen = window.localStorage.getItem('screen');
		if (appScreen) {
			var appData = window.localStorage.getItem('data');
			switch(appScreen) {
				case 'front':
					appHome();
					break;
				case 'detail':
					show(appData);
					break;
				case 'song_info':
					show(stlfFilter('songs')[0]);
					song_info(appData);
					break;
				case 'statement_info':
					show(stlfFilter('statements')[0]);
					statement_info(appData);
					break;
				case 'settings':
					select_concepts();
					break;
			}
		}
	}
	
});

function onBackKeyDown() {
    // Handle the back button
	if ($('iframe').index() != -1) {
		$('body').css('overflow','');
		$('iframe').remove();
		return true;	
	}
	switch ($('body').attr('class')) {
		case 'front':
			navigator.app.exitApp();
			break;
		case 'catalog':
			appHome();
			break;
		case 'settings':
			$('.concept,#select_concepts').remove();
			$('#ok,#cancel').hide();
		case 'detail':
			browse();
			break;
		case 'song_info':
			$('#lyrics').remove();
			show(stlfFilter('songs')[0]);
			break;
		case 'statement_info':
			$('#lyrics').remove();
			$('#name').css('text-align','');
			show(stlfFilter('statements')[0]);
			break;
	}
}


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