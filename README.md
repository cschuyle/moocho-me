# Items

This is **Items**. It's whatever you want it to be!

Actually it's a minimal starter webapp backed by a relational database, using the following stack:
- Spring Boot as the kitchen sink (mostly web backend and Dependency Injection) framework
- Kotlin as the backend language
- Gradle as the build system, using the Groovy DSL (not Kotlin)
- Database-agnostic, but using H2 embedded in-memory database as a minimal implementation

### Requirements
- Tested on Windows Linux Subsystem and MacOS Monterey 12.7.4 (Intel Xeon).
  Should run on any reasonably recent Linux-ish system.
- Java runtime 21

### Running

```shell
./gradlew bootRun
```

Then direct your browser to <http://localhost:8080>

### Testing

```shell
./gradlew test
```