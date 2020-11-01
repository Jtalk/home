import {Loading} from "../enums";

export default function useLoadingStatus(swrState) {
    if (!swrState.data && !swrState.error) {
        return Loading.LOADING;
    }
    if (!!swrState.error) {
        return Loading.ERROR;
    } else {
        return Loading.READY;
    }
}
