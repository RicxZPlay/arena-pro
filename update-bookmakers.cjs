const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

const DATA_PATH = './src/data.json';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n--- ARENA PRO: ATUALIZAR SOMENTE CASAS E JOGOS ---');
console.log('Cole o JSON da parte "bookmakers" abaixo e pressione ENTER:\n');
console.log('Formatos aceitos: JSON completo, {"bookmakers":[...]}, {"casas":[...]} ou diretamente [...].\n');

let jsonBuffer = '';

rl.on('line', (line) => {
  jsonBuffer += line;

  try {
    const parsed = JSON.parse(jsonBuffer);
    rl.close();
    updateBookmakers(parsed);
  } catch (e) {
    // Continua aguardando se o JSON colado ainda estiver incompleto.
  }
});

function getFormattedDate() {
  const now = new Date();

  return now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0');
}

function extractBookmakers(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.bookmakers)) return input.bookmakers;
  if (Array.isArray(input?.casas)) return input.casas;

  throw new Error('JSON invalido: envie um array de casas ou uma chave "bookmakers".');
}

function validateBookmakers(bookmakers) {
  if (!Array.isArray(bookmakers) || bookmakers.length === 0) {
    throw new Error('A lista de casas esta vazia.');
  }

  bookmakers.forEach((bookmaker, bookmakerIndex) => {
    const name = bookmaker?.name || bookmaker?.casa;

    if (!name || typeof name !== 'string') {
      throw new Error(`Casa na posicao ${bookmakerIndex + 1} precisa ter "name".`);
    }

    const games = bookmaker?.games || bookmaker?.jogos;

    if (!Array.isArray(games)) {
      throw new Error(`Casa "${name}" precisa ter "games" como array.`);
    }

    games.forEach((game, gameIndex) => {
      if (!game || typeof game !== 'object') {
        throw new Error(`Jogo ${gameIndex + 1} da casa "${name}" precisa ser um objeto.`);
      }

      const match = game.match || game.jogo;
      const odds = game.odds;

      if (!match && !(game.home || game.mandante) && !(game.away || game.visitante)) {
        throw new Error(`Jogo ${gameIndex + 1} da casa "${name}" precisa ter "match" ou times mandante/visitante.`);
      }

      if (odds && typeof odds !== 'object') {
        throw new Error(`Odds do jogo ${gameIndex + 1} da casa "${name}" precisam ser um objeto.`);
      }

      if (game.markets && !Array.isArray(game.markets)) {
        throw new Error(`Markets do jogo ${gameIndex + 1} da casa "${name}" precisa ser um array.`);
      }
    });
  });
}

function countGames(bookmakers) {
  return bookmakers.reduce((total, bookmaker) => {
    const games = bookmaker.games || bookmaker.jogos || [];
    return total + games.length;
  }, 0);
}

function getBestOdd(bookmakers) {
  const odds = [];

  bookmakers.forEach((bookmaker) => {
    (bookmaker.games || bookmaker.jogos || []).forEach((game) => {
      const mainOdds = game.odds || {};

      [
        mainOdds.home,
        mainOdds.draw,
        mainOdds.away,
        mainOdds.mandante,
        mainOdds.empate,
        mainOdds.visitante,
        game.oddMandante,
        game.oddEmpate,
        game.oddVisitante
      ].forEach((odd) => {
        const number = Number(odd);
        if (Number.isFinite(number) && number > 0) odds.push(number);
      });

      (game.markets || []).forEach((market) => {
        const number = Number(market.odd);
        if (Number.isFinite(number) && number > 0) odds.push(number);
      });
    });
  });

  return odds.length ? Math.max(...odds) : null;
}

function updateBookmakers(input) {
  try {
    console.log('\n[1/3] Validando casas e jogos...');

    const incomingBookmakers = extractBookmakers(input);
    validateBookmakers(incomingBookmakers);

    const currentData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const nextData = {
      ...currentData,
      updatedAt: getFormattedDate(),
      summary: {
        ...(currentData.summary || {}),
        totalBookmakers: incomingBookmakers.length,
        totalGames: countGames(incomingBookmakers),
        bestOdd: getBestOdd(incomingBookmakers)
      },
      bookmakers: incomingBookmakers
    };

    fs.writeFileSync(DATA_PATH, JSON.stringify(nextData, null, 2));
    console.log('Arquivo src/data.json atualizado somente em casas e jogos.');
    console.log('As abas surebets, dicas, melhores jogos e sortezinha foram preservadas.');

    console.log('\n[2/3] Enviando para o GitHub...');

    execSync('git add src/data.json', { stdio: 'inherit' });
    execSync('git commit -m "Update: casas e jogos"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });

    console.log('\n[3/3] Finalizando...');
    console.log('\nTUDO PRONTO! A Vercel sera atualizada em instantes.');
    console.log('Acesse: https://arena-pro-five.vercel.app\n');

    process.exit(0);
  } catch (error) {
    console.error('\nERRO DURANTE A ATUALIZACAO DE CASAS E JOGOS:');
    console.error(error.message);
    process.exit(1);
  }
}
