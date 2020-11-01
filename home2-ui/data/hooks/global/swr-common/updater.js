import {useCallback, useMemo, useState} from "react";
import {Updating} from "../enums";
import {superagentPut} from "../../../ajax";
import {mutate} from "swr";

export default function useUpdater(url, updateBody = true) {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const updater = useCallback(async (data, updateUrl) => {
        setStatus(Updating.UPDATING);
        setError(null);
        try {
            const body = await superagentPut(updateUrl || url, data);
            if (updateBody) {
                await mutate(url, body, false);
            } else {
                await mutate(url);
            }
            setStatus(Updating.UPDATED);
            setError(null);
        } catch (e) {
            setStatus(Updating.ERROR);
            setError(e?.message || e);
        }
    }, [updateBody, url]);
    return useMemo(() => ({updater, status, error}), [error, status, updater]);
}
