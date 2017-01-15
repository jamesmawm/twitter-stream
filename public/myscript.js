var filters = '';
var socket = io.connect();

socket.on("connect", function () {
	console.log("connected");
	socket.emit('getfilter', function () {
	});
});

socket.on("disconnect", function () {
	console.log("disconnected");
	socket.disconnect();
});

socket.on('pushfilter', function (f) {
	filters = f;
	$('#tracker').empty();
	filters.forEach(function (keyword) {
		addKeywordToList(keyword);
	});
});

socket.on('message', function (json) {
	var data = JSON.parse(json);
	var replacePattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	var replacedText = (data.text).replace(replacePattern, '<a href="$1" target="_blank">$1</a>');

	filters.forEach(function (str) {
		var search = new RegExp(str, "gim");
		replacedText = replacedText.replace(search, '<span class="label label-danger">' + str + '</span>');
	});

	var html = "<span class='display_text' onclick='display_snapshot(this);' >[" + data.user.screen_name + "] " + replacedText + "</span>";
	html += "&nbsp;&nbsp;<span><a href='#' onclick='show_data(this);'>data</a><div style='display:none' class='panel data'>" + json + "</div></span>";
	var node = $("<li ></li>").html(html);
	node.prependTo("ul.unstyled");//.css({opacity:0}).slideDown("slow").animate({opacity:1},"slow");
});

function display_snapshot(e) {
	var html = $(e).html();
	var data = $(e).parent().find('.data').text();
	html += "&nbsp;&nbsp;<a href='#' onclick='show_data(this);'>data</a>";
	html += "<div style='display:none;' class='panel'>" + data + "</div>";
	$('#snapbox_box').html(html);
}

/*
 Show the raw json data
 */
function show_data(e) {
	var target_display = $(e).parent().find('div');
	if (target_display.is(':visible')) {
		target_display.hide();
	}
	else {
		target_display.show();
	}
	return false;
}

function addKeywordToList(keyword) {
	var node = $('<div id="' + keyword + '" class="tracker"><b><a href="#" class="tracker_link">&times;</a></b>&nbsp;&nbsp;<span class="keyword">' + keyword + '</span></div>');
	node.prependTo("#tracker");
}

function addKeyword() {
	var input = $('#input_tracker');
	var keyword = input.val();

	socket.emit('addKeyword', keyword);
	addKeywordToList(keyword);

	socket.disconnect();
	socket.socket.reconnect();
}

$(document).ready(function () {
	// Removing a keyword from the list
	$(document).on('click', '.tracker', function (_) {
		var keyword = $(this).find('.keyword').text();
		socket.emit('removeKeyword', keyword);
		$(this).remove();
		//window.location.reload();
		socket.disconnect();
		socket.socket.reconnect();
		return false;
	});
});