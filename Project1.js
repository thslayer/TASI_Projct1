const http = require('http');
const url = require('url');
const fs = require('fs');

// Função para calcular IMC
function calcularIMC(peso, altura) {
    const imc = peso / (altura ** 2);
    let classificacao = '';

    if (imc < 18.5) {
        classificacao = 'Abaixo do peso';
    } else if (imc < 25) {
        classificacao = 'Peso normal';
    } else if (imc < 30) {
        classificacao = 'Sobrepeso';
    } else if (imc < 35) {
        classificacao = 'Obesidade Grau I';
    } else if (imc < 40) {
        classificacao = 'Obesidade Grau II';
    } else {
        classificacao = 'Obesidade Grau III ou Mórbida';
    }

    return { valor: imc.toFixed(2), classificacao };
}

// Função para calcular situação do aluno com base na média e notas A1 e A2
function calcularSituacao(media, notaA1, notaA2) {
    const mediaMinima = 5;
    const mediaAprovacaoDireta = 7;
    const mediaAprovacaoAF = 3;
    const notaAF = (mediaMinima + media) / 2;
    let situacao = '';

    if (media >= mediaAprovacaoDireta) {
        situacao = 'Aprovado';
    } else if (media >= mediaMinima && media < mediaAprovacaoDireta) {
        situacao = 'AF';
    } else {
        situacao = 'Reprovado';
    }

    const htmlPath = `./${situacao}.html`;

    // Gerar HTML correspondente à situação do aluno
    let htmlContent = `<h1>Situação do Aluno</h1>
                      <p>Nota A1: ${notaA1}</p>
                      <p>Nota A2: ${notaA2}</p>
                      <p>Média: ${media.toFixed(2)}</p>
                      <p>Situação: ${situacao}</p>`;

    // Escrever conteúdo HTML em arquivo
    fs.writeFileSync(htmlPath, htmlContent);

    return htmlPath;
}

// Função para calcular conversão de dólar para real
function calcularConversaoDolar(valorDolar, quantidadeReais) {
    const valorConvertido = valorDolar * quantidadeReais;
    const htmlContent = `<h1>Conversão de Dólar para Real</h1>
                        <p>Valor do Dólar: ${valorDolar}</p>
                        <p>Quantidade em Reais: ${quantidadeReais}</p>
                        <p>Valor Convertido: ${valorConvertido.toFixed(2)}</p>`;
    return htmlContent;
}

// Função para tratar requisições HTTP
function handleRequest(req, res) {
    const path = url.parse(req.url, true).pathname;

    if (path === '/') {
        // Página inicial
        const htmlContent = `<h1>Projeto Node.js</h1>
                            <p>Nome: [Seu Nome]</p>
                            <p>Número de Matrícula: [Seu Número de Matrícula]</p>
                            <p>Descrição: Este é um projeto Node.js que implementa um sistema com três rotas diferentes: IMC, Notas e Dólar. Consulte a documentação para mais detalhes sobre como utilizar cada rota.</p>`;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
    } else if (path === '/imc') {
        // Rota para cálculo do IMC
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { peso, altura } = JSON.parse(body);
                const resultadoIMC = calcularIMC(peso, altura);
                const htmlContent = `<h1>IMC</h1>
                                    <p>Valor do IMC: ${resultadoIMC.valor}</p>
                                    <p>Classificação: ${resultadoIMC.classificacao}</p>`;
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(htmlContent);
            });
        } else {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
        }
    } else if (path === '/notas') {
        // Rota para cálculo da situação do aluno
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { media, notaA1, notaA2 } = JSON.parse(body);
                const htmlPath = calcularSituacao(media, notaA1, notaA2);
                fs.readFile(htmlPath, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal Server Error');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(data);
                    }
                });
            });
        } else {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
        }
    } else if (path === '/dolar') {
        // Rota para conversão de dólar para real
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { valorDolar, quantidadeReais } = JSON.parse(body);
                const htmlContent = calcularConversaoDolar(valorDolar, quantidadeReais);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(htmlContent);
            });
        } else {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

// Criar servidor HTTP
const server = http.createServer(handleRequest);

// Escutar na porta 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
