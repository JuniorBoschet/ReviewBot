const { getTodayInBrazil, startOfDay, addDays } = require('./dates');

/**
 * Schedule a function to run every day at approximately midnight Sao Paulo time.
 *
 * @param {Function} taskFn - async or sync function to execute daily
 * @returns {Object} - an object with a `cancel()` method
 */
function scheduleDailyTask(taskFn) {
  function msUntilNextMidnight() {
    const now = getTodayInBrazil();
    const tomorrow = addDays(startOfDay(now), 1);
    return tomorrow.getTime() - now.getTime();
  }

  let timeoutId;
  let intervalId;

  async function fireAndSchedule() {
    try {
      await taskFn();
    } catch (err) {
      console.error('scheduled task error:', err);
    }
    intervalId = setInterval(taskFn, 24 * 60 * 60 * 1000);
  }

  timeoutId = setTimeout(fireAndSchedule, msUntilNextMidnight());

  return {
    cancel() {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    },
  };
}

module.exports = {
  scheduleDailyTask,
};
