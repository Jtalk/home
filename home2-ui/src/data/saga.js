import {all} from "redux-saga/effects"
import {watchOwner} from "./reduce/owner";
import {initAjax} from "./reduce/ajax";
import {watchProjects} from "./reduce/projects";
import {watchLatestArticles} from "./reduce/latest-articles";
import {watchAuthentication} from "./reduce/authentication";
import {watchFooter} from "./reduce/footer";
import {watchTags} from "./reduce/tags";
import {watchImages} from "./reduce/images";

export function* rootSaga() {
    yield all([
        initAjax(),
        watchTags(),
        watchOwner(),
        watchFooter(),
        watchImages(),
        watchProjects(),
        watchAuthentication(),
        watchLatestArticles(),
    ]);
}