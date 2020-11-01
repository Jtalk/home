import useSWR from "swr";
import {articlesApiUrl} from "./list";
import useLoadingStatus from "../global/swr-common/loading-status";

export function useArticle(id) {
    const {data} = useArticleLoader(id);
    return data;
}

export function useArticleLoader(id) {
    return useSWR(id && `${articlesApiUrl}/${id}`);
}

export function useArticleLoading(id) {
    const result = useArticleLoader(id);
    return useLoadingStatus(result);
}
