import {useLocation} from "react-router";

export function useQuery() {
    let search = useLocation().search;
    return new URLSearchParams(search);
}

export function useQueryParam(name, defaultValue) {
    let q = useQuery();
    return q.get(name) || defaultValue;
}
