import {ERROR_ACTION, WAIT_FOR_ACTION} from "redux-wait-for-action";
import {Action} from "./action";

export const ownerActions = {
    load: () => ({type: Action.LOAD, [WAIT_FOR_ACTION]: Action.LOADED, [ERROR_ACTION]: Action.LOAD_ERROR})
}
