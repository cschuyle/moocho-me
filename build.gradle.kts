import org.gradle.api.tasks.testing.logging.TestExceptionFormat
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.3.0"
    id("io.spring.dependency-management") version "1.1.5"
    id("org.jetbrains.kotlin.jvm") version "1.9.24"
    id("org.jetbrains.kotlin.plugin.spring") version "1.9.24"
}

group = "com.dragnon.moocho-web"
version = "0.0.1-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenLocal()
    mavenCentral()
}

dependencies {
//	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-jdbc")

    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    runtimeOnly("com.h2database:h2")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    implementation("org.springframework.boot:spring-boot-starter-security")
// TODO When this is actually deployed somewhere, cache the searchIndexes with time-expiration and test it.
//    implementation("org.ehcache:ehcache:3.10.8")


//	testImplementation 'org.jetbrains.kotlin:kotlin-test'

    implementation("org.apache.lucene:lucene-core:9.10.0")
    implementation("org.apache.lucene:lucene-analysis-common:9.10.0")
    implementation("org.apache.lucene:lucene-queryparser:9.10.0")

    implementation("com.amazonaws:aws-java-sdk-s3:1.12.732")

    implementation("org.postgresql:postgresql:42.7.3")

    testImplementation("com.nhaarman.mockitokotlin2:mockito-kotlin:2.2.0")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs += "-Xjsr305=strict"
        jvmTarget = "17"
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.withType<Test> {
    testLogging {
//		events("standardOut", "started", "passed", "skipped", "failed")
        events("failed")
//		showStandardStreams = true
        exceptionFormat = TestExceptionFormat.FULL
    }
}

if (project.hasProperty("prod")) {
    tasks.withType<Jar> {
        dependsOn(":frontend:yarn_build")

        from("../frontend/build") {
            into("static")
        }
    }
}

tasks.withType<Jar> {
    manifest {
        attributes["Main-Class"] = "com.dragnon.moocho.api.AppKt"
    }
    // To avoid the duplicate handling strategy error
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE

    // To add all of the dependencies
    from(sourceSets.main.get().output)

    dependsOn(configurations.runtimeClasspath)
    from({
        configurations.runtimeClasspath.get().filter { it.name.endsWith("jar") }.map { zipTree(it) }
    })
}

