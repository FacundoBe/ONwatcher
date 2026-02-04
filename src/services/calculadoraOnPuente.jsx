

export async function calculaRendimientoOnPuente(tiker, precio) {

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

            console.log("La TIR extraída es:", tir); // Resultado: 6.17
        } else {
            console.error("No se encontró la celda de TIR");
        }
        return tir;
    }


    async function obtenerDatosBono(tiker) {
        try {
            // 1. Hacemos la petición a la api de datos de Bonos de puente, estops datos los pide la api de calculo de rendimiento
            const respuestaDatosBono = await fetch("api-puente/puente/actionCalculadoraBonosPublica!getDatosBono.action?idBono=BONO_IRCFO", {
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
            console.log(doc)
            // 3. Scrapeamos los datos que necesitamos para hacer la llamada a la Api de calculadora de bonos 
            const datosBono = await scrapeDatosBono(doc)
            console.log(datosBono)
            return datosBono

        } catch (error) {
            // Manejo de errores por si la red falla
            console.error('Hubo un error:', error);
        }
    }

    async function apiRendimientoOn(tiker, datosBono, precio) {  // ***** FALTA poner variable al proximo dia habil al fecha de liquidacion *****
        const url = `api-puente/puente/actionCalculadoraBonosPublica!calcular.action?calculadoraPublica=true&idCategoria=18&idBono=BONO_${tiker}&descripcionCategoria=Bonos+emitidos+por+empresas+en+Argentina&tipoCambioFormateado=${datosBono.tipoCambio}&precioFormateado=${datosBono.precio}&tirFromBono=${datosBono.tir}&paridadFormateada=${datosBono.paridad}&monedaEmision=${datosBono.moneda}&valorResidual=${datosBono.valorRresidual}&tipoCalculoSelection=precioVN&monedaPrecio=DIVISA_DOLAR&precioVN=${precio}&tipoCantidadSelection=cantidadVN&cantidadVN=100&fechaLiquidacion=03%2F02%2F2026&tipoDeCambio=1&labelTipoCambio=N%2FA`
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

            // 3. Scrapeamos los datos que necesitamos para hacer la llamada a la Api de calculadora de bonos 
            const tir = await scrapeRendimiento(doc)
            return tir

        } catch (error) {
            // Manejo de errores por si la red falla
            console.error('Hubo un error al llamar a la api de calcular bonos de puente', error);
        }
    }

    const datosBono = await obtenerDatosBono(tiker); // primero hay que obtener los datos del bono que hay que mandar a la Api de calculadora de bonos
    //console.log("datos Bono", datosBono)
    const tir = await apiRendimientoOn("IRCFO", datosBono, precio)
    //console.log("el rendimiento es de ", tir)
    return tir
}