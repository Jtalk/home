import {Action} from "./index";
import {ERROR_ACTION, WAIT_FOR_ACTION} from "redux-wait-for-action";
import {DEFAULT_PAGE_SIZE} from "../articles";

export const articleActions = {
    load: () => ({
        type: Action.LOAD,
        data: {
            page: 0,
            pageSize: DEFAULT_PAGE_SIZE,
            publishedOnly: true,
        },
        [WAIT_FOR_ACTION]: Action.LOADED,
        [ERROR_ACTION]: Action.LOAD_ERROR
    }),
    loadOne: (id) => ({
        type: Action.LOAD_ONE, data: id, [WAIT_FOR_ACTION]: Action.LOADED_ONE, [ERROR_ACTION]: Action.LOAD_ONE_ERROR
    }),
}
