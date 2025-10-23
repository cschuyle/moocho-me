package com.dragnon.moocho.api

import org.assertj.core.api.Assertions.assertThat
import kotlin.test.Test

class SecurityTest {

    private val API_KEY_PEPPER = "pepper"

    @Test
    fun `should compute API key HMAC hash correctly`() {
        val apiKey = "test-api-key"
        val hmacHashHex = ApiKeyService(API_KEY_PEPPER).hmacHex(apiKey)
        assertThat(hmacHashHex).isEqualTo("f5ddaaa067f0eb0cf47d8aad45f2086bc5774948b7b7209b6e091839feedda0a")
    }
}