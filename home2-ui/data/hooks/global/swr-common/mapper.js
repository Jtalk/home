import { useMemo } from "react";
import _identity from "lodash/identity";
import { useLoadingStatus } from "./index";

export default function useResultMapper(swrResult, dataMapper = _identity) {
  const { error, data } = swrResult;
  const loading = useLoadingStatus(swrResult);
  return useMemo(() => {
    const mappedData = data && dataMapper(data);
    const errorMessage = error?.message || error;
    return { data: mappedData, error: errorMessage, loading };
  }, [data, dataMapper, error, loading]);
}
