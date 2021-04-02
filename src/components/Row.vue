<template>
    <tr class="credential">
        <Cell 
            :content="idata.alias" 
            :editable="edit" 
            @change="update('alias', idata.alias)"/>

        <Cell 
            :content="idata.username" 
            :copyable="true" 
            :editable="edit" 
            @change="update('username', idata.username)"/>

        <Cell 
            :content="idata.password" 
            :copyable="true" 
            :hidden="true" 
            :editable="edit"
            @change="update('password', idata.password)"/>
        
        <Cell 
            :content="idata.description" 
            :editable="edit"
            @change="update('description', idata.description)"/>
        
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
        idata: {},
        edit: false
    }),
    created() {
        this.idata = this.data;
    },
    methods: {
        update(attr, val) {
            this.idata[attr] = val;
            this.$emit('update', this.idata);
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