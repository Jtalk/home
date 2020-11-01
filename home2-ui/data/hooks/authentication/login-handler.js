import {useAuthentication} from "./context";

export function useLoginHandler() {
    const {login} = useAuthentication() || {};
    return login;
}

export function useLoginError() {
    const {error} = useAuthentication() || {};
    return error;
}
