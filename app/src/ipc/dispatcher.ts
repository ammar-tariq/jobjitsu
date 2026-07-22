import type { Result } from "@jobjitsu/shared";
import {
  deniedUnknownCommand,
  isIpcCommandName,
  notImplementedCommand,
  type IpcCommandName,
  type IpcPayloadMap,
  type IpcResultMap,
} from "./commands.js";

export type IpcHandler<C extends IpcCommandName = IpcCommandName> = (
  payload: IpcPayloadMap[C],
) => Result<IpcResultMap[C]> | Promise<Result<IpcResultMap[C]>>;

export type IpcHandlerMap = {
  readonly [C in IpcCommandName]?: IpcHandler<C>;
};

export type IpcDispatcher = {
  /**
   * Invoke a host command by string name.
   * Unknown names fail closed with `permission` — never route to AI complete.
   */
  invoke(command: string, payload?: unknown): Promise<Result<unknown>>;
};

/**
 * Allowlist dispatcher — only registered handlers run; unknown commands are denied.
 */
export function createIpcDispatcher(handlers: IpcHandlerMap = {}): IpcDispatcher {
  return {
    async invoke(command: string, payload?: unknown): Promise<Result<unknown>> {
      if (!isIpcCommandName(command)) {
        return deniedUnknownCommand(command);
      }

      const handler = handlers[command] as IpcHandler | undefined;
      if (!handler) {
        return notImplementedCommand(command);
      }

      return handler(payload as never);
    },
  };
}
