import find from "lodash/find";
import useSWR from "swr";
import superagentFetch from "../../ajax/fetch";
import preload from "../../preload/preload";
import { usePreloadContext } from "../../preload/context";
import useResultMapper from "../global/swr-common/mapper";
import { useCallback, useMemo } from "react";

export const projectsApiUrl = "/projects";

export function useProjects(withUnpublished = false) {
  const preload = usePreloadContext();
  const result = useSWR(`${projectsApiUrl}?published=${!withUnpublished}`, superagentFetch, {
    initialData: preload?.projects,
  });
  return useResultMapper(result);
}

export function useProject(id, withUnpublished = false) {
  const result = useProjects(withUnpublished);
  const getProject = useCallback(
    (data) => {
      if (!data) return;
      return find(data, (p) => p.id === id) || data[0];
    },
    [id]
  );
  return useResultMapper(result, getProject);
}

export async function preloadProjects() {
  return preload("projects", superagentFetch(projectsApiUrl));
}
