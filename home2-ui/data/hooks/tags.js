import useSWR from "swr";

const knownTagsApiUrl = "/blog/tags";

export function useAvailableTags() {
    const result = useAvailableTagsLoader();
    return result.data;
}

function useAvailableTagsLoader() {
    return useSWR(knownTagsApiUrl);
}
