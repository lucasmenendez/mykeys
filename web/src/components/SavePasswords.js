export default {
    props: {
        passwords: {
            type: Array,
            required: true,
        },
        passphrase: {
            type: String,
            required: true,
        },
    },
    emits: ['update:passphrase', 'submit'],
    data() {
        return {
            content: "",
            errorMessage: "",
            showPassphrase: false,
        }
    },
    template: `
    <form @submit="submitForm">
        <h3>Encrypt and safe your passwords</h3>
        <p>Type your passphrase to encrypt your passwords. By default it uses your previous password.</p>
        <label class="label" for="passphrase">Encryption passphrase</label>
        <div class="is-flex">
            <input 
                :type="showPassphrase ? 'text' : 'password'" 
                id="passphrase" 
                class="input has-mr-2" 
                :value="passphrase" 
                ref="passphraseInput"
                @input="$emit('update:passphrase', $event.target.value)"
                placeholder="Enter your passwords passphrase...">
            <span class="button has-mr-2 has-bg-transparent has-text-black" @click="showPassphrase = !showPassphrase">
                <i class="si-eye-slash"></i>
            </span>
            <button 
                type="submit"
                class="button is-primary"
                :disabled="!passphrase">
                <i class="si-unlock"></i>
            </button>
        </div>
        <div class="alert has-mb-none" style="background: red;" v-if="errorMessage">{{ errorMessage }}</div>
        <div v-if="content">
            <hr class="has-m-8">
            <textarea class="textarea" rows="6" :value="content" placeholder="Encryption result..." style="resize: none;" readonly></textarea>
            <div class="is-flex has-justify-between has-items-center has-mt-4">
                <span class="has-weight-bold">Save this URL as a bookmark <i class="si-star"></i></span>
                <span>or</span>
                <button class="button is-primary" type="button" @click="downloadFile">
                    <i class="si-download"></i>
                    Download
                </button>
            </div>
        </div>
    </form>
    `,
    methods: {
        submitForm(event) {
            event.preventDefault();
            this.content = "";
            for (let i = 0; i < this.passwords.length; i++) {
                let pass = this.passwords[i];
                let result = MyKeysCLI.set(this.content, this.passphrase, pass.alias, pass.username, pass.password);
                if (result.error) {
                    this.errorMessage = result.error;
                    return;
                }
                this.content = result.data;
            }
            this.$emit('submit', this.content);
        },
        downloadFile() {
            const element = document.createElement("a");
            element.style.display = "none";
            const file = new Blob([this.content], {type: 'text/plain'});
            element.href = URL.createObjectURL(file);
            element.download = "secret.mykeys";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    },
}