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
        let offsetBuffer = 0;

        // Controla que sea un objeto tipo Buffer
        if ( Buffer.isBuffer(buffer) ) {
            for (const [key, value] of Object.entries(format)) {
                // Toma la cantidad de bytes del objeto actual
                let bytsCurrent = (value.type == 'float' ? 4 : Math.ceil( Number(value.len / 8 ) ));
    
                if ( value.type == 'uint' ) {
                    _object[value.tag] = buffer.readUIntBE(offsetBuffer, bytsCurrent);
                    
                } else if ( value.type == 'int' ) {
                    _object[value.tag] = buffer.readIntBE(offsetBuffer, bytsCurrent);
                    
                } else if ( value.type == 'float' ) {
                    _object[value.tag] = buffer.readFloatBE(offsetBuffer);
    
                } else if ( value.type == 'ascii' ) {
                    _object[value.tag] = buffer.toString('ascii', offsetBuffer, offsetBuffer + bytsCurrent);
                }
    
                // agrega los bytes actuales al offset
                offsetBuffer += bytsCurrent;
            }
            
        } else {
            _object['error'] = 'Se debe ingresar un objeto tipo "Buffer" para su decodificación.'
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
        let buffer = Buffer.alloc(lenByts);

        // guarda la posición de inicio para los siguientes bytes
        let offsetBuffer = 0;
        
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
                buffer.writeUIntBE(valor, offsetBuffer, bytsCurrent);
                
            } else if ( value.type == 'int' ) {
                // Controla si es un numero
                if ( isNaN(valor) ) {
                    valor = 0; //Remplazar con valor de error
                }
                // coloca el valor en INT BE con los parametros dados
                buffer.writeIntBE(valor, offsetBuffer, bytsCurrent);
                
            } else if ( value.type == 'float' ) {
                // Controla si es un numero
                if ( isNaN(valor) ) {
                    valor = 0; //Remplazar con valor de error
                }
                // coloca el valor en Float BE con los parametros dados
                buffer.writeFloatBE(valor, offsetBuffer);
                
            } else if ( value.type == 'ascii' ) {
                // Controla que sea un string
                if ( !(typeof valor === 'string' || valor instanceof String) ) {
                    valor = 'err';
                }
                // coloca el valor en ascii con los parametros dados
                // si el tamaño de ascii ingresado es mayor a los bytes asignados el texto se recortara a este tamaño
                // si la cantidad de bytes asignada es mayor al tamaño del valor a asignar se completara con 00 estos bytes
                buffer.write(valor, offsetBuffer, bytsCurrent, 'ascii')

            }

            // agrega los bytes actuales al offset            
            offsetBuffer += bytsCurrent;

        }

        return { size: buffer.length, buffer: buffer };
    }
}

module.exports = BinaryParser;
