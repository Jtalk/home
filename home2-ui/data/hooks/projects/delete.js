import useDeleter from "../global/swr-common/deleter";
import { projectsApiUrl } from "./get";
import { useCallback, useMemo } from "react";

export function useProjectDeleter() {
  const result = useDeleter(projectsApiUrl);
  const { deleter: nestedDeleter } = result;
  const deleter = useCallback(
    async (id) => {
      if (!id) {
        console.error(`Cannot delete project without ID`);
        return;
      }
      return nestedDeleter(`${projectsApiUrl}/${id}`);
    },
    [nestedDeleter]
  );
  return useMemo(() => ({ ...result, deleter }), [deleter, result]);
}
