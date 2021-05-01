<template>
    <div>
        <HelpMessage>
            <template v-slot:content>
                <p>Enter up to 10 passwords, including its aliases, usernames and descriptions. When you have finished, click on the <i>Encrypt and save</i> button..</p>
            </template>
            <template v-slot:action>
                <Button 
                    class="primary"
                    @click="$router.push({ name: 'encrypt', params: { data: items.slice(0, 10) } })">
                    <i class="fi left fi-locked"></i>
                    Encrypt and save
                </Button>
            </template>
        </HelpMessage>

        <Table :columns="columns" :rows="items" v-if="items.length">
            <template v-slot:cell="{ index, row, column }">
                <Input 
                    :val="row[column.key]" 
                    :maxlength="column.length"
                    :placeholder="column.placeholder"
                    @change="value => update(index, column.key, value)"/>

                <CopyButton 
                    v-if="column.copyable" 
                    :content="row[column.key]"
                    @copied="success" />
            </template>

            <template v-slot:action="{ index }">
                <Button class="icon red" @click="remove(index)">
                    <i class="fi fi-trash"></i>
                </Button>
            </template>
        </Table>
        
        <center>
            <Button v-if="items.length < 10" @click="items.push({})">
                <i class="fi fi-plus-a"></i> Add new password
            </Button>
        </center>
    </div>
</template>

<script>
import EventBus from '@/lib/eventbus';

import Input from '@/elements/Input';
import Button from '@/elements/Button';
import Table from '@/elements/Table';

import CopyButton from '@/components/CopyButton';
import HelpMessage from '@/components/HelpMessage';

export default {
    name: 'Manager',
    props: {
        data: Array
    },
    data: () => ({
        columns: [
            { key: 'alias', length: 20, copyable: false, placeholder: 'Example credentials' },
            { key: 'username', length: 25, copyable: true, placeholder: 'myusername' },
            { key: 'password', length: 25, copyable: true, placeholder: 'myp4ssw0rd' },
            { key: 'description', length: 50, copyable: false, placeholder: 'https://myservi.ce/login' }
        ],
        items: []
    }),
    mounted() {
        this.items = !Array.isArray(this.data) || this.data.length === 0 ? [{}] : this.data;
    },
    methods: {
        success() {
            EventBus.$emit('notification', { type: 'success', content: 'Done!'});
        },
        update(index, key, value) {
            this.items[index][key] = value;
        },
        remove(index) {
            this.items.splice(index, 1);
            this.success();
        }
    },
    components: { Input, Button, Table, CopyButton, HelpMessage }
}
</script>