// https://community.cloudflare.com/t/timeout-with-fetch/25249/5

export function isEmpty(text: string): boolean {
    return text === null || text === undefined || text === '' || text.trim() === '';
}

export async function promiseTimeoutRace<T>(thePromise: Promise<T>, timeout = 120000): Promise<T | null> {
    try {
        let signal = new Promise(resolve => setTimeout(resolve, timeout));

        let race = await Promise.race([thePromise, signal]);

        if (race !== null && race !== undefined) {
            // @ts-ignore
            return race;
        }
    } catch (e) {
        console.error('promiseTimeoutRace: ', e);
    }
    return null;
}

export async function fetchWithTimeout(fetchPromise: Promise<Response>, timeout = 120000): Promise<Response | null> {
    return promiseTimeoutRace(fetchPromise, timeout);
}

export async function readRequestBody(request: Request): Promise<any> {
    try {
        if (request.method !== 'GET') {
            let contentType = request.headers.get('content-type');

            if (contentType.includes('application/json')) {
                return await request.json();
            } else if (contentType.includes('form')) {
                let formData = await request.formData();
                let body = {};
                for (let entry of formData.entries()) {
                    body[entry[0]] = entry[1];
                }
                return {text: body};
            } else {
                return {text: request.text()};
            }
        }
    } catch (e) {
        console.error('readRequestBody: ', e);
    }
    return {text: ''};
}

export function postBearer(data: object, apikey: string): any {
    return {
        headers: {
            Authorization: `Bearer ${apikey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(data),
    };
}

export const JSON_HEADER = {
    'content-type': 'application/json;charset=UTF-8',
};
export const HTML_HEADER = {
    'content-type': 'text/html;charset=UTF-8',
};

export const NOT_FOUND = () => new Response('404 Not Found', {status: 404});
export const UNPROCESSABLE_ENTITY = () => new Response('422 Unprocessable Content', {status: 422});
export const INTERNAL_SERVER_ERROR = () => new Response('500 Internal Server Error', {status: 500});
