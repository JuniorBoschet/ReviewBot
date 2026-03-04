
# 🤖 Bot de Rodízio de Code Review (Discord)

Este bot do Discord automatiza o **rodízio de responsáveis por code review**, alternando **duplas de desenvolvedores a cada 2 dias úteis**, considerando **finais de semana e feriados nacionais do Brasil**.

Ele envia mensagens automáticas em um canal configurado e disponibiliza um comando para consultar quem está responsável no dia atual.

---

## 🚀 Funcionalidades

* 🔄 **Rodízio automático de duplas** de code review
* 📆 Contabiliza **apenas dias úteis**

  * Ignora sábados e domingos
  * Ignora feriados nacionais do Brasil (configurados no código)
* ⏱️ Troca de dupla a cada **2 dias úteis**
* 📣 Envio automático de mensagem no Discord no **primeiro dia de cada dupla**
* 🧾 Comando `/reviewers` para consultar quem está responsável hoje
* ⚡ Registro de comandos **instantâneo no servidor** (quando possível)
* ⚠️ Suporta `clientReady` (evento recomendado para discord.js v15+) e captura erros em interações para evitar crashes

---

## 🧠 Como funciona a lógica

### 📅 Dias úteis

Um dia é considerado **útil** se:

* Não for sábado (`6`) nem domingo (`0`)
* Não estiver listado no array `HOLIDAYS`

```js
function isWorkday(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6 && !isHoliday(date);
}
```

---

### ⏳ Contagem de dias úteis

O bot conta quantos **dias úteis se passaram** desde a data inicial (via `START_DATE` em variáveis de ambiente) até hoje.

Essa contagem é usada para definir:

* Qual dupla está ativa
* Se hoje é o primeiro dia da dupla

---

### 👥 Rodízio de duplas

* Cada dupla atua por **2 dias úteis**
* O índice da dupla é calculado com base na quantidade de dias úteis já passados
* Quando chega ao fim da lista, o rodízio recomeça

```js
const index = Math.floor((workdayCount - 1) / 2) % TEAMS.length;
```

---

### 🔔 Notificações automáticas

O bot envia uma mensagem automática quando:

* É um **dia útil**
* É o **primeiro dia da dupla**
* Ou quando o bot é iniciado (modo forçado)

Mensagem enviada no canal configurado:

```
🔄 TROCA DE CODE REVIEW!
A partir de hoje (dd/mm/aaaa):
@dev1 e @dev2 estão responsáveis pelos próximos 2 dias úteis!
```

---

## 🧾 Comando disponível

### `/reviewers`

Mostra quem está responsável pelo code review **no dia atual**.

**Exemplo de resposta:**

```
Responsáveis pelo code review hoje (dd/mm/aaaa):
@dev1 e @dev2
```

### `/next [days]`

Lista as próximas duplas que entram em vigência, considerando apenas dias úteis. `days` é opcional (padrão 5).

```markdown
/next       ← 5 dias úteis adiante
/next days:10
```

> O bot adiciona um tratamento de erros ao processar comandos para não cair se a interaction expirar ou ocorrer um problema; qualquer falha é logada.

---

## ⚙️ Configuração

As opções de configuração são lidas de **variáveis de ambiente** (consulte `.env.example`). Para desenvolvimento, coloque-as em um arquivo .env na raiz (não comite este arquivo).

Exemplo de .env (sem crase para não fechar a string):

DISCORD_TOKEN=SEU_TOKEN_DO_BOT
GUILD_ID=ID_DO_SERVIDOR
CHANNEL_ID=ID_DO_CANAL_DE_NOTIFICAO
START_DATE=2025-01-02
TEAMS=[
  ["123456789012345678", "123456789012345679"],
  ["223456789012345678", "223456789012345679"]
]

> **Observação:** a variável `TEAMS` deve ser uma string JSON válida (aspas duplas e vírgulas corretas). **Coloque-a em uma única linha**; o pacote `dotenv` não suporta valores multilinha, então quebras de linha serão interpretadas como novas variáveis, resultando em `Unexpected end of JSON input`. Se precisar de várias linhas use `\n` escapado ou exporte a variável fora de um `.env`. Um valor vazio ou somente espaços é tratado como ausente.

### Variáveis importantes

| Variável        | Descrição                           |
| --------------- | ----------------------------------- |
| `DISCORD_TOKEN` | Token do bot do Discord             |
| `GUILD_ID`      | ID do servidor                      |
| `CHANNEL_ID`    | Canal onde o bot envia notificações |
| `START_DATE`    | Data inicial do rodízio             |
| `TEAMS`         | Lista de duplas (IDs dos usuários)  |


---

## 📅 Feriados

Os feriados nacionais brasileiros estão definidos diretamente no código, incluindo:

* Datas fixas (Natal, Tiradentes, etc.)
* Datas móveis (Carnaval, Sexta-feira Santa, Corpus Christi)
* Consciência Negra (20/11)

Eles são usados para **pular dias não úteis automaticamente**.

---

## 🛠️ Execução

Instale as dependências:

```bash
npm install discord.js
```

Inicie o bot:

```bash
node index.js
```

---

## ✅ Comportamento ao iniciar

Ao iniciar:

* O bot registra o comando `/reviewers`
* Envia uma mensagem mostrando **a dupla atual**
* Inicia um loop que verifica diariamente se precisa trocar a dupla

---

## 📌 Observações

* O intervalo de verificação é de **24 horas**
* O bot assume que ficará rodando continuamente
* Caso fique offline, ao voltar ele recalcula corretamente com base na data

---

Se quiser, posso:

* ✨ Converter isso para **TypeScript**
* 📦 Criar uma versão com **feriados dinâmicos**
* 🧪 Escrever testes para validar o rodízio
* 🧠 Melhorar o README para padrão open-source

Só dizer 😄
