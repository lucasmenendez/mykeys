import Modal from './components/Modal.js';
import OpenPasswords from './components/OpenPasswords.js';
import PasswordsTable from './components/PasswordsTable.js';

import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
// import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js'

const app = createApp({
    data() {
        return {
            showFileModal: true,
            content: "",
            passphrase: "",
            passwords: [
                {
                    alias: "",
                    username: "",
                    password: ""
                }    
            ],
        }
    },
    async created() {
        this.checkURLParams();
        await this.setupWebAssembly();
    },
    template: `
        <Modal v-model:open.sync="showFileModal" :closable="false">
            <OpenPasswords 
                :initial="content"
                @new="newFile"
                @submit="loadFile"></OpenPasswords>
        </Modal>
        <div class="container">
            <div class="has-p-6 has-m-6 has-bg-white is-rounded is-shadowed">
                <div class="has-m-3 has-bg-transparent has-text-primary is-flex has-justify-center has-items-center">
                    <i class="si-exclamation-square has-size-3 has-mr-6"></i>
                    <span has="has-weight-bold">If you make any changes to the passwords, make sure to export them before closing the page.</span>
                </div>
                <PasswordsTable :passwords="passwords"></PasswordsTable>
            </div>
        </div>
        {{ this.passwords }}
    `,
    methods: {
        async setupWebAssembly() {
            const go = new Go();
            const result = await WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject);
            go.run(result.instance);
        },
        checkURLParams() {
            const urlQuery = window.location.search;
            const urlParams = new URLSearchParams(urlQuery);
            this.content = urlParams.get("b64");
        },
        newFile() {
            this.content = "";
            this.passphrase = "";
            this.showFileModal = false;
        },
        loadFile(content, passphrase) {
            this.content = content;
            this.passphrase = passphrase;
            let data = MyKeysCLI.list(this.content, this.passphrase);
            this.passwords = JSON.parse(data);

            this.showFileModal = false;
        }
    },
    components: {
        OpenPasswords, Modal, PasswordsTable
    }
});

app.mount('#app');