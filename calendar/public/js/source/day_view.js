(function() {
    const $ = require(process.env.PWD + '/public/js/jquery-3.1.1.min.js');
    const eventData = require(process.env.PWD + '/data/eventData.js');

    $(document).ready(function() {
        eventData.getEvents().then(function(events) {
            var dayEvents = events[$('#left-panel').data('dateid')];

            // Fill in events the current day
            var html = '<ul class="events">';

            for (let event of dayEvents) {
                html += '<li>' + event.title + '</li>';
            }

            html += '</ul>'

            $('#events').html(html);
        });
    });
})();