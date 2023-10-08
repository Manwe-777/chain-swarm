import { Express } from "express";
import { ToolDb } from "mtgatool-db";
import moment from "moment";
import osu from "node-os-utils";

const startTime = new Date().getTime();

export default function expressSetup(app: Express, db: ToolDb) {
  // Setup Express
  app.get("/", (_req: any, res: any) => {
    res.json({ ok: true, msg: "You found the root!" });
  });

  app.get("/info", async (_req: any, res: any) => {
    const currentTime = new Date().getTime();
    const uptime = currentTime - startTime;
    const duration = moment.duration(uptime);

    const cpu = osu.cpu;

    const usage = await cpu.usage();
    const free = await cpu.free();

    res.json({ uptime: duration.humanize(), cpus: cpu.count(), usage, free });
  });

  app.get("/peers", (_req: any, res: any) => {
    res.json({ peers: Object.keys(db.network.clientToSend) });
  });

  app.get("/pubkey", (_req: any, res: any) => {
    res.json({ pubkey: db.getPubKey() });
  });

  app.get("/api/:id", (_req, res: any) => {
    db.store.get(_req.params.id, (err, data) => {
      if (err || !data) {
        res.json({ msg: "not found" });
      } else {
        try {
          const d = JSON.parse(data);
          res.json(d);
        } catch (e) {
          res.json({ msg: e });
        }
      }
    });
  });
}
