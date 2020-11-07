import useSWR from "swr";
import {articlesApiUrl} from "./list";
import useLoadingStatus from "../global/swr-common/loading-status";
import superagentFetch from "../../ajax/fetch";

export function useArticle(id) {
    const {data} = useArticleLoader(id);
    return data;
}

export function useArticleLoader(id) {
    return useSWR(id && `${articlesApiUrl}/${id}`, superagentFetch);
}

export function useArticleLoading(id) {
    const result = useArticleLoader(id);
    return useLoadingStatus(result);
}
