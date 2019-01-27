import React, {Component} from 'react';
import './App.css';
import Header from './header/header';
import About from "./home/about";
import {Container} from "semantic-ui-react";
import Footer from "./footer/footer";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Blog from "./blog/blog";
import WebError from "./error/web-error";
import Projects from "./projects/projects";

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ownerName: "Vasya Pupkin"
        };
    }

    render() {
        document.title = this.state.ownerName;
        return <Router>
            <div className="main-content-pushable">
                <Switch>
                    <Route exact path="/" render={this.home.bind(this)}/>
                    <Route path="/projects" render={this.projects.bind(this)}/>
                    <Route path="/blog" render={this.blog.bind(this)}/>
                    <Route render={this.error.bind(this)}/>
                </Switch>
                <Footer/>
            </div>
        </Router>
    }

    home() {
        return this.page("About", <About ownerName={this.state.ownerName}/>);
    }

    projects() {
        return this.page("Projects", <Projects ownerName={this.state.ownerName}/>)
    }

    blog() {
        return this.page("Blog", <Blog ownerName={this.state.ownerName}/>);
    }

    error() {
        return this.page(null, <WebError httpCode={404} message={"Not found"}/>);
    }

    page(activeLink, mainComponent) {
        return <Container className="main-content-pusher framed">
            <Header ownerName="Vasya Pupkin" activeLink={activeLink}/>
            {mainComponent}
        </Container>
    }
}



export default App;
