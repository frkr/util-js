// https://community.cloudflare.com/t/timeout-with-fetch/25249/5
export async function fetchWithTimeout(fetchPromise: Promise<Response>, timeout = 120000): Promise<Response | null> {
    try {

        let timeoutPromise = new Promise(resolve => setTimeout(resolve, timeout))

        let ret = await Promise.race([fetchPromise, timeoutPromise])

        if (ret instanceof Response) {
            return ret;
        }

    } catch (e) {
    }
    return null;
}

export async function readRequestBody(request): Promise<any> {
    try {
        if (request.method !== "GET") {
            let contentType = request.headers.get("content-type");

            if (contentType.includes("application/json")) {
                return await request.json();
            } else if (contentType.includes("form")) {
                let formData = await request.formData();
                let body = {};
                for (let entry of formData.entries()) {
                    body[entry[0]] = entry[1];
                }
                return body;
            } else {
                return {text: request.text()};
            }
        }
    } catch (e) {
        console.error("readRequestBody: ", e);
    }
    return {text: ""};
}

export const NOT_FOUND = () => new Response("404 Not Found", {status: 404});
export const UNPROCESSABLE_ENTITY = () => new Response("422 Unprocessable Content", {status: 422});
export const INTERNAL_SERVER_ERROR = () => new Response("500 Internal Server Error", {status: 500});
