// bot.js
// Main Discord bot logic, using the modular helpers for configuration,
// rotation, and scheduling.

const express = require('express');
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const config = require('./config');
const { formatBrazil, getTodayInBrazil, isWorkday } = require('./dates');
const { getCurrentTeam, isFirstDayOfTeam } = require('./rotation');
const state = require('./state');
const { scheduleDailyTask } = require('./scheduler');

const PORT = process.env.PORT || 3000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function notifyIfNeeded(forceToday = false) {
  const todayBrazil = getTodayInBrazil();
  const shouldNotify =
    forceToday || (isWorkday(todayBrazil) && isFirstDayOfTeam(config.startDate));

  if (!shouldNotify) return;

  const offset = state.getOffsetTeams();
  const team = getCurrentTeam(config.startDate, config.teams, offset);
  const channel = client.channels.cache.get(config.channelId.toString());

  if (!channel || channel.type !== ChannelType.GuildText) {
    console.log('❌ Canal de notificação não encontrado ou inválido!');
    return;
  }

  try {
    const title = forceToday ? '👥 **CODE REVIEW ATUAL**' : '🔄 **TROCA DE CODE REVIEW!**';
    const text = forceToday
      ? 'estão responsáveis hoje e amanhã'
      : 'estão responsáveis pelos próximos 2 dias úteis';
    const dateStr = formatBrazil(todayBrazil, 'dd/MM/yyyy');

    await channel.send({
      content: `${title}\n**A partir de hoje (${dateStr}):**\n<@${team[0]}> e <@${team[1]}> ${text}!\nBoa revisão, dupla! 🚀`,
    });
    console.log(`✅ Mensagem enviada: ${
      forceToday ? 'dupla atual (início do bot)' : 'troca automática'
    }`);
  } catch (error) {
    console.error('Erro ao enviar mensagem automática:', error);
  }
}

async function registerCommands() {
  const commands = [
    {
      name: 'reviewers',
      description: 'Mostra quem está de code review hoje',
    },
    {
      name: 'next',
      description: 'Mostra próximas duplas de code review',
      options: [
        {
          name: 'days',
          type: 4, // INTEGER
          description: 'Número de dias úteis à frente (padrão 5)',
          required: false,
        },
      ],
    },
    {
      name: 'skip',
      description: 'Pula para a próxima dupla imediatamente',
    },
  ];

  try {
    const guild = await client.guilds.fetch(config.guildId);
    await guild.commands.set(commands);
    console.log('✅ Comando /reviewers registrado no servidor!');
  } catch (error) {
    console.error('Erro ao registrar no servidor, tentando global:', error);
    await client.application.commands.set(commands);
    console.log(
      'Comando /reviewers registrado globalmente (pode demorar até 1h)'
    );
  }
}

function startHttpServer() {
  const app = express();

  app.get('/', (req, res) => {
    res.send('🤖 Bot de Code Review online e funcionando! 🚀');
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`🌐 Servidor HTTP rodando na porta ${PORT} para manter o Render acordado`);
  });
}

function setupInteractionHandler() {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
      if (interaction.commandName === 'reviewers') {
        const team = getCurrentTeam(config.startDate, config.teams);
        const todayStr = formatBrazil(getTodayInBrazil(), 'dd/MM/yyyy');

        await interaction.reply({
          content: `**Responsáveis pelo code review hoje (${todayStr}):**\n<@${
            team[0]
          }> e <@${team[1]}>\nBoa revisão! 🚀`,
          ephemeral: false,
        });
      } else if (interaction.commandName === 'next') {
        const days = interaction.options.getInteger('days') || 5;
        const offset = state.getOffsetTeams();
        const results = [];
        let workdaysSeen = 0;
        let cursor = new Date(config.startDate);
        const today = getTodayInBrazil();
        while (cursor <= today) {
          if (isWorkday(cursor)) workdaysSeen++;
          cursor.setDate(cursor.getDate() + 1);
        }
        let countCursor = workdaysSeen;
        while (results.length < days) {
          while (!isWorkday(cursor)) {
            cursor.setDate(cursor.getDate() + 1);
          }
          countCursor += 1;
          const team = require('./rotation').teamByWorkdayCount(countCursor, config.teams, offset);
          results.push({ date: new Date(cursor), pair: team });
          cursor.setDate(cursor.getDate() + 1);
        }
        const lines = results.map(r => {
          const dstr = formatBrazil(r.date, 'dd/MM/yyyy');
          return `${dstr}: <@${r.pair[0]}> & <@${r.pair[1]}>`;
        });
        await interaction.reply({ content: `Próximas duplas (dias úteis):\n${lines.join('\n')}` });
      } else if (interaction.commandName === 'skip') {
        const newOffset = state.incrementOffsetTeams();
        const team = getCurrentTeam(config.startDate, config.teams, newOffset);
        const dateStr = formatBrazil(getTodayInBrazil(), 'dd/MM/yyyy');
        await interaction.reply({
          content: `✅ Skip aplicado! Nova dupla a partir de hoje (${dateStr}): <@${team[0]}> e <@${team[1]}>`,
          ephemeral: false,
        });
        const channel = client.channels.cache.get(config.channelId.toString());
        if (channel && channel.type === ChannelType.GuildText) {
          await channel.send(`🔁 **SKIP** foi acionado! Nova dupla a partir de hoje (${dateStr}): <@${team[0]}> e <@${team[1]}>`);
        }
      } else if (interaction.commandName === 'skip') {
        const newOffset = state.incrementOffsetTeams();
        const team = getCurrentTeam(config.startDate, config.teams, newOffset);
        const dateStr = formatBrazil(getTodayInBrazil(), 'dd/MM/yyyy');
        await interaction.reply({
          content: `✅ Skip aplicado! Nova dupla a partir de hoje (${dateStr}): <@${team[0]}> e <@${team[1]}>`,
          ephemeral: false,
        });
        const channel = client.channels.cache.get(config.channelId.toString());
        if (channel && channel.type === ChannelType.GuildText) {
          await channel.send(`🔁 **SKIP** foi acionado! Nova dupla a partir de hoje (${dateStr}): <@${team[0]}> e <@${team[1]}>`);
        }
      }
    } catch (err) {
      console.error('error handling interaction:', err);
    }
  });
}

async function start() {
  startHttpServer();
  setupInteractionHandler();

  client.once('clientReady', async () => {
    console.log(`Bot conectado como ${client.user.tag}`);

    await registerCommands();
    await notifyIfNeeded(true);
    scheduleDailyTask(() => notifyIfNeeded(false));
  });
  
  client.on('error', (error) => {
    console.error('Discord client error:', error);
  });

  client.login(config.token);
}

module.exports = { start };
