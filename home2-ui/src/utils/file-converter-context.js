import {useState, createContext, useContext} from "react";
import React from "react";
import what from "what.js";

export class FileConverter {
    async toDataUrl(file) {
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
}

export const defaultFileConverter = new FileConverter();
export const FileConverterContext = createContext();

export const FileConverterProvider = function ({children, fileConverter}) {
    fileConverter = fileConverter || defaultFileConverter;
    return <FileConverterContext.Provider value={fileConverter}>
        {children}
    </FileConverterContext.Provider>
};

export function useDataUrl(target) {
    let [dataUrl, setDataUrl] = useState();
    let [currentSource, setCurrentSource] = useState();
    let conv = useContext(FileConverterContext);
    if (!target) {
        dataUrl && setDataUrl(null);
        return null;
    }
    if (currentSource === target) {
        return dataUrl;
    }
    conv.toDataUrl(target).then(dataUrl => {
        setDataUrl(dataUrl);
        setCurrentSource(target);
    }, reject => console.error("Error converting an image file into a data URL", reject));
}
