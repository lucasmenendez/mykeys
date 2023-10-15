export default {
    emits: ['update:passwords'],
    props: ['passwords'],
    template: `
    <div>
        <div class="columns sticky" style="position: sticky; top: 0; background: white; z-index: 1;">
            <div class="column is-one-quarter">
                <span class="has-pt-4 has-pb-4 has-weight-bold">Alias</span>
            </div>
            <div class="column is-one-quarter">
                <span class="has-pt-4 has-pb-4 has-weight-bold">Username</span>
            </div>
            <div class="column is-half">
                <span class="has-pt-4 has-pb-4 has-weight-bold">Password</span>
            </div>
        </div>
        <div class="columns" v-for="(pass, index)  in passwords" :key="index">
            <div class="column is-one-quarter has-p-4">
                <input type="text" v-model="pass.alias" class="input is-fullwidth" placeholder="Alias">
            </div>
            <div class="column is-one-quarter has-p-4">
                <input type="text" v-model="pass.username" class="input is-fullwidth" placeholder="Username">
            </div>
            <div class="column is-half has-p-4">
                <div class="is-flex">
                    <input type="password" :ref="index" v-model="pass.password" class="input is-fullwidth" placeholder="Password">
                    <span class="button has-bg-transparent has-text-black" @click="togglePasswordVisibility(index)">
                        <i class="si-eye-slash"></i>
                    </span>
                </div>
            </div>
        </div>
    </div>
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
        }
    },
    style() {
        return `
            .sticky {
                position: sticky;
                top: 0;
                background-color: white;
            }
        `;
    }
}