plugins {
    id("org.springframework.boot") version "3.3.1"
    id("io.spring.dependency-management") version "1.1.5"
    kotlin("jvm") version "1.9.24"
    kotlin("plugin.spring") version "1.9.24"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {

    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-stdlib:2.0.0")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // Web, API
    implementation("org.springframework.boot:spring-boot-starter-web")

    // Database
    implementation("org.springframework.boot:spring-boot-starter-data-jdbc")
    runtimeOnly("org.postgresql:postgresql")

    // Security
    implementation("org.springframework.boot:spring-boot-starter-security")

// TODO When this is actually deployed somewhere, cache the searchIndexes with time-expiration and test it.
//    implementation("org.ehcache:ehcache:3.10.8")

    // Lucene
    implementation("org.apache.lucene:lucene-core:9.11.1")
    implementation("org.apache.lucene:lucene-analysis-common:9.11.1")
    implementation("org.apache.lucene:lucene-queryparser:9.11.1")

    // AWS
    implementation("com.amazonaws:aws-java-sdk-s3:1.12.761")

    // Local Dev
    //    runtimeOnly("com.h2database:h2")
    developmentOnly("org.springframework.boot:spring-boot-devtools")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testImplementation("com.ninja-squad:springmockk:4.0.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testImplementation("com.nhaarman.mockitokotlin2:mockito-kotlin:2.2.0")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

// Don't do this - it breaks the executable jar (results in main ClassNotFound).
//    tasks.withType<Jar> {
//        manifest {
//            attributes["Main-Class"] = "com.example.ktskull.AppKt"
//        }
//    }

// Use this instead of tasks,withType<Jar>
//springBoot {
//    mainClass.set("com.dragnon.moocho.api.AppKt")
//}

// Disable generation of plain jar - it confuses poor old Heroku unless you use a Procfile (override the startup command),
// because Heroku uses build.libs/*.jar as its target for the java -jar command.
// See https://docs.spring.io/spring-boot/gradle-plugin/packaging.html#packaging-executable.and-plain-archives
tasks.named("jar") {
    enabled = false
}
