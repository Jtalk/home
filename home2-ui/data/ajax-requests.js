import {OwnerRequests} from "./ajax/owner-requests";
import {FooterRequests} from "./ajax/footer-requests";
import {ImagesRequests} from "./ajax/images-requests";
import {ProjectsRequests} from "./ajax/projects-requests";
import {ArticlesRequests} from "./ajax/articles-requests";
import {TagsRequests} from "./ajax/tags-requests";
import {AuthenticationRequests} from "./ajax/authentication-requests";
import {SearchRequests} from "./ajax/search-requests";

export class Ajax {

    constructor() {
        this.authentication = new AuthenticationRequests();
        this.footer = new FooterRequests();
        this.images = new ImagesRequests();
        this.owner = new OwnerRequests(this.images);
        this.projects = new ProjectsRequests(this.images);
        this.articles = new ArticlesRequests();
        this.tags = new TagsRequests();
        this.search = new SearchRequests();
    }
}