export const Uploading = {
    UPLOADING: Symbol('uploading'),
    UPLOADED: Symbol('uploaded'),
    ERROR: Symbol('upload_error'),
};
export const Updating = {
    UPDATING: Symbol('updating'),
    UPDATED: Symbol('update_ready'),
    ERROR: Symbol('update_error'),
};
export const Loading = {
    LOADING: Symbol('loading'),
    READY: Symbol('data_ready'),
    ERROR: Symbol('data_error'),
};
export const Deleting = {
    DELETING: Symbol('deleting'),
    DELETED: Symbol('deleted'),
    DELETE_ERROR: Symbol('delete_error'),
};