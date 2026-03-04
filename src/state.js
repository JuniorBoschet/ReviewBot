const { existsSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');

const FILE = path.resolve(process.cwd(), 'state.json');

function readState() {
  if (!existsSync(FILE)) {
    const initial = { offsetTeams: 0 };
    try {
      writeFileSync(FILE, JSON.stringify(initial, null, 2));
    } catch (err) {
      console.error('failed to create initial state file', err);
    }
    return initial;
  }
  try {
    const raw = readFileSync(FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('failed to read state file, resetting', err);
    const initial = { offsetTeams: 0 };
    try {
      writeFileSync(FILE, JSON.stringify(initial, null, 2));
    } catch (err2) {
      console.error('failed to write fallback state file', err2);
    }
    return initial;
  }
}

function writeState(state) {
  try {
    writeFileSync(FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('failed to write state file', err);
  }
}

function getOffsetTeams() {
  const s = readState();
  return s.offsetTeams || 0;
}

function incrementOffsetTeams() {
  const s = readState();
  s.offsetTeams = (s.offsetTeams || 0) + 1;
  writeState(s);
  return s.offsetTeams;
}

module.exports = {
  getOffsetTeams,
  incrementOffsetTeams,
};
