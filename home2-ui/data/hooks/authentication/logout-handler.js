import { useAuthentication } from "./context";

export function useLogoutHandler() {
  const { logout } = useAuthentication() || {};
  return logout;
}
