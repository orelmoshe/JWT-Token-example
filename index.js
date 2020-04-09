const express = require('express');
const mongoose = require('mongoose');
const AuthController = require('./controllers/AuthController');

const app = express();
const Port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect('mongodb://localhost/jwt-token', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
});

app.get('/api', (req, res) => {
	res.status(200).send('API works');
});

app.use('/api/auth', AuthController);

app.listen(Port, () => {
	console.log('server listening on port ' + Port);
});
