import { Util } from "./util";

export class GracefulExit {
    static events = ['SIGTERM', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'exit'];
    static listeners: Array<{ handler: (code: number | Error, event: string) => Promise<any>; description?: string; }> = [];
    static removeListener(handler: (code: number | Error, event: string) => Promise<any>) { Util.removeElements(this.listeners, ...Util.where(this.listeners, { handler })); }
    private static initialized = false;
    static addListener(handler: (code: number | Error, event: string) => Promise<any>, description?: string) {
        this.listeners.push({ handler, description });
        if (!this.initialized) {
            this.initialized = true;
            let handled = false;
            for (const event of this.events)
                process.on(event as any, async (code: any) => {
                    if (!handled) {
                        handled = true;
                        if (this.listeners.length) {
                            console.error('Terminating gracefully...', event, code);
                            for (const { handler, description } of this.listeners)
                                await handler(code, event)
                                    .catch(e => console.error(description, e));
                            console.error('/Terminated');
                        }
                        process.exit(event == 'exit' ? code : 1 + this.events.indexOf(event));
                    }
                });
        }
        return () => this.removeListener(handler);
    }

    /** Run a block of code, and perform a cleanup script if the process is terminated before the block finished */
    static async run<T>(block: () => Promise<T>, cleanup: (code: number | Error, event: string) => any) {
        const removeListener = this.addListener(cleanup);
        return await block().finally(removeListener);
    }
}
