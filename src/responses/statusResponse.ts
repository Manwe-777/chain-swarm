import { Response } from "express";

export default function statusResponse(
  res: Response<any>,
  status: number,
  msg: string,
  ok = false
): Response<any> {
  return res.status(status).json({ ok, msg });
}
