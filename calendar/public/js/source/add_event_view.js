(function() {
    $(document).ready(function() {
        $('#new-event-form').submit(function(e) {
            e.preventDefault();

            $('#new-event-form .alert-danger').hide();

            // Grab data from serialized form
            var data = $(e.target).serializeArray().reduce(function(obj, item) {
                if (!isNaN(item.value)) {
                    obj[item.name] = +item.value;
                } else {
                    obj[item.name] = item.value;
                }
                return obj;
            }, {});

            var month = +$(e.target).data('month');
            var year = +$(e.target).data('year');
            var date = +data.date;

            try {
                eventData.addEvent(new Date(year, month, date), data).then(function(ret) {
                    window.location = $('#home-btn').attr('href');
                });
            } catch (e) {
                $('#new-event-form .alert-danger').text(e);
                $('#new-event-form .alert-danger').show();
            }
        });
    });
})();
