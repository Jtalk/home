import prefix from "superagent-prefix";
import delay, { isApiDelayEnabled } from "./delay";
import { ApiPrefix } from "./prefix";

export async function superagent() {
  return await import("superagent");
}

export default function api(request) {
  request = request.use(prefix(ApiPrefix())).withCredentials();
  if (isApiDelayEnabled()) {
    request = request.use(delayed);
  }
  return request;
}

function delayed(saRequest) {
  let saThen = saRequest.then.bind(saRequest);
  saRequest.then = (resolve, reject) => {
    saThen(
      (v) => delay().then(() => resolve(v), reject),
      (error) => reject(error)
    );
  };
  return saRequest;
}
