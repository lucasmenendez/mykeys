<template>
    <div v-bind="$attrs" :class="'box'">
        <div>
            <slot name="content"></slot>
        </div>
        <div class="extra" v-if="$slots.extra">
            <slot name="extra"></slot>
        </div>
    </div>
</template>


<style scoped>
.box {
    border: 1px solid #ddd;
    background: white;
    box-sizing: border-box;
    border-radius: 8px;
    box-shadow: 0px 10px 20px -15px #000;
}

.box .extra {
    background: #ddd;
    border-top: 1px solid #ddd;
    border-bottom-left-radius: 7px;
    border-bottom-right-radius: 7px;
}
</style>