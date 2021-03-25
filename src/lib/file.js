const Crypto = window.crypto;
const fileHandleOps = {
    multiple: false,
    excludeAcceptAllOption: true,
    types: [{
        accept: {'text/plain': ['.txt']},
    }],
};

class FileAPI {
    static async open() {
        const [ handle ] = await window.showOpenFilePicker(fileHandleOps)
            .catch(err => {
                console.error(err);
                throw 'Error selecting the file.';
            });

        const file = await handle.getFile()
            .catch(err => {
                console.error(err);
                throw 'Error selecting the file.';
            });
        return await file.text()
            .catch(err => {
                console.error(err);
                throw 'Error reading the file.';
            });
    }

    static async save(content) {
        const handle = await window.showSaveFilePicker(fileHandleOps)
            .catch(err => {
                console.error(err);
                throw 'Error selecting the file.';
            });

        const writable = await handle.createWritable()
            .catch(err => {
                console.error(err);
                throw 'Error creating the descriptor to write the file.';
            });

        await writable.write(content)
            .catch(err => {
                console.error(err);
                throw 'Error writing the file.';
            });

        await writable.close()
            .catch(err => {
                console.error(err);
                throw 'Error closing the descriptor of the file.';
            });
    }

    static requestPassword(msg = 'Enter your password:', minLenght = 8) {
        const rgx = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        
        return new Promise((resolve, reject) => {
            const password = prompt(msg);
            if (password === null) reject('You must to type a password.');
            else if (password.length < minLenght) reject('The password is too short.');
            else if (!rgx.test(password)) reject('The password must cointain one letter and one number at least.');
            resolve(password);
        });
    }

    static _dump(obj) {
        return JSON.stringify(obj);
    }

    static _parse(str) {
        return JSON.parse(str);
    }

    static _encode(content) {
        return new TextEncoder('utf-8').encode(content);
    }

    static async encrypt(content, password) {
        const encPwd = FileAPI._encode(password);
        const hashPwd = await crypto.subtle.digest('SHA-256', encPwd)
            .catch(err => {
                console.error(err);
                throw 'Error generating password hash.';
            });

        const name = 'AES-GCM';
        const iv = Crypto.getRandomValues(new Uint8Array(12));
        const alg = { name, iv };

        const key = await Crypto.subtle.importKey('raw', hashPwd, alg, false, ['encrypt'])
            .catch(err => {
                console.error(err);
                throw 'Error importing the key.';
            });

        const dumpContent = FileAPI._dump(content);
        const encContent = FileAPI._encode(dumpContent);
        const ctBuffer = await Crypto.subtle.encrypt(alg, key, encContent)
            .catch(err => {
                console.error(err);
                throw 'Error encrypting the content.';
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
                throw 'Error generating password hash.';
            });

        const name = 'AES-GCM';
        const iv = new Uint8Array(content.slice(0,24).match(/.{2}/g).map(byte => parseInt(byte, 16)));
        const alg = { name, iv };

        const key = await Crypto.subtle.importKey('raw', hashPwd, alg, false, ['decrypt'])
            .catch(err => {
                console.error(err);
                throw 'Error importing the key.';
            });

        const ctStr = atob(content.slice(24));
        const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));

        const plainBuffer = await Crypto.subtle.decrypt(alg, key, ctUint8)
            .catch(err => {
                console.error(err);
                throw 'Error encrypting the content.';
            });

        const plainText = new TextDecoder().decode(plainBuffer);
        return FileAPI._parse(plainText);
    }
}

export default FileAPI;