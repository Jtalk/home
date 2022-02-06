export default function health(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  return res.end("OK");
}
