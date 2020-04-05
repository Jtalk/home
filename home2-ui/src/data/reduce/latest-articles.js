import {fromJS, Map} from "immutable";
import {Loading} from "./global/enums";
import {action, error, newState} from "./global/actions";
import {useData, useLastError, useLoading} from "./global/hook-barebone";

const MAX_PAGE_SIZE = 100;

export const Action = {
    LOAD: Symbol("latest articles load"),
    LOADED: Symbol("latest articles loaded"),
    LOAD_ERROR: Symbol("latest articles load error"),
};

export function latestArticles(state = fromJS({loading: Loading.INITIAL, data: []}), action) {
    switch (action.type) {
        case Action.LOAD:
            return fromJS({loading: Loading.LOADING, errorMessage: undefined, uploading: undefined, data: []});
        case Action.LOADED:
            return Map({loading: Loading.READY, errorMessage: undefined, data: fromJS(action.data)});
        case Action.LOAD_ERROR:
            return state.merge({loading: Loading.ERROR, errorMessage: action.errorMessage});
        default:
            return state;
    }
}

export function useLatestArticles(PREVIEW_SIZE) {
    return useData(load, [PREVIEW_SIZE], "latest-articles");
}

export function useLatestArticlesLoading() {
    return useLoading("latest-articles");
}

export function useLatestArticlesError() {
    return useLastError("latest-articles");
}

function load(ajax, previewSize) {
    if (previewSize > MAX_PAGE_SIZE) {
        throw Error(`The requested preview size ${previewSize} exceeds max ${MAX_PAGE_SIZE}`);
    }
    return async dispatch => {
        dispatch(action(Action.LOAD));
        try {
            let {articles} = await ajax.articles.load(0, previewSize, true);
            dispatch(newState(Action.LOADED, articles));
        } catch (e) {
            console.error(`Cannot load ${previewSize} latest articles `, e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}
