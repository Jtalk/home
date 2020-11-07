import { useMemo } from "react";
import { useLoadingStatus } from "../global/swr-common";
import useSWR from "swr";
import { superagentFetch } from "../../ajax";
import getConfig from "next/config";

const { publicRuntimeConfig: config } = getConfig();

export const imagesApiUrl = "/images";
export const pageUrl = (page) => (page ? `${imagesApiUrl}?page=${page}` : imagesApiUrl);

export function useImages(page) {
  const { data } = useImagesLoader(page);
  return useMemo(() => {
    if (!data) return data;
    const { images, pagination } = data;
    return { pagination, images: images.map(toInternalImageData) };
  }, [data]);
}

export function useImagesTotalCount(page) {
  const { data } = useImagesLoader(page);
  return data?.pagination?.total;
}

export function useImagesLoading(page) {
  const result = useImagesLoader(page);
  return useLoadingStatus(result);
}

function useImagesLoader(page) {
  return useSWR(pageUrl(page), superagentFetch);
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
