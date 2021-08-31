/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Response } from "express";
import env from "../env";

export default function defaultResponse(
  res: Response<any>,
  err: any,
  msg: string,
  ErrorCode = 500
): Response<any> {
  return err
    ? res.status(ErrorCode).json({
        ok: false,
        msg: env == "dev" ? err : err.message || "Internal error",
      })
    : res.status(200).json({ ok: true, msg });
}
