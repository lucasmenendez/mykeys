<template>
    <div :class="{ 'block': block }">
        <input
            :class="{ 'bordered': bordered }"
            v-bind="$attrs"
            v-model="value"
            @input="$emit('input', value)"
            @change="change" />

        <small v-if="max > 0">{{ length }}/{{ max }}</small>
        <small v-if="min > 0">{{ min - length > 0 ? min - length : 0 }}</small>
    </div>
</template>

<script>
export default {
    name: 'Input',
    props: {
        val: {
            default: null
        },
        bordered: {
            type: Boolean,
            default: false
        },
        block: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        length() {
            return this.value !== null ? this.value.length : 0;
        },
        max() {
            return this.$attrs['maxlength'] !== undefined ? 
                Number(this.$attrs['maxlength']) : -1;
        },
        min() {
            return this.$attrs['minlength'] !== undefined ? 
                Number(this.$attrs['minlength']) : -1;
        },
        rgx() {
            return this.$attrs['pattern'] !== undefined ? 
                new RegExp(`^${this.$attrs['pattern']}$`) : false;
        },
        result() {
            let msg;
            if (this.min > 0 && this.length < this.min) msg = `At least ${this.min} characters.`;
            else if (this.max > 0 && this.length > this.max) msg = `Maximum ${this.max} characters.`;
            else if (this.rgx && !this.rgx.test(this.value)) msg = 'The value does not meet the requirements.';
            else return this.value;

            throw new Error(msg);
        }
    },
    data: () => ({
        value: null
    }),
    mounted() {
        this.value = this.val;
    },
    methods: {
        change() {
            try {
                let res = this.result;
                this.$emit('change', res);
            } catch (error) {
                this.$emit('error', error);
            }
        },
    }
}
</script>

<style scoped>
div {
    display: inline-block;
    vertical-align: top;
    width: auto;
}

div.block, div.block input { 
    width: 100% !important; 
}

input {
    font-family: inherit;
    font-weight: 300;
    padding: 10px 15px;
    margin: 5px;
    outline: none;
    border-radius: 8px;
    border: 1px solid #aaa;
}

input:not(.bordered) {
    border: 1px solid transparent;
}

input:hover, input:active, input:focus {
    border: 1px solid #aaa;
}

small {
    display: block;
    font-size: 12px;
    color: #555;
    padding: 0 5px;
    text-align: right;
}
</style>