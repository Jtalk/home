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

export const MarkdownTextArea = function ({children}) {
    let opts = {
        overrides: {
            InfoMessage,
        }
    };
    const rootRef = useRef();
    useEffect(() => {
        rootRef.current.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }, [children]);

    return <div ref={rootRef}>
        <Markdown options={opts}>
            {children}
        </Markdown>
    </div>
};
