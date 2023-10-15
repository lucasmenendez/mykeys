export default {
    emits: ['update:open'],
    props: {
        closable: {
            type: Boolean,
            default: true,
        },
        open: {
            type: Boolean,
            default: true,
        },
    },
    template: `
        <div class="scrim" v-if="open">
            <div class="modal">
                <div class="close" @click="close" v-if="closable"></div>
                <slot></slot>
            </div>
        </div>
    `,
    methods: {
        close() {
            this.open = false;
            $emit('update:open', false);
        }
    }
}