

export async function calculaRendimientoOnPuente(tiker, precio, divisa = "DOLAR", tipoCambio = 1) {
    // tiker de la Pn en byma 
    // precio: Precio con coma para los decimales
    // divisa: string con los valores ARS o DOLAR
    // tipoCambio: si la divisa es ARS va precio del en pesos del dolar, para divisa DOLAR es 1.

    // la Pagina de la calculadora de puente usa dos Api, la primera Api la llama al elegir el bono y devuelve 
    // // informacion del bono como valor residual, paridad etc, esta info la usa cuando se usa en lso headers para llamar 
    // // a la api que  calcula la tir 

    // En estas Apis de Puente todos los tiker de busqueda tienen que estar en su vErsion en pesos (termina con O)
    const formatedTiker = tiker.slice(0, -1) + "O";

    console.log(`tiker: ${tiker}, precio: ${precio}, divisa: ${divisa}, cambio: ${tipoCambio}`)



    async function parseHtmlPuenteApi(respuesta) { // parse Html from puente api using charset ISO-8859-1

        // 1. Obtener los bytes puros (necesario por el charset ISO-8859-1)
        const buffer = await respuesta.arrayBuffer();

        // 2. Decodificar manualmente
        const decoder = new TextDecoder('iso-8859-1');
        const htmlString = decoder.decode(buffer);

        // 3. Parsear el HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        return doc
    }


    async function scrapeDatosBono(doc) {

        // 4.  Leo los value de los hidden input usando suys id
        const leerValue = (id) => {
            return doc.getElementById(id)?.value;
        };

        // 5. Crear el objeto final
        const resultado = {
            tipoCambio: leerValue('tipoCambioFormateado'),
            precio: leerValue('precioFormateado'),
            tir: leerValue('tirFromBono'),
            paridad: leerValue('paridadFormateada'),
            moneda: leerValue('monedaEmision'),
            valorRresidual: leerValue('valorResidual')
        };

        return resultado
    }


    async function scrapeRendimiento(doc) {

        // 1. Buscamos todas las celdas de la tabla
        const celdas = doc.querySelectorAll('td');

        // 2. Filtramos la que contiene el texto "TIR %:"
        const celdaEtiqueta = Array.from(celdas).find(td => td.innerText.includes('TIR %:'));

        let tir = 0
        if (celdaEtiqueta) {
            // 3. Obtenemos la siguiente celda (donde está el número)
            const valorTexto = celdaEtiqueta.nextElementSibling.innerText.trim();

            // 4. Convertimos de formato "6,17" (coma) a "6.17" (punto) para que JS lo entienda como número
            tir = parseFloat(valorTexto.replace(',', '.'));

        } else {
            console.error("No se encontró la celda de TIR");
        }
        return tir;
    }

    function obtenerProximoDiaHabil() { // para que ande bien la Api el dia tiene que ser al menos el siguiente al de la consulta asi que le sumo 2 al habil
        let fecha = new Date(); // Fecha actual
        let diaSemana = fecha.getDay(); // 0 (Dom) a 6 (Sab)

        // Si es Viernes (5) sumamos 3 días, si es Sábado (6) sumamos 2, si no (Dom-Jue), sumamos 1
        if (diaSemana === 5) {
            fecha.setDate(fecha.getDate() + 3 + 2); // Saltar a Lunes
        } else if (diaSemana === 6) {
            fecha.setDate(fecha.getDate() + 2 + 2); // Saltar a Lunes
        } else {
            fecha.setDate(fecha.getDate() + 1 + 2); // Saltar a mañana
        }
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        //console.log("fecha de liquidacion", fechaFormateada)
        return fechaFormateada;
    }


    async function obtenerDatosBono(formatedTiker) {
        try {
            // 1. Hacemos la petición a la api de datos de Bonos de puente, estos datos los pide la api de calculo de rendimiento
            const respuestaDatosBono = await fetch(`api-puente/puente/actionCalculadoraBonosPublica!getDatosBono.action?idBono=BONO_${formatedTiker}`, {
                "headers": {
                    "accept": "text/html, */*; q=0.01",
                    "accept-language": "es-ES,es;q=0.9",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "https://www.puentenet.com/puente/actionCalculadoraBonosPublica!calculadoraBonosPublica.action",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            });

            if (!respuestaDatosBono.ok) {
                // Si entra aquí, hubo un error (404, 500, etc.)
                throw new Error(`Error HTTP: ${response.status}`);
            }

            // 2. Parseamos la respuesta a un objeto DOM Html 
            const doc = await parseHtmlPuenteApi(respuestaDatosBono)

            // 3. Scrapeamos los datos que necesitamos para hacer la llamada a la Api de calculadora de bonos 
            const datosBono = await scrapeDatosBono(doc)
            //console.log(datosBono)
            return datosBono

        } catch (error) {
            // Manejo de errores por si la red falla
            console.error(`Hubo un error obteniendo los datos del bono ${tiker} de puente.net:`, error);
            return null
        }
    }

    async function apiRendimientoOn(formatedTiker, datosBono, precio) {

        const url = `api-puente/puente/actionCalculadoraBonosPublica!calcular.action?calculadoraPublica=true&idCategoria=18&idBono=BONO_${formatedTiker}&descripcionCategoria=Bonos+emitidos+por+empresas+en+Argentina&tipoCambioFormateado=${datosBono.tipoCambio}&precioFormateado=${datosBono.precio}&tirFromBono=${datosBono.tir}&paridadFormateada=${datosBono.paridad}&monedaEmision=${datosBono.moneda}&valorResidual=${datosBono.valorRresidual}&tipoCalculoSelection=precioVN&monedaPrecio=DIVISA_${divisa}&precioVN=${precio}&tipoCantidadSelection=cantidadVN&cantidadVN=100&fechaLiquidacion=${encodeURIComponent(obtenerProximoDiaHabil())}&tipoDeCambio=${tipoCambio}&labelTipoCambio=${tipoCambio === 1 ? 'N%2FA' : 'ARS%2FUSD'}`
        try {
            // 1. Hacemos la petición a la api de calculo de Bonos de Puente
            const rendimiento = await fetch(url, {
                "headers": {
                    "accept": "text/html, */*; q=0.01",
                    "accept-language": "es-ES,es;q=0.9",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "https://www.puentenet.com/puente/actionCalculadoraBonosPublica!calculadoraBonosPublica.action",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            });


            // 2. Parseamos la respuesta a un objeto DOM Html 
            const doc = await parseHtmlPuenteApi(rendimiento)
           // console.log(doc)
            // 3. Scrapeamos los datos que necesitamos para hacer la llamada a la Api de calculadora de bonos 
            const tir = await scrapeRendimiento(doc)
            return tir

        } catch (error) {
            // Manejo de errores por si la red falla
            console.error('Hubo un error al llamar a la api de calcular bonos de puente', error);
        }
    }

    const datosBono = await obtenerDatosBono(formatedTiker); // primero hay que obtener los datos del bono que hay que mandar a la Api de calculadora de bonos
    //console.log("datos Bono", datosBono)
    let tir = 0
    if (datosBono) {  // si no se obtubo los datos del bono no se puede llamar a la api d erendimiento sin datos o daria error
        tir = await apiRendimientoOn(formatedTiker, datosBono, precio)
    }
    //console.log("el rendimiento es de ", tir)
    return tir
}