(function () {
    $(document).ready(function () {
        var dateId = $('#event-data').data('dateid');
        var eventId = $('#event-data').data('eventid')

        if (dateId && eventId) {

            eventData.getEvents().then(function (events) {
                var event = events[dateId].filter(function (e) {
                    return e.id === eventId;
                })[0];

                var month = +dateId.substring(0, dateId.indexOf('-'));
                var date = +dateId.substring(dateId.indexOf('-') + 1, dateId.lastIndexOf('-'));
                var year = +dateId.substring(dateId.lastIndexOf('-') + 1, dateId.length);

                $('#event-title').text(event.title);
                $('#event-date').text((month + 1) + '/' + date + '/' + year);
                $('#event-location').text(event.location);
                $('#event-description').text(event.description);
            });
        }
    });
})();