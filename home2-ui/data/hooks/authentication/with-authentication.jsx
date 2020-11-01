import React, {useCallback, useEffect, useMemo, useReducer} from "react";
import {Login} from "./login-state";
import storageAvailable from "storage-available";
import {AuthenticationContext} from "./context";
import superagentPostJson from "../../ajax/post";
import superagentPostForm from "../../ajax/post-form";

const SESSION_EXPIRY_KEY = "session-expiry";
const SESSION_USERNAME_KEY = "session-username";

const defaultContext = {
    status: null,
    state: null,
    error: null,
}

const Action = {
    RESTORE: "authentication restore",
    LOGGING_IN: "authentication logging in",
    LOGIN: "authentication login",
    TRIGGER_REFRESH: "authentication trigger refresh",
    REFRESH: "authentication refresh",
    LOGOUT: "authentication logout",
    ERROR: "authentication error",
};

function authReducer(state, action) {
    switch (action.type) {
        case Action.RESTORE:
            return {status: Login.LOGGED_IN, state: action.data, error: null};
        case Action.LOGGING_IN:
            return {status: Login.LOGGING_IN, state: null, error: null};
        case Action.LOGIN:
            return {status: Login.LOGGED_IN, state: action.data, error: null};
        case Action.REFRESH:
            return {status: Login.LOGGED_IN, state: {...state.state, expiry: action.data}, error: null};
        case Action.LOGOUT:
            return {status: null, state: null, error: null};
        case Action.ERROR:
            return {status: Login.ERROR, state: null, error: action.data};
        default:
            return state;
    }
}

export default function withAuthentication(Component) {
    const Wrapper = function(props) {
        return <WithAuthentication>
            <Component {...props}/>
        </WithAuthentication>
    }
    Wrapper.displayName = `withAuthentication(${Component.displayName || Component.name || "Component"})`;
    return Wrapper;
}

function WithAuthentication({children}) {
    const [reducerState, dispatch] = useReducer(authReducer, defaultContext);
    const {status, state, error} = reducerState;

    useEffect(() => {
        if (!process.browser) return;
        const state = localstoreAuthentication();
        if (!state) {
            console.log("No saved credentials found in local store, unauthenticated");
            return;
        }
        if (needsRefresh(state)) {
            refreshAuthentication().then(expiry => {
                if (expiry) {
                    dispatch({type: Action.INIT, data: state});
                } else {
                    // Else our auth has expired already, cleaning the local store
                    console.info("The authentication data in the local store has expired, cleaning it up");
                    clearLocalStore();
                }
            }).catch(e => {
                dispatch({type: Action.ERROR, data: e?.message || e});
            });
        }
    }, []);

    useEffect(() => {
        if (status !== Login.LOGGED_IN || !state?.expiry) return;
        const expiry = state?.expiry && new Date(state?.expiry);
        let now = new Date();
        let timeUntilRefresh = expiry.getTime() - now.getTime();
        if (timeUntilRefresh <= 0) {
            console.error("Auth token refresh was triggered after the token had already expired", expiry && expiry.toISOString(), ">", now.toISOString());
            return;
        }
        timeUntilRefresh = timeUntilRefresh / 2; // Try refreshing halfway through expiry
        console.debug("Waiting for ", timeUntilRefresh, "ms to refresh the auth token");
        const id = setTimeout(() => {
            refreshAuthentication()
                .then(newExpiry => {
                    dispatch({type: Action.REFRESH, data: newExpiry})
                    updateLocalStore({expiry: newExpiry});
                })
                .catch(e => {
                    console.error(`Problem refreshing authentication`, e);
                    // No error state dispatch, the existing auth still holds
                })
        }, timeUntilRefresh);
        return () => clearTimeout(id);
    }, [status, state])

    const login = useCallback(async form => {
        dispatch({type: Action.LOGGING_IN});
        try {
            const {expiry} = await superagentPostForm("/login", form);
            console.info("Login success");
            dispatch({type: Action.LOGIN, data: {expiry, username: form.login}});
            return true;
        } catch (e) {
            console.error("Error logging in", e);
            if (e.status >= 400 && e.status < 500) {
                console.warn("Login failure:", e.response.body.errors);
                dispatch({type: Action.ERROR, data: (e.response.body.errors || ["unknown"]).join(" | ")});
            } else {
                console.error("Server error", e.response);
                dispatch({type: Action.ERROR, data: "Unknown error while trying to log in"});
            }
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await superagentPostJson("/logout");
            dispatch({type: Action.LOGOUT});
            clearLocalStore();
        } catch (e) {
            console.error(`Error logging out`, e);
        }
    }, []);

    const ctx = useMemo(() => ({status, state, error, login, logout}), [status, state, error, login, logout]);

    return <AuthenticationContext.Provider value={ctx}>
        {children}
    </AuthenticationContext.Provider>
}

function localstoreAuthentication() {
    let expiry = localStoreGet(SESSION_EXPIRY_KEY);
    let username = localStoreGet(SESSION_USERNAME_KEY);
    if (expiry && username) {
        return {expiry, username};
    } else {
        return null;
    }
}

function needsRefresh(state) {
    const expiry = new Date(state.expiry);
    return expiry && expiry.getTime() > Date.now();
}

async function refreshAuthentication() {
    const response = await superagentPostJson("/login/refresh");
    return response.expiry;
}

function updateLocalStore(actionData) {
    localStoreSet(SESSION_EXPIRY_KEY, actionData.expiry);
    if (actionData.username) {
        localStoreSet(SESSION_USERNAME_KEY, actionData.username);
    }
}

function clearLocalStore() {
    localStoreRemove(SESSION_EXPIRY_KEY);
    localStoreRemove(SESSION_USERNAME_KEY);
}

function localStoreGet(name) {
    if (storageAvailable("localStorage")) {
        return window.localStorage.getItem(name);
    } else {
        return undefined;
    }
}

function localStoreSet(name, value) {
    if (storageAvailable("localStorage")) {
        return window.localStorage.setItem(name, value);
    } else {
        console.warn("Local store not available, cannot save authentication information between sessions");
    }
}

function localStoreRemove(name) {
    if (storageAvailable("localStorage")) {
        return window.localStorage.removeItem(name);
    } else {
        console.warn("Local store not available, cannot remove authentication information between sessions");
    }
}
