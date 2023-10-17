import Modal from './components/Modal.js';
import OpenPasswords from './components/OpenPasswords.js';
import SavePasswords from './components/SavePasswords.js';
import ListPasswords from './components/ListPasswords.js';

import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
// import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js'

const app = createApp({
    data() {
        return {
            showOpenFileModal: true,
            showSaveFileModal: false,
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
        <Modal v-model:open.sync="showOpenFileModal" :closable="false">
            <OpenPasswords 
                :initial="content"
                @new="newFile"
                @submit="loadFile"></OpenPasswords>
        </Modal>
        <Modal v-model:open.sync="showSaveFileModal" :closable="true">
            <SavePasswords 
                :passwords="passwords" 
                v-model:passphrase="passphrase"
                @submit="onSave"></SavePasswords>
        </Modal>
        <div class="container has-pt-6 has-pb-24">
            <div class="has-m-6 has-bg-transparent has-text-primary is-flex has-justify-center has-items-center">
                <i class="si-exclamation-square has-size-3 has-mr-6"></i>
                <span has="has-weight-bold">If you make any changes to the passwords, make sure to <b>Encrypt & Save</b> them before closing the page.</span>
            </div>
            <div class="has-p-6 has-bg-white is-rounded is-shadowed">
                <ListPasswords :passwords="passwords" @done="showSaveFileModal = true"></ListPasswords>
            </div>
        </div>
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
            this.content = urlParams.get("data");
        },
        newFile() {
            this.content = "";
            this.passphrase = "";
            this.showOpenFileModal = false;
        },
        loadFile(content, passphrase, passwords) {
            this.content = content;
            this.passphrase = passphrase;
            this.passwords = passwords;
            this.showOpenFileModal = false;
        },
        onSave(newContent) {
            this.content = newContent;
            window.history.pushState({}, null, `?data=${this.content}`);
        }
    },
    components: {
        Modal, OpenPasswords, SavePasswords, ListPasswords
    }
});

app.mount('#app');