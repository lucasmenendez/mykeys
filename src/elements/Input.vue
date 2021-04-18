<template>
    <div>
        <input 
            v-bind="$attrs"
            v-model="value"
            @input="$emit('input', value)"
            @change="$emit('change', result)" />

        <small v-if="max > 0">{{ length }}/{{ max }}</small>
        <small v-if="min > 0 && (min - length) > 0">{{ min - length }}</small>
    </div>
</template>

<script>
export default {
    name: 'Input',
    props: {
        val: {
            default: null
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

            this.$emit('error', new Error(msg)); 
            return null;
        }
    },
    data: () => ({
        value: null
    }),
    mounted() {
        this.value = this.val;
    }
}
</script>

<style scoped>
    div {
        display: inline-block;
        vertical-align: top;
    }

    div.block,
    div.block input {
        width: 100%;
        height: auto;
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

    div:not(.bordered) input {
        border: 1px solid transparent;
    }

    div:not(.bordered) input:hover, div:not(.bordered) input:active {
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