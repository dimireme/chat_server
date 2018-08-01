const express = require('express');
const app = express();
const socket = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const DATAFILE = path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
	res.send('Your at the server part of Chat application.');
});

app.get('/getHistory', (req, res) => {
	fs.readFile(DATAFILE, 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			res.send("Error " + err);
		}

		// get only last 3 messages.
		const result = JSON.parse(data).slice(-3);

		res.json(result);
	});
});

const server = app.listen(PORT, () => {
	console.log(`Listening on ${PORT}.`);
});

const io = socket(server);

io.on('connection', (socket) => {
	console.log(`Client with id ${socket.id} was connected.`);

	socket.on('message', (message) => {
		saveMessage(message);
		io.emit('message', message);
	});

	socket.on('disconnect', () => {
		console.log(`Client with id ${socket.id} was disconnected.`);
	});
});

const saveMessage = function(message) {
	// save message to the data file
	fs.readFile(DATAFILE, 'utf8', (err, data) => {
		if (err) console.error(err);
		const result = JSON.parse(data);
		result.push(message);
		fs.writeFile(DATAFILE, JSON.stringify(result), (err) => {
			if (err) console.error(err);
		});
	});
};
