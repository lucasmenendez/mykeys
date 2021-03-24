<template>
    <tr class="credential">
        <Cell 
            :content="data.alias" 
            :editable="edit" 
            @change="val => data.alias = val"/>

        <Cell 
            :content="data.username" 
            :copyable="true" 
            :editable="edit" 
            @change="val => data.username = val"/>

        <Cell 
            :content="data.password" 
            :copyable="true" 
            :hidden="true" 
            :editable="edit"
            @change="val => data.password = val"/>
        
        <Cell 
            :content="data.description" 
            :editable="edit"
            @change="val => data.description = val"/>
        
        <td>
            <button class="action" @click="edit = !edit">{{ edit ? 'Save': 'Edit' }}</button>
            <button class="action" v-if="!edit" @click="$emit('delete')">Delete</button>
        </td>
    </tr>
</template>

<script>
import Cell from '@/components/Cell';

export default {
    name: 'Row',
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        edit: false
    }),
    methods: {
        log(i) {
            console.log(i);
        }
    },
    components: {
        Cell
    }
}
</script>

<style>
.action {
    height: auto;
    line-height: normal;
    padding: 2px 5px;
    margin-bottom: 0;
    margin-left: 8px;
}
</style>