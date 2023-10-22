export default {
    emits: ['update:passwords', 'done'],
    props: ['passwords'],
    data() {
        return {
            filterText: "",
            isMobile: window.innerWidth < 800,
            cardView: window.innerWidth < 800,
            styles: {
                stickyHeader: {
                    position: "sticky",
                    top: "0",
                    background: "white",
                    zIndex: "1"
                }
            }
        }
    },
    computed: {
        filteredPasswords() {
            return this.passwords.filter(pass => pass.alias.toLowerCase().includes(this.filterText.toLowerCase()));
        }
    },
    template: `
        <div>
            <div class="is-flex has-items-center has-flex-wrap">
                <div class="has-flex-grow">
                    <button class="button has-m-2" @click="$emit('done')">
                        <i class="si-lock"></i>
                        Encrypt & Save
                    </button>
                </div>
                <label for="filter" class="is-flex has-w-100 has-items-center has-bg-muted is-rounded has-m-2">
                    <i class="si-search has-size-3 has-pl-3 has-pr-none has-text-dark"></i>
                    <input type="text" class="input has-flex-grow" id="filter" v-model="filterText" placeholder="Search by alias..."/>
                </label>
                <label class="is-flex has-weight-light has-m-2" for="view">
                    <span><i class="si-bars"></i></span>
                    <input type="checkbox" v-model="cardView" id="view" class="switch has-mr-2 has-ml-2" :disabled="isMobile"/>
                    <span><i class="si-layout"></i></span>
                </label>
            </div>
            <hr class="has-mt-6 has-mb-6">

            <div id="list" v-if="!cardView">
                <div class="columns has-m-0" :style="styles.stickyHeader">
                    <span class="column has-p-4 has-pl-2-mobile has-pr-2-mobile has-weight-bold"><i class="si-chat has-mr-3"></i>Alias</span>
                    <span class="column has-p-4 has-pl-2-mobile has-pr-2-mobile has-weight-bold"><i class="si-user has-mr-3"></i>Username</span>
                    <span class="column has-p-4 has-pl-2-mobile has-pr-2-mobile has-weight-bold"><i class="si-file-dots has-mr-3"></i>Password</span>
                    <span class="column has-p-4 has-pl-2-mobile has-pr-2-mobile has-weight-bold"><i class="si-grid has-mr-3"></i>Actions</span>
                </div>
                <div class="columns has-m-0" v-for="(pass, index) in filteredPasswords" :key="index">
                    <div class="column has-p-4 has-pl-2-mobile has-pr-2-mobile">
                        <input type="text" v-model="pass.alias" class="input is-fullwidth" placeholder="Alias">
                    </div>
                    <div class="column has-p-4 has-pl-2-mobile has-pr-2-mobile">
                        <input type="text" v-model="pass.username" class="input is-fullwidth" placeholder="Username">
                    </div>
                    <div class="column has-p-4 has-pl-2-mobile has-pr-2-mobile">
                        <input type="password" :ref="index" v-model="pass.password" class="input is-fullwidth" placeholder="Password">    
                    </div>
                    <div class="column is-flex has-justify-around">
                        <button class="button has-bg-transparent has-text-black" @click="togglePasswordVisibility(index)">
                            <i class="si-eye-slash"></i>
                        </button>
                        <button class="button has-bg-transparent has-text-primary" @click="copyPassword(pass)">
                            <i class="si-copy"></i>
                        </button>
                        <button class="button has-bg-transparent" style="color: red" @click="deletePassword(index, pass)">
                            <i class="si-trash"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div id="cards" v-if="cardView">
                <div class="columns">
                    <div class="column" v-for="(pass, index) in filteredPasswords" :key="index">
                        <div class="has-pr-2 has-pl-2 has-m-4 has-m-4">
                            <label class="label is-block has-mb-2">
                                Alias
                                <input type="text" v-model="pass.alias" class="input has-mt-2 is-fullwidth" placeholder="Alias">
                            </label>
                            <label class="label is-block has-mb-4">
                                Username
                                <input type="text" v-model="pass.username" class="input has-mt-2 is-fullwidth" placeholder="Username">
                            </label>
                            <label class="label is-block">
                                Password
                                <input type="password" :ref="index" v-model="pass.password" class="input is-fullwidth" placeholder="Password">
                            </label>
                            <div class="is-flex has-justify-around">
                                <button class="button has-bg-transparent has-text-black" @click="togglePasswordVisibility(index)">
                                    <i class="si-eye-slash"></i> Toggle
                                </button>
                                <button class="button has-bg-transparent has-text-primary" @click="copyPassword(pass)">
                                    <i class="si-copy"></i> Copy
                                </button>
                                <button class="button has-bg-transparent" style="color: red" @click="deletePassword(index, pass)">
                                    <i class="si-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button class="button has-bg-white is-block has-ml-auto has-mr-auto is-pill has-text-black has-m-6 is-shadowed" @click="newPassword">
            <i class="si-plus"></i>
            Add new password
        </button>
    `,
    methods: {
        togglePasswordVisibility(ref) {
            if (this.$refs[ref].length) {
                if (this.$refs[ref][0].type == "password") {
                    this.$refs[ref][0].type = "text"
                } else {
                    this.$refs[ref][0].type = "password"
                }
            }
        },
        newPassword() {
            this.passwords.push({
                alias: "",
                username: "",
                password: ""
            });
            this.$emit('update:passwords', this.passwords);
        },
        async copyPassword(pass) {
            let result = await navigator.permissions.query({ name: "clipboard-write" })
            if (result.state != "prompt" && result.state == "granted") {
                await navigator.clipboard.writeText(pass.password);
            }
        },
        deletePassword(index, pass) {
            if (confirm(`Are you sure you want to delete the password for ${pass.alias}?`)) {
                this.passwords.splice(index, 1);
                this.$emit('update:passwords', this.passwords);
            }
        }
    },
}