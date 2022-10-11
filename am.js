const fs = require('fs');

// Carrega o automerge no node
const Automerge = require('automerge')

// coleta os argumentos
const filename = process.argv[2]; // nome do arquivo
const command = process.argv[3]; // comando primário
const n0 = process.argv[4]; // primeiro variavel
const element = process.argv[5]; // tipo do elemento
const n1 = process.argv[6]; // segunda variável
const type = process.argv[7]; // tipo do dado
const n2 = process.argv[8]; // terceira variável
const index = parseInt(process.argv[9]); // numero do indice
const listelement = process.argv[10]; //tipo do elemento da lista
const n3 = process.argv[11]; // quarta variável
const listype = process.argv[12]; //tipo do objeto da lista
const n4 = process.argv[13]; // quinta variável

// habilita modo verboso
const cmd = false; // Mostra os comandos
const out = true; // Mostra a saída

// variáveis de trabalho
let currentDoc, newDoc;

// ----------------------------------------- FUNÇÕES ------------------------------------------------

//Função para exibir o manual:
function help () {

console.log("Am Editor v0.1.0")
console.log("")
console.log("Utilitario que permite manipular arquivos padrao Automerge via linha de comando")
console.log("")
console.log("Uso:")
console.log("    node am.js <nome_do_arquivo_sem_extensao> init")
console.log('    node am.js <nome do arquivo sem extensao> set "<nome do objeto>" object')
console.log('    node am.js <nome do arquivo sem extensao> set "<nome do objeto>" field "<nome do campo>" string "<conteudo>"')
console.log('    node am.js <nome do arquivo sem extensao> set "<nome do objeto>" field "<nome do campo>" array')
console.log('    node am.js <nome do arquivo sem extensao> set "<nome do objeto>" field "<nome do campo>" array index 0 object')
console.log('    node am.js <nome do arquivo sem extensao> set "<nome do objeto>" field "<nome do campo 1>" array index 0 field "<nome do campo 2>" string "<conteudo>"')
console.log('    node am.js <nome do arquivo sem extensao> set "<nome do objeto>" field "<nome do campo 1>" array index 0 item "<nome do campo 2>"')
console.log('    node am.js <nome do arquivo sem extensao> rem "<nome do objeto>" ')
console.log("")
console.log("Mais informacoes:")
console.log("")
console.log("    https://github.com/fabiobosisio/am")
console.log("")
console.log("    Por favor reporte bugs em <hhttps://github.com/fabiobosisio/am/blob/master/README.md>")

}



// ----------------------------------------- CORPO PRINCIPAL ------------------------------------------------

// seleciona o comando a ser executado
if (cmd) console.log("Comando: " +command);
switch (command) {
    case 'init': // comando de inicialização
	newDoc = Automerge.init();
	if (out) console.log(newDoc);

    // Salva o arquivo local .automerge com os metadados automerge do json
    fs.writeFileSync(filename+".atm", Automerge.save(newDoc), {encoding: null}); 
		
    // Salva o arquivo local .json
    fs.writeFileSync(filename+".json", JSON.stringify(newDoc), {encoding: null});
    break;
  
    case 'set': // comando de manipulação
	//Carrega o último arquivo salvo
	currentDoc = Automerge.load(fs.readFileSync(filename+".atm", {encoding: null}));
    
	// seleciona o comando a ser executado
	if (cmd) console.log("Tipo do Elemento: "+ element);
	switch (element) { 
	   case 'object': // adiciona objetos
		newDoc = Automerge.change(currentDoc, currentDoc => {
		    if (!currentDoc[n0]) currentDoc[n0] = {}
	    })
	    if (out) console.log(newDoc); 
	    break;
	
	    case 'field': // adiciona campos
	    if (cmd) console.log("Tipo da estrutura: "+ type)
	    newDoc = Automerge.change(currentDoc, currentDoc => {
		if (type == 'string') currentDoc[n0][n1] = n2;
		//To do outros tipos abaixo
		//if (type == 'number') currentDoc[n1] = Number(n2)
		//if (type == 'bool') currentDoc[n1] = JSON.parse(n2)
		//if (type == 'null' || n2 == 'null') currentDoc[n1] = null
		if (type == 'array'){
		    if (!n2) currentDoc[n0][n1] = []; // cria uma lista vazia
		    else if (n2 == 'index'){ // alimenta a lista de acordo com o indice
			    if (cmd) console.log("Posicao na lista: " +index)
			    if (cmd) console.log("Tipo do elemento da lista: " +listelement)
			    switch (listelement) {
				case 'object': 
				   currentDoc[n0][n1].insertAt(index, {});
				   //currentDoc[n0][n1][index] = {};
				break;
				case 'field': 
				   //currentDoc[n0][n1].insertAt(index, {});
				   //if (listype == 'string') currentDoc[n0][n1].insertAt(index, {[n3]:n4});
				   if (listype == 'string') currentDoc[n0][n1][index] = {[n3]:n4};
				   else if (v) console.log("todo: outros tipos (lista)");
				break;
				case 'item':
				    currentDoc[n0][n1].insertAt(index, n3);
				break;
			 
			    }
			}
		}
	    })
	    if (out) console.log(newDoc);
	    break;
	}
    
    // Salva o arquivo local .automerge com os metadados automerge do json
    fs.writeFileSync(filename+".atm", Automerge.save(newDoc), {encoding: null}); 
		
    // Salva o arquivo local .json
    fs.writeFileSync(filename+".json", JSON.stringify(newDoc), {encoding: null});
 
    break;
	 
    case 'rem':// apaga seções
	//Carrega o último arquivo salvo
	currentDoc = Automerge.load(fs.readFileSync(filename+".atm", {encoding: null}));
	//Apaga
	newDoc = Automerge.change(currentDoc, currentDoc => {
		delete currentDoc[n0];
	})
	if (out) console.log(newDoc);
	
	// Salva o arquivo local .automerge com os metadados automerge do json
	fs.writeFileSync(filename+".atm", Automerge.save(newDoc), {encoding: null}); 
		
	// Salva o arquivo local .json
	fs.writeFileSync(filename+".json", JSON.stringify(newDoc), {encoding: null});
    break;
    default:
        //console.log('\x1b[36m%s\x1b[0m',`Operacao invalida!`);
	help();
    break;	
	 
}

