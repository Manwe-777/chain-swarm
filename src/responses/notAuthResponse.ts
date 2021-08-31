import { Response } from "express";

export default function notAuthResponse(res: Response<any>): Response<any> {
  return res
    .status(401)
    .json({ ok: false, msg: "You dont have permissions to do this!" });
}
