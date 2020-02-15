import * as request from "superagent";
import api from "../../utils/superagent-api";
import {apiDelay} from "../../utils/test-api-delay";
import _ from "lodash";

export class ArticlesRequests {

    async load(page, pageSize) {
        let response = await request.get(`/blog/articles?page=${page}&pageSize=${pageSize}`)
            .use(api);
        await apiDelay();
        let result = _.mapKeys(response.body, (v, k) => k === "data" ? "articles" : k);
        result.articles = result.articles.map(datesFromRest);
        return result;
    }

    async loadOne(articleId) {
        let response = await request.get(`/blog/articles/${articleId}`)
            .use(api);
        await apiDelay();
        return datesFromRest(response.body);
    }

    async update(id, update) {
        update = datesToRest(update);
        let response = await request.put(`/blog/articles/${id}`, update)
            .use(api);
        console.info(`Article ${id} updated with ${response.status}: ${response.text}`);
        return datesFromRest(response.body);
    }

    async remove(id) {
        await request.delete(`/blog/articles/${id}`)
            .use(api);
        await apiDelay();
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