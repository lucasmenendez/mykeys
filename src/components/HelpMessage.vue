<template>
    <Box class="help-message" :elevation="false">
        <template v-slot:content>
            <Step>
                <template v-slot:content>
                    <slot name="content"></slot>
                </template>
                <template v-slot:action>
                    <slot name="action"></slot>
                </template>
            </Step>
        </template>
    </Box>
</template>

<script>
import Box from '@/elements/Box';
import Step from '@/elements/Step';

export default {
    name: 'HelpMessage',
    components: { Box, Step }
}
</script>

<style scoped>
.help-message {
    display: inline-block;
    vertical-align: top;
    width: 96%;
    margin: 20px 2%;
    padding: 10px 20px;
}

</style>