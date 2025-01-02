import * as changeCase from "change-case";
import * as _ from "lodash";
import apiClient from "@/lib/api-client.js";
import CryptoJS from 'crypto-js';
import {jwtDecode} from "jwt-decode";

function toCase(caseFunction, obj, recursive = false) {
    if (!!obj && typeof obj === 'object') {
        if (recursive) {
            if (Array.isArray(obj)) {
                return obj.map(item => {
                    return !!item && typeof item === 'object'
                        ? toCase(caseFunction, item, true)
                        : item;
                });
            } else {
                let newObj = {};

                for (const [key, value] of Object.entries(obj)) {
                    newObj[caseFunction(key)] = !!obj && typeof value === 'object'
                        ? toCase(caseFunction, value, true)
                        : value
                }

                return newObj;
            }
        } else {
            if (Array.isArray(obj)) {
                return obj.map(item => {
                    return !!item && typeof item === 'object'
                        ? toCase(caseFunction, item)
                        : item;
                });
            } else {
                let newObj = {};

                for (const [key, value] of Object.entries(obj)) {
                    newObj[caseFunction(key)] = value;
                }

                return newObj;
            }
        }
    } else {
        return obj
    }
}
export function keysToCamelCase(obj, recursive = false) {
    return toCase(changeCase.camelCase, obj, recursive);
}

export function keysToKebabCase(obj, recursive = false) {
    return toCase(changeCase.kebabCase, obj, recursive);
}

export function delay(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds)
    });
}

export function isRealObject(v) {
    return !!v && typeof v === 'object' && !Array.isArray(v) && Object.prototype.toString.call(v) === '[object Object]';
}

export function preventDefaultAndStopPropagation(e) {
    _.isFunction(e?.stopPropagation) && e.stopPropagation();
    _.isFunction(e?.preventDefault) && e.preventDefault();

    return false;
}

export async function base64ImageFromUrl(url) {
    if (!url) {
        return Promise.reject({message: "url is required"});
    }

    const headResponse = await apiClient.head(url);

    if (!headResponse.headers['content-type']?.startsWith('image/')) {
        return Promise.reject({message: "non-image Content-Type"});
    }

    const imageBlobResponse = await apiClient.get(url, {
        responseType: "blob",
        headers: {'Content-Type': null}
    });

    if (imageBlobResponse.data.size === 0) {
        return Promise.reject({message: "Invalid image blob data"});
    }

    const reader = new FileReader();
    reader.readAsDataURL(imageBlobResponse.data);

    return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

export function randomHash(length) {
    return CryptoJS.SHA256(CryptoJS.lib.WordArray.random(length || 256)).toString(CryptoJS.enc.Hex);
}

export function isJwtToken(str) {
    try {
        jwtDecode(str);

        return true;
    } catch (e) {
        return false;
    }
}

export default {
    keysToCamelCase,
    keysToKebabCase,
    delay,
    isRealObject,
    preventDefaultAndStopPropagation,
    base64ImageFromUrl,
    randomHash,
    isJwtToken
}