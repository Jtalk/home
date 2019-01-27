import React, {Component} from 'react';
import './App.css';
import Header from './header/header';
import HomeGrid from "./home/home-grid";
import {Container} from "semantic-ui-react";
import Footer from "./footer/footer";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Blog from "./blog/blog";
import WebError from "./error/web-error";

class App extends Component {
    render() {
        return <Router>
            <div className="main-content-pushable">
                <Switch>
                    <Route exact path="/" render={this.home.bind(this)}/>
                    <Route exact path="/blog" render={this.blog.bind(this)}/>
                    <Route render={this.error.bind(this)}/>
                </Switch>
                <Footer/>
            </div>
        </Router>
    }

    home(match) {
        return this.page("About", <HomeGrid ownerName="Vasya Pupkin"/>);
    }

    blog(match) {
        return this.page("Blog", <Blog/>);
    }

    error(match) {
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
