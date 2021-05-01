<template>
    <div class="container">
        <slot></slot>
    </div>
</template>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background: white;
    font-family: 'Open Sans', sans-serif;
    font-weight: 300;
    font-size: 1.1em;
}

body > * {
    display: inline-block;
    vertical-align: top;
}

.container {
    display: block;
    margin: 0 auto;
    max-width: 1200px;
}
</style>