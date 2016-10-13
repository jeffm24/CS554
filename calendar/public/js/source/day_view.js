(function () {
    $(document).ready(function () {
        var dateId = $('#left-panel').data('dateid');

        if (dateId) {
            eventData.getEvents().then(function (events) {

                var dayEvents = events[dateId];

                var month = +dateId.substring(0, dateId.indexOf('-'));
                var date = +dateId.substring(dateId.indexOf('-') + 1, dateId.lastIndexOf('-'));
                var year = +dateId.substring(dateId.lastIndexOf('-') + 1, dateId.length);

                // Fill in events the current day
                var html = '<ul class="events">';

                for (let event of dayEvents) {
                    html += '<li><a href="/' + month + '/' + date + '/' + year + '/' + event.id + '">' + event.title + '</a></li>';
                }

                html += '</ul>'

                $('#events').html(html);
            });
        }
    });
})();