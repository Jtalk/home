import {useState} from "react";
import what from "what.js";

async function toDataUrl(file) {
    if (!file || typeof(file) === "string") {
        return file;
    }
    if (file instanceof File) {
        return new Promise(resolve => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsDataURL(file);
        });
    }
    throw Error(`Cannot convert to a data URL: unknown type ${what(file)}`);
}

export function useDataUrl(target) {
    let [dataUrl, setDataUrl] = useState();
    let [currentSource, setCurrentSource] = useState();
    if (!target) {
        dataUrl && setDataUrl(null);
        return null;
    }
    if (currentSource === target) {
        return dataUrl;
    }
    toDataUrl(target).then(dataUrl => {
        setDataUrl(dataUrl);
        setCurrentSource(target);
    }, reject => console.error("Error converting an image file into a data URL", reject));
}
