import React, { useEffect, useRef } from "react";
import { InfoMessage } from "../messages/info-message";
import { IdImage } from "../image/id-image";
import Markdown from "markdown-to-jsx";
import { Preview } from "./text-area-preview";
import { PreviewOnly } from "./text-area-preview-only";

const languages = {
  javascript: async () => import("highlight.js/lib/languages/javascript"),
  cpp: async () => import("highlight.js/lib/languages/cpp"),
  java: async () => import("highlight.js/lib/languages/java"),
  scala: async () => import("highlight.js/lib/languages/scala"),
  kotlin: async () => import("highlight.js/lib/languages/kotlin"),
  erlang: async () => import("highlight.js/lib/languages/erlang"),
  python: async () => import("highlight.js/lib/languages/python"),
  perl: async () => import("highlight.js/lib/languages/perl"),
  bash: async () => import("highlight.js/lib/languages/bash"),
  x86asm: async () => import("highlight.js/lib/languages/x86asm"),
  yaml: async () => import("highlight.js/lib/languages/yaml"),
  json: async () => import("highlight.js/lib/languages/json"),
  xml: async () => import("highlight.js/lib/languages/xml"),
  properties: async () => import("highlight.js/lib/languages/properties"),
  ini: async () => import("highlight.js/lib/languages/ini"),
};

async function highlight(targetRef, languagesInText) {
  console.info(`Loading highlighting for`, languagesInText);
  if (languagesInText.length > 0) {
    const hljs = await import("highlight.js/lib/core");
    const promises = languagesInText
      .map((language) => [language, languages[language]])
      .filter((loader) => !!loader[1])
      .map(async ([language, loader]) => {
        const module = await loader();
        hljs.registerLanguage(language, module.default);
      });
    await Promise.all(promises);
    if (languagesInText.length > 0) {
      targetRef.current.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightBlock(block);
      });
    }
  }
}

function useHighlightJS(targetRef, text) {
  useEffect(() => {
    if (!text) return;
    if (typeof text !== "string") {
      console.error(`Unexpected markdown child: expected string, but found`, typeof text, text);
      return;
    }
    const languagesInText = extractLanguages(text);
    highlight(targetRef, languagesInText).catch((err) => {
      console.error(`Could not load highlighting for`, languagesInText, err);
    });
  }, [targetRef, text]);
}

// We're using a random string to wrap our text. This way we can still utilise the power of
// <Markdown/> and keep our article preview system nice to work with.
const WRAPPER_COMPONENT_NAME = "UGxeb0I7MWsgq5YuVDXxlfH0DlKS1nfu5m3vZviiU7hbPXhfyYlN1RqoLoz4OzOz";

export default function MarkdownTextArea({ children, preview, ...rest }) {
  let opts = {
    overrides: {
      InfoMessage,
      IdImage,
      preview: {
        component: Preview,
      },
      [WRAPPER_COMPONENT_NAME]: {
        component: preview ? PreviewOnly : Preview,
      },
    },
  };
  const rootRef = useRef();
  useHighlightJS(rootRef, children);
  if (typeof children !== "string") {
    throw Error("Markdown text area can only render textual content, but was " + typeof children);
  }

  return (
    <div ref={rootRef} {...rest}>
      <Markdown options={opts}>{`<${WRAPPER_COMPONENT_NAME}>${children}</${WRAPPER_COMPONENT_NAME}>`}</Markdown>
    </div>
  );
}

function extractLanguages(text) {
  const languagesInText = [];
  const regex = /```(\w+)/g;
  let m;
  while ((m = regex.exec(text))) {
    languagesInText.push(m[1]);
  }
  return languagesInText;
}
