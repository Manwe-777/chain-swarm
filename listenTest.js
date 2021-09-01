const dht = require("@hyperswarm/dht");

async function main() {
  const node = dht({
    ephemeral: true,
  });

  const hyperPeers = [];

  const bufferKey = Buffer.from(
    "23a8aed15e661c3f3d4844ec122a47fcbaf8136bfc9e338d7f8608018d18e2d4",
    "hex"
  );

  node
    .lookup(bufferKey)
    .on("data", (data) => {
      data.peers.forEach((p) => {
        if (!hyperPeers.includes(p.host)) {
          hyperPeers.push(p.host);
        }
      });
    })
    .on("end", () => {
      console.log(hyperPeers);
      // unannounce it and shutdown
      node.unannounce(bufferKey, { port: 4001 }, function () {
        node.destroy();
        process.exit(1);
      });
    });
}

main();
