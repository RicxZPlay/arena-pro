const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

const DATA_PATH = './src/data.json';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n--- ARENA PRO: ATUALIZAR ABA $2 ---');
console.log('Cole o JSON da aba "$2" abaixo e pressione ENTER:\n');
console.log('Formatos aceitos: {"twoReais":[...]}, {"$2":[...]}, {"doisReais":[...]} ou diretamente [...].\n');

let jsonBuffer = '';

rl.on('line', (line) => {
  jsonBuffer += line;

  try {
    const parsed = JSON.parse(jsonBuffer);
    rl.close();
    updateTwoReais(parsed);
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

function extractTwoReais(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.twoReais)) return input.twoReais;
  if (Array.isArray(input?.doisReais)) return input.doisReais;
  if (Array.isArray(input?.['$2'])) return input['$2'];

  throw new Error('JSON invalido: envie um array ou uma chave "twoReais", "$2" ou "doisReais".');
}

function validateTwoReais(entries) {
  if (!Array.isArray(entries)) {
    throw new Error('A aba $2 precisa ser um array.');
  }

  entries.forEach((entry, entryIndex) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`Item ${entryIndex + 1} da aba $2 precisa ser um objeto.`);
    }

    const bets = entry.bets || entry.apostas;

    if (!Array.isArray(bets) || bets.length !== 2) {
      throw new Error(`Item ${entryIndex + 1} precisa ter exatamente duas apostas em "bets".`);
    }

    bets.forEach((bet, betIndex) => {
      if (!bet || typeof bet !== 'object' || Array.isArray(bet)) {
        throw new Error(`Aposta ${betIndex + 1} do item ${entryIndex + 1} precisa ser um objeto.`);
      }

      if (!(bet.match || bet.jogo)) {
        throw new Error(`Aposta ${betIndex + 1} do item ${entryIndex + 1} precisa ter "match".`);
      }

      if (!(bet.market || bet.mercado)) {
        throw new Error(`Aposta ${betIndex + 1} do item ${entryIndex + 1} precisa ter "market".`);
      }

      if (!(bet.selection || bet.selecao)) {
        throw new Error(`Aposta ${betIndex + 1} do item ${entryIndex + 1} precisa ter "selection".`);
      }
    });
  });
}

function updateTwoReais(input) {
  try {
    console.log('\n[1/3] Validando aba $2...');

    const twoReais = extractTwoReais(input);
    validateTwoReais(twoReais);

    const currentData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const nextData = {
      ...currentData,
      updatedAt: getFormattedDate(),
      twoReais
    };

    fs.writeFileSync(DATA_PATH, JSON.stringify(nextData, null, 2));
    console.log('Arquivo src/data.json atualizado somente na aba $2.');

    console.log('\n[2/3] Enviando para o GitHub...');

    execSync('git add src/data.json', { stdio: 'inherit' });
    execSync('git commit -m "Update: aba $2"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });

    console.log('\n[3/3] Finalizando...');
    console.log('\nTUDO PRONTO! A Vercel sera atualizada em instantes.');
    console.log('Acesse: https://arena-pro-five.vercel.app\n');

    process.exit(0);
  } catch (error) {
    console.error('\nERRO DURANTE A ATUALIZACAO DA ABA $2:');
    console.error(error.message);
    process.exit(1);
  }
}
