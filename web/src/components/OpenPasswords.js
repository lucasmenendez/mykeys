export default {
    emits: ['submit', 'new'],
    props: ['initial'],
    data() {
        return {
            content: this.initial,
            passphrase: "",
            external: !!this.initial,
        }
    },
    mounted() {
        if (this.content) {
            this.$refs.passphraseInput.focus();
        }
    },
    template: `
    <form @submit="submitForm">
        <h3>Wellcome to MyKeys.live!</h3>
        <p>{{ 
            content ?
            'Type your passphrase to decrypt your passwords' : 
            'What do you want to do?'
        }}</p>
        <div id="no-content" v-if="!content">
            <a class="button is-secondary is-full" @click="$emit('new')">
                <i class="si-file-plus"></i>
                Create a new one
            </a>
            <div class="is-flex has-justify-center has-text-center">
                <span class="is-block has-mt-6">or</span>
            </div>
            <hr class="has-mt-6 has-mb-6">
        </div>
            <div>
                <label class="button is-full has-mb-6" for="file">
                    <i class="si-search"></i>
                    Open a passwords file
                </label>
                <input 
                    type="file" 
                    id="file" 
                    class="is-hidden" 
                    ref="fileInput"
                    @click="resetInputFile($event)"
                    @change="readInputFile($event)">
            </div>
            <textarea 
                class="textarea" 
                rows="6"
                v-model="content"
                placeholder="Or paste here your base64 encrypted passwords..."></textarea>
            <div class="is-flex has-justify-center has-text-center">
                <span class="is-block has-mt-6">and</span>
            </div>
        <label class="label" for="passphrase">Encryption passphrase</label>
        <div class="is-flex">
            <input 
                type="password" 
                id="passphrase" 
                class="input has-mr-2" 
                v-model="passphrase" 
                ref="passphraseInput"
                placeholder="Enter your passwords passphrase...">
            <button 
                type="button"
                class="button is-primary"
                :disabled="!passphrase"
                @click="$emit('submit')">
                <i class="si-unlock"></i>
            </button>
        </div>
    </form>
    `,
    methods: {
        resetInputFile(event) {
            event.target.value = null;
        },
        readInputFile(event) {
            if (event.target.files.length == 0) {
                return;
            }
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                this.content = event.target.result;
            };
            reader.readAsText(file);
        },
        submitForm(event) {
            event.preventDefault();
            this.$emit('submit', this.content, this.passphrase);
        }
    },
    watch: {
        content() {
            this.$refs.passphraseInput.focus();
        }
    }
}