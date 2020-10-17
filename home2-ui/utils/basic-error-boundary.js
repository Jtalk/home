import React from "react";

export class BasicErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.render = this.render.bind(this);
        this.componentDidCatch = this.componentDidCatch.bind(this);
    }

    static getDerivedStateFromError(error) {
        return { error: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error in boundary", errorInfo, error);
    }

    render() {
        if (this.state.error) {
            return <React.Fragment/>
        } else {
            return this.props.children;
        }
    }
}
