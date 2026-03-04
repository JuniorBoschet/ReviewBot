const fs = require('fs');

const r = fs.readFileSync('README.md', 'utf8');

const newBlock = `## ⚙️ Configuração

As opções de configuração são lidas de **variáveis de ambiente**. Para desenvolvimento, coloque-as em um arquivo \.env na raiz (não comite este arquivo).

Exemplo de .env (sem crase para não fechar a string):

DISCORD_TOKEN=SEU_TOKEN_DO_BOT
GUILD_ID=ID_DO_SERVIDOR
CHANNEL_ID=ID_DO_CANAL_DE_NOTIFICAO
START_DATE=2025-01-02
TEAMS=[
  ["123456789012345678", "123456789012345679"],
  ["223456789012345678", "223456789012345679"]
]

> **Observação:** a variável TEAMS deve ser uma string JSON válida (aspas duplas). Não use quebras de linha não escapadas.

### Variáveis importantes

| Variável        | Descrição                           |
| --------------- | ----------------------------------- |
| \`DISCORD_TOKEN\` | Token do bot do Discord             |
| \`GUILD_ID\`      | ID do servidor                      |
| \`CHANNEL_ID\`    | Canal onde o bot envia notificações |
| \`START_DATE\`    | Data inicial do rodízio             |
| \`TEAMS\`         | Lista de duplas (IDs dos usuários)  |
`;

const pattern = /## ⚙️ Configuração[\s\S]*?---\n\n## 📅 Feriados/;
if (!pattern.test(r)) {
  console.error('pattern not found');
  process.exit(1);
}

const replaced = r.replace(pattern, newBlock + '\n\n---\n\n## 📅 Feriados');
fs.writeFileSync('README.md', replaced);
console.log('README patched');
