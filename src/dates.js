const { toZonedTime, format: formatTz } = require('date-fns-tz');
const { startOfDay, addDays, isSunday, isSaturday } = require('date-fns');
const holidays = require('./holidays.json');

const TIMEZONE = 'America/Sao_Paulo';

function getTodayInBrazil() {
  return toZonedTime(new Date(), TIMEZONE);
}

function getDateInBrazil(date) {
  return toZonedTime(date, TIMEZONE);
}

function formatBrazil(date, fmt = 'yyyy-MM-dd') {
  return formatTz(date, fmt, { timeZone: TIMEZONE });
}

function isHoliday(date) {
  const zoned = getDateInBrazil(date);
  const str = formatBrazil(zoned, 'yyyy-MM-dd');
  return holidays.includes(str);
}

function isWorkday(date) {
  const zoned = getDateInBrazil(date);
  return !isSaturday(zoned) && !isSunday(zoned) && !isHoliday(zoned);
}

module.exports = {
  TIMEZONE,
  getTodayInBrazil,
  getDateInBrazil,
  formatBrazil,
  isHoliday,
  isWorkday,
  startOfDay,
  addDays,
};
