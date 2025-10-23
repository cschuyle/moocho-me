// kotlin
package com.dragnon.moocho.api

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.GetObjectRequest
import com.amazonaws.services.s3.model.S3Object
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.context.annotation.Bean
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.security.core.userdetails.User
import org.springframework.security.provisioning.InMemoryUserDetailsManager
import org.springframework.test.context.jdbc.Sql
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@Sql(
    scripts = ["/create-auth-tables.sql", "/insert-testuser-api-key.sql"],
    executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS
)
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = [
        "moocho.bucket.name=test-bucket-name",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password="
    ]
)
class SecurityComponentTest {

    companion object {
        @JvmStatic
        @org.springframework.test.context.DynamicPropertySource
        fun dynamicProperties(registry: org.springframework.test.context.DynamicPropertyRegistry) {
            registry.add("api.key.pepper") { "pepper" }
        }

        const val TEST_API_KEY = "test-api-key"
        const val TEST_USERNAME = "testuser"
    }

    @Autowired
    lateinit var restTemplate: TestRestTemplate

    @MockBean
    lateinit var amazonS3Client: AmazonS3

    @MockBean
    lateinit var apiKeyRepository: ApiKeyRepository

    @BeforeEach
    fun setup() {
        whenever(amazonS3Client.getObject(any<GetObjectRequest>())).thenReturn(mock<S3Object>())
        whenever(amazonS3Client.getObject(anyString(), anyString())).thenReturn(mock<S3Object>())
    }


    @TestConfiguration
    class TestConfig {

        @RestController
        class Controller {
            @GetMapping("/test/authenticated")
            fun whoami(principal: Principal): String = principal.name
        }

        @Bean
        fun testUserDetailsService(): InMemoryUserDetailsManager {
            val user = User.withUsername(TEST_USERNAME)
                .password("{noop}unused")
                .roles("USER")
                .build()
            return InMemoryUserDetailsManager(user)
        }
    }

    @Test
    fun `authenticates when API key is valid`() {

        given(apiKeyRepository.findUsernameByApiKey(TEST_API_KEY)).willReturn(TEST_USERNAME)

        val entity = HttpEntity<Void>(HttpHeaders().apply { set("X-API-KEY", TEST_API_KEY) })
        val resp = restTemplate.exchange("/test/authenticated", HttpMethod.GET, entity, String::class.java)

        assertThat(resp.statusCode.value()).isEqualTo(200)
        assertThat(resp.body).isEqualTo(TEST_USERNAME)
    }

    @Test
    fun `does not authenticate when API key is invalid`() {

        // mock ApiKeyService to resolve the api key to the test username
        given(apiKeyRepository.findUsernameByApiKey(TEST_API_KEY)).willReturn(null)

        // call the protected endpoint with the X-API-KEY header
        val entity = HttpEntity<Void>(HttpHeaders().apply { set("X-API-KEY", TEST_API_KEY) })
        val resp = restTemplate.exchange("/test/authenticated", HttpMethod.GET, entity, String::class.java)

        val actual = resp.statusCode.value()
        // TODO Figure out why from IntelliJ it's 200; from the command line it's an exception 403
        assertThat(actual).isIn(200, 403)
        if (actual == 200) {
            assertThat(resp.body).contains("Please sign in")
        }
    }
}