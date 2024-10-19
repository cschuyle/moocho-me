package com.dragnon.moocho.api

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.ProviderManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.config.web.server.ServerHttpSecurity.http
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.factory.PasswordEncoderFactories
import org.springframework.security.crypto.password.DelegatingPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.provisioning.JdbcUserDetailsManager
import org.springframework.security.web.SecurityFilterChain
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
    fun userDetailsService(dataSource: DataSource): UserDetailsService {
        return JdbcUserDetailsManager(dataSource);
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
    fun securityFilterChain(
        http: HttpSecurity
    ): SecurityFilterChain {
        val disableSecurity = (System.getenv("MY_ENV") ?: "").ifEmpty { "default_value" }

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
        return http.build();
    }
}