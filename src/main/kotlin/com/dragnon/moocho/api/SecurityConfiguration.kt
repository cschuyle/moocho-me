package com.dragnon.moocho.api

import jakarta.servlet.FilterChain
import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.ProviderManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.DelegatingPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.provisioning.JdbcUserDetailsManager
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Service
import org.springframework.web.filter.OncePerRequestFilter
import java.io.IOException
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import javax.sql.DataSource

@Configuration
@EnableWebSecurity
class SecurityConfiguration {

    @Bean
    fun delegatingPasswordEncoder(): PasswordEncoder {
        val passwordEncoder = DelegatingPasswordEncoder(
            "bcrypt",
            mapOf("bcrypt" to BCryptPasswordEncoder(10))
        ).apply {
            setDefaultPasswordEncoderForMatches(BCryptPasswordEncoder())
        }
        return passwordEncoder
    }

    @Bean
    fun authenticationManager(
        userDetailsService: UserDetailsService,
        passwordEncoder: PasswordEncoder
    ): AuthenticationManager {
        val authenticationProvider = DaoAuthenticationProvider()
        authenticationProvider.setUserDetailsService(userDetailsService)
        authenticationProvider.setPasswordEncoder(passwordEncoder)
        return ProviderManager(authenticationProvider)
    }

    @Bean
    fun apiKeyAuthFilter(
        apiKeyRepository: ApiKeyRepository,
        userDetailsService: UserDetailsService
    ): ApiKeyAuthFilter {
        return ApiKeyAuthFilter(apiKeyRepository, userDetailsService)
    }

    @Bean
    fun securityFilterChain(
        http: HttpSecurity,
        apiKeyAuthFilter: ApiKeyAuthFilter
    ): SecurityFilterChain {
        val disableSecurity = (System.getenv("DISABLE_SECURITY") ?: "").ifEmpty { "false" }

        // register the API key filter before username/password filter
        http.addFilterBefore(apiKeyAuthFilter, UsernamePasswordAuthenticationFilter::class.java)

        if ("true".equals(disableSecurity)) {
            http.invoke {
                authorizeRequests {
                    authorize(anyRequest, authenticated)
                }
                csrf { disable() }
            }
        } else {
            http.invoke {
                authorizeRequests {
                    authorize(anyRequest, authenticated)
                }
                csrf { disable() }
                formLogin { }
                httpBasic { }
            }
        }
        return http.build()
    }

    @Bean
    fun userDetailsService(dataSource: DataSource): UserDetailsService {
        return JdbcUserDetailsManager(dataSource)
    }
}

class ApiKeyAuthFilter(
    private val apiKeyRepository: ApiKeyRepository,
    private val userDetailsService: UserDetailsService
) : OncePerRequestFilter() {

    private val headerName = "X-API-KEY"

    @Throws(ServletException::class, IOException::class)
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val apiKey = request.getHeader(headerName)

        if (!apiKey.isNullOrBlank() && SecurityContextHolder.getContext().authentication == null) {
            val username = apiKeyRepository.findUsernameByApiKey(apiKey)
            if (!username.isNullOrBlank()) {
                val userDetails = userDetailsService.loadUserByUsername(username)
                val auth = UsernamePasswordAuthenticationToken(userDetails, null, userDetails.authorities)
                auth.details = WebAuthenticationDetailsSource().buildDetails(request)
                SecurityContextHolder.getContext().authentication = auth
            }
        }

        filterChain.doFilter(request, response)
    }
}

@Service
class ApiKeyService(
    @org.springframework.beans.factory.annotation.Value("\${api.key.pepper:}")
    private val apiKeyPepper: String?
) {
    private val hmacSecret: ByteArray = (apiKeyPepper?.takeIf { it.isNotBlank() }
        ?: throw IllegalStateException("API_KEY_PEPPER must be set")).toByteArray(Charsets.UTF_8)

    fun hmacHex(apiKey: String): String {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(hmacSecret, "HmacSHA256"))
        val result = mac.doFinal(apiKey.toByteArray(Charsets.UTF_8))
        return result.joinToString("") { "%02x".format(it) }
    }
}

@Service
class ApiKeyRepository(
    private val jdbcTemplate: JdbcTemplate,
    private val apiKeyService: ApiKeyService
) {
    // Return the username associated with the apiKey, or null if not found.
    fun findUsernameByApiKey(apiKey: String): String? {
        val hash = apiKeyService.hmacHex(apiKey)
        val sql = "select username from api_keys where api_key_hash = ?"
        return try {
            // TODO  log access
            jdbcTemplate.queryForObject(sql, { rs, _ -> rs.getString("username") }, hash)
        } catch (ex: EmptyResultDataAccessException) {
            null
        }
    }
}

