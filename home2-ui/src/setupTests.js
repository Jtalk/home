import * as Enzyme from "enzyme/build";
import Adapter from "enzyme-adapter-react-16/build";
import config from "react-global-configuration";

Enzyme.configure({adapter: new Adapter()});

config.set({}, {freeze: false});
