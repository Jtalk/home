import React, {useEffect, useRef} from "react";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js/lib/highlight";

import "highlight.js/styles/idea.css";

import javascript from "highlight.js/lib/languages/javascript";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import scala from "highlight.js/lib/languages/scala";
import kotlin from "highlight.js/lib/languages/kotlin";
import erlang from "highlight.js/lib/languages/erlang";
import python from "highlight.js/lib/languages/python";
import perl from "highlight.js/lib/languages/perl";
import bash from "highlight.js/lib/languages/bash";
import asm86 from "highlight.js/lib/languages/x86asm";
import yaml from "highlight.js/lib/languages/yaml";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import properties from "highlight.js/lib/languages/properties";
import {InfoMessage} from "./messages";
import {IdImage} from "./image";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("java", java);
hljs.registerLanguage("scala", scala);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("erlang", erlang);
hljs.registerLanguage("python", python);
hljs.registerLanguage("perl", perl);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("asm86", asm86);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("properties", properties);

// We're using a random string to wrap our text. This way we can still utilise the power of
// <Markdown/> and keep our article preview system nice to work with.
const WRAPPER_COMPONENT_NAME = "UGxeb0I7MWsgq5YuVDXxlfH0DlKS1nfu5m3vZviiU7hbPXhfyYlN1RqoLoz4OzOz";

export const MarkdownTextArea = function ({children, preview}) {
    let opts = {
        overrides: {
            InfoMessage,
            IdImage,
            preview: {
                component: Preview
            },
            [WRAPPER_COMPONENT_NAME]: {
                component: preview ? PreviewOnly : Preview
            }
        }
    };
    const rootRef = useRef();
    useEffect(() => {
        rootRef.current.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightBlock(block);
        });
    }, [children]);

    if (typeof children !== "string") {
        throw Error("Markdown text area can only render textual content, but was " + typeof children);
    }

    return <div ref={rootRef}>
        <Markdown options={opts}>
            {`<${WRAPPER_COMPONENT_NAME}>${children}</${WRAPPER_COMPONENT_NAME}>`}
        </Markdown>
    </div>
};


export const Preview = function ({children}) {
    return children;
};

export const PreviewOnly = function ({children}) {
    let previewChildren = [];
    React.Children.forEach(children, child => {
        if (child.type === Preview) {
            previewChildren.push(child);
        }
    });
    if (previewChildren.length <= 0) {
        console.warn("Cannot find a preview tag among", children, "using a default preview");
        return <p>
            <i>No preview available for this entry</i>
        </p>
    }
    return previewChildren;
};
