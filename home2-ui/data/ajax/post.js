import api, { superagent } from "./api";

export default async function superagentPostJson(url, data, printData = false) {
  try {
    const sa = await superagent();
    console.info(`Posting`, url, printData ? data : "<secret>");
    let response = await sa.post(url, data).use(api);
    console.info(`Post complete`, url, response.status, response.body);
    return response.body;
  } catch (e) {
    console.error(`Error posting`, url, e);
    throw e;
  }
}
