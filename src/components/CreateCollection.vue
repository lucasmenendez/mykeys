<template>
    <Button @click="create">
        <slot></slot>
    </Button>
</template>

<script>
import FileAPI from '@/lib/file';

import Button from '@/elements/Button'

export default {
    name: 'CreateNewCollection',
    methods: {
        create() {
            const data = FileAPI.create();
            this.$emit('created', data);
        }
    },
    components: { Button }
}
</script>