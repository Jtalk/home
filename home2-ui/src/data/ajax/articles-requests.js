import * as request from "superagent";
import api from "./superagent-api";
import {mapKeys} from "lodash-es";

export class ArticlesRequests {

    async load(page, pageSize, publishedOnly = false) {
        console.debug(`Articles (page=${page}, pageSize=${pageSize}, published=${publishedOnly}) loading`);
        let response = await request.get(`/blog/articles?page=${page}&pageSize=${pageSize}&published=${publishedOnly}`)
            .use(api);
        console.debug(`Articles loaded with`, response.status, response.body);
        let result = mapKeys(response.body, (v, k) => k === "data" ? "articles" : k);
        result.articles = result.articles.map(datesFromRest);
        return result;
    }

    async loadOne(articleId) {
        console.debug(`Article ${articleId} loading`);
        let response = await request.get(`/blog/articles/${articleId}`)
            .use(api);
        console.debug(`Article ${articleId} loaded with`, response.status, response.body);
        return datesFromRest(response.body);
    }

    async update(id, update) {
        console.info(`Article ${id} updating`, update);
        update = datesToRest(update);
        let response = await request.put(`/blog/articles/${id}`, update)
            .use(api);
        console.info(`Article ${id} updated with`, response.status, response.body);
        return datesFromRest(response.body);
    }

    async remove(id) {
        console.info(`Article ${id} deleting`);
        let response = await request.delete(`/blog/articles/${id}`)
            .use(api);
        console.info(`Article ${id} deleted with`, response.status, response.body);
        return response.body;
    }
}

function asDate(restDate) {
    let result = Date.parse(restDate);
    if (isNaN(result)) {
        throw Error(`Cannot parse ${restDate} as date`);
    }
    return new Date(result);
}

function asString(date) {
    return date.toISOString();
}

function datesFromRest(obj) {
    obj.created = obj.created && asDate(obj.created);
    return obj;
}

function datesToRest(obj) {
    obj.created = obj.created && asString(obj.created);
    return obj;
}