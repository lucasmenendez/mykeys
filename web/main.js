async function loadGoEnv() {
    // Instantiate our wasm module
    const go = new Go();
    const result = await WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject);
    go.run(result.instance);
}

(async function(){
    await loadGoEnv();
    document.getElementById("main-form").addEventListener("submit", function(e) {
        e.preventDefault();
        let b64file = document.getElementById("base64").value,
            passphrase = document.getElementById("passphrase").value;
            action = document.getElementById("action").value,
            alias = document.getElementById("alias").value,
            username = document.getElementById("username").value,
            password = document.getElementById("password").value;

        let result = "Unknown action";
        switch (action) {
            case "list":
                result = MyKeysCLI.list(b64file, passphrase);
                break;
            case "get":
                result = MyKeysCLI.get(b64file, passphrase, alias);
                break;
            case "set":
                result = MyKeysCLI.set(b64file, passphrase, alias, username, password);
                break;
            case "del":
                result = MyKeysCLI.del(b64file, passphrase, alias);
                break;
        }
        document.getElementById("output").innerText = result;
    });
})()