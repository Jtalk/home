import useDeleter from "../global/swr-common/deleter";
import { articlesApiUrl } from "./list";
import { useCallback, useMemo } from "react";

export function useArticlesDeleter() {
  const result = useDeleter(articlesApiUrl);
  const { deleter: nestedDeleter } = result;
  const deleter = useCallback(
    async (id) => {
      if (!id) {
        console.error(`Cannot delete article without ID`);
        return;
      }
      return nestedDeleter(`${articlesApiUrl}/${id}`);
    },
    [nestedDeleter]
  );
  return useMemo(() => ({ ...result, deleter }), [deleter, result]);
}
