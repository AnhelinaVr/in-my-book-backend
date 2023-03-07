import type { Request, Response } from 'express';
import Exception from '../exceptions';
import { StatusCodes } from '../constants/status-codes';

type HandlerEvent = {
  headers: Request['headers'];
  query: Request['query'];
  params: Request['params'];
  body: string;
  method: string;
  path: string;
};

export type HandlerResponse =
  | {
      status: {
        code: StatusCodes;
      };
      body: any;
    }
  | Exception;

const handleRequest =
  (handler: (request: HandlerEvent) => Promise<HandlerResponse>) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      const request: HandlerEvent = {
        headers: req.headers,
        query: req.query,
        params: req.params,
        body: req.body,
        method: req.method,
        path: req.path,
      };

      const response = await handler({
        ...request,
      });

      if (!(response instanceof Exception))
        res.status(response.status.code ?? StatusCodes.OK).send(response.body);
      else
        res
          .status(response.status.code ?? StatusCodes.INTERNAL_SERVER_ERROR)
          .send(response.obj);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(
          error instanceof Error ? error?.message : 'INTERNAL SERVER ERROR',
        );
    }
  };

export default handleRequest;
