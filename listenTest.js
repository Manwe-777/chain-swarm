const DHT = require("@hyperswarm/dht");
const pump = require("pump");
const net = require("net");

function main() {
  const port = 1234;
  const publicKey = Buffer.from(
    "e679064098b19fc00b0f128799c73a5d633573e70e111d862d6e91085b45613a",
    "hex"
  );

  const node = new DHT();

  const server = net.createServer(function (servsock) {
    const socket = node.connect(publicKey);
    pump(servsock, socket, servsock);
    console.log("Opened connection at port " + port);
  });

  server.listen(port, 'localhost');
}

main();
