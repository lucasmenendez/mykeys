<template>
    <div>
        <PasswordForm 
            description="Type your master passsword to decrypt your URL and get your passwords."
            placeholder="Type your master password"
            @error="error"
            @submit="decrypt">
            <template v-slot:button>
                <i class="fi left fi-unlocked"></i> Decrypt!
            </template>
        </PasswordForm>
    </div>
</template>

<script>
import EventBus from '@/lib/eventbus';
import FileAPI from '@/lib/file';

import PasswordForm from '@/components/PasswordForm';

export default {
    name: 'Decrypt',
    props: {
        blob: {
            type: String,
            required: true
        }
    },
    methods: {
        error(e) {
            console.log(e);
            EventBus.$emit('notification', {
                type: 'error',
                content: e.message
            });
        },
        async decrypt(password) {
            try {
                const blob = this.blob;
                const data = await FileAPI.decrypt(this.blob, password);
                this.$router.push({ name: 'manager', params: { data, blob } });
            } catch (e) {
                console.log(e.message);
                this.error(e);
            }
        }
    },
    components: { PasswordForm }
}
</script>