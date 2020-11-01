import {useDeleter} from "../global/swr-common";
import {pageUrl} from "./get";

export function useImageDeleter(page) {
    return useDeleter(pageUrl(page));
}
