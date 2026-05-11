const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n--- ARENA PRO: ATUALIZAÇÃO AUTOMÁTICA ---');
console.log('Cole o JSON gerado pela IA abaixo e pressione ENTER:\n');

let jsonBuffer = '';
rl.on('line', (line) => {
  jsonBuffer += line;
  // Tenta validar o JSON conforme ele é colado.
  // Se for um JSON completo e válido, prossegue.
  try {
    const parsed = JSON.parse(jsonBuffer);
    rl.close();
    updateApp(parsed);
  } catch (e) {
    // Continua esperando mais linhas se o JSON ainda não estiver completo
  }
});

function updateApp(data) {
  try {
    console.log('\n[1/3] Validando e ajustando dados...');
    
    // Atualiza automaticamente a data para o momento atual
    const agora = new Date();
    const dataFormatada = agora.getFullYear() + '-' + 
      String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
      String(agora.getDate()).padStart(2, '0') + ' ' + 
      String(agora.getHours()).padStart(2, '0') + ':' + 
      String(agora.getMinutes()).padStart(2, '0');
    
    data.updatedAt = dataFormatada;
    
    // Caminho do arquivo de dados
    const dataPath = './src/data.json';
    
    // Salva o novo JSON formatado
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('✅ Arquivo src/data.json atualizado com sucesso!');

    console.log('\n[2/3] Enviando para o GitHub...');
    
    // Comandos Git
    execSync('git add .');
    execSync('git commit -m "Update: novos dados de análise esportiva"');
    execSync('git push origin main');
    
    console.log('✅ Código enviado para o GitHub!');
    
    console.log('\n[3/3] Finalizando...');
    console.log('\n🚀 TUDO PRONTO! O site na Vercel será atualizado em instantes.');
    console.log('Acesse: https://arena-pro-five.vercel.app\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO DURANTE A ATUALIZAÇÃO:');
    console.error(error.message);
    process.exit(1);
  }
}
