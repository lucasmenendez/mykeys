<template>
    <div>
        <input 
            v-bind="$attrs"
            v-model="value"
            :class="{ 'bordered': bordered }"
            @input="$emit('input', value)"
            @change="$emit('change', value)"/>
    </div>
</template>

<script>
export default {
    name: 'Input',
    props: {
        val: {
            default: ''
        },
        bordered: {
            type: Boolean,
            default: false
        }
    },
    data: () => ({
        value: ''
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