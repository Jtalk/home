import React from "react";
import {Grid} from "semantic-ui-react";
import OwnerCard from "./owner-card";
import LatestPosts from "./latest-posts";

class HomeGrid extends React.Component {

    render() {
        return <Grid stackable centered>
            <Grid.Row>
                {/*{ Something about footer-margin style was below }*/}
                <Grid.Column width={10}>
                    I am Vasya!!!
                </Grid.Column>
                <Grid.Column width={4}>
                    <OwnerCard ownerPhotoUrl="/images/avatar.png"
                               ownerName="Vasya Pupkin"
                               ownerNickname="VPupkin"
                               ownerDescription="Very cool guy"
                               ownerEmail="vasya@example.com"/>
                   <LatestPosts/>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    }
}

export default HomeGrid;