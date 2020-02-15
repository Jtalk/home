import {OwnerRequests} from "./ajax/owner-requests";
import {FooterRequests} from "./ajax/footer-requests";
import {ImagesRequests} from "./ajax/images-requests";
import {ProjectsRequests} from "./ajax/projects-requests";
import {ArticlesRequests} from "./ajax/articles-requests";
import {TagsRequests} from "./ajax/tags-requests";

export class Ajax {

    constructor() {
        this.footer = new FooterRequests();
        this.images = new ImagesRequests();
        this.owner = new OwnerRequests(this.images);
        this.projects = new ProjectsRequests(this.images);
        this.articles = new ArticlesRequests();
        this.tags = new TagsRequests();
    }
}