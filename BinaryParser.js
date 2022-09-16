/** Biblioteca para optimización de trama de datos.
 * </br>Los tipos de datos que se pueden codificar son los siguientes:
 * <ul style="list-style: none;">
 *  <li> 'uint' de 1 a 32 bits
 *  <li> 'int' de 2 a 32 bits
 *  <li> 'float' de 32 bits
 *  <li> 'ascii' de 8 bits por caracter
 * </ul>
 * Codificaciones realizadas en BE por ser el estándar más usado para comunicaciones
*/
class BinaryParser {
    /**
    * Se ingresa un buffer con datos codificados y un arreglo de objetos con el formato de los datos.
    * </br>Devuelve un objeto con los datos accesibles para su uso.
    * </br>v0.1.0 | [Gomila Molina Diego Tomas] | Primera versión
    * 
    * @param {buffer} buffer -> Trama a deserializar
    * @param {*} format -> Formato de serialización (ver notas adjuntas)
    * @return {*} Objeto "composición" (trama deserializada en campos tag = valor)
    * @memberof BinaryParser
    * @version 0.1.0
    */
    decode(buffer, format) {
        
        // inicializa objeto de salida
        let _object = {}
        
        // guarda la posición de inicio para los siguientes bytes
        let offsetBufferBits = 0;

        for (const [key, value] of Object.entries(format)) {

            // Toma la cantidad de bites del objeto actual
            let bitsCurrent = (value.type == 'float' ? 32 : value.len );

            let bits = buffer.slice(offsetBufferBits, offsetBufferBits + bitsCurrent)
            // Transforma a bytes
            let bytes = parseInt(bits, 2).toString(16).toUpperCase();
            // Tomas la cantidad de bytes
            let bytsCurrent = bytes.length/2;
            // crea el buffer
            let bufferTemp = Buffer.allocUnsafe(bytsCurrent);
            bufferTemp = Buffer.from(bytes, 'hex');

            if ( value.type == 'uint' ) {
                _object[value.tag] = bufferTemp.readUIntBE(0,bytsCurrent);

            } else if ( value.type == 'int' ) {
                _object[value.tag] = bufferTemp.readIntBE(0, bytsCurrent);  

            } else if ( value.type == 'float' ) {
                _object[value.tag] = bufferTemp.readFloatBE(0);

            } else if ( value.type == 'ascii' ) {
                _object[value.tag] = bufferTemp.toString('ascii', 0, bytsCurrent);

            }

            // agrega los bytes actuales al offset
            offsetBufferBits += bitsCurrent;
        }
            
        
        return _object
    }

    /**
    * Se le ingresa un objeto a codificar de forma binario y un arreglo de objetos con el formato de codificación a utilizar
    * </br>Devuelve los objetos codificados, en "size" el tamaño del buffer y en "buffer" los datos codificados
    * </br>v0.1.0 | [Gomila Molina Diego Tomas] | Primera versión
    * 
    * @param {*} _object -> Objeto a frasear (serializar)
    * @param {*} format -> Formato de serialización (ver notas adjuntas)
    * @return {*} size -> tamaño en bits de la trama. buffer -> Node.js Buffer.
    * @memberof BinaryParser
    * @version 0.1.0
    */
    encode(_object, format) {
        // calcula tamaño total en bytes que tendra el buffer
        // Cuando la conversion de bits a bytes no es entera la redondea hacia arriba
        let lenByts = format.reduce(
            (previousValue, currentValue) => previousValue + (currentValue.type == 'float' ? 4 : Math.ceil( Number(currentValue.len / 8 ) )),
            0
          );
        
        //   Crea el buffer
        let ArrayBits = [];
        
        // Recorre el formato dato y busca los valores de cada campo en _objeto
        for (const [key, value] of Object.entries(format)) {

            // busca el valor a guardar en el buffer en _objeto
            let valor = _object[value.tag];

            // Toma la cantidad de bytes del objeto actual            
            let bytsCurrent = (value.type == 'float' ? 4 : Math.ceil( Number(value.len / 8 ) ));

            if ( value.type == 'uint' ) {
                // Controla si es un numero y si es mayor a 0
                if ( isNaN(valor) || valor < 0 ) {
                    valor = 0; //Remplazar con valor de error
                }
                // coloca el valor en UINT BE con los parametros dados
                let bufferTemp = Buffer.alloc(bytsCurrent);
                bufferTemp.writeUIntBE(valor, 0, bytsCurrent);

                let bits = split2Bits(bufferTemp, value.len)[0];
                ArrayBits.push(bits)
                
            } else if ( value.type == 'int' ) {
                // Controla si es un numero
                if ( isNaN(valor) ) {
                    valor = 0; //Remplazar con valor de error
                }
                // coloca el valor en INT BE con los parametros dados
                let bufferTemp = Buffer.alloc(bytsCurrent);
                bufferTemp.writeIntBE(valor, 0, bytsCurrent);

                let bits = split2Bits(bufferTemp, value.len)[0];
                ArrayBits.push(bits)
                
            } else if ( value.type == 'float' ) {
                // Controla si es un numero
                if ( isNaN(valor) ) {
                    valor = 0; //Remplazar con valor de error
                }
                // coloca el valor en Float BE con los parametros dados
                let bufferTemp = Buffer.alloc(4);
                bufferTemp.writeFloatBE(valor, 0);

                let bits = split2Bits(bufferTemp, 32)[0];
                ArrayBits.push(bits)
                
            } else if ( value.type == 'ascii' ) {
                // Controla que sea un string
                if ( !(typeof valor === 'string' || valor instanceof String) ) {
                    valor = 'err';
                }
                // coloca el valor en ascii con los parametros dados
                // si el tamaño de ascii ingresado es mayor a los bytes asignados el texto se recortara a este tamaño
                // si la cantidad de bytes asignada es mayor al tamaño del valor a asignar se completara con 00 estos bytes
                let bufferTemp = Buffer.alloc(bytsCurrent);
                bufferTemp.write(valor, 0, bytsCurrent, 'ascii')

                let bits = split2Bits(bufferTemp, value.len)[0];
                ArrayBits.push(bits)

            }


        }

        let bitsPLanos = ArrayBits.flat().toString().replaceAll(',','')
        return { size: bitsPLanos.length, buffer: bitsPLanos };
    }
}

function byte2bits(a)
{
    var tmp = "";
    for(var i = 128; i >= 1; i /= 2)
        tmp += a&i?'1':'0';
    return tmp;
}
function split2Bits(a, n)
{
    var buff = "";
    var b = [];
    for(var i = 0; i < a.length; i++)
    {
        buff += byte2bits(a[i]);
        while(buff.length >= n)
        {
            b.push(buff.substr(0, n));
            buff = buff.substr(n);
        }
    }
    return [b, buff];
}

module.exports = BinaryParser;
