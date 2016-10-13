const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const eventData = require('../data/eventData.js');

const constructorMethod = (app) => {
    app.get("/", (req, res) => {
        var now = new Date();

        res.redirect("/" + now.getMonth() + "/" + now.getFullYear());
    });

    app.get("/add_event/:month/:year", (req, res) => {
        res.render("add_event_view", {
            date: req.query.date, 
            month: req.params.month, 
            year: req.params.year, 
            pageTitle: "Jeff Mariconda",
            helpers: {
                getMonthName: function(monthNum) {
                    return months[monthNum];
                },
                getLastDate: function(monthNum, year) {
                    var lastDay = new Date(year, monthNum + 1, 0);

                    return lastDay.getDate();
                }
            }
        });
    });

    app.get("/:month/:date/:year/:eventId", (req, res) => {
        res.render("event_view", {
            month: req.params.month, 
            date: req.params.date, 
            year: req.params.year, 
            eventId: req.params.eventId,
            pageTitle: "Jeff Mariconda"
        });
    });

    app.get("/:month/:date/:year", (req, res) => {
        res.render("day_view", {
            date: req.params.date, 
            month: req.params.month, 
            year: req.params.year, 
            pageTitle: "Jeff Mariconda",
            helpers: {
                getNearbyDays: function (month, date, year) { 
                    var days = [];
                    var day = new Date(year, month, date);
                    day.setDate(day.getDate() - 2);

                    for (let i = 0 ; i < 5 ; i++, day.setDate(day.getDate() + 1)) {
                        var dayObj = {
                            date: day.getDate(),
                            month: day.getMonth(),
                            year: day.getFullYear()                              
                        };

                        // If it is the day object for the current day, set the current property
                        if (dayObj.date == date && dayObj.month == month && dayObj.year == year) {
                            dayObj.current = 'current';
                        }

                        days.push(dayObj);
                    }

                    return days;
                },
                getPrevDay: function(month, date, year) {
                    var date = new Date(year, month, parseInt(date) - 1);

                    return '/' + date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear();
                },
                getNextDay: function(month, date, year) {
                    var date = new Date(year, month, parseInt(date) + 1);

                    return '/' + date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear();
                },
                getRemainingDays: function (month, date, year) { 
                    var currDate = new Date(year, month, date);
                    var lastDate = new Date(year, 11, 31);

                    var remaining = (lastDate - currDate) / (1000 * 60 * 60 * 24);
                    
                    return parseInt(remaining);
                },
                getThisThurs: function (month, date, year) { 
                    var date = new Date(year, month, date);
                    var currDay = date.getDay();

                    if (currDay > 4) {
                        date.setDate(date.getDate() - (currDay - 4));
                    } else if (currDay < 4) {
                        date.setDate(date.getDate() + (4 - currDay));
                    }

                    var firstDate = new Date(year, 0, 1);
                    var passed = (date - firstDate) / (1000 * 60 * 60 * 24) + 1;
                    
                    return parseInt(passed);
                },
                getDay: function(month, date, year) {
                    return fullDays[(new Date(year, month, date)).getDay()];
                },
                getMonthName: function(month) {
                    return fullMonths[month];
                },
                getMonthNum: function(month) {
                    return month + 1;
                }
            }
        });
    });

    app.get("/:month/:year", (req, res) => {
        res.render("month_view", {
            month: req.params.month, 
            year: req.params.year,
            pageTitle: "Jeff Mariconda",
            helpers: {
                getDays: function (month, year, week) { 
                    var days = [
                        {day: 'Sun', month: month, year: year}, 
                        {day: 'Mon', month: month, year: year}, 
                        {day: 'Tue', month: month, year: year},
                        {day: 'Wed', month: month, year: year}, 
                        {day: 'Thu', month: month, year: year}, 
                        {day: 'Fri', month: month, year: year}, 
                        {day: 'Sat', month: month, year: year}
                    ];

                    var now = new Date();
                    
                    // get the first day of the month to start
                    var currDay = new Date(year, month, 1);
                    var currDate = 1;

                    // increment to start of week
                    while (week !== 0) {
                        currDay.setDate(++currDate);

                        // if it hits a sunday decrement week
                        if (currDay.getDay() === 0) {
                            week--;
                        }
                    }

                    // fill in days of that week
                    for (let i in days) {
                        // if the current day is not within the current month, break
                        if (currDay.getMonth() != month) {
                            break;
                        }
                        
                        // get date info
                        if (i == currDay.getDay()) {
                            days[i].date = currDay.getDate();

                            // If currDay is the actual current date, set current to true
                            if (currDay.getMonth() === now.getMonth() && currDay.getDate() === now.getDate() && currDay.getFullYear() === now.getFullYear()) {
                                days[i].current = true;
                            }
                            
                            currDay.setDate(++currDate);
                        }
                    }

                    return days;
                },
                getMonthName: function(month) {
                    return months[month];
                },
                getNextMonth: function(month, year) {
                    var nextMonth = new Date(year, parseInt(month) + 1, 1);

                    return '/' + nextMonth.getMonth() + '/' + nextMonth.getFullYear();
                },
                getPrevMonth: function(month, year) {
                    var prevMonth = new Date(year, parseInt(month) - 1, 1);

                    return '/' + prevMonth.getMonth() + '/' + prevMonth.getFullYear();
                }
            }
        });
    });  
};

module.exports = constructorMethod;