import find from "lodash/find";
import useSWR from "swr";
import useLoadingStatus from "../global/swr-common/loading-status";
import superagentFetch from "../../ajax/fetch";

export const projectsApiUrl = "/projects";

export function useProjects(withUnpublished = false) {
  const result = useProjectsLoader(withUnpublished);
  return result.data;
}

export function useProject(id, withUnpublished = false) {
  const result = useProjectsLoader(withUnpublished);
  if (!result.data) return;
  return find(result.data, (p) => p.id === id) || result.data[0];
}

export function useProjectsLoader(withUnpublished) {
  return useSWR(`${projectsApiUrl}?published=${!withUnpublished}`, superagentFetch);
}

export function useProjectLoading(withUnpublished = false) {
  const result = useProjectsLoader(withUnpublished);
  return useLoadingStatus(result);
}
