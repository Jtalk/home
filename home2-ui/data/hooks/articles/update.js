import useUpdater from "../global/swr-common/updater";
import {articlesApiUrl} from "./list";
import {useCallback, useMemo} from "react";

export function useArticleUpdater() {
    const result = useUpdater(articlesApiUrl);
    const {updater: nestedUpdater} = result;
    const updater = useCallback(async (id, update) => {
        if (!id) {
            console.error(`Cannot update article without ID`);
            return;
        }
        await nestedUpdater(update, `${articlesApiUrl}/${id}`);
    }, [nestedUpdater]);
    return useMemo(() => ({...result, updater}), [result, updater]);
}
