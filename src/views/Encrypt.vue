<template>
    <div>
        <PasswordForm 
            description="Type your master passsword to encrypt your passwords and get your URL."
            placeholder="Type your master password"
            @error="error"
            @submit="encrypt">
            <template v-slot:button>
                <i class="fi left fi-locked"></i> Encrypt!
            </template>
        </PasswordForm>

        <GeneratedUrl 
            v-if="blob" 
            :blob="blob"
            @copied="success" 
            @error="error" />
    </div>
</template>

<script>
import EventBus from '@/lib/eventbus';
import FileAPI from '@/lib/file';

import PasswordForm from '@/components/PasswordForm';
import GeneratedUrl from '@/components/GeneratedUrl';

export default {
    name: 'Encrypt',
    props: {
        data: {
            type: Array,
            required: true
        }
    },
    data: () => ({
        blob: '',
    }),
    methods: {
        success() {
            EventBus.$emit('notification', { type: 'success', content: 'Done!'});
        },
        error(e) {
            console.error(e);
            EventBus.$emit('notification', {
                type: 'error',
                content: e.message
            });
        },
        async encrypt(password) {
            try {
                this.blob = await FileAPI.encrypt(this.data, password);
            } catch (e) {
                this.error(e);
            }
        }
    },
    components: { PasswordForm, GeneratedUrl }
}
</script>