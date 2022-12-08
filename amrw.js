//***************************** Variáveis Globais *****************************//

const Automerge = require('automerge') // Carrega o automerge no node
var fs = require("fs"); // file system
let a = 3; // Contador para navegação nos argumentos de linha de comando
let i = 0; // Contador do vetor do path
let path = []; // Vetor para armazenar o path
var root; // Armazena a raiz do arquivo
var out; // Armazena o campo indicado no path a ser acessado
var file; //  Armazena o Nome do arquivo a ser lido/salvo
var verbose = false; // Ativa (true) e desativa (false) o modo verboso
var errorcheck = false; // Verificador de erro de sintaxe

//***************************** Funções *****************************//

//Função para recompor o path
function getDataFromPath(jsonObj, pathString) {
    try {
        data = {...jsonObj}
        pathList.forEach(value => data = data[value])
        data = root[data][fieldname]
        return data
    } catch {
        return null
    }
}

//Função setar o elemento no objeto json
function setDataOnPath(data = {}, pathList, value) {

    const prop = pathList.shift()

    if(pathList.length === 0){
        data[prop] = value
    } else {
       // if(typeof(data[prop]) !== 'object') data[prop] = {}
        setDataOnPath(data[prop], pathList, value)
    }
    return data 
}

//Função setar o elemento no array json
function setDataArrayOnPath(data = {}, pathList, index, value) {

    const prop = pathList.shift()

    if(pathList.length === 0){
        data[prop].splice(index, 0, value)
        
    } else {
        //if(typeof(data[prop]) !== 'object') data[prop] = {}
        setDataOnPath(data[prop], pathList, value)
    }
    return data 
}

//Função para apagar o elemento no json
function delDataOnPath(data = {}, pathList) {

    const prop = pathList.shift()

    if(pathList.length === 0){
		delete data[prop]
    } else {
        //if(typeof(data[prop]) !== 'object') delete data[prop]
        delDataOnPath(data[prop], pathList)
    }
    return data    
}

//Função para exibir o manual:
function help() {

console.log("AMRW v0.1.0")
console.log("")
console.log("AMRW is a command line reader and editor for JSON-Automerge files")
console.log("")
console.log("Usage:")
console.log("    node amrw.js <file> init [verbose]")
console.log("    node amrw.js <file> <path>... <mode> <op> [verbose]")
console.log("    node amrw.js <file> json [verbose]")
console.log("    node amrw.js help")
console.log("")
console.log("Help:")
console.log("    Displays this manual")
console.log("")
console.log("Verbose:")
console.log("    Enable verbose mode")
console.log("")
console.log("File:")
console.log("    Filename")
console.log("")
console.log("Init:")
console.log("    Initializes a minimal JSON-Autmerge file")
console.log("")
console.log("Json:")
console.log("    Convert an Automerge file to a JSON file and save to disk")
console.log("")
console.log("Path:")
console.log("    field <fld>    Indicates the field to be accessed")
console.log("    |")
console.log("    index <idx>    Indicates the index of the accessed field, if it is an array type field")
console.log("")
console.log("Mode:")
console.log("    read           Enables read mode, in which case it is not necessary to include operations")
console.log("    |")
console.log("    write          Enables editor mode, it is necessary to include the desired operation (<op>)")
console.log("")
console.log("Ops:")
console.log("    object ins <fld> <value>      Inserts a field with value in the object accessed by path")
console.log("    object set <fld> <value>      Modifies a field with value in the object accessed by path")
console.log("    object del <fld>              Delete a field with value in the object accessed by path")
console.log("    |")
console.log("    array ins <idx> <value>       Inserts a value at the indicated index of the array accessed by path ")
console.log("    array set <idx> <value>       Modifies a value at the indicated index of the array accessed by path")
console.log("    array del <idx>               Delete a value at the indicated index of the array accessed by path")
console.log("")
console.log("    Value:")
console.log("        object                  an empty object (dictionary)")
console.log("        array                   an empty array (list)")
console.log("        string <str>            a string <str>")
console.log("        number <num>            a number <num>")
console.log("        bool (true | false)     a boolean")
console.log("        null                    a null value")
console.log("")
console.log("More Information:")
console.log("")
console.log("    https://github.com/fabiobosisio/amrw")
console.log("")
console.log("    Please report bugs at <https://github.com/fabiobosisio/amrw/blob/master/README.md>")
console.log("")
}

// Função de salvar/sobrescrever arquivo local
function save(file,value){
  // Remove extensoes passadas no nome do arquivo nos argumentos
  file = file.substr(0, file.lastIndexOf('.')) || file;
  // Salva o arquivo local .automerge com os metadados automerge do json
  fs.writeFileSync(file+".am", Automerge.save(value), {encoding: null}); 		
  if(verbose) console.log('\x1b[36m%s\x1b[0m',"Arquivo salvo com sucesso");
  return;
}

// Função que transforma arquivo automerge em json
function amtojson(file){ 
  // Remove extensoes passadas no nome do arquivo nos argumentos
  file = file.substr(0, file.lastIndexOf('.')) || file;
  let fileam = file+".am"
  // Verifica se o arquivo existe localmente
  if(!fs.existsSync(fileam)) {
    console.log('\x1b[1m\x1b[31m%s',"\nArquivo "+fileam+" inexistente!",'\x1b[0m\n');
  }
  else {
    // Carrega o arquivo e converte para JSON
    let value = Automerge.load(fs.readFileSync(fileam, {encoding: null}));
    if(verbose) console.log('\x1b[36m%s\x1b[0m',"Arquivo:")
    if(verbose) show(value);
    // Salva o arquivo local .json
    fs.writeFileSync(file+".json", JSON.stringify(value), {encoding: null});
    if(verbose) console.log('\x1b[36m%s\x1b[0m',"Arquivo salvo com sucesso");
  }
  return;
}

// Função de leitura do arquivo json e recomposição do path
function recompose(path){
  file = process.argv[2];  
  // Remove extensoes passadas no nome do arquivo nos argumentos
  file = file.substr(0, file.lastIndexOf('.')) || file;
  file = file+".am"
  // Verifica se o arquivo existe localmente
  if(!fs.existsSync(file)) {
    console.log('\x1b[1m\x1b[31m%s',"\nArquivo "+file+" inexistente!",'\x1b[0m\n');
    out = ''
  }
  else {
    // Carrega o arquivo e converte para JSON
    root = out = Automerge.load(fs.readFileSync(file, {encoding: null}));
  }
  // recompoe o path
  for(let c=1; c<=i; c++){
    out = out[path[c]];
  };
  return;
}

// Função de exclusão de elementos
function del(type, fieldname) {
  path.shift(); // Elimina o primeiro elemento vazio do array do path
  path[path.length] = fieldname // Inclui como ultimo elemento o nome do novo campo no array do path
  if(verbose) console.log('\x1b[36m%s\x1b[0m',"Arquivo anterior:")
  if(verbose) show(Automerge.load(Automerge.save(root)))	
	var newOut = Automerge.change(root, root => {
		existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) delDataOnPath(root, path)
	})

  if(verbose) console.log('\x1b[36m%s\x1b[0m',"Arquivo atualizado:")
  if(verbose) show(Automerge.load(Automerge.save(newOut)))	
  // Salva o arquivo local 
  save(file,newOut)
  return;
}

// Função de inserção de valores
function insert(type, fieldname, valuetype, value) {
  path.shift(); // Elimina o primeiro elemento vazio do array do path
  if (type == 'object'){
	path[path.length] = fieldname // Inclui como ultimo elemento o nome do novo campo no array do path
    if(verbose) console.log("em Objeto")
    if(verbose) console.log('\x1b[36m%s\x1b[0m',"Arquivo:")
    if(verbose) show(root);
    switch(valuetype) {
	case 'object':
	  if(verbose) console.log("object")
	  //out[fieldname] = {}    
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, {})
		})  	  
	break;
	case 'array':
	  if(verbose) console.log("array")
	  //out[fieldname] = []
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, [])
		})
	break;
	case 'string':
	  if(verbose) console.log("string:"+value)
	  //out[fieldname] = value
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, value)
		})
	break;
	case 'number':
	  if(verbose) console.log("number:"+value)
	  //out[fieldname] = Number(value)
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, Number(value))
		})
	break;
	case 'bool':
	  if(verbose) console.log("bool:"+value)
	  //out[fieldname] = JSON.parse(value)
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, JSON.parse(value))
		})
	break;
	case 'null':
	  if(verbose) console.log("null")
	  //out[fieldname] = null;
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, null)
		})
	default:
      }
    
  }else if (type == 'array'){ //Nesse caso a variável fieldname recebe o indice do vetor e não o nome do campo
    if(verbose) console.log("em Vetor")
    if(verbose) console.log("Arquivo:")
    if(verbose) show(root);
    switch(valuetype) {
	case 'nestedobject':
	  if(verbose) console.log("nested object")
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataArrayOnPath(root, path, fieldname, {[value]:{}})
		})
	break;
	case 'object':
	  if(verbose) console.log("object")
	  //out.splice(fieldname, 0, {});
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataArrayOnPath(root, path, fieldname, {})
		})
	break;
	case 'array':
	  if(verbose) console.log("array")
	  //out.splice(fieldname, 0, []);
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataArrayOnPath(root, path, fieldname, [])
		})
	break;
	case 'string':
	  if(verbose) console.log("string:"+value)
	  //out.splice(fieldname, 0, value);
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataArrayOnPath(root, path, fieldname, value)
		})
	break;
	case 'number':
	  if(verbose) console.log("number:"+value)
	 // out.splice(fieldname, 0, Number(value));
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataArrayOnPath(root, path, fieldname, Number(value))
		})
	break;
	case 'bool':
	  if(verbose) console.log("bool:"+value)
	  //out.splice(fieldname, 0, JSON.parse(value));
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataArrayOnPath(root, path, fieldname, JSON.parse(value))
		})
	break;
	case 'null':
	  if(verbose) console.log("null")
	  //out.splice(fieldname, 0, null);
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataArrayOnPath(root, path, fieldname, null)
		})
	default:
      }
  }
   if(verbose) console.log('\x1b[1m\x1b[31m%s', "Arquivo atualizado:",'\x1b[0m')
   if(verbose) show(Automerge.load(Automerge.save(newOut)))	
   // Salva o arquivo local .json
   save(file,newOut)
  return;
}

// Função de edição de valores
function sett(type, fieldname, valuetype, value) {
  path.shift(); // Elimina o primeiro elemento vazio do array do path
  path[path.length] = fieldname // Inclui como ultimo elemento o nome do novo campo no array do path
  if (type == 'object'){
    if(verbose) console.log("em Objeto")
    if(verbose) console.log('\x1b[36m%s\x1b[0m',"Arquivo:")
    if(verbose) show(root);
    switch(valuetype) {
	case 'object':
	  if(verbose) console.log("object")
	  //out[fieldname] = {}    
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, {})
		})  	  
	break;
	case 'array':
	  if(verbose) console.log("array")
	  //out[fieldname] = []
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, [])
		})
	break;
	case 'string':
	  if(verbose) console.log("string:"+value)
	  //out[fieldname] = value
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, value)
		})
	break;
	case 'number':
	  if(verbose) console.log("number:"+value)
	  //out[fieldname] = Number(value)
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, Number(value))
		})
	break;
	case 'bool':
	  if(verbose) console.log("bool:"+value)
	  //out[fieldname] = JSON.parse(value)
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, JSON.parse(value))
		})
	break;
	case 'null':
	  if(verbose) console.log("null")
	  //out[fieldname] = null;
	    var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, null)
		})
	default:
      }
    
  }else if (type == 'array'){ //Nesse caso a variável fieldname recebe o indice do vetor e não o nome do campo
    if(verbose) console.log("em Vetor")
    if(verbose) console.log("Arquivo:")
    if(verbose) show(root);
    switch(valuetype) {
	case 'nestedobject':
	  if(verbose) console.log("nested object")
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, {[value]:{}})
		})
	break;
	case 'object':
	  if(verbose) console.log("object")
	  //out.splice(fieldname, 0, {});
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, {})
		})
	break;
	case 'array':
	  if(verbose) console.log("array")
	  //out.splice(fieldname, 0, []);
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, [])
		})
	break;
	case 'string':
	  if(verbose) console.log("string:"+value)
	  //out.splice(fieldname, 0, value);
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, value)
		})
	break;
	case 'number':
	  if(verbose) console.log("number:"+value)
	 // out.splice(fieldname, 0, Number(value));
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, Number(value))
		})
	break;
	case 'bool':
	  if(verbose) console.log("bool:"+value)
	  //out.splice(fieldname, 0, JSON.parse(value));
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, JSON.parse(value))
		})
	break;
	case 'null':
	  if(verbose) console.log("null")
	  //out.splice(fieldname, 0, null);
		var newOut = Automerge.change(root, root => {
			existsValueOnPath = Boolean(getDataFromPath(root, path))
		if (!existsValueOnPath) setDataOnPath(root, path, null)
		})
	default:
      }
  }
   if(verbose) console.log('\x1b[1m\x1b[31m%s', "Arquivo atualizado:",'\x1b[0m')
   if(verbose) show(Automerge.load(Automerge.save(newOut)))	
   // Salva o arquivo local .json
   save(file,newOut)
  return;
}

// Função de exibição do JSON formatado
function show(out){
  console.dir(out, { depth: null} );
  return;
}

//***************************** Módulo Principal *****************************//

// Habilita o modo verboso
if (process.argv[process.argv.length-1] === 'verbose'){
     verbose = true; 
}

// Exibe o manual
if (process.argv[2] == 'help' || process.argv[2] == 'Help' || process.argv[2] == 'h' || process.argv[2] == null){
  help();
}
// Main
while (process.argv[a]){
  if (process.argv[a] == 'init'){ // inicializa o arquivo Automerge
      errorcheck = true; // Sinaliza que não há erro de sintaxe
      const tempinit = Automerge.init()
	  save(process.argv[2], tempinit)  
  }else if (process.argv[a] == 'json'){ // transforma o arquivo automerge em um json
      amtojson(process.argv[2]);
      errorcheck = true; // Sinaliza que não há erro de sintaxe 
  }else if (process.argv[a] == 'field' || process.argv[a] == 'index'){ // constroi o vetor com o path
      i++;
      path[i] = process.argv[a+1];
  }else if (process.argv[a] == 'read'){ // habilita o modo leitura e exibe o json
      recompose(path);
      show(out);// Exibe o json na tela
      errorcheck = true; // Sinaliza que não há erro de sintaxe
  }else if (process.argv[a] == 'write'){ // habilita o modo edicao
      errorcheck = true; // Sinaliza que não há erro de sintaxe
      recompose(path); // Le o arquivo e recompoe o path
      switch(process.argv[a+2]) {
	  case 'ins':
	      if(verbose) console.log("ins");
	      insert(process.argv[a+1], process.argv[a+3],process.argv[a+4],process.argv[a+5]);
	  break;
	  case 'set':
	      if(verbose) console.log("set");
	      sett(process.argv[a+1], process.argv[a+3],process.argv[a+4],process.argv[a+5]);
	  break;
	  case 'del':
	      if(verbose) console.log("del")
	      del(process.argv[a+1], process.argv[a+3]);
	  break;
	  default:
      }
  }
  a++; // Avança no path
}
if (errorcheck==false){
      console.log('\x1b[1m\x1b[31m%s',"Erro de sintaxe (Falta init, json, read ou write)",'\x1b[0m');
}
