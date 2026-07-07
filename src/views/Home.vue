<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useProductsStore } from '@/stores/products'

const store = useProductsStore()
const carouselRef = ref<HTMLElement | null>(null)

const scrollCarousel = (direction: 'left' | 'right') => {
  if (!carouselRef.value) return
  const scrollAmount = carouselRef.value.clientWidth * 0.8
  carouselRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

onMounted(() => {
  store.fetchProducts()

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' })

  document.querySelectorAll('.venture-card').forEach(card => {
    observer.observe(card)
  })
})
</script>

<template>
  <main class="pt-16">
    <!-- Hero -->
    <section class="min-h-[90vh] flex flex-col justify-center px-6 md:px-12 max-w-7xl mx-auto py-24">
      <div class="text-xs font-mono uppercase tracking-[0.3em] text-tech mb-6 flex items-center gap-3">
        <span class="inline-block w-8 h-px bg-tech"></span>
        Venture Studio · Problem-First
      </div>
      <h1 class="text-[clamp(3rem,9vw,8rem)] leading-[0.9] tracking-tighter font-serif mb-8 max-w-5xl">
        The system<br/>builds itself.
      </h1>
      <p class="text-lg md:text-2xl text-neutral-500 max-w-2xl font-light leading-relaxed mb-12">
        SALTEDHASH is a venture studio and brand umbrella. We build intelligent software systems and curate natural essentials — guided by elegant utility.
      </p>
      <div class="flex flex-wrap gap-4">
        <router-link to="/studio" class="group flex items-center gap-2 bg-neutral-900 text-white px-7 py-3.5 text-sm uppercase tracking-widest font-medium hover:bg-tech transition-all duration-300" v-ripple>
          Enter Studio <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </router-link>
        <router-link to="/triu" class="group flex items-center gap-2 border border-neutral-200 px-7 py-3.5 text-sm uppercase tracking-widest font-medium hover:border-naturals hover:text-naturals transition-all duration-300" v-ripple>
          TRIU Naturals <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </router-link>
      </div>
    </section>

    <!-- Product Carousel (Replaces 3D Scene) -->
    <section class="relative py-16 md:py-24 bg-neutral-50 overflow-hidden">
      <div class="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs font-mono uppercase tracking-widest text-naturals mb-2">Featured Products</div>
            <h2 class="text-3xl md:text-5xl font-serif">Curated Essentials</h2>
          </div>
          <div class="flex gap-2">
            <button @click="scrollCarousel('left')" class="w-10 h-10 flex items-center justify-center border border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-200" aria-label="Scroll left">
              <ChevronLeft class="w-5 h-5" />
            </button>
            <button @click="scrollCarousel('right')" class="w-10 h-10 flex items-center justify-center border border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-200" aria-label="Scroll right">
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div ref="carouselRef" class="flex overflow-x-auto gap-6 px-6 md:px-12 pb-4 hide-scrollbar snap-x snap-mandatory">
        <template v-if="store.loading">
          <div v-for="i in 4" :key="i" class="flex-none w-[280px] md:w-[320px] snap-start">
            <div class="bg-white border border-neutral-200 p-6">
              <div class="w-full aspect-[3/4] bg-neutral-100 animate-pulse mb-4"></div>
              <div class="w-3/4 h-5 bg-neutral-100 animate-pulse mb-2"></div>
              <div class="w-1/2 h-4 bg-neutral-100 animate-pulse"></div>
            </div>
          </div>
        </template>

        <template v-else>
          <div
            v-for="product in (store.products.length > 0 ? store.products : store.fallbackProducts)"
            :key="product.$id"
            @click="store.openProductPanel(product)"
            class="flex-none w-[280px] md:w-[320px] snap-start group cursor-pointer"
          >
            <div class="bg-white border border-neutral-200 group-hover:border-naturals transition-colors duration-300 overflow-hidden flex flex-col h-full">
              <div class="aspect-[3/4] bg-neutral-100 overflow-hidden relative">
                <img
                  v-if="product.imageFileId"
                  :src="store.getImageUrl(product.imageFileId)"
                  :alt="product.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-neutral-50 p-6">
                  <div class="text-center">
                    <div class="text-5xl font-serif text-neutral-300 mb-2">{{ product.name?.charAt(0) || '?' }}</div>
                    <div class="text-xs font-mono uppercase tracking-widest text-neutral-400">{{ product.category || 'Product' }}</div>
                  </div>
                </div>
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium tracking-widest uppercase border border-neutral-200">
                  {{ product.category || 'Natural' }}
                </div>
              </div>
              <div class="p-5 flex flex-col flex-grow">
                <h3 class="font-serif text-lg font-medium text-neutral-900 mb-1">{{ product.name }}</h3>
                <p class="text-neutral-500 text-xs leading-relaxed mb-3 line-clamp-2">{{ product.description }}</p>
                <div class="mt-auto flex items-center justify-between">
                  <span v-if="product.price" class="font-medium text-neutral-900 text-sm">₹{{ product.price.toFixed(0) }}</span>
                  <span class="text-[10px] font-medium text-neutral-400 group-hover:text-naturals transition-colors uppercase tracking-wider">View &rarr;</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- Ventures -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 px-6 py-24 max-w-7xl mx-auto">
      <router-link to="/studio" class="venture-card group relative overflow-hidden bg-background border border-neutral-200 p-10 md:p-14 hover:border-tech transition-colors duration-500 min-h-[380px] flex flex-col justify-between" v-card-tilt>
        <div class="absolute inset-0 bg-tech/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
        <div class="relative z-10">
          <div class="text-xs font-mono uppercase tracking-widest text-tech mb-4">01 — Services</div>
          <h2 class="font-serif text-4xl md:text-5xl mb-6">Tech & AI/ML</h2>
          <p class="text-neutral-500 max-w-md leading-relaxed">Software automation, AI-driven solutions, and digital strategy to scale your operations efficiently.</p>
        </div>
        <div class="relative z-10 flex items-center gap-2 text-sm uppercase tracking-widest mt-12 font-medium text-tech opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Enter Studio <ArrowRight class="w-4 h-4 group-hover:translate-x-2 transition-transform" />
        </div>
      </router-link>

      <router-link to="/triu" class="venture-card group relative overflow-hidden bg-background border border-neutral-200 p-10 md:p-14 hover:border-naturals transition-colors duration-500 min-h-[380px] flex flex-col justify-between" v-card-tilt>
        <div class="absolute inset-0 bg-naturals/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
        <div class="relative z-10">
          <div class="text-xs font-mono uppercase tracking-widest text-naturals mb-4">02 — Products</div>
          <h2 class="font-serif text-4xl md:text-5xl mb-6">TRIU Naturals</h2>
          <p class="text-neutral-500 max-w-md leading-relaxed">Chemical-free care rooted in tradition. Pure neem, rose, and natural utility products for everyday rituals.</p>
        </div>
        <div class="relative z-10 flex items-center gap-2 text-sm uppercase tracking-widest mt-12 font-medium text-naturals opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Explore Catalog <ArrowRight class="w-4 h-4 group-hover:translate-x-2 transition-transform" />
        </div>
      </router-link>

      <router-link to="/studio" class="venture-card group relative overflow-hidden bg-background border border-neutral-200 p-10 md:p-14 hover:border-marketing transition-colors duration-500 min-h-[380px] flex flex-col justify-between" v-card-tilt>
        <div class="absolute inset-0 bg-marketing/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
        <div class="relative z-10">
          <div class="text-xs font-mono uppercase tracking-widest text-marketing mb-4">03 — Marketing</div>
          <h2 class="font-serif text-4xl md:text-5xl mb-6">Shri Nandi Marketing</h2>
          <p class="text-neutral-500 max-w-md leading-relaxed">Data-driven growth, digital presence, and brand strategy for businesses ready to scale. Powered by field-tested marketing operations.</p>
        </div>
        <div class="relative z-10 flex items-center gap-2 text-sm uppercase tracking-widest mt-12 font-medium text-marketing opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          View Services <ArrowRight class="w-4 h-4 group-hover:translate-x-2 transition-transform" />
        </div>
      </router-link>
    </section>

    <!-- CTA Band -->
    <section class="bg-neutral-900 text-white py-20 px-6 text-center">
      <h3 class="font-serif text-4xl md:text-6xl mb-6">A problem-first product lab.</h3>
      <router-link to="/contact" class="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium hover:text-neutral-300 transition-colors" v-ripple>
        Work with us <ArrowRight class="w-4 h-4" />
      </router-link>
    </section>
  </main>
</template>

<style scoped>
.venture-card {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out, border-color 0.3s ease;
}

.venture-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
