<template>
    <button v-bind="$attrs" @click="$emit('click')">
        <slot></slot>
    </button>
</template>

<style>
button {
    display: inline-block;
    vertical-align: top;
    width: auto;
    margin: 5px;
    padding: 15px 30px;
    border-radius: 100px;
    outline: none;
    border: 1px solid #ccc;
    background: white;
    font-family: inherit;
    font-size: .9em;
    font-weight: inherit;
    box-shadow: 0px 0px 15px -7px #000;
    cursor: pointer;
    transition: all .2s ease-in-out;
}

button:hover {
    background: #f0f0f0;
}

button:active {
    transform: translateY(3px);
    box-shadow: 0px 0px 10px -6px #000;
}

button.icon {
    box-shadow: none;
    border: none;
    color: #2980b9;
    padding: 10px;
    min-width: 30px;
    text-align: center;
}

button.primary {
    background: linear-gradient(135deg, #ea00fb 0%, #090979 35%, #0095ff 100%);;
    color: white;
}

button.red {
    color: #c0392b;
}
</style>