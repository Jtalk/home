import * as Enzyme from "enzyme/build";
import Adapter from "enzyme-adapter-react-16/build";
import getConfig from "next/config";

Enzyme.configure({adapter: new Adapter()});
jest.mock("next/config");
getConfig.mockImplementation(() => ({}));
