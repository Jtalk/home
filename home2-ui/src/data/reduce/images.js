import {fromJS} from "immutable";
import {action, error, newState} from "./global/actions";
import config from 'react-global-configuration';
import {Deleting, Loading, Uploading} from "./global/enums";

// let testimages = [
//     {
//         description: "A test image 1",
//         href: "/images/avatar.png",
//         uploadedDateTime: new Date(2018, 11, 6, 13, 35)
//     },
//     {description: "A test image 2", href: "/images/avatar.png", uploadedDateTime: new Date()},
//     {description: "A test image 3", href: "/images/avatar.png", uploadedDateTime: new Date(2016, 3, 6, 11, 3)},
//     {description: "A test image 4", href: "/images/avatar.png", uploadedDateTime: new Date()},
//     {description: "A test image 5", href: "/images/avatar.png", uploadedDateTime: new Date()},
// ];

const defaultImages = fromJS({
    images: [],
    pagination: { total: 0 },
});

const initialState = fromJS({
    upload: {
        status: undefined,
        error: undefined,
    },
    loading: {
        status: undefined,
        error: undefined,
    },
    data: defaultImages,
});

const Action = {
    INIT: Symbol("init"),
    LOADING: Symbol("loading"),
    LOADED: Symbol("loaded"),
    LOAD_ERROR: Symbol("load error"),
    UPLOADING: Symbol("uploading"),
    UPLOADED: Symbol("uploaded"),
    UPLOAD_ERROR: Symbol("upload error"),
    DELETED: Symbol("deleted"),
    DELETE_ERROR: Symbol("delete error"),
};

export function images(state = initialState, action) {
    switch (action.type) {
        case Action.INIT:
            return state.merge(fromJS({loading: undefined, uploading: undefined, deletion: undefined}));
        case Action.LOADING:
            return state.merge(fromJS({loading: {status: Loading.LOADING}, data: defaultImages}));
        case Action.LOADED:
            return fromJS({loading: {status: Loading.READY}, data: fromJS(action.data)});
        case Action.LOAD_ERROR:
            return state.merge(fromJS({loading: {status: Loading.ERROR, error: {message: action.errorMessage}}}));
        case Action.UPLOADING:
            return state.merge(fromJS({uploading: {status: Uploading.UPLOADING}}));
        case Action.UPLOADED:
            let pagination = state.get("data").get("pagination").toJS();
            let images = state.get("data").get("images");
            if (pagination.current === 0) {
                images = images.withMutations(is => growPreservingSize(is, action.data, pagination.pageSize));
            }
            return state.merge(fromJS({uploading: {status: Uploading.UPLOADED}, data: {images, pagination}}));
        case Action.UPLOAD_ERROR:
            return state.merge(fromJS({uploading: {status: Uploading.ERROR, error: {message: action.errorMessage}}}));
        case Action.DELETED:
            return state.merge(fromJS({deletion: {status: Deleting.DELETED}}));
        case Action.DELETE_ERROR:
            return state.merge(fromJS({deletion: {status: Deleting.DELETE_ERROR, error: {message: action.errorMessage}}}));
        default:
            return state;
    }
}

export function load(ajax, page) {
    page = page || 0;
    return async dispatch => {
        dispatch(action(Action.INIT));
        reload(ajax, page)(dispatch);
    }
}

function reload(ajax, page) {
    return async dispatch => {
        dispatch(action(Action.LOADING));
        try {
            let imagesData = await ajax.images.load(page);
            imagesData = toInternalImagesData(imagesData);
            dispatch(newState(Action.LOADED, fromJS(imagesData)));
        } catch (e) {
            console.error("Cannot load images list", e);
            dispatch(error(Action.LOAD_ERROR, e.toLocaleString()));
        }
    }
}

export function upload(ajax, description, file, currentPage) {
    return async dispatch => {
        dispatch(action(Action.UPLOADING));
        try {
            let response = await ajax.images.upload(description, file);
            dispatch(newState(Action.UPLOADED, toInternalImageData(response.body)));
            if (currentPage > 0) {
                // Optimisation: we don't reload it for page=0 as we can handle uploading here locally.
                // page=0 is expected to be the most common scenario for this function.
                reload(ajax, currentPage)(dispatch);
            }
        } catch (e) {
            console.error(`Cannot upload image "${description}"`, e);
            dispatch(error(Action.UPLOAD_ERROR, e.toLocaleString()));
        }
    }
}

export function delete_(ajax, id, currentState) {
    return async dispatch => {
        try {
            let wasLoaded = !!currentState.images.find(i => i.id === id);
            await ajax.images.delete(id);
            dispatch(newState(Action.DELETED, id));
            if (wasLoaded) {
                dispatch(reload(ajax, currentState.pagination.current));
            }
        } catch (e) {
            console.error(`Cannot delete image ${id}`, e);
            dispatch(error(Action.DELETE_ERROR, e.toLocaleString()));
        }
    }
}

function asImgSrc(id) {
    let apiPrefix = config.get().api;
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

function growPreservingSize(collection, newItem, collectionMaxSize) {
    let withNewImage = collection.unshift(newItem);
    if (collectionMaxSize > withNewImage.length) {
        return withNewImage.pop();
    } else {
        return withNewImage
    }
}