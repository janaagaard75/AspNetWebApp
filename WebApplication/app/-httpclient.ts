module CocaineCartels {
    "use strict";

    export class HttpClient {
        private static ajax<T>(method: string, url: string, errorMessage: string, data?: any): Promise<T> {
            const promise = new Promise<T>((resolve, reject) => {
                const client = new XMLHttpRequest();
                client.timeout = 10 * 1000; // 10 seconds timeout as stardard.
                client.responseType = "json";
                client.open("GET", url);
                client.send();
                client.onload = (/*e: Event*/) => {
                    if (client.status !== 200) {
                        reject(`Status is ${client.status} ${client.statusText}. Only 200 OK is supported.`);
                    }

                    const object = <T>client.response;
                    resolve(object);
                }
                client.onerror = (/*e: Event*/) => {
                    reject(`Error ${errorMessage} '${url}': ${client.statusText}.`);
                }
            });

            return promise;
        }

        public static get<T>(url: string): Promise<T> {
            const promise = HttpClient.ajax("GET", url, "getting data from");
            return promise;
        }

        public static post<T>(url: string, data: any): Promise<T> {
            const promise = HttpClient.ajax("POST", url, "posting data to", data);
            return promise;
        }
    }
}

//if (args && (method === "POST" || method === "PUT")) {
//    uri += "?";
//    let argcount = 0;
//    for (let key in args) {
//        if (args.hasOwnProperty(key)) {
//            if (argcount++) {
//                uri += "&";
//            }
//            uri += encodeURIComponent(key) + "=" + encodeURIComponent(args[key]);
//        }
//    }
//}
