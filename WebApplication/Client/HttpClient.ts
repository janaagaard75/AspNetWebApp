module CocaineCartels {
    "use strict";

    enum HttpMethod {
        Get,
        Post
    }

    export class HttpClient {
        private static ajax<T>(method: HttpMethod, url: string, errorMessage: string, data?: any): Promise<T> {
            var jsonData = null;
            if (data != null) {
                jsonData = JSON.stringify(data);
            }

            const promise = new Promise<T>((resolve, reject) => {
                const client = new XMLHttpRequest();
                client.timeout = 10 * 1000; // 10 seconds timeout as stardard.
                client.responseType = "json";
                client.open(method === HttpMethod.Get ? "GET" : "POST", url);
                if (method === HttpMethod.Post) {
                    client.setRequestHeader("Content-Type", "application/json");
                }
                client.send(jsonData);
                client.onload = (/*e: Event*/) => {
                    const object = <T>client.response;
                    if (object === null) {
                        if (client.status !== 200 && client.status !== 204) {
                            reject(`Status is ${client.status} ${client.statusText}. Only 200 OK and 204 No Content are supported when a null is returned.`);
                        }
                    } else {
                        if (client.status !== 200) {
                            reject(`Status is ${client.status} ${client.statusText}. Only 200 OK is supported when a value is returned.`);
                        }
                    }

                    resolve(object);
                }
                client.onerror = (/*e: Event*/) => {
                    reject(`Error ${errorMessage} '${url}': ${client.statusText}.`);
                }
            });

            return promise;
        }

        public static get<T>(url: string): Promise<T> {
            const promise = HttpClient.ajax(HttpMethod.Get, url, "getting data from");
            return promise;
        }

        public static post<T>(url: string, data: any): Promise<T> {
            const promise = HttpClient.ajax(HttpMethod.Post, url, "posting data to", data);
            return promise;
        }
    }
}
