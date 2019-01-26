import React from "react";
import {Menu} from "semantic-ui-react";

class HeaderMenuItem extends React.Component {

    render() {
        return <Menu.Item active={this.props.active}>
            {this.props.title}
        </Menu.Item>
    }
}

export default HeaderMenuItem;