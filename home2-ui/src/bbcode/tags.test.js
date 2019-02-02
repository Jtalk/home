import "../bbcode/tags";
import {formatMarkup} from "../utils/text-markup";
import {shallow} from "enzyme";
import * as Enzyme from "enzyme/build";
import Adapter from "enzyme-adapter-react-16/build";
import React from "react";
import {expect} from "chai";

Enzyme.configure({adapter: new Adapter()});

describe("BBCode Tags", () => {
    it("should process custom tags", () => {
        let data = "[h1]Header1[/h1][h2]Header2[/h2]ExtraText[h3]Header3[/h3][h4]Header4[/h4][h5]Header5[/h5]" +
            "[abbr title=\"Full Text\"]FT[/abbr]OtherText[p]Paragraph[/p][p][/p]Loose text";
        let result = shallow(<div>{formatMarkup(data)}</div>);
        expect(result.find("h1").props()).to.eql({children: ["Header1"]});
        expect(result.find("h2").props()).to.eql({children: ["Header2"]});
        expect(result.find("h3").props()).to.eql({children: ["Header3"]});
        expect(result.find("h4").props()).to.eql({children: ["Header4"]});
        expect(result.find("h5").props()).to.eql({children: ["Header5"]});
        expect(result.find("abbr").props()).to.eql({children: ["FT"], title: "Full Text"});
        expect(result.find("p").at(0).props()).to.eql({children: ["Paragraph"]});
        expect(result.find("p").at(1).props()).to.eql({children: []});
    });
});