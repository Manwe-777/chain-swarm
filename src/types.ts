export type PIPE_MESSAGE = "handshake" | "put" | "get";

export interface PipeMessageBase {
  type: PIPE_MESSAGE;
}

export interface PipeHandshake extends PipeMessageBase {
  type: "handshake";
  key: string;
}

export interface PipePut extends PipeMessageBase {
  type: "put";
  key: string;
  value: string;
}

export interface PipeGet extends PipeMessageBase {
  type: "get";
  key: string;
}

export type PipeMessage = PipeHandshake | PipePut | PipeGet;
