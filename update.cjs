const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

const DATA_PATH = './src/data.json';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n--- ARENA PRO: ATUALIZAR ANALISES ---');
console.log('Cole o JSON gerado pela IA abaixo e pressione ENTER:\n');
console.log('Este modo atualiza summary, surebets, tips, bestGames, lucky e warnings.');
console.log('Casas e jogos sao preservados. Para isso, use ATUALIZAR_CASAS_E_JOGOS.bat.\n');

let jsonBuffer = '';

rl.on('line', (line) => {
  jsonBuffer += line;

  try {
    const parsed = JSON.parse(jsonBuffer);
    rl.close();
    updateAnalysis(parsed);
  } catch (e) {
    // Continua esperando mais linhas se o JSON ainda nao estiver completo.
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

function readCurrentData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function getArray(input, primaryKey, fallbackKey) {
  if (Array.isArray(input?.[primaryKey])) return input[primaryKey];
  if (fallbackKey && Array.isArray(input?.[fallbackKey])) return input[fallbackKey];
  return undefined;
}

function validateArray(value, key) {
  if (value !== undefined && !Array.isArray(value)) {
    throw new Error(`A chave "${key}" precisa ser um array.`);
  }
}

function hasAnalysisFields(input) {
  return [
    'summary',
    'resumo',
    'surebets',
    'possiveisSurebets',
    'tips',
    'dicas',
    'bestGames',
    'melhoresJogos',
    'lucky',
    'sortezinha',
    'warnings',
    'avisos'
  ].some((key) => Object.prototype.hasOwnProperty.call(input || {}, key));
}

function mergeAnalysis(currentData, incomingData) {
  if (!incomingData || typeof incomingData !== 'object' || Array.isArray(incomingData)) {
    throw new Error('JSON invalido: envie um objeto com as chaves de analise.');
  }

  if (!hasAnalysisFields(incomingData)) {
    throw new Error('Nenhuma chave de analise encontrada. Para casas e jogos, use ATUALIZAR_CASAS_E_JOGOS.bat.');
  }

  if (incomingData.bookmakers || incomingData.casas) {
    console.log('Aviso: a chave "bookmakers/casas" foi recebida, mas sera ignorada neste modo.');
  }

  const incomingSummary = incomingData.summary || incomingData.resumo || {};
  const surebets = getArray(incomingData, 'surebets', 'possiveisSurebets');
  const tips = getArray(incomingData, 'tips', 'dicas');
  const bestGames = getArray(incomingData, 'bestGames', 'melhoresJogos');
  const lucky = getArray(incomingData, 'lucky', 'sortezinha');
  const warnings = getArray(incomingData, 'warnings', 'avisos');

  validateArray(surebets, 'surebets');
  validateArray(tips, 'tips');
  validateArray(bestGames, 'bestGames');
  validateArray(lucky, 'lucky');
  validateArray(warnings, 'warnings');

  const currentSummary = currentData.summary || {};
  const nextSummary = {
    ...currentSummary,
    ...incomingSummary,
    totalBookmakers: currentSummary.totalBookmakers,
    totalGames: currentSummary.totalGames,
    bestOdd: currentSummary.bestOdd,
    surebetsFound: incomingSummary.surebetsFound ?? (surebets ? surebets.length : currentSummary.surebetsFound)
  };

  const nextData = {
    ...currentData,
    updatedAt: getFormattedDate(),
    summary: nextSummary
  };

  if (surebets !== undefined) nextData.surebets = surebets;
  if (tips !== undefined) nextData.tips = tips;
  if (bestGames !== undefined) nextData.bestGames = bestGames;
  if (lucky !== undefined) nextData.lucky = lucky;
  if (warnings !== undefined) nextData.warnings = warnings;

  return nextData;
}

function updateAnalysis(incomingData) {
  try {
    console.log('\n[1/3] Validando e mesclando analises...');

    const currentData = readCurrentData();
    const nextData = mergeAnalysis(currentData, incomingData);

    fs.writeFileSync(DATA_PATH, JSON.stringify(nextData, null, 2));
    console.log('Arquivo src/data.json atualizado sem alterar casas e jogos.');

    console.log('\n[2/3] Enviando para o GitHub...');

    execSync('git add src/data.json', { stdio: 'inherit' });
    execSync('git commit -m "Update: analises esportivas"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });

    console.log('\n[3/3] Finalizando...');
    console.log('\nTUDO PRONTO! O site na Vercel sera atualizado em instantes.');
    console.log('Acesse: https://arena-pro-five.vercel.app\n');

    process.exit(0);
  } catch (error) {
    console.error('\nERRO DURANTE A ATUALIZACAO:');
    console.error(error.message);
    process.exit(1);
  }
}
