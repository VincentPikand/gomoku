const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3000, () => console.log("listening at 3k"));
app.use(express.static('public'));

let rooms = [];

io.on('connection', (socket) => {
	console.log('someone connected with id ' + socket.id);

	/* CREATE ROOM WITH CUSTOM ID */
	socket.on('create', (data) => {
		socket.join(data.roomId);
		rooms.push(data.roomId);
		console.log(rooms);
	});
	/* discard room */
	socket.on('cancel', (data) => {
		const index = rooms.indexOf(data);
		rooms.splice(index, 1);
		socket.leave(data);

	});
	/* JOIN ROOM WITH CUSTOM ID */
	socket.on('join', (roomId) => {

		const room = io.nsps['/'].adapter.rooms[roomId]; /* get how many clients are in room */
		rooms.forEach((e) => {
			console.log(e + '|' + roomId);
			if (roomId == e && room.length === 1) {
				socket.join(roomId);
				socket.emit('status', true);
			} else if (roomId != e || room == undefined) {
				let noRoom = 'Room does not exist.';
				socket.emit('err0', noRoom);
			} else if (room.length === 2) {
				let fullRoom = 'That room is full.';
				socket.emit('err1', fullRoom);
			}
		});
		socket.to(roomId).emit('ready', true);
	});

	socket.on('playedTurn', (data) => {
		socket.to(data.roomId).emit('gameData', data.arr);
	});
	socket.on('leaveRoom', (data) => {
		const room = io.nsps['/'].adapter.rooms[data]; /* get how many clients are in room */
		const index = rooms.indexOf(data);
		if (room.length === 2) {
			rooms.splice(index, 1);
			console.log('removed id');
		}
		socket.leave(data);
		console.log(rooms);
	});
});