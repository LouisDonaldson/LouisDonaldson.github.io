//#region module imports
const http = require("http");
const fs = require("fs").promises;
//#endregion

//#region Global variables
const port = 8000;
const homepage = "/index.html";

const refresh_log = true;
//#endregion

//#region Classes
class Server {
  constructor(port = 8000) {
    http.createServer(this.Listener).listen(8000);
  }
  async Listener(req, res) {
    //#region Listener Functions
    const CheckMarkupFiles = async (url) => {
      let file;
      if (url == "/") {
        file = await server.FindFile(homepage);
      } else {
        file = await server.FindFile(url);
      }

      return file;
    };
    //#endregion

    server.LogRequest(req); // logs server requests

    try {
      const file = await CheckMarkupFiles(req.url);
      res.writeHead(200);
      res.end(file);
    } catch (e) {
      server.LogError(e);
      res.writeHead(404);
      res.end("Error finding file");
    }
  }
  async FindFile(url) {
    // url will be "/urlname"
    const file = await fs.readFile(__dirname + "/markup" + url);
    if (file) {
      return file;
    } else {
      throw new Error("Error finding file.");
    }
  }
  async LogRequest(req) {
    const temp_log = `--
${new Date().toISOString()},
Request: "${req.url}",
Type: ${req.method},
From: ${req.socket.remoteAddress},
JSON Headers: ${JSON.stringify(req.headers)}`;

    console.log(temp_log);
  }

  async LogError(e) {
    console.error(e);
  }
}

//#endregion

//#region Code start point
const server = new Server(port);
//#endregion
