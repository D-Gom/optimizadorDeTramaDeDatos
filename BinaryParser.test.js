const BinaryParser = require('./BinaryParser')

var binaryParser = new BinaryParser();

test('Compresión de datos en formato UINT', () => {
    const format = [
        { tag: "Entero", type: "uint", len: 8 },
    ];
    var data = { 
        Entero: 46 
    };
    let codificado = binaryParser.encode( data, format)

    expect( codificado.size ).toBe( 1 );
    expect( codificado.buffer.toString() ).toBe( Buffer.from([46]).toString() );
});

test('Descompresión de datos en formato UINT', () => {
    const format = [
        { tag: "Entero", type: "uint", len: 8 },
    ];
    var data = { 
        Entero: 46 
    };
    let buffer = Buffer.from([46]);
    
    let decodificado = binaryParser.decode( buffer , format)

    expect( decodificado.Entero ).toBe( data.Entero );
});

test('Compresión de datos en formato INT', () => {
    const format = [
        { tag: "BattVolt.value", type: "int", len: 8 },
    ];
    var data = { 
        'BattVolt.value': -100, 
    };
    let codificado = binaryParser.encode( data, format)

    expect( codificado.size ).toBe( 1 );
    expect( codificado.buffer.toString() ).toBe( Buffer.from([-100]).toString() );
});

test('Descompresión de datos en formato UINT', () => {
    const format = [
        { tag: "BattVolt.value", type: "int", len: 8 },
    ];
    var data = { 
        'BattVolt.value': -100, 
    };
    let buffer = Buffer.from([-100]);
    
    let decodificado = binaryParser.decode( buffer , format)

    expect( decodificado['BattVolt.value'] ).toBe( data['BattVolt.value'] );
});

test('Compresión de datos en formato FLOAT', () => {
    const format = [
        { tag: "WaterLevel", type: "float"},
    ];
    var data = { 
        'WaterLevel': -115.35, 
    };
    let codificado = binaryParser.encode( data, format)

    let buffer = Buffer.alloc(4);
    buffer.writeFloatBE([-115.35]);

    expect( codificado.size ).toBe( 4 );
    expect( codificado.buffer.toString() ).toBe( buffer.toString() );
});

test('Descompresión de datos en formato FLOAT', () => {
    const format = [
        { tag: "WaterLevel", type: "float"},
    ];
    var data = { 
        'WaterLevel': -115.35, 
    };
    let buffer = Buffer.alloc(4);
    buffer.writeFloatBE([-115.35]);
    
    let decodificado = binaryParser.decode( buffer , format)

    expect( decodificado['WaterLevel'] ).toBeCloseTo( data['WaterLevel'] );
});

test('Compresión de datos en formato ASCII', () => {
    const format = [
        { tag: "txt", type: "ascii", len: 48 },
    ];
    var data = { 
        'txt': 'prueba de string', 
    };
    let codificado = binaryParser.encode( data, format)

    expect( codificado.size ).toBe( 6 );
    expect( codificado.buffer.toString() ).toBe( 'prueba' );
});

test('Descompresión de datos en formato ASCII', () => {
    const format = [
        { tag: "txt", type: "ascii", len: 48 },
    ];
    var data = { 
        'txt': 'prueba de string', 
    };
    let buffer = Buffer.from('prueba');
    
    let decodificado = binaryParser.decode( buffer , format)

    expect( data['txt'] ).toMatch( decodificado['txt'] );
});