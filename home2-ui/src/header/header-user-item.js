import React from "react";
import {Dropdown} from "semantic-ui-react";

class HeaderUserItem extends React.Component {

    render() {
        if (!this.props.user) {
            return null;
        }
        return <Dropdown item text={this.props.user} icon="user">
            <Dropdown.Menu>
                 <Dropdown.Item text="Logout"/>
            </Dropdown.Menu>
        </Dropdown>
    }
}

export default HeaderUserItem;