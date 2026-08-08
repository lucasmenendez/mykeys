/// <reference types="@solidjs/start/env" />

declare global {
    interface Go {
        importObject: WebAssembly.Imports;
        run(instance: WebAssembly.Instance): Promise<void>;
    }

    var Go: {
        new (): Go;
    };

    interface MyKeysResult {
        error: string | null;
        data: string;
    }

    interface MyKeysCLI {
        list(b64: string, passphrase: string): MyKeysResult;
        set(b64: string, passphrase: string, alias: string, username: string, password: string): MyKeysResult;
        del(b64: string, passphrase: string, id: string): MyKeysResult;
    }

    interface Window {
        MyKeysCLI: MyKeysCLI;
    }
}

export {};
