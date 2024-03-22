package com.dragnon.fortxi.items.rest

import com.dragnon.fortxi.items.data.Item
import com.jayway.jsonpath.DocumentContext
import com.jayway.jsonpath.JsonPath
import net.minidev.json.JSONArray
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import kotlin.random.Random

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ItemControllerTest {
    @Autowired
    var restTemplate: TestRestTemplate? = null

    fun rest() = restTemplate!!

    @Test
    fun shouldSaveAndRetrieveAnItem() {
        val randomName = randomString()
        val newItem = Item(randomName)
        val createResponse: ResponseEntity<Void> = rest()
            .postForEntity("/items", newItem, Void::class.java)
        assertThat(createResponse.statusCode).isEqualTo(HttpStatus.OK)

        val getResponse: ResponseEntity<List<*>> = rest()
            .getForEntity("/items", List::class.java)
        assertThat(getResponse.statusCode).isEqualTo(HttpStatus.OK)

        val documentContext: DocumentContext = JsonPath.parse(getResponse.body as List<*>)
        val names: JSONArray = documentContext.read("\$..name")
        assertThat(names).contains(randomName)
    }
}

private val charPool: List<Char> = ('a'..'z') + ('A'..'Z') + ('0'..'9')
private fun randomString() = (1..20)
    .map { Random.nextInt(0, charPool.size).let { charPool[it] } }
    .joinToString("")
