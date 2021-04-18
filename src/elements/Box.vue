<template>
    <div class="box">
        <slot></slot>
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
</style>