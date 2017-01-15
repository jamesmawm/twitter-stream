#!/usr/bin/env node

require('dotenv').config();

var Express = require('express');
var Http = require('http');
var Twitter = require('twit');
var SocketIO = require('socket.io');
var Fs = require('fs');

var app = Express();
app.use(Express.static(__dirname + '/public'));

// Routes
app.get('/', function (req, res, next) {
	res.render('/public/index.html');
});

var server = Http.createServer(app);
server.listen(process.env.LISTEN_PORT, process.env.LISTEN_HOST);
console.log("Running on http://" + process.env.LISTEN_HOST + ":" + process.env.LISTEN_PORT);

var io = SocketIO.listen(server);
io.set('log level', 0);

var twit = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

var stream = null;
var track_list = [];

Fs.readFile(process.env.TRACK_FILE_NAME, 'utf8', function (err, data) {
	if (err) {
		console.log("Error reading file:", err);
		return;
	}

	track_list = data.split(',').map(function (word) {
		return word.trim();
	});
	stream = twit.stream('statuses/filter', {track: track_list});
});

function restart_stream() {
	stream.stop();
	stream = twit.stream('statuses/filter', {track: track_list});
}

function save_config(text) {
	Fs.writeFile(process.env.TRACK_FILE_NAME, text, function (err) {
		if (err)
			return console.log(err);
	});
}

io.sockets.on('connection', function (socket) {
	console.log('io.sockets.on connection');

	socket.on('data', function (action, data) {
		if (action === '*') {
			twit.updateStatus(data, function (err, data) {

			});
		}
	});

	socket.on('getfilter', function () {
		socket.emit('pushfilter', track_list);
	});

	socket.on('addKeyword', function (keyword) {
		track_list.push(keyword);
		restart_stream();
		save_config(track_list.join(","));
	});

	socket.on('removeKeyword', function (keyword) {
		var index = track_list.indexOf(keyword);
		if (index == -1)
			return; // nothing to remove

		track_list.splice(index, 1);
		restart_stream();
		save_config(track_list.join(","));
	});


	stream.on('tweet', function (tweet) {
		socket.emit('message', JSON.stringify(tweet));
	});

	stream.on('error', function (err) {
		console.log("Err: " + err);
	});

	socket.on('disconnect', function () {
		console.log('Disconnect.');
	});
});
