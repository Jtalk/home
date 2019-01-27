import React from "react";
import {Grid} from "semantic-ui-react";
import OwnerCard from "./owner-card";
import LatestPosts from "./latest-posts";
import "../bbcode/tags";
import parser from "bbcode-to-react";

class HomeGrid extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            text: "[h1]Header [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam" +
                " est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius" +
                " modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima" +
                " veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea" +
                " commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil" +
                " molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?[/p]"
        };
    }

    render() {
        return <Grid stackable centered>
            <Grid.Row>
                {/*{ Something about footer-margin style was below }*/}
                <Grid.Column width={10} as="main">
                    {parser.toReact(this.state.text)}
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