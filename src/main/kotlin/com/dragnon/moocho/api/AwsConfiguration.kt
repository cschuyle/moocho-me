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
    @Bean
    fun objectMapper(): ObjectMapper {
        return jacksonObjectMapper()
    }

    @Bean
    fun amazonS3Client(
        @Value("\${aws.access.key}") accessKey: String,
        @Value("\${aws.secret.key}") secretKey: String,
        @Value("\${aws.region}") region: String?,
        @Value("\${aws.endpoint.url:null}") endpoint: String?
    ): AmazonS3 {
        val awsStaticCredentialsProvider = AWSStaticCredentialsProvider(BasicAWSCredentials(accessKey, secretKey))
        if (endpoint == null) {
            return AmazonS3ClientBuilder
                .standard()
                .withCredentials(awsStaticCredentialsProvider)
                .withRegion(region)
                .build()
        } else {
            return AmazonS3ClientBuilder
                .standard()
                .withCredentials(awsStaticCredentialsProvider)
                .withEndpointConfiguration(AwsClientBuilder.EndpointConfiguration(endpoint, ""))
                .withPathStyleAccessEnabled(true)
                .build()
        }
    }
}