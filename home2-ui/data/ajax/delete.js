import api, { superagent } from "./api";

export default async function superagentDelete(url) {
  try {
    const sa = await superagent();
    console.info(`Deleting`, url);
    let response = await sa.delete(url).use(api);
    console.info(`Delete complete`, url, response.status, response.body);
    return response.body;
  } catch (e) {
    console.error(`Error deleting`, url, e);
    throw e;
  }
}
