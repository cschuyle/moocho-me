# Moocho Me

**Moocho Me** is a mess O data with some ability to browse it.

### Setup

- Java 21
- Node.js v21.7.1
- yarn v1.22.22

Copy .envrc-template
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

To use the webapp UI, direct your browser to <http://localhost:3000/>.

You can also hit the REST API directly at <http://localhost:8080/>.

### Testing

```shell
./gradlew test
```