<template>
    <footer class="bg-gray-900 text-gray-100 mt-12">
            <div class="container mx-auto px-6 py-6 flex flex-col items-center md:items-start space-y-2">

                <!-- Политика конфиденциальности -->
                <NuxtLink to="/privacy" class="hover:underline text-sm">
                    Политика конфиденциальности
                </NuxtLink>

                <!-- Контакты: почта и телефон на одной строке -->
                <div class="flex flex-row gap-6 text-sm">
                    <a href="mailto:contact@example.com" class="hover:underline">
                    contact@example.com
                    </a>
                    <a href="tel:+78121234567" class="hover:underline">
                    +7 (812) 123-45-67
                    </a>
                </div>

                <!-- Копирайт -->
                <div class="text-sm text-center md:text-left mt-2 md:mt-0">
                    © 2025 Library Project. Все права защищены.
                </div>

            </div>
    </footer>
</template>