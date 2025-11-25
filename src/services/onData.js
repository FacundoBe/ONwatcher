
const API_BYMADTA_ON_URL = "https://open.bymadata.com.ar/vanoms-be-core/rest/api/bymadata/free/negociable-obligations"

export async function getBymaData() {
    return fetch(API_BYMADTA_ON_URL, {
        headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "es-ES,es;q=0.9,en;q=0.8",
            "cache-control": "no-cache,no-store,max-age=1,must-revalidate",
            "content-type": "application/json",
            "expires": "1",
            "options": "renta-fija",
            "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "token": "dc826d4c2dde7519e882a250359a23a5"
        },
        referrer: "https://open.bymadata.com.ar/",
        body: "{\"excludeZeroPxAndQty\":true,\"T1\":true,\"T0\":false,\"Content-Type\":\"application/json, text/plain\"}",
        method: "POST",
        mode: "cors",
        credentials: "include"
    }) // ** agregar mejor control de errores al fetch y pasarlo a un custom Hook useFetch
        .then(res => res.json())
        .then(videos => {
            return videos
        })
        .catch(error => {
            alert("Lo lamentamos no se pudo obener las lista de cursos del servidor")
            console.log(error.message)
        })
}


