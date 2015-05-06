'use strict';

var mongoose = require('mongoose/'),
	Schema = mongoose.Schema,
	Schemas = {};

Schemas.station = new Schema({
	remote: String,
	line: String,
	lat: String,
	lng: String,
	station: String
});

Schemas.turnstileData = new Schema({
	remote: String,
	date: Date,
	time: String,
	description: String,
	entries: Number,
	exits: Number
});

Schemas.turnstileData.index({remote: 1, date: 1, time: 1});

exports.Schemas = Schemas;