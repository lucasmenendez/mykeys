<template>
    <div class="jumbo">
        <img :src="picture"/>
        <h1>{{ title }}</h1>
        <p v-html="description" />
    </div>
</template>

<script>
export default {
    name: 'Jumbo',
    props: {
        picture: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
.jumbo {
    display: block;
    margin: 5vh auto;
    max-width: 80%;
    color: white;
    text-align: center;
    background: linear-gradient(135deg, rgba(234,0,251,1) 0%, rgba(9,9,121,1) 35%, rgba(0,149,255,1) 100%);
    padding: 5vh 5vw;
    border-radius: 32px;
    box-shadow: 0px 10px 20px -15px #000;
}

.jumbo img {
    display: inline-block;
    vertical-align: top;
    max-width: 150px;
    width: 30vw;
}

.jumbo h1 {
    margin: 5vh auto 3vh;
}

.jumbo p {
    font-weight: 100;
    line-height: 1.5em;
    font-size: .9em;
}
</style>