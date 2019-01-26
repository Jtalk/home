import React, { Component } from 'react';
import './App.css';
import Header from './header/header';
import {Container} from "semantic-ui-react";

class App extends Component {
  render() {
    return (
      <div className="pushable">
        <div className="pusher">
          <Container>
            <Header ownerName="Vasya Pupkin"/>
          </Container>
        </div>
      </div>
    );
  }
}

export default App;
