<template>
    <form action="" @submit.prevent="encrypt">
        <Input 
            type="password"
            class="bordered"
            placeholder="Type your master password"
            minlength="8"
            pattern="(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}"
            @change="p => this.password = p" 
            @error="log"/>

        <Button type="submit">
            <i class="fi fi-locked"></i>
            Encrypt!
        </Button>

        <div v-if="content">
            <p>Share or save the following link as a bookmark to use your encrypted passwords later!</p>
            <router-link :to="{name: 'decrypt', params: { blob: this.content }}">https://lucasmenendez.github.io/mykeys/d/{{ content }}</router-link>
        </div>
    </form>
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
        password: null,
        content: ''
    }),
    methods: {
        log(e) {
            console.log(e);
        },
        async encrypt() {
            console.log(this.password)
            this.content = await FileAPI.encrypt(this.data, this.password);
        }
    },
    components: { Input, Button }
}
</script>