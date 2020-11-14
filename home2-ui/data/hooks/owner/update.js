import useUpdater from "../global/swr-common/updater";
import { ownerApiUrl } from "./get";
import { useCallback } from "react";
import { useImageUploader } from "../images";

export function useOwnerUpdater() {
  const { updater: nestedUpdater, error, status } = useUpdater(ownerApiUrl);
  const { uploader: imageUploader } = useImageUploader(0);
  const updater = useCallback(
    async (data, { photo }) => {
      if (photo) {
        const uploaded = await imageUploader("owner-photo", photo);
        data.photoId = uploaded.id;
      }
      return nestedUpdater(data);
    },
    [imageUploader, nestedUpdater]
  );
  return { updater, error, status };
}
