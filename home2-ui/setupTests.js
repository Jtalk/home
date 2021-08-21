import * as Enzyme from "enzyme/build";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17/build";
import getConfig from "next/config";

Enzyme.configure({ adapter: new Adapter() });
jest.mock("next/config");
getConfig.mockImplementation(() => ({}));
