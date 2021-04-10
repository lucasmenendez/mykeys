<template>
    <button v-bind="$attrs" @click="$emit('click')">
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: 'Button'
}
</script>