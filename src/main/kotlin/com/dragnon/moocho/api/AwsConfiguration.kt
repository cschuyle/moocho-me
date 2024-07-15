package com.dragnon.moocho.api

import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.AmazonS3ClientBuilder
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration


@Configuration
class AwsConfiguration {

    private val logger = org.slf4j.LoggerFactory.getLogger(this::class.java)

    @Bean
    fun objectMapper(): ObjectMapper {
        return jacksonObjectMapper()
    }

    @Bean
    fun amazonS3Client(
        @Value("\${aws.access.key}") accessKey: String,
        @Value("\${aws.secret.key}") secretKey: String,
        @Value("\${aws.region:#{null}}") region: String?,
        @Value("\${aws.endpoint.url:#{null}}") endpoint: String?
    ): AmazonS3 {
        val creds = AWSStaticCredentialsProvider(BasicAWSCredentials(accessKey, secretKey))
        logger.info("ENDPOINT: ${endpoint}")
        if (endpoint == null) {
            if (region == null) {
                throw IllegalStateException("Property aws.endpoint.url not provided, therefore must provide aws.region, which is not provided")
            }
            logger.info("AWS login to standard AWS")
            return AmazonS3ClientBuilder
                .standard()
                .withCredentials(creds)
                .withRegion(region)
                .build()
        } else {
            logger.warn("AWS login to non-standard endpoint")
            return AmazonS3ClientBuilder
                .standard()
                .withCredentials(creds)
                .withEndpointConfiguration(AwsClientBuilder.EndpointConfiguration(endpoint, ""))
                .withPathStyleAccessEnabled(true)
                .build()
        }
    }
}