export const Action = {
    LOAD: Symbol("articles load"),
    LOADED: Symbol("articles loaded"),
    LOAD_ONE: Symbol("single article load"),
    LOADED_ONE: Symbol("single article loaded"),
    LOAD_ONE_ERROR: Symbol("single article load error"),
    LOAD_ERROR: Symbol("articles load error"),
    UPDATE: Symbol("article update"),
    UPDATED: Symbol("article updated"),
    UPDATE_ERROR: Symbol("article update error"),
    DELETE: Symbol("articles delete"),
    DELETED: Symbol("articles deleted"),
    DELETE_ERROR: Symbol("articles delete error"),
};
