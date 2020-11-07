import what from "what.js";

export function formatDateTime(date) {
  switch (what(date)) {
    case "date":
      return date.toLocaleString();
    case "number":
    case "string":
      return formatDateTime(new Date(date));
    case "undefined":
    case "null":
      return date;
    default:
      throw Error(`Unknown date: ${date}`);
  }
}
