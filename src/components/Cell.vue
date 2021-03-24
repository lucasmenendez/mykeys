<template>
    <td>
        <span v-if="!editable">{{ hidden ? hide(value) : value }}</span>
        <input type="text" v-model="value" v-if="editable" @change="$emit('change', value)"/>
        <button 
            class="action copy" 
            v-if="copyable"
            @click="copy(value)">
                <i class="fi fi-copy"></i>
        </button>
    </td>
</template>

<script>
import EventBus from '@/lib/eventbus';

export default {
    name: 'Cell',
    props: {
        content: {
            required: true
        },
        hidden: {
            type: Boolean,
            default: false
        },
        copyable: {
            type: Boolean,
            default: false
        },
        editable: {
            type: Boolean,
            default: false
        }
    },
    data: () => ({
        value: ''
    }),
    mounted() {
        this.value = this.content;
    },
    methods: {
        hide(val) {
            if (val && val.length) return '•'.repeat(val.length);
            else return '';
        },
        async copy(content) {
            try {
                await navigator.clipboard.writeText(content);
                EventBus.$emit('info', '¡Copied!');
            } catch (error) {
                EventBus.$emit('error', 'Something was wrong copying the content ;(');
                console.error(error);
            }
        }
    }
}
</script>

<style scoped>
.copy {
    font-size: 12px;
    margin-left: 8px;
    margin-bottom: 0;
    visibility: hidden;
    opacity: 0;
}

td:hover > .copy {
    opacity: 1;
    visibility: visible;
}

input {
    margin: 0;
    height: auto;
    padding: 0
}
</style>