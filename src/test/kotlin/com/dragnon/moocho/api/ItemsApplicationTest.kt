package com.dragnon.moocho.api

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class MoochoApplicationTests {

    companion object {
        @JvmStatic
        @org.springframework.test.context.DynamicPropertySource
        fun dynamicProperties(registry: org.springframework.test.context.DynamicPropertyRegistry) {
            registry.add("api.key.pepper") { "doesn't matter" }
        }
    }

    @Test
    fun contextLoads() {
    }

}
