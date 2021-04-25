<template>
    <div class="step" :class="['step', !index ? 'no-index' : '']">
        <span class="index" v-if="index">
            {{ index }}
        </span>

        <div class="content">
            <slot name="content"></slot>
        </div>

        <div v-if="$scopedSlots.action" class="action">
            <slot name="action"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Step',
    props: {
        index: {
            type: Number,
            required: false
        }
    }
}
</script>

<style scoped>
.step {
    display: grid;
    grid-template-columns: 10% auto 30%;
    grid-template-areas: "index content action";
    margin: 3vh 0;
    padding: 1vh 3vw;
    align-items: center;
    justify-content: space-around;
}

.step.no-index {
    grid-template-columns: auto 30%;
    grid-template-areas: "content action";
}

.step.no-index .index { display: none; }

.step .index {
    text-align: center;
    grid-area: index;
    font-size: 1.5em;
    font-weight: bold;
    color: transparent;
    background: #666;
    background-clip: text;
    text-shadow: 0px 1px 1px rgba(255, 255, 255, .5);
}

.step .content {
    grid-area: content;
}

.step .action {
    grid-area: action;
    text-align: center;
}

@media screen and (max-width: 876px) {
    .step {
        grid-template-columns: 20% 80%;
        row-gap: 2vh;
        grid-template-areas: 
            "index content"
            "action action";
    }

    .step.step.no-index {
        grid-template-columns: 20% 80%;
        row-gap: 2vh;
        grid-template-areas: 
            "content content"
            "action action";
    }
}
</style>