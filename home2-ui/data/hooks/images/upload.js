import { useCallback, useState } from "react";
import { Uploading } from "../global/enums";
import { superagentUploadFile } from "../../ajax";
import { imagesApiUrl, pageUrl } from "./get";
import { mutate } from "swr";

export function useImageUploader(page) {
  const [status, setStatus] = useState();
  const [error, setError] = useState();
  const uploader = useCallback(
    async ({ name, file }) => {
      setStatus(Uploading.UPLOADING);
      setError(null);
      try {
        const result = await superagentUploadFile(imagesApiUrl, name, file);
        setStatus(Uploading.UPLOADED);
        setError(null);
        await mutate(pageUrl(page));
        return result;
      } catch (e) {
        console.error(`Error uploading image ${name}`, e);
        setStatus(Uploading.ERROR);
        setError(e?.message || e);
      }
    },
    [page]
  );
  return { status, error, uploader };
}
