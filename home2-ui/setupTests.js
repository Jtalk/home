import getConfig from "next/config";

jest.mock("next/config");
getConfig.mockImplementation(() => ({}));
