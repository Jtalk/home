import _identity from "lodash/identity";
import { useMemo } from "react";
import { useLoadingStatus } from "./index";

export default function usePaginatedResultMapper(swrResult, dataMapper = _identity) {
  const { error, data } = swrResult;
  const loading = useLoadingStatus(swrResult);
  return useMemo(() => {
    const pagination = data?.pagination;
    const mappedData = data && dataMapper(data?.data);
    const errorMessage = error?.message || error;
    return { data: mappedData, pagination, error: errorMessage, loading };
  }, [data, dataMapper, error, loading]);
}
