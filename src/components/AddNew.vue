<template>
    <button
        class="add-new" 
        @click="$emit('click')">
        <i class="fi fi-plus-a"></i>
        Add new
    </button>
</template>

<style scoped>
.add-new {
    margin-bottom: 5vh;
}
</style>