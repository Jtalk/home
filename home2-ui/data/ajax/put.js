import api, { superagent } from "./api";

export default async function superagentPut(url, data) {
  try {
    const sa = await superagent();
    console.info(`Putting`, url, data);
    let response = await sa.put(url, data).use(api);
    console.info(`Put complete`, url, response.status, response.body);
    return response.body;
  } catch (e) {
    console.error(`Error putting`, url, e);
    throw e;
  }
}
