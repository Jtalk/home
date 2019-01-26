import React, {Component} from 'react';
import './App.css';
import Header from './header/header';
import HomeGrid from "./home/home-grid";
import {Container} from "semantic-ui-react";
import Footer from "./footer/footer";

class App extends Component {
    render() {
        return <div className="main-content-pushable">
            <Container className="main-content-pusher framed">
                <Header ownerName="Vasya Pupkin"/>
                <HomeGrid ownerName="Vasya Pupkin"/>
            </Container>
            <Footer/>
        </div>
    }
}

export default App;
