import {Login} from "./login-state";
import {useAuthentication} from "./context";

export function useLoginStatus() {
    const {status} = useAuthentication();
    return status;
}

export function useLoggedIn() {
    return useLoginStatus() === Login.LOGGED_IN;
}

export function useUsername() {
    const {state} = useAuthentication();
    return state?.username;
}

export function useLoginError() {
    const {error} = useAuthentication();
    return error;
}

export function useLoginHandler() {
    const {login} = useAuthentication();
    return login;
}

export function useLogoutHandler() {
    const {logout} = useAuthentication();
    return logout;
}
