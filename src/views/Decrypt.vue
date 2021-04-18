<template>
    <div>
        <Input 
            type="password" 
            class="bordered"
            placeholder="Type your master password"
            minlength="8"
            @input="p => this.password = p" />
            
        <Button @click="decrypt">
            <i class="fi fi-unlocked"></i>
            Decrypt!
        </Button>
    </div>
</template>

<script>
import FileAPI from '@/lib/file';

import Input from '@/elements/Input';
import Button from '@/elements/Button';

export default {
    name: 'Decrypt',
    props: {
        blob: {
            type: String,
            required: true
        }
    },
    data: () => ({
        password: ''
    }),
    methods: {
        async decrypt() {
            const data = await FileAPI.decrypt(this.blob, this.password);
            this.$router.push({ name: 'manager', params: { data } })
        }
    },
    components: { Input, Button }
}
</script>