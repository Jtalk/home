import React from "react";
import {Menu} from "semantic-ui-react";

export default class HeaderOwner extends React.Component {

    render() {
        // Avoid ugly margin if owner name has not yet been loaded
        let margin = this.props.ownerName ? '10px' : '0px';
        return <Menu.Item>
            <img src="/images/icon16.png" style={{height: '16px', width: '16px', marginRight: margin}} alt="Icon"/>
            <b>{this.props.ownerName}</b>
        </Menu.Item>
    }
}