import useUpdater from "../global/swr-common/updater";
import { projectsApiUrl } from "./get";
import { useCallback, useMemo } from "react";
import { useImageUploader } from "../images";

export function useProjectUpdater() {
  const updater = useUpdater(`${projectsApiUrl}?published=false`, false);
  const { updater: nestedUpdater } = updater;
  const { uploader: imageUploader } = useImageUploader(0);
  const updaterById = useCallback(
    async (id, body, logo) => {
      if (!id) {
        console.error(`ID not provided when updating project`);
        return;
      }
      if (logo) {
        const uploaded = await imageUploader(`project-${id}-logo`, logo);
        body.logoId = uploaded.id;
      }
      return nestedUpdater(body, `${projectsApiUrl}/${id}`);
    },
    [imageUploader, nestedUpdater]
  );
  return useMemo(() => ({ ...updater, updater: updaterById }), [updater, updaterById]);
}
