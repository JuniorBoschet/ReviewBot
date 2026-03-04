const { existsSync } = require('fs');
const path = require('path');

const dotenvPath = path.resolve(process.cwd(), '.env');
if (existsSync(dotenvPath)) {
  require('dotenv').config({ path: dotenvPath });
}

function parseJsonEnv(varName) {
  const raw = process.env[varName];
  if (!raw || raw.trim() === '') return undefined; 
  try {
    return JSON.parse(raw);
  } catch (err) {
    const hint = `ensure ${varName} is valid JSON (use double quotes, escape newlines)`;
    throw new Error(`environment variable ${varName} contains invalid JSON: ${err.message}. ${hint}`);
  }
}

const config = {
  token: process.env.DISCORD_TOKEN,
  channelId: process.env.CHANNEL_ID,
  guildId: process.env.GUILD_ID,
  startDate: process.env.START_DATE,
  teams: parseJsonEnv('TEAMS'),
};

for (const key of ['token', 'channelId', 'startDate', 'teams']) {
  if (!config[key]) {
    throw new Error(`missing required config value: ${key}. double-check your environment variables`);
  }
}

if (!Array.isArray(config.teams)) {
  throw new Error('TEAMS must be a JSON array of pairs');
}
for (const pair of config.teams) {
  if (!Array.isArray(pair) || pair.length !== 2) {
    throw new Error('each item in TEAMS must be an array of two user IDs');
  }
}

module.exports = config;
