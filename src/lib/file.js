const Crypto = window.crypto;

class FileAPI {
    static create() {
        // return [{
        //     "alias": "Example credentials",
        //     "username": "myusername",
        //     "password": "mys3cr3tp4ssw0rd",
        //     "description": "http://myservi.ce/login"
        // }];
        return [
            {"alias": "msssavb444","username": "17lbtonz6yibyihq1czazmgfj","password": "lhnj8u6zo6caoa1e4cmtbub4l","description": "g3acfv7dg7n0crdnvtf039ohjnhfjfhl4horfr2btmj83l7g8n"},
            {"alias": "2xicx9h6ik","username": "5g79x7fzfkfcrzgrzouqfr25u","password": "p27idtn9x51img518tryc8lsx","description": "xw4xwbbl7nmrttiv64lr0j5oypl9z86tcrnlp0e20tspwfaic0"},
            {"alias": "mlkbh8nmdv","username": "t3xmgkgsk4wt303cq139p5ikl","password": "dntxmsjozuahangqddddxke5r","description": "q60hutc066b13ajgacbl9rwvokqxkombak9wc8g4kif9a57i6b"},
            {"alias": "y0m2w9tucw","username": "o2fyc4tzx86dqeujb1us0qgez","password": "bwa43vb59hccoplyitvu579tk","description": "uhnuj9wbb0ghfu6vebh4ud6qqpzcttqxmh18zoaa6imj6aqwh1"},
            {"alias": "11u70fjx9j","username": "zddjq8ea4dslnj8ut2t1rzdmo","password": "h4ymkrwuumnwooz7ynvyjoh19","description": "9mh5uw5ny6tmzkg4ir2rl7chxmef8rvm6evy0k608y7h4nogk1"},
            {"alias": "6m0qt9b0gi","username": "s6fy8goaxkvub66e6ixjkvu2j","password": "4nfqjrquv2q2qtlxm5om58ho3","description": "pqbbnb9mribk523toi37ufqlhrsyu4cfzjehm4ha169hmoaxa0"},
            {"alias": "pnh9edzwjp","username": "82app6mtrwplrgw8lyxht8pkw","password": "dfy1yovkl30paoufsqsaytku0","description": "z0aas8xh561pjpxvierjcezzwfkgv5bhkd5mvty5shs72blobh"},
            {"alias": "vmou60r6uy","username": "5tx6e6wvl55qi0u9wqxzy38zk","password": "tjqzymwpqwv20q58dm5bi1j2p","description": "1vpa3mqqc8kzq9dngnp3bpfzk2nddexbgml4wfk4htxgu6nkfg"},
            {"alias": "dsjcmidea7","username": "tadbl50167gm9wdha6huk9aat","password": "vsi4d6n3h2ylk5tvmdp9180yz","description": "zxnke9eq8dx9si7fq3tyglug4hkupmmtomyny47hjb44q9mdph"},
            {"alias": "h4dtensx8w","username": "eormq84sfz3uxtysiduzhz30k","password": "naks6h604d2zwmnqq7pv0eq80","description": "vl7rk9lvo84770t1amhtygewnwsgt4c9tx9ekoce35k56ycgve"}
        ];
    }

    static _dump(obj) {
        const temp = obj.map(item => ({
            a: item.alias,
            u: item.username,
            p: item.password,
            d: item.description
        }));

        return JSON.stringify(temp);
    }

    static _parse(str) {
        const temp = JSON.parse(str);

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
                throw 'Error decrypting the content.';
            });

        const plainText = new TextDecoder().decode(plainBuffer);
        return FileAPI._parse(plainText);
    }
}

export default FileAPI;