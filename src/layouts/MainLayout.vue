<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-grey-10 text-brown-1" style="height: 70px">
      <q-toolbar>
        <q-toolbar-title>Mis Proyectos</q-toolbar-title>
        <div v-if="searchBar" class="q-ma-sm">
          <q-input
            color="brown-1"
            label-color="brown-1"
            input-class="text-brown-1"
            v-model="searchQuery"
            label="Buscar..."
          />
        </div>
        <q-btn flat @click="updateSearchBar()" round dense icon="search" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view :search-query="searchQuery"></router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    return {
      searchQuery: ref(""),
      searchBar: ref(false),
    };
  },

  methods: {
    updateSearchQuery(query) {
      this.searchQuery = query;
    },

    updateSearchBar() {
      if (this.searchBar) {
        this.searchBar = false;
      } else {
        this.searchBar = true;
      }
    },
  },
};
</script>

<style></style>

<style lang="sass">
.text-white
  color: $brown-1
</style>
