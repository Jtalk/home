import {Logger} from "./logger";

describe("Logger", () => {
  it('info', () => {
    var log = Logger.of("testsc");
    var results = [];
    log.handler = mockHandler(results);
    log.info("Test Msg");
    expect(results).toMatchObject([{message: "Test Msg", level: "INFO", scope: "testsc"}]);
  });
  it('info with exception', () => {
    var log = Logger.of("testsc");
    var results = [];
    log.handler = mockHandler(results);
    log.info("Test Msg", Error("Test Exception"));
    expect(results).toMatchObject([{message: "Test Msg", level: "INFO", scope: "testsc", exception: {message: "Test Exception"}}]);
  });
  it('error', () => {
    var log = Logger.of("testsc");
    var results = [];
    log.handler = mockHandler(results);
    log.error("Test Msg");
    expect(results).toMatchObject([{message: "Test Msg", level: "ERROR", scope: "testsc"}]);
  });
  it('error with exception', () => {
    var log = Logger.of("testsc");
    var results = [];
    log.handler = mockHandler(results);
    log.error("Test Msg", Error("Test Exception"));
    expect(results).toMatchObject([{message: "Test Msg", level: "ERROR", scope: "testsc", exception: {message: "Test Exception"}}]);
  });
  it('debug', () => {
    var log = Logger.of("testsc");
    var results = [];
    log.handler = mockHandler(results);
    log.debug("Test Msg");
    expect(results).toMatchObject([{message: "Test Msg", level: "DEBUG", scope: "testsc"}]);
  });
  it('debug with exception', () => {
    var log = Logger.of("testsc");
    var results = [];
    log.handler = mockHandler(results);
    log.debug("Test Msg", Error("Test Exception"));
    expect(results).toMatchObject([{message: "Test Msg", level: "DEBUG", scope: "testsc", exception: {message: "Test Exception"}}]);
  });
});

function mockHandler(store) {
  return (e) => store.push(e)
}