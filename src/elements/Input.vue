<template>
    <div>
        <input 
            v-bind="$attrs"
            v-model="value"
            :class="{ 'bordered': bordered }"
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
        },
        bordered: {
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
    input:not(.bordered) {
        border: 1px solid transparent;
        outline: none;
    }

    input:not(.bordered):hover, input:not(.bordered):active {
        border: 1px solid black;
    }

    input:not(.bordered):hover + #copy, 
    input:not(.bordered):active + #copy {
        visibility: visible;
        opacity: 1;
    }
</style>