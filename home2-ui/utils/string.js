import replaceString from "replace-string";

export function format(template, ...args) {
  let i = 0;
  return replaceString(template, "{}", () => args[i++]);
}
