<template>
    <button :type="submit ? 'submit' : 'button'" @click="$emit('click')">
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: 'Button',
    props: {
        submit: {
            type: Boolean,
            default: false
        }
    }
}
</script>