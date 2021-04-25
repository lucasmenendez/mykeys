<template>
    <Box class="password-form">
        <template v-slot:content>
            <div class="header" v-if="description">
                <i class="icon fi fi-key"></i>
                <p class="description">{{ description }}</p>
            </div>
            <div class="content">
                <Input 
                    class="field"
                    type="password"
                    :block="true"
                    :bordered="true"
                    :placeholder="placeholder"
                    minlength="8"
                    pattern="(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}"
                    @change="change" 
                    @error="error"/>

                <Button class="action" @click="submit">
                    <slot name="button"></slot>
                </Button>
            </div>
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
    data: () => ({
        pass: ''
    }),
    methods: {
        submit() {
            if (!this.pass) {
                const error = new Error('You must to enter a master password.');
                this.$emit('error', error);
            } else this.$emit('submit', this.pass);
        },
        change(p) {
            this.pass = p;
            this.$emit('change', p);
        },
        error(e) {
            console.error(e);
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
    margin-right: 2vw;
}

@media screen and (max-width: 600px) {
    .password-form .content { flex-wrap: wrap; }
    .password-form .content .field, 
    .password-form .content .action { 
        width: 100%;
        margin: 1vh 0
    }
}
</style>