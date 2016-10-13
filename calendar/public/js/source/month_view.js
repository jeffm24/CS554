(function () {
    $(document).ready(function () {
        
        if ($('.month').length) {

            eventData.getEvents().then(function (events) {
                // Fill in events for each day of the month
                $('.day:not(.filler)').each(function () {
                    var dayEvents = events[$(this).attr('id')];

                    if (dayEvents) {
                        var html = '<ul class="events">';

                        for (let event of dayEvents) {
                            html += '<li>' + event.title + '</li>';
                        }

                        html += '</ul>'

                        $(this).addClass('has-events').append(html);
                    }
                });
            });
        }
    });
})();