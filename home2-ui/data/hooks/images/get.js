import { useCallback } from "react";
import useSWR from "swr";
import { superagentFetch } from "../../ajax";
import getConfig from "next/config";
import usePaginatedResultMapper from "../global/swr-common/paginated-mapper";

const { publicRuntimeConfig: config } = getConfig();

export const imagesApiUrl = "/images";
export const pageUrl = (page) => (page ? `${imagesApiUrl}?page=${page}` : imagesApiUrl);

export function useImages(page) {
  const result = useSWR(pageUrl(page), superagentFetch);
  const mapper = useCallback((images) => images.map(toInternalImageData), []);
  return usePaginatedResultMapper(result, mapper);
}

function asImgSrc(id) {
  let apiPrefix = config.api.prefix;
  return `${apiPrefix}/images/${id}`;
}

function toInternalImageData(image) {
  let result = Object.assign({}, image);
  result.src = asImgSrc(image.id);
  result.uploadedDateTime = image.uploaded["$date"];
  result.description = image.metadata && image.metadata.description;
  delete result.metadata;
  return result;
}
