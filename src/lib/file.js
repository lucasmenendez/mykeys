import * as Serializer from "@msgpack/msgpack";

const Crypto = window.crypto;

class FileAPI {
    static _dump(data) {
        const temp = data.map(item => ({
            a: item.alias,
            u: item.username,
            p: item.password,
            d: item.description
        }));
          
        return Serializer.encode(temp);
    }

    static _parse(data) {
        const temp = Serializer.decode(data);

        return temp.map(item => ({
            alias: item.a,
            username: item.u,
            password: item.p,
            description: item.d
        }));
    }

    static _encode(content) {
        return new TextEncoder('utf-8').encode(content);
    }

    static async encrypt(content, password) {
        const encPwd = FileAPI._encode(password);
        const hashPwd = await crypto.subtle.digest('SHA-256', encPwd)
            .catch(err => {
                console.error(err);
                throw new Error('Error generating password hash.');
            });

        const name = 'AES-GCM';
        const iv = Crypto.getRandomValues(new Uint8Array(12));
        const alg = { name, iv };

        const key = await Crypto.subtle.importKey('raw', hashPwd, alg, false, ['encrypt'])
            .catch(err => {
                console.error(err);
                throw new Error('Error importing the key.');
            });

        const dumpContent = FileAPI._dump(content);
        const ctBuffer = await Crypto.subtle.encrypt(alg, key, dumpContent)
            .catch(err => {
                console.error(err);
                throw new Error('Error encrypting the content.');
            });

        const ctArray = Array.from(new Uint8Array(ctBuffer));
        const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
        const ctBase64 = btoa(ctStr);

        const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');
        return ivHex + ctBase64;
    }

    static async decrypt(content, password) {
        const encPwd = FileAPI._encode(password);
        const hashPwd = await Crypto.subtle.digest('SHA-256', encPwd)
            .catch(err => {
                console.error(err);
                throw new Error('Error generating password hash.');
            });

        const name = 'AES-GCM';
        const iv = new Uint8Array(content.slice(0,24).match(/.{2}/g).map(byte => parseInt(byte, 16)));
        const alg = { name, iv };

        const key = await Crypto.subtle.importKey('raw', hashPwd, alg, false, ['decrypt'])
            .catch(err => {
                console.error(err);
                throw new Error('Error importing the key.');
            });

        const ctStr = atob(content.slice(24));
        const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));

        const plainBuffer = await Crypto.subtle.decrypt(alg, key, ctUint8)
            .catch(err => {
                console.error(err);
                throw new Error('Error decrypting the content.');
            });

        return FileAPI._parse(plainBuffer);
    }
}

export default FileAPI;