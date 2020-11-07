import { createContext, useContext } from "react";

const PreloadContext = createContext({});
export default PreloadContext;

export function usePreloadContext() {
  return useContext(PreloadContext);
}
