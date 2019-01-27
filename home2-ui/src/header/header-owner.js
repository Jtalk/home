import React from "react";
import {Menu} from "semantic-ui-react";

class HeaderOwner extends React.Component {

    render() {
        return <Menu.Item>
            <img src="/images/icon16.png" style={{height: '16px', width: '16px', marginRight: '10px'}} alt="Icon"/>
            <b>{this.props.ownerName}</b>
        </Menu.Item>
    }
}

export default HeaderOwner;