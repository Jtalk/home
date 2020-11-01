import {Deleting, Loading, Updating} from "./reduce/global/enums";
import {useCallback, useMemo, useState} from "react";
import {superagentDelete, superagentPut} from "./ajax/superagent-api";
import {mutate} from "swr";

export function useLoadingStatus(swrState) {
    if (!swrState.data && !swrState.error) {
        return Loading.LOADING;
    }
    if (!!swrState.error) {
        return Loading.ERROR;
    } else {
        return Loading.READY;
    }
}

export function useUpdater(url, updateBody = true) {
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

export function useDeleter(url) {
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
