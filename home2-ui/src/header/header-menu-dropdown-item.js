import React from "react";
import {Dropdown} from "semantic-ui-react";

class HeaderMenuDropdownItem extends React.Component {

    render() {
        return <Dropdown item text={this.props.title}>
            <Dropdown.Menu>
                 {this.props.items.map(item => <Dropdown.Item active={item.active} text={item.title} key={item.title}/>)}
            </Dropdown.Menu>
        </Dropdown>
    }
}

export default HeaderMenuDropdownItem;