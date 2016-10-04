var exports = module.exports = {};

const helpers = require('./helpers.js');
const uuid = require('node-uuid');
const storage = require('electron-json-storage');

exports.addEvent = function(date, eventData) {
    eventData = helpers.filterObjectFields(eventData, {
        title: {type: 'string', required: true},
        location: {type: 'string', required: true},
        description: {type: 'string', required: true}
    });

    if (Object.keys(eventData).length !== 3) {
        throw new Error('Please fill out all fields.');
    } else if (!(date instanceof Date) || date.toString() === 'Invalid Date') {
        throw new Error('Error: Invalid date.');
    }

    var key = date.getMonth() + '-' + date.getDate() + '-' + date.getFullYear();

    eventData.id = uuid.v4();

    return new Promise(function(resolve, reject) {
        storage.get('events', function(error, data) {
            if (error) throw error;
            
            if (!data[key]) {
                data[key] = [eventData];
            } else {
                data[key].push(eventData);
            }

            storage.set('events', data, function(error) {
                if (error) throw error;

                resolve(true);
            });
        });
    });
};


exports.getEvents = function() {
    return new Promise(function(resolve, reject) {
        storage.get('events', function(error, data) {
            if (error) throw error;
            
            resolve(data);
        });
    });
};
