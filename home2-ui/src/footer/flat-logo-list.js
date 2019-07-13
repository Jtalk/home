import React from "react";

const LOGO_HEIGHT = '40px';

export default class FlatLogoList extends React.Component {

    render() {
        return this.props.logos.map((logo, i) => {
            var style = {};
            if (i > 0 && this.props.spacing) {
                style = {marginLeft: this.props.spacing + ' !important'};
            }
            return <a key={logo.name} href={logo.href} style={style}>
                <img src={logo.src} height={LOGO_HEIGHT} alt={logo.name}/>
            </a>
        });
    }
}