<template>
    <div v-bind="$attrs" :class="['box', !elevation ? 'plain': '']">
        <div>
            <slot name="content"></slot>
        </div>
        <div class="extra" v-if="$slots.extra">
            <slot name="extra"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Box',
    props: {
        elevation: {
            type: Boolean,
            default: true
        }
    }
}
</script>

<style scoped>
.box {
    border: 1px solid #ddd;
    background: white;
    box-sizing: border-box;
    border-radius: 8px;
    box-shadow: 0px 10px 20px -15px #000;
}

.box.plain {
    border: none;
    box-shadow: none;
    border-radius: 0;
}

.box .extra {
    background: #ddd;
    border-top: 1px solid #ddd;
    border-bottom-left-radius: 7px;
    border-bottom-right-radius: 7px;
}

.box.plain .extra { 
    border: none;
    border-radius: 0;
}
</style>