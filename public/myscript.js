var filters='';
var socket = io.connect();

socket.on("connect", function() {
    console.log("connected");
    socket.emit('getfilter', function() {
    });
});

socket.on("disconnect", function() {
    console.log("disconnected");
    socket.disconnect();
});

socket.on('pushfilter', function(f) {
    filters = f;
    $('#tracker').empty();
    filters.forEach(function(str){
//        var node =  $('<div class="alert alert-info" id="'+str+'"><a class="close" data-dismiss="alert" id="'+str+'" href="#">&times;</a><p>'+str+'</p></div></div>')
        var node =  $('<li id="'+str+'"><a href="#" class="">'+str+'</a></li>');
        node.prependTo("#tracker");
    });
});

socket.on('message', function(json) {
    data = JSON.parse(json);
    var replacePattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    var replacedText = (data.text).replace(replacePattern, '<a href="$1" target="_blank">$1</a>');

    filters.forEach(function(str) {
        var search = new RegExp(str, "gim");
        replacedText = replacedText.replace(search, '<span class="label label-danger">'+str+'</span>');
    });

    var html = "<span class='display_text' onclick='display_snapshot(this);' >[" + data.user.screen_name + "] " + replacedText + "</span>";
    html += " &nbsp;&nbsp;<span><a href='#' onclick='show_data(this);'>data</a><div style='display:none' class='panel data'>" + json + "</div></span>";
    var node = $("<li ></li>").html(html);
    node.prependTo("ul.unstyled");//.css({opacity:0}).slideDown("slow").animate({opacity:1},"slow");
});

function display_snapshot(e){
    var html  = $(e).html();
    var data = $(e).parent().find('.data').text();
    html += "&nbsp;&nbsp;<a href='#' onclick='show_data(this);'>data</a>";
    html += "<div style='display:none;' class='panel'>" + data + "</div>";
    $('#snapbox_box').html(html);
}

/*
Show the raw json data
*/
function show_data(e){
    var target_display = $(e).parent().find('div');
    if (target_display.is(':visible')){
        target_display.hide();
    }
    else{
        target_display.show();
    }
    return false;
}


function addTrack() {
    socket.emit( 'data', '+', $("#data").val());
    $("#data").val('');
    socket.disconnect();
    socket.socket.reconnect();
}

$("#tracker").delegate('a', 'click', function() {
    socket.emit( 'data', '-', $(this).attr('id'));
    socket.disconnect();
    socket.socket.reconnect();
});

function tweetThat() {
    socket.emit( 'data', '*', $('#tweet').val());
    $('#tweet').val('');
}

$(document).ready(function(){

});