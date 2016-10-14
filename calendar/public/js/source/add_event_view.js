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

            var dateData = {
                month: +$(e.target).data('month'),
                year: +$(e.target).data('year'),
                date: +data.date
            };

            try {
                eventData.addEvent(dateData, data).then(function(ret) {
                    window.location = $('#home-btn').attr('href');
                });
            } catch (e) {
                $('#new-event-form .alert-danger').text(e);
                $('#new-event-form .alert-danger').show();
            }
        });
    });
})();
