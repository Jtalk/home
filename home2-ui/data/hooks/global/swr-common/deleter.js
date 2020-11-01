import {useCallback, useMemo, useState} from "react";
import {Deleting} from "../enums";
import {superagentDelete} from "../../../ajax";
import {mutate} from "swr";

export default function useDeleter(url) {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const deleter = useCallback(async deleteUrl => {
        setStatus(Deleting.DELETING);
        setError(null);
        try {
            await superagentDelete(deleteUrl || url);
            await mutate(url);
            setStatus(Deleting.DELETED);
            setError(null);
        } catch (e) {
            setStatus(Deleting.ERROR);
            setError(e?.message || e);
        }
    }, [url]);
    return useMemo(() => ({deleter, status, error}), [deleter, error, status]);
}
