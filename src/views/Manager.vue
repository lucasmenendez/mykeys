<template>
    <div>   
        <Button 
            class="primary"
            @click="$router.push({ name: 'encrypt', params: { data: items.slice(0, 10) } })">
            <i class="fi left fi-locked"></i>
            Encrypt and store
        </Button>

        <Table :columns="columns" :rows="items">
            <template v-slot:cell="{ index, row, column }">
                <Input 
                    :val="row[column.key]" 
                    :maxlength="column.length"
                    @change="value => update(index, column.key, value)"/>

                <CopyButton v-if="column.copyable" :content="row[column.key]"/>
            </template>

            <template v-slot:action="{ index }">
                <Button class="icon red" @click="items.splice(index, 1)">
                    <i class="fi fi-trash"></i>
                </Button>
            </template>
        </Table>

        <Button v-if="items.length < 10" @click="items.push({})">
            <i class="fi fi-plus-a"></i> Add new password
        </Button>
    </div>
</template>

<script>
import Input from '@/elements/Input';
import Button from '@/elements/Button';
import Table from '@/elements/Table';

import CopyButton from '@/components/CopyButton';

export default {
    name: 'Manager',
    props: {
        data: Array
    },
    data: () => ({
        columns: [
            { key: 'alias', length: 10, copyable: false },
            { key: 'username', length: 25, copyable: true },
            { key: 'password', length: 25, copyable: true },
            { key: 'description', length: 50, copyable: false }
        ],
        items: []
    }),
    mounted() {
        if (!Array.isArray(this.data) || this.data.length === 0) this.$router.push({ name: 'home' });
        this.items = this.data;
    },
    methods: {
        update(index, key, value) {
            console.log(index, key, value);
            this.items[index][key] = value;
        }
    },
    components: { Input, Button, Table, CopyButton }
}
</script>