<template>
    <div>
        <Input 
            type="password" 
            placeholder="Type your master password"
            :bordered="true" 
            @input="p => this.password = p" />

        <Button @click="encrypt">Encrypt</Button>
        <div v-if="content">
            <p>Save the following link as a bookmark to store your encrypted passwords.</p>
            <router-link :to="{name: 'decrypt', params: { blob: this.content }}">https://lucasmenendez.github.io/mykeys/d/{{ content }}</router-link>
        </div>
    </div>
</template>

<script>
import FileAPI from '@/lib/file';

import Input from '@/elements/Input';
import Button from '@/elements/Button';

export default {
    name: 'Encrypt',
    props: {
        data: {
            type: Array,
            required: true
        }
    },
    data: () => ({
        password: '',
        content: ''
    }),
    methods: {
        async encrypt() {
            this.content = await FileAPI.encrypt(this.data, this.password);
        }
    },
    components: { Input, Button }
}
</script>