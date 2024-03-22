# Items

This is **Items**. It's whatever you want it to be!

Actually it's a minimal starter webapp backed by a relational database, using the following stack:

**Backend:**
- Spring Boot as the kitchen sink (mostly web backend and Dependency Injection) framework.
- Kotlin as the backend language.
- Database-agnostic, but using H2 embedded in-memory database as a minimal implementation.

**Frontend:**
- React

**Build system, project structure:**
- Gradle
  - Kotlin DSL (not Groovy).
  - Multi-module project.
- I used <https://github.com/arnaud-deprez/spring-boot-react-sample> as a starting point to integrate React and Spring Boot in the same project.

### Requirements
- Tested on MacOS Monterey 12.7.4 (Intel Xeon E5 (2013)).
  Should run on any reasonably recent Linux-ish system.
- Java v17
- Node.js v21.7.1
- yarn v1.22.22

### Running

Using two different terminal windows:

Start the backend. Changes to the backend code require a re-compile and restart of the server.
```shell
chmod 0755 ./gradlew # Only necessary the first time, and only if you somehow got a copy without the executable bit set
./gradlew bootRun
```

Start the frontend. Changes to the frontend code will automatically refresh.
```shell
cd frontend
yarn install # Only necessary the first time
yarn start
```

To use the webapp UI, direct your browser to <http://localhost:3000>.

You can also hit the REST API directly at <http://localhost:8080/items>.

### Testing

```shell
./gradlew test
```