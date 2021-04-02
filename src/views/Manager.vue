<template>
    <div ref="table" class="container extra-width">
        <div class="row">
            <div class="column one-half">
                <SearchBox @change="val => this.needle = val"/>
            </div>
            <div class="column one-half" style="text-align: right;">
                <Download :data="items"/>
            </div>
        </div>

        <table class="credentials u-full-width">
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
                <Row 
                    v-for="(item, index) in filteredItems" 
                    :key="index"
                    :data="item"
                    @update="newItem => item = newItem"
                    @delete="items.splice(index, 1)"/>
            </tbody>
        </table>

        <AddNew @click="items.push({})" />
    </div>
</template>

<script>
import SearchBox from '@/components/SearchBox';
import Download from '@/components/Download';
import Row from '@/components/Row';
import AddNew from '@/components/AddNew';

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
    created() {
        window.onbeforeunload = () => 'Are you sure? Data will be deleted...';
    },
    mounted() {
        if (!Array.isArray(this.data) || this.data.length === 0) this.$router.push({ name: 'home' });
        this.items = this.data;
    },
    components: { SearchBox, Download, Row, AddNew }
}
</script>

<style scoped>
.container {
    width: 90%;
    max-width: 1200px;
    margin-top: 10vh;
}

.credentials {
    margin-bottom: 5vh;
}

.credentials thead th {
    background: white;
    position: sticky;
    top: 0;
    padding-top: 5vh;
}

.credentials thead th:after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background: #999;
}
</style>