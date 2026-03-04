// rotation.js
// Logic for counting workdays since a start date and determining the
// current team pair responsible for review.

const { startOfDay } = require('date-fns');
const { getTodayInBrazil, getDateInBrazil, isWorkday, addDays } = require('./dates');

function countWorkdaysSinceStart(startDate) {
  let count = 0;
  let current = new Date(startDate);
  const today = startOfDay(getTodayInBrazil());

  let currentZoned = startOfDay(getDateInBrazil(current));

  while (currentZoned <= today) {
    if (isWorkday(current)) count++;
    current = addDays(current, 1);
    currentZoned = startOfDay(getDateInBrazil(current));
  }
  return count;
}

function getCurrentTeam(startDate, teams) {
  const workdayCount = countWorkdaysSinceStart(startDate);
  if (workdayCount === 0) return teams[0];
  const index = Math.floor((workdayCount - 1) / 2) % teams.length;
  return teams[index];
}

function isFirstDayOfTeam(startDate) {
  const workdayCount = countWorkdaysSinceStart(startDate);
  return workdayCount > 0 && workdayCount % 2 === 1;
}

module.exports = {
  countWorkdaysSinceStart,
  getCurrentTeam,
  isFirstDayOfTeam,
};
