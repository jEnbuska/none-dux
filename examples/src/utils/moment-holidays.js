// ## Moment.JS Holiday-fi Plugin
//
// Usage:
//  Call .holiday() from any moment object. If date is a Finnish Holiday, name of the holiday will be returned.
//  Otherwise, return nothing.
//
//  Example:
//    `moment('12/25/2013').holiday()` will return "Joulupäivä"
//
// Holidays:
//  You can configure holiday bellow. The 'M' stands for Month and represents fixed day holidays.
//
// License:
//  Copyright (c) 2014 [Sampo Toiva] under [MIT License](http://opensource.org/licenses/MIT)
//
// Inspired by: https://gist.github.com/jrhames/5200024
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define([ 'moment', ], factory); // AMD
  } else if (typeof exports === 'object') {
    module.exports = factory(require('moment')); // Node
  } else {
    factory(window.moment); // Browser global
  }
}((moment) => {
  // var moment;

  // moment = typeof require !== "undefined" && require !== null ? require("moment") : this.moment;

  // Static variables
  let saturday = 6,
    november = 9,
    december = 10,
    june = 5;

  // Holiday definitions, static dates
  const holidays = {
    M: {// Day, Month
      '01/01': 'Uudenvuodenpäivä',
      '06/01': 'Loppiainen',
      '01/05': 'Vappu',
      '25/12': 'Joulupäivä',
      '26/12': 'Tapaninpäivä',
    },

  };

  const staticHolidays = function (moment) {
    return holidays.M[moment.format('DD/MM')];
  };

  // variable dates
  // Pyhäinpäivä 31.10-6.11 lauantaina
  const allSaintsDay = function (moment) {
    const start = moment.clone().month(saturday).date(31);
    const end = moment.clone().month(november).date(30);

    if (isSaturdayHoliday(moment, start, end)) {
      return 'Pyhäinpäivä';
    }
  };

  // Juhannus 20.6.-26.6. lauantaina
  const midSummer = function (moment) {
    const start = moment.clone().month(june).date(20);
    const end = moment.clone().month(june).date(26);

    if (isSaturdayHoliday(moment, start, end)) {
      return 'Juhannuspäivä';
    }
  };

  var isSaturdayHoliday = function (moment, start, end) {
    return isSaturday(moment) && moment.isAfter(start) && moment.isBefore(end);
  };

  var isSaturday = function (moment) {
    return moment.day() === saturday;
  };

  /**
   /*  @param year The year for which the Easter sunday is calculated
   /*  @return easter sunday json: {day: <day_of_month>, month: <month>}
   **/
  const easterSunday = function (year) {
    let a = Math.floor(year % 19),
      b = Math.floor(year / 100),
      c = Math.floor(year % 100),
      d = Math.floor(b / 4),
      e = Math.floor(b % 4),
      f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3),
      h = Math.floor((19 * a + b - d -g + 15) % 30),
      i = Math.floor(c / 4),
      k = Math.floor(c % 4),
      l = Math.floor((32 + 2 * e + 2 * i - h - k) % 7),
      m = Math.floor((a + 11 * h + 22 * l) / 451),
      n = Math.floor((h + l - 7 * m + 114) / 31),
      p = Math.floor((h + l - 7 * m + 114) % 31);

    return moment({ year, month: n - 1, day: p + 1, }); // months start from 0
  };

  const easterRelatedDays = function (moment) {
    let easter = easterSunday(moment.year()),
      goodFriday = easter.clone().subtract('days', 2),
      easterMonday = easter.clone().add('days', 1),
      ascension = easter.clone().add('days', 39);

    if (moment.isSame(goodFriday)) {
      return 'Pitkäperjantai';
    } else if (moment.isSame(easter)) {
      return 'Pääsiäispäivä';
    } else if (moment.isSame(easterMonday)) {
      return 'Toinen pääsiäispäivä';
    } else if (moment.isSame(ascension)) {
      return 'Helatorstai';
    }
  };

  moment.fn.holiday = function () {
    const currentDate = this.format('DD/MM');
    return staticHolidays(this) ||
      easterRelatedDays(this) ||
      midSummer(this) ||
      allSaintsDay(this);
  };

  return moment;
}));
