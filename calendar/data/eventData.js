var exports = module.exports = {};

const helpers = require('./helpers.js');
const uuid = require('node-uuid');
const storage = require('electron-json-storage');
const fs = require('fs');

exports.addEvent = function (dateData, eventData) {
    dateData = helpers.filterObjectFields(dateData, {
        month: { type: 'number', required: true },
        year: { type: 'number', required: true },
        date: { type: 'number', required: true }
    });

    eventData = helpers.filterObjectFields(eventData, {
        title: { type: 'string', required: true },
        location: { type: 'string', required: true },
        description: { type: 'string', required: true }
    });

    var date = new Date(dateData.year, dateData.month, dateData.date);

    if (Object.keys(eventData).length !== 3) {
        throw new Error('Please fill out all fields.');
    } else if (date.toString() === 'Invalid Date' || date.getMonth() !== dateData.month || date.getFullYear() !== dateData.year || date.getDate() !== dateData.date) {
        throw new Error('Invalid date.');
    }

    var key = date.getMonth() + '-' + date.getDate() + '-' + date.getFullYear();

    eventData.id = uuid.v4();

    return new Promise(function (resolve, reject) {
        storage.get('events', function (error, data) {
            if (error) reject(error);

            if (!data[key]) {
                data[key] = [eventData];
            } else {
                data[key].push(eventData);
            }

            storage.set('events', data, function (error) {
                if (error) reject(error);

                resolve(true);
            });
        });
    });
};

exports.getEvents = function () {
    return new Promise(function (resolve, reject) {

        storage.get('events', function (error, data) {
            if (error) reject(error);

            resolve(data);
        });
    });
};

exports.clearCalendar = function() {
    return new Promise(function (resolve, reject) {

        storage.set('events', {}, function (error, events) {
            if (error) reject(error);

            resolve(true);
        });
    });
};

exports.saveCalendar = function (filePath) {
    return new Promise(function (resolve, reject) {

        storage.get('events', function (error, events) {
            if (error) reject(error);

            fs.writeFile(filePath, JSON.stringify(events), function (error) {
                if (error) reject(error);

                resolve(true);
            });
        });
    });
};

exports.loadCalendar = function (filePath) {
    return new Promise(function (resolve, reject) {

        fs.readFile(filePath, function (error, events) {
            if (error) reject(error);
            
            storage.set('events', JSON.parse(events), function (error, events) {
                if (error) reject(error);

                resolve(true);
            });
        });
    });
};
