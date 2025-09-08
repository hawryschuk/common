import { Util } from "./util";

export class Base64 {
    static encodeSync(input: string | Uint8Array | ArrayBuffer | Blob | any, { urlsafe }: { urlsafe?: boolean } = {}): string {
        let bytes: Uint8Array;
        if (input instanceof Uint8Array) {
            bytes = input;
        } else if (input instanceof ArrayBuffer) {
            bytes = new Uint8Array(input);
        } else {
            bytes = new TextEncoder().encode(Util.toString(input));
        }

        let base64 = (() => {
            if (typeof Buffer !== "undefined" && typeof Buffer.from === "function") {
                return Buffer.from(bytes).toString("base64");
            } else {
                let binary = "";
                const chunk = 0x8000; // avoid call-stack limits
                for (let i = 0; i < bytes.length; i += chunk) { binary += String.fromCharCode(...bytes.subarray(i, i + chunk)); }
                return btoa(binary);
            }
        })();

        return urlsafe ? base64.replace(/\+/g, '-').replace(/\//g, '_') : base64;
    }

    static async encode(input: string | Uint8Array | ArrayBuffer | Blob, { urlsafe }: { urlsafe?: boolean } = {}): Promise<string> {
        if (typeof Blob !== "undefined" && input instanceof Blob) {
            const ab = await input.arrayBuffer();
            input = new Uint8Array(ab);
        }
        return this.encodeSync(input, { urlsafe });
    }


    static decode(base64: string, { mimeType = 'application/octect-stream', urlsafe }: { mimeType?: string; urlsafe?: boolean; } = {}) {
        if (urlsafe) base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

        const bytes = (() => {
            if (typeof Buffer !== "undefined" && typeof Buffer.from === "function") {
                return new Uint8Array(Buffer.from(base64, "base64"));
            } else {
                const binary = atob(base64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                return bytes;
            }
        })();
        return new class Base64Decode {
            get bytes() { return bytes; }
            get string() { return new TextDecoder().decode(this.bytes); }
            get blob() { return new Blob([this.bytes], { type: mimeType }); }
        }
    }
};

// static base64ToArrayBuffer(base64: string) {
//     const binary_string = this.atob(base64);
//     const len = binary_string.length;
//     const bytes = new Uint8Array(len);
//     for (let i = 0; i < len; i++)  bytes[i] = binary_string.charCodeAt(i);
//     return bytes.buffer;
// }

// static arrayBufferToBase64(buffer: ArrayBuffer) {
//     let binary = "";
//     const bytes = new Uint8Array(buffer);
//     const len = bytes.byteLength;
//     for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
//     return this.btoa(binary);
// }

// static toBase64(binary: any, urlsafe?: boolean) {
//     const base64 = Buffer
//         .from(this.toString(binary))
//         .toString('base64');
//     return urlsafe
//         ? base64.replace(/\+/g, '-').replace(/\//g, '_')
//         : base64;
// }

// static fromBase64(base64: string, urlsafe?: boolean) {
//     if (urlsafe) base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
//     return Buffer.from(base64, 'base64').toString('binary')
// }

// static btoa(obj: any): string { return Buffer.from(obj).toString('base64'); }
// static atob(b64Encoded: string): any { return Buffer.from(b64Encoded, 'base64').toString(); }
