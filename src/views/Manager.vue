<template>
    <div>
        <div>
            <Input 
                placeholder="Type a query to filter the list..."
                :bordered="true"
                @input="n => this.needle = n" />
            
            <Button @click="$router.push({ name: 'encrypt', params: { data } })">
                Encrypt and store
            </Button>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Alias</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(i, index) in filteredItems" :key="index">
                    <td>
                        <Input 
                            :val="i.alias" 
                            @change="d => i.alias = d"/>
                    </td>
                    <td>
                        <Input :val="i.username" @change="d => i.username = d"/>
                        <CopyButton :content="i.username"/>
                    </td>
                    <td>
                        <Input :val="i.password" @change="d => i.password = d"/>
                        <CopyButton :content="i.password"/>
                    </td>
                    <td>
                        <Input 
                            :val="i.description" 
                            @change="d => i.description = d"/>
                    </td>
                    <td>
                        <Button @click="items.splice(index, 1)">
                            <i class="fi fi-trash"></i>
                        </Button>
                    </td>
                </tr>
            </tbody>
        </table>

        <Button @click="items.push({})">
            <i class="fi fi-plus-a"></i> Add new password
        </Button>
    </div>
</template>

<script>
import Input from '@/elements/Input';
import Button from '@/elements/Button';

import CopyButton from '@/components/CopyButton';

export default {
    name: 'Manager',
    props: {
        data: Array
    },
    data: () => ({
        items: [],
        needle: ''
    }),
    computed: {
        filteredItems() {
            if (this.needle === '') return this.items;

            const needle = this.needle.toLowerCase();
            return this.items.filter(item => {
                return item.alias.toLowerCase().includes(needle) ||
                    item.description.toLowerCase().includes(needle);
            });
        }
    },
    mounted() {
        if (!Array.isArray(this.data) || this.data.length === 0) this.$router.push({ name: 'home' });
        this.items = this.data;
    },
    components: { Input, Button, CopyButton }
}
</script>