import {fromJS} from "immutable";
import {action, error} from "./global/actions";
import config from 'react-global-configuration';
import {Deleting, Loading, Uploading} from "./global/enums";
import {useDeleter2, useLastError, useLoader, useLoading, useUpdater2, useUpdating} from "./global/hook-barebone";
import {useImmutableSelector} from "../redux-store";
import {call, put, takeEvery, takeLatest} from "redux-saga/effects";
import {fetchAjax} from "./ajax";
import {addPage, defaultPages} from "./global/paginated-data";
import {useMemo} from "react";

const initialState = fromJS({
    upload: {
        status: undefined,
        error: undefined,
    },
    loading: {
        status: undefined,
        error: undefined,
    },
    data: defaultPages(),
});

const Action = {
    INIT: Symbol("images init"),
    LOAD: Symbol("images loading"),
    LOADED: Symbol("images loaded"),
    LOAD_ERROR: Symbol("images load error"),
    UPLOAD: Symbol("images uploading"),
    UPLOADED: Symbol("images uploaded"),
    UPLOAD_ERROR: Symbol("images upload error"),
    DELETE: Symbol("images delete"),
    DELETED: Symbol("images deleted"),
    DELETE_ERROR: Symbol("images delete error"),
};

export function images(state = initialState, action) {
    switch (action.type) {
        case Action.INIT:
            return state.merge(fromJS({loading: undefined, uploading: undefined, deletion: undefined}));
        case Action.LOAD:
            return state.merge(fromJS({loading: {status: Loading.LOADING}}));
        case Action.LOADED:
            return state.merge(fromJS({
                loading: {status: Loading.READY},
                data: addPage(state.get("data"), action.data.images, action.data.pagination),
            }));
        case Action.LOAD_ERROR:
            return state.merge(fromJS({loading: {status: Loading.ERROR, error: {message: action.errorMessage}}}));
        case Action.UPLOAD:
            return state.merge(fromJS({uploading: {status: Uploading.UPLOADING}, deleting: undefined}));
        case Action.UPLOADED:
            return state.merge(fromJS({uploading: {status: Uploading.UPLOADED}, data: defaultPages()}));
        case Action.UPLOAD_ERROR:
            return state.merge(fromJS({uploading: {status: Uploading.ERROR, error: {message: action.errorMessage}}}));
        case Action.DELETE:
            return state.merge(fromJS({deletion: {status: Deleting.DELETING}, uploading: undefined}));
        case Action.DELETED:
            return state.merge(fromJS({deletion: {status: Deleting.DELETED}, data: defaultPages()}));
        case Action.DELETE_ERROR:
            return state.merge(fromJS({
                deletion: {
                    status: Deleting.DELETE_ERROR, error: {message: action.errorMessage}
                }
            }));
        default:
            return state;
    }
}

export function* watchImages() {
    yield takeLatest(Action.LOAD, ({data}) => load(data));
    yield takeEvery(Action.UPLOAD, ({data: {update}}) => upload(update.description, update.file));
    yield takeEvery(Action.DELETE, ({data}) => delete_(data.id));
}

export function useImages(page) {
    let images = useImmutableSelector("images", "data", "pages");
    let loadAction = useMemo(() => action(Action.LOAD, page), [page]);
    useLoader(loadAction, !images[page]);
    return images[page] || [];
}

export function useImagesTotalCount() {
    return useImmutableSelector("images", "data", "total") || 0;
}

export function useImagesLoading() {
    return useLoading("images", ["loading", "status"]);
}

export function useImagesUploading() {
    return useUpdating("images", ["uploading", "status"]);
}

export function useImagesUploadingError() {
    return useLastError("images", ["uploading", "error", "message"]);
}

export function useImageUploader() {
    return useUpdater2(Action.UPLOAD);
}

export function useImageDeleter() {
    return useDeleter2(Action.DELETE);
}

function* load(page) {
    let ajax = yield fetchAjax();
    try {
        let imagesData = yield call(ajax.images.load, page);
        imagesData = toInternalImagesData(imagesData);
        yield put(action(Action.LOADED, imagesData));
    } catch (e) {
        console.error("Cannot load images list", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString()));
    }
}

function* upload(description, file) {
    let ajax = yield fetchAjax();
    try {
        let response = yield call(ajax.images.upload, description, file);
        yield put(action(Action.UPLOADED, toInternalImageData(response.body)));
    } catch (e) {
        console.error(`Cannot upload image "${description}"`, e);
        yield put(error(Action.UPLOAD_ERROR, e.toLocaleString()));
    }
}

function* delete_(id) {
    let ajax = yield fetchAjax();
    try {
        yield call(ajax.images.delete, id);
        yield put(action(Action.DELETED, id));
    } catch (e) {
        console.error(`Cannot delete image ${id}`, e);
        yield put(error(Action.DELETE_ERROR, e.toLocaleString()));
    }
}

function asImgSrc(id) {
    let apiPrefix = config.get("api.prefix");
    return `${apiPrefix}/images/${id}`;
}

function toInternalImagesData(serverImagesData) {
    let result = Object.assign({}, serverImagesData);
    result.images = serverImagesData.data.map(toInternalImageData);
    delete result.data;
    return result;
}

function toInternalImageData(image) {
    let result = Object.assign({}, image);
    result.src = asImgSrc(image.id);
    result.uploadedDateTime = image.uploaded["$date"];
    result.description = image.metadata && image.metadata.description;
    delete result.metadata;
    console.log("uploaded", image);
    return result;
}
