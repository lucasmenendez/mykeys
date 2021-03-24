<template>
    <div class="searchbox">
        <i class="fi fi-search"></i>
        <input 
            type="text" 
            v-model="needle" 
            placeholder="Type a query to filter the list..."
            @input="$emit('change', needle)"/>
    </div>
</template>

<script>
export default {
    name: 'SearchBox',
    data: () => ({ needle: '' })
}
</script>

<style scoped>
.searchbox {
    width: 100%;
    box-sizing: border-box;
}

.searchbox .fi {
    width: 50px;
    text-align: center;
}

.searchbox input {
    width: calc(100% - 50px);
}
</style>