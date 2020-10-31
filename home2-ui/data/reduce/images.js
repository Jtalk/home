import {action, error} from "./global/actions";
import {Deleting, Loading, Uploading} from "./global/enums";
import {useDeleter2, useLastError, useLoader, useLoading, useUpdater2, useUpdating} from "./global/hook-barebone";
import {useImmutableSelector} from "../redux-store";
import {call, put, takeEvery, takeLatest} from "redux-saga/effects";
import {addPage, defaultPages} from "./global/paginated-data";
import {useMemo} from "react";
import getConfig from "next/config";
import {HYDRATE} from "next-redux-wrapper";
import merge from "lodash/merge";

const {publicRuntimeConfig: config} = getConfig();

const initialState = {
    upload: {
        status: null,
        error: null,
    },
    loading: {
        status: null,
        error: null,
    },
    data: defaultPages(),
};

const Action = {
    INIT: "images init",
    LOAD: "images loading",
    LOADED: "images loaded",
    LOAD_ERROR: "images load error",
    UPLOAD: "images uploading",
    UPLOADED: "images uploaded",
    UPLOAD_ERROR: "images upload error",
    DELETE: "images delete",
    DELETED: "images deleted",
    DELETE_ERROR: "images delete error",
};

export const segment = "images";

export function reducer(state = initialState, action) {
    switch (action.type) {
        case Action.INIT:
            return merge({}, state, {loading: null, uploading: null, deletion: null});
        case Action.LOAD:
            return merge({}, state, {loading: {status: Loading.LOADING}});
        case Action.LOADED:
            return merge({}, state, {
                loading: {status: Loading.READY},
                data: addPage(state.data, action.data.images, action.data.pagination),
            });
        case Action.LOAD_ERROR:
            return merge({}, state, {loading: {status: Loading.ERROR, error: {message: action.errorMessage}}});
        case Action.UPLOAD:
            return merge({}, state, {uploading: {status: Uploading.UPLOADING}, deleting: null});
        case Action.UPLOADED:
            return merge({}, state, {uploading: {status: Uploading.UPLOADED}, data: defaultPages()});
        case Action.UPLOAD_ERROR:
            return merge({}, state, {uploading: {status: Uploading.ERROR, error: {message: action.errorMessage}}});
        case Action.DELETE:
            return merge({}, state, {deletion: {status: Deleting.DELETING}, uploading: null});
        case Action.DELETED:
            return merge({}, state, {deletion: {status: Deleting.DELETED}, data: defaultPages()});
        case Action.DELETE_ERROR:
            return merge({}, state, {
                deletion: {
                    status: Deleting.DELETE_ERROR, error: {message: action.errorMessage}
                }
            });
        case HYDRATE:
            // Admin-only activity, no server-side rendering involved
            return state;
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
    let images = useImmutableSelector(segment, "data", "pages");
    let loadAction = useMemo(() => action(Action.LOAD, page), [page]);
    useLoader(loadAction, !images[page]);
    return images[page] || [];
}

export function useImagesTotalCount() {
    return useImmutableSelector(segment, "data", "total") || 0;
}

export function useImagesLoading() {
    return useLoading(segment, ["loading", "status"]);
}

export function useImagesUploading() {
    return useUpdating(segment, ["uploading", "status"]);
}

export function useImagesUploadingError() {
    return useLastError(segment, ["uploading", "error", "message"]);
}

export function useImageUploader() {
    return useUpdater2(Action.UPLOAD);
}

export function useImageDeleter() {
    return useDeleter2(Action.DELETE);
}

function* load(page) {
    try {
        const ImageRequests = yield call(() => import("../ajax/images-requests"));
        let imagesData = yield call(ImageRequests.load, page);
        imagesData = toInternalImagesData(imagesData);
        yield put(action(Action.LOADED, imagesData));
    } catch (e) {
        console.error("Cannot load images list", e);
        yield put(error(Action.LOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}

function* upload(description, file) {
    try {
        const ImageRequests = yield call(() => import("../ajax/images-requests"));
        let result = yield call(ImageRequests.upload, description, file);
        yield put(action(Action.UPLOADED, toInternalImageData(result)));
    } catch (e) {
        console.error(`Cannot upload image "${description}"`, e);
        yield put(error(Action.UPLOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}

function* delete_(id) {
    try {
        const ImageRequests = yield call(() => import("../ajax/images-requests"));
        yield call(ImageRequests.delete, id);
        yield put(action(Action.DELETED, id));
    } catch (e) {
        console.error(`Cannot delete image ${id}`, e);
        yield put(error(Action.DELETE_ERROR, e.toLocaleString(), {error: e}));
    }
}

function asImgSrc(id) {
    let apiPrefix = config.api.prefix;
    return `${apiPrefix}/images/${id}`;
}

function toInternalImagesData(serverImagesData) {
    let result = {...serverImagesData};
    result.images = serverImagesData.data.map(toInternalImageData);
    delete result.data;
    console.debug(`Converted backend image data to frontend:`, serverImagesData, result)
    return result;
}

function toInternalImageData(image) {
    let result = Object.assign({}, image);
    result.src = asImgSrc(image.id);
    result.uploadedDateTime = image.uploaded["$date"];
    result.description = image.metadata && image.metadata.description;
    delete result.metadata;
    return result;
}
