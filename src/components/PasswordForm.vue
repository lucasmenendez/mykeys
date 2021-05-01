<template>
    <Box class="password-form">
        <template v-slot:content>
            <div class="header" v-if="description">
                <i class="icon fi fi-key"></i>
                <p class="description">{{ description }}</p>
            </div>
            <form class="content" v-on:submit.prevent="submit">
                <div class="field">
                    <Input 
                        type="password"
                        :block="true"
                        :bordered="true"
                        :placeholder="placeholder"
                        minlength="8"
                        pattern="(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}"
                        @change="change"
                        @input="input" 
                        @error="error" />
                    
                    <ul class="requirements">
                        <li :class="{ 'completed': hasLetter, 'required': !hasLetter && submitted }">At least one letter.</li>
                        <li :class="{ 'completed': hasNumber, 'required': !hasNumber && submitted }">At least one number.</li>
                        <li :class="{ 'completed': minLength, 'required': !minLength && submitted }">At least eight characters.</li>
                    </ul>
                </div>

                <Button type="submit" class="action" :disabled="!valid">
                    <slot name="button"></slot>
                </Button>
            </form>
        </template>
    </Box>
</template>

<script>
import Box from '@/elements/Box';
import Input from '@/elements/Input';
import Button from '@/elements/Button';

export default {
    name: 'PasswordForm',
    props: {
        description: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        }
    },
    computed: {
        valid() {
            return this.hasLetter && this.hasNumber && this.minLength;
        },
        hasLetter() {
            return this.temp.match(/[A-Za-z]+/);
        },
        hasNumber() {
            return this.temp.match(/[0-9]+/);
        },
        minLength() {
            return this.temp.length >= 8;
        },
    },
    data: () => ({
        pass: '',
        temp: '',
        submitted: false
    }),
    methods: {
        submit() {
            this.submitted = true;
            if (!this.pass) {
                const error = new Error('You must to enter a master password.');
                this.$emit('error', error);
            } else this.$emit('submit', this.pass);
        },
        input(p) {
            this.temp = p;
            this.$emit('input', p);
        },
        change(p) {
            this.pass = p;
            this.$emit('change', p);
        },
        error(e) {
            this.submitted = true;
            this.$emit('error', e);
        }
    },
    components: { Box, Input, Button }
}
</script>

<style scoped>
.password-form {
    display: block;
    padding: 10px 20px;
    margin: 10vh auto 20px;
    max-width: 600px;
    width: 96%;
}

.password-form .header {
    display: block;
    text-align: center;
    margin: 3vh 0;
}

.password-form .header .icon {
    font-size: 3em;
    margin-bottom: 3vh;
    color: #777;
}

.password-form .header .description {
    color: #777;
    font-style: italic;
    font-size: .9em;
}

.password-form .content {
    display: flex;
    width: 100%;
    flex-wrap: nowrap;
    align-items: flex-start;
    margin: 3vh 0;
}

.password-form .content .field {
    flex-grow: 1;
    width: 60%;
    margin-right: 2vw;
}

.password-form .content .field .requirements {
    color: #777;
    display: inline-block;
    vertical-align: top;
    font-size: .8em;
    padding: 0 8px 0 32px;
}

.password-form .content .field .requirements li.completed { color: #27ae60; }
.password-form .content .field .requirements li.required { color: #e74c3c; }

@media screen and (max-width: 600px) {
    .password-form .content { flex-wrap: wrap; }
    .password-form .content .field, 
    .password-form .content .action { 
        width: 100%;
        margin: 1vh 0
    }
}
</style>