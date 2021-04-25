<template>
    <Toast v-if="msg" :type="type" @hidden="reset">
        <template v-slot:content>{{ msg }}</template>
    </Toast>
</template>

<script>
import EventBus from '@/lib/eventbus';

import Toast from '@/elements/Toast';

export default {
    name: 'Notification',
    data: () => ({
        type: 'default',
        msg: null
    }),
    mounted() {
        EventBus.$on('notification', this.listen);
    },
    methods: {
        listen(def) {
            const { type, content } = def;
            this.type = type;
            this.msg = content;
        }, 
        reset() {
            this.default = 'default';
            this.msg = null;
        }
    },
    components: { Toast }
}
</script>