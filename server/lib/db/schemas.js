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

Schemas.trainUsage = new Schema({
	train: String,
	remote: String,
	date: Date,
	time: String,
	entries: Number,
	exits: Number
});

Schemas.turnstileData = new Schema({
	remote: String,
	date: Date,
	time: String,
	description: String,
	entries: Number,
	exits: Number
});

Schemas.trainColorWise = new Schema({
	trainColor: String,
	line: String,
	date: Date,
	entries: Number,
	exits: Number
});

Schemas.monthWiseAverage = new Schema({
	remote: String,
	month: String,
	year: String,
	entries: Number,
	exits: Number
});

Schemas.yearWiseAverage = new Schema({
	remote: String,
	year: String,
	entries: Number,
	exits: Number
});

Schemas.dayWiseAverage = new Schema({
	remote: String,
	day: String,
	month: String,
	year: String,
	entries: Number,
	exits: Number
});

//Hours 7-10
Schemas.peakHourWeekdayAverage = new Schema({
	remote: String,
	day: String,
	month: String,
	year: String,
	entries: String,
	exits: String
});

//Evening Hours 5-8
Schemas.eveningHourWeekdayAverage = new Schema({
	remote: String,
	day: String,
	month: String,
	year: String,
	entries: String,
	exits: String
});

Schemas.turnstileData.index({remote: 1, date: 1, time: 1});

exports.Schemas = Schemas;