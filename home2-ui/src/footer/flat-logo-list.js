import React from "react";

export default class FlatLogoList extends React.Component {

    render() {
        return this.props.logos.map((logo, i) => {
            var style = {};
            if (i > 0) {
                style = {marginLeft: '30px !important'};
            }
            return <a key={logo.name} href={logo.href}>
                <img src={logo.src} height={logo.height} alt={logo.name} style={style}/>
            </a>
        });
    }
}