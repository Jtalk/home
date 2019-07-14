import {OwnerRequests} from "./ajax/owner-requests";
import {FooterRequests} from "./ajax/footer-requests";

export class Ajax {

    constructor() {
        this.owner = new OwnerRequests();
        this.footer = new FooterRequests();
    }
}