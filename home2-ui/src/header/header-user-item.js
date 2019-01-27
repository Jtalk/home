import React from "react";
import {Dropdown} from "semantic-ui-react";
import {Link} from "react-router-dom";

class HeaderUserItem extends React.Component {

    render() {
        if (!this.props.user) {
            return null;
        }
        return <Dropdown item text={this.props.user} icon="user">
            <Dropdown.Menu>
                <Link className="dropdown item" to="/admin/bio">Edit Bio</Link>
                <Dropdown.Item text="Logout"/>
            </Dropdown.Menu>
        </Dropdown>
    }
}

export default HeaderUserItem;