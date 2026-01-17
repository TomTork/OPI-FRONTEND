<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    
    <!-- Основной контент -->
    <main class="flex-1 pt-12">
      <div class="mx-auto px-4 pt-12 pb-40" style="max-width: 1200px;">
        <NuxtPage />
      </div>
    </main>


    <Footer />
  </div>
</template>

<script setup lang="ts">
    import Header from '~/components/Header.vue'
    import Footer from '~/components/Footer.vue'
</script>
