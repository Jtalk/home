import React from "react";
import {Link} from "react-router-dom";
import {Menu} from "semantic-ui-react";

export default class HeaderMenuItem extends React.Component {

    render() {
        let {title, href} = this.props.link;
        if (this.props.activeLink === title) {
            return <Menu.Item active>{title}</Menu.Item>
        } else {
            return <Link to={href} className="item">{title}</Link>
        }
    }

    static buildLink(title, href) {
        return {
            title: title,
            href: href,
            key: title
        }
    }
}