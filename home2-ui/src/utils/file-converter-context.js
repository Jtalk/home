import {useState, createContext, useContext} from "react";
import React from "react";

export class FileConverter {
    async fileToDataUrl(file) {
        return new Promise(resolve => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsDataURL(file);
        });
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

export function useDataUrl(fileHandler) {
    let [dataUrl, setDataUrl] = useState();
    let [currentFile, setCurrentFile] = useState();
    let conv = useContext(FileConverterContext);
    if (!fileHandler) {
        dataUrl && setDataUrl(null);
        return null;
    }
    if (currentFile === fileHandler) {
        return dataUrl;
    }
    conv.fileToDataUrl(fileHandler).then(dataUrl => {
        setDataUrl(dataUrl);
        setCurrentFile(fileHandler);
    });
}
