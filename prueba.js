const BinaryParser = require('./BinaryParser')
var binaryParser = new BinaryParser();

const format1 = [
    { tag: "Entero", type: "uint", len: 8 },
	{ tag: "PTemp", type: "int", len: 8 },
	{ tag: "BattVolt.value", type: "int", len: 8 },
	{ tag: "WaterLevel", type: "float" },
	{ tag: "String", type: "ascii", len: 48 },
];
	
var data = { 
    PTemp: 120, 
    'BattVolt.value': -100, 
    WaterLevel: -115.35, 
    'String': 'prueba de string', 
    Entero: 46 
}; 
    
let codificado = binaryParser.encode( data, format1)

console.log(codificado);
let decodificado = binaryParser.decode( codificado.buffer , format1)

console.log(decodificado);
