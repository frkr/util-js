"use strict";

export function isEmpty(text: any): boolean {
    if (text === null || text === undefined) {
        return true;
    }
    let rt = (text + '').trim();
    return rt.length === 0 || rt === 'null' || rt === 'undefined' || rt === 'unknown';
}

export function isEmptyOr(text: any, or: string = ''): string {
    return isEmpty(text) ? or : (text + '');
}

export function onlyNumbers(text: string): string {
    return new String(text).replaceAll(/[^0-9]/g, '');
}

const alpha = /[^A-Za-z áéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕ]/g
const alphaDot = /[^A-Za-z áéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕ\\.]/g

export function onlyAplha(text: string): string {
    return new String(text).replaceAll(alpha, '');
}

export function onlyAplhaDot(text: string): string {
    return new String(text).replaceAll(alphaDot, '');
}

export function limitText(value: string, limit = 50) {
    let data = onlyAplhaDot(value).trim();
    if (data.length > limit) {
        return data.substring(0, limit);
    }
    return data;
}

export function onlyEmail(text: string): string {
    try {
        return text.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)[0].toLowerCase();
    } catch (e) {
    }

    return null;
}

// https://community.cloudflare.com/t/timeout-with-fetch/25249/5

export async function promiseTimeoutRace<T>(thePromise: Promise<T>, timeout = 120000): Promise<T | null> {
    try {
        let signal = sleep(timeout);

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

export function sleep(time: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time));
}

export async function fetchWithTimeout(fetchPromise: Promise<Response>, timeout = 120000): Promise<Response | null> {
    return promiseTimeoutRace(fetchPromise, timeout);
}

export async function readRequestBody(request: Request) {
    try {
        if (request.method !== 'GET') {
            let contentType = request.headers.get('content-type');

            if (includes(contentType, 'application/json')) {
                return await request.json();
            } else if (includes(contentType, 'form')) {
                let formData = await request.formData();
                let body = {};
                formData.forEach((value, key) => {
                    body[key] = value;
                });
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

interface postBearerProps {
    data?: any,
    headers?: any,
    method?: "POST" | "PUT" | "GET" | "DELETE" | string,
    apikey: string,
}

export function postBearer({headers, apikey, method, data}: postBearerProps): any {
    let heds = {
        Authorization: `Bearer ${apikey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }

    if (headers) {
        heds = {
            ...heds,
            ...headers,
        }
    }
    let ret = {
        headers: heds,
        method: method || (!data ? "GET" : "POST"),
    }
    if (data) {
        ret['body'] = JSON.stringify(data)
    }
    return ret
}

export const JSON_HEADER = {
    'Content-Type': 'application/json;charset=UTF-8',
};
export const TEXT_HEADER = {
    'Content-Type': 'text/plain;charset=UTF-8',
}
export const HTML_HEADER = {
    'Content-Type': 'text/html;charset=UTF-8',
};

export const HTTP_CREATED = () => new Response('201 Created', {status: 201});
export const HTTP_OK = () => new Response('200 Ok', {status: 200});
export const HTTP_NOT_FOUND = () => new Response('404 Not Found', {status: 404});
export const HTTP_UNPROCESSABLE_ENTITY = () => new Response('422 Unprocessable Content', {status: 422});
export const HTTP_INTERNAL_SERVER_ERROR = () => new Response('500 Internal Server Error', {status: 500});

export const HTTP_UNAUTHORIZED = () => new Response('401 Unauthorized', {status: 401});

export function includesArr(arr: [], item: string) {
    for (let i = 0; i < arr.length; i++) {
        if (includes(arr[i], item)) {
            return true;
        }
    }
    return false;
}

export function includes(str: string, item: string) {
    return str === null ? false : str.indexOf(item) !== -1;
}

export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
};

export async function streamToArrayBuffer(stream: ReadableStream, streamSize: number) {
    let result = new Uint8Array(streamSize);
    let bytesRead = 0;
    const reader = stream.getReader();
    while (true) {
        const {done, value} = await reader.read();
        if (done) {
            break;
        }
        result.set(value, bytesRead);
        bytesRead += value.length;
    }
    return result;
}

export async function downloadBlob(url: string): Promise<Blob> {
    return await (await fetch(url, {
            headers: {
                'User-Agent': 'PostmanRuntime/7.26.8',
            },
            method: 'GET',
        },
    )).blob();
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function randomHEX(size = 16): Promise<string> {

    return Array.from(
        new Uint8Array(
            await crypto.subtle.digest("sha-512",
                crypto.getRandomValues(new Uint8Array(size))
            ))).map(b => b.toString(16).padStart(2, "0"))
        .join("")

}

/**
 * Fisher-Yates shuffle
 * @param array
 * @returns same pointer array shuffled
 */
export function shuffle(array: Array<any>): Array<any> {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

export function getUniqueListBy(arr: any[], key: string) {
    // @ts-ignore
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

export function toBinary(string) {
    const codeUnits = new Uint16Array(string.length);
    for (let i = 0; i < codeUnits.length; i++) {
        codeUnits[i] = string.charCodeAt(i);
    }
    // @ts-ignore
    return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
}

export function fromBinary(encoded) {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    // @ts-ignore
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
}
