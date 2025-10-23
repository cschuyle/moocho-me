package com.dragnon.moocho.api

import org.assertj.core.api.Assertions.assertThat
import kotlin.test.Test

class SecurityTest {

    private val API_KEY_PEPPER = "secret-key-aka-pepper"

    @Test
    fun `should compute API key HMAC hash correctly`() {
        val apiKey = "test-api-key"
        val hmacHashHex = ApiKeyService(API_KEY_PEPPER).getHmacHashHex(apiKey)
        assertThat(hmacHashHex).isEqualTo("50a62eefb989e360a7cf2296e5594411ca8bc7ba9d2c413c0b23372215efb5d4")
    }
}