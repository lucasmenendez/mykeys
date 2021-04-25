<template>
    <Button class="icon" id="copy" @click="copy">
        <i class="fi fi-copy"></i>
    </Button>
</template>

<script>
import Button from '@/elements/Button';

export default {
    name: 'CopyButton',
    props: {
        content: {
            required: true
        }
    },
    methods: {
        async copy() {
            try {
                await navigator.clipboard.writeText(this.content);
                this.$emit('copied');
            } catch (error) {
                this.$emit('error', error);
            }
        }
    },
    components: { Button }
}
</script>