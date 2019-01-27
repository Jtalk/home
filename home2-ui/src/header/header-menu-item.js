import React from "react";
import {Link} from "react-router-dom";
import {Menu} from "semantic-ui-react";

class HeaderMenuItem extends React.Component {

    render() {
        if (this.props.active) {
            return <Menu.Item active>{this.props.title}</Menu.Item>
        } else {
            return <Link to={this.props.href} className="item">{this.props.title}</Link>
        }
    }

}

export default HeaderMenuItem;