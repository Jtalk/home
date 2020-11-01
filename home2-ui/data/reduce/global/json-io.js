import mapValues from "lodash/mapValues";
import isPlainObject from "lodash/isPlainObject";

const SERVICE_OBJECT_MARKER = "__serialised_type__";

export function serialiseJSON(state) {
  return mapDeep(state, v => {
    if (!v) return v;
    if (v instanceof Date) {
      return { [SERVICE_OBJECT_MARKER]: "date", value: v.toISOString() };
    }
    return v;
  });
}

export function deserialiseJSON(json) {
  return mapDeep(json, v => {
    if (!v) return v;
    if (v[SERVICE_OBJECT_MARKER] === "date") {
      return new Date(v.value);
    }
    return v;
  })
}

function mapDeep(target, f) {
  if (Array.isArray(target)) {
    return target.map(v => mapDeep(v, f));
  } else if (isPlainObject(target) && !target[SERVICE_OBJECT_MARKER]) {
    return mapValues(target, v => mapDeep(v, f));
  } else {
    return f(target);
  }
}
