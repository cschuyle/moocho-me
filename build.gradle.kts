import io.spring.gradle.dependencymanagement.DependencyManagementPlugin
import org.jetbrains.kotlin.gradle.plugin.KotlinPlatformJvmPlugin

plugins {
    base
    kotlin("jvm") version "1.9.24" apply false
    id("io.spring.dependency-management") version "1.1.5" apply false
}

allprojects {
    group = "com.dragnon.moocho-web"
    version = "0.0.1-SNAPSHOT"

    repositories {
        mavenLocal()
        mavenCentral()
    }
}
