<template>
    <Box class="quickstart">
        <template v-slot:content>
            <h2>Quick Start</h2>
            <Step :index="1">
                <template v-slot:content>First you need to create a new collection to start storing your passwords.</template>
                <template v-slot:action>
                    <CreateCollection @created="data => $router.push({ name: 'manager', params: { data }})">
                        <i class="fi left fi-plus-a"></i>
                        New collection
                    </CreateCollection>
                </template>
            </Step>
            <Step :index="2">
                <template v-slot:content>Enter up to 10 passwords, including its aliases, usernames and descriptions and encrypt them with your master password.</template>
                <template v-slot:action><Icon class="fi fi-locked"></Icon></template>
            </Step>
            <Step :index="3">
                <template v-slot:content>Get your password collection as a URL and save it as a bookmark or share it with anyone you want.</template>
                <template v-slot:action><Icon class="fi fi-broken-link"></Icon></template>
            </Step>
        </template>
    </Box>
</template>

<script>
import Box from '@/elements/Box';
import Icon from '@/elements/Icon';
import Step from '@/elements/Step';

import CreateCollection from '@/components/CreateCollection';

export default {
    name: 'QuickStart',
    components: { Box, Step, Icon, CreateCollection }
}
</script>

<style scoped>
.quickstart {
    display: block;
    margin: 5vh auto;
    padding: 5vh 0;
    max-width: 80%;
    border-radius: 32px;
}

.quickstart h2 {
    text-align: center;
    font-weight: lighter;
    color: #666;
}
</style>