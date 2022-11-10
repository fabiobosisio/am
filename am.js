var fs = require("fs");

if (process.argv[2]){
  var jsonData = fs.readFileSync(process.argv[2], "utf8");
}else{
    console.log("Inclua o nome do arquivo logo apos o comando\n");
    return;
  }

let a = 3;
let i = 0;
let path = [];
let out = JSON.parse(jsonData);

while (process.argv[a]){
  if (process.argv[a] == 'field' || process.argv[a] == 'index'){ // constroi o vetor com o path
	  i++;
	  path[i] = process.argv[a+1];
  }else if (process.argv[a] == 'read'){ // habilita o modo leitura e exibe o json
    for(let c=1; c<=i; c++){
      out = out[path[c]];
    };
    console.log(out);// exibe o json na tela
    
  }
  
  
  
  
  
  a++;
}


