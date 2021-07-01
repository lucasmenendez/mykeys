<template>
    <div class="question-section">
        <ul class="menu">
            <li v-for="(item, index) in questions" :key="index" @click="goTo(index)">
                {{ item.question }}
            </li>
        </ul>

        <div class="questions">
            <div class="question-frame" 
                v-for="(item, index) in questions" 
                :key="index"
                :ref="`question-${index}`">
                <Box class="question">
                    <template v-slot:content>
                        <h3>{{ item.question }}</h3>
                        <p>{{ item.answer }}</p>
                    </template>
                </Box>
            </div>
        </div>
    </div>
</template>

<script>
import Box from '@/elements/Box';

export default {
    name: 'Questions',
    props: {
        questions: {
            type: Array,
            required: true
        }
    },
    methods: {
        goTo(index) {
            const ref = `question-${index}`;
            this.$refs[ref][0].scrollIntoView({ behavior: 'smooth' });
        }
    },
    components: { Box }
}
</script>

<style scoped>
.question-section {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 5%;
}

.question-section .menu {
    display: inline-block;
    position: sticky;
    top: 0;
    vertical-align: top;
    flex-grow: 1;
    width: 30%;
    list-style: none;
    margin: 20px 0;
    padding: 20px 20px;
}

.question-section .menu li {
    display: inline-block;
    vertical-align: top;
    width: 100%;
    height: auto;
    border-bottom: 1px solid #ddd;
    padding: 20px 0;
    color: #666;
    cursor: pointer;
    transition: color .2s ease-in-out;
}

.question-section .menu li:last-child { border: none; }

.question-section .menu li:hover {
    color: #0095ff;
}

.question-section .questions {
    display: inline-block;
    vertical-align: top;
    width: 65%;
}

.question-section .questions .question-frame {
    padding: 20px 0;
}

.question-section .questions .question-frame .question {
    padding: 20px 30px;
}

.question-section .questions .question-frame .question h3 {
    font-weight: lighter;
    margin-bottom: 20px;
}

.question-section .questions .question-frame .question p {
    font-size: .9em;
}
</style>