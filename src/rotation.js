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

function teamByWorkdayCount(workdayCount, teams, offsetTeams = 0) {
  if (teams.length === 0) return [];
  let index;
  if (workdayCount <= 0) {
    index = 0;
  } else {
    index = Math.floor((workdayCount - 1) / 2) % teams.length;
  }
  index = ((index + offsetTeams) % teams.length + teams.length) % teams.length;
  return teams[index];
}

function getCurrentTeam(startDate, teams, offsetTeams = 0) {
  const workdayCount = countWorkdaysSinceStart(startDate);
  return teamByWorkdayCount(workdayCount, teams, offsetTeams);
}

function isFirstDayOfTeam(startDate) {
  const workdayCount = countWorkdaysSinceStart(startDate);
  return workdayCount > 0 && workdayCount % 2 === 1;
}

module.exports = {
  countWorkdaysSinceStart,
  getCurrentTeam,
  isFirstDayOfTeam,
  teamByWorkdayCount,
};
