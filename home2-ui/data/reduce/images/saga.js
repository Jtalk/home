import getConfig from "next/config";
import {call, put, takeEvery, takeLatest} from "redux-saga/effects";
import {action, error} from "../global/actions";
import {Action} from "./action";

const {publicRuntimeConfig: config} = getConfig();

export function* watchImages() {
    yield takeLatest(Action.LOAD, ({data}) => load(data));
    yield takeEvery(Action.UPLOAD, ({data: {update}}) => upload(update.description, update.file));
    yield takeEvery(Action.DELETE, ({data}) => delete_(data.id));
}

function* load(page) {
    try {
        const ImageRequests = yield call(() => import("../../ajax/images-requests"));
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
        const ImageRequests = yield call(() => import("../../ajax/images-requests"));
        let result = yield call(ImageRequests.upload, description, file);
        yield put(action(Action.UPLOADED, toInternalImageData(result)));
    } catch (e) {
        console.error(`Cannot upload image "${description}"`, e);
        yield put(error(Action.UPLOAD_ERROR, e.toLocaleString(), {error: e}));
    }
}

function* delete_(id) {
    try {
        const ImageRequests = yield call(() => import("../../ajax/images-requests"));
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
