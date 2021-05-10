<div>
<img src="/url-shortner.png" width="400px" height="200px">
</div>

# URL Shortener

![GitHub issues](https://img.shields.io/github/issues/rishabh570/sc-url-shortener)
[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)

A simple URL shortener utility built with nodejs, postgreSQL, redis and kafka.


## Installation 

- Clone the project

```
git clone https://gitlab.com/rishabhrawat570/url-shortener.git
cd url-shortener
```

- Install the dependencies

```
npm install
```

- Then, you can run the server

```
npm start
```

or, you can run the server on dev with live reload

```
npm run dev
```

Open [http://localhost:8201/status](http://localhost:8201/status) with your favorite browser to check the status of the service.
 
## Running Tests

To run tests, run the following command

```bash
  npm run test
```

  
## Usage/Examples

### To get the short URL

```bash
$ curl -d '{"url": "<LONG-URL>"}' -H 'Content-Type: application/json' <BASE_URL>/shortenUrl
```

or, you can explicitly provide the TTL (time-to-live) for the short URL. By default, TTL is set to 2 years ahead.

```bash
$ curl -d '{"url": "<LONG-URL>", "ttl": "2020-12-25"}' -H 'Content-Type: application/json' <BASE_URL>/shortenUrl
```

Response:

```json
{
    "shortUrl":"<SHORT-URL>",
    "longUrl":"<LONG-URL>"
}
```

### To get the long URL

```bash
$ curl -i -H 'Content-Type: application/json' <BASE_URL>/<SHORT-URL>
```

Response:

```
HTTP/1.1 302 OK
Date: Thu, 02 Jul 2020 10:31:09 GMT
Transfer-Encoding: chunked
Connection: keep-alive
Location: <LONG-URL>
```
  
## FAQ

#### How a short key is generated?

It uses `nanoId` to generate a random string of predefined length.

#### How does it ensure the uniqueness of the key?

- `nanoId` doesn't ensure the uniqueness that's why there is an expiry date set at the time of short URL creation. A short key is open for reuse once the expiry date is hit.
- There are retries performed if it lands upon a non-expired short key during the random key generation process.
- Retries are capped and can be tweaked as per the requirement.

#### Does it support Analytics?

It uses Kafka to send events whenever a short URL is clicked. This gives the flexibility of plugging your own analytics service.

## Contributing

This project is open for any type of contribution. Feel free to open an issue if you have any query or found a bug.

## License

Licensed under the MIT License, Copyright © 2021

See [LICENSE](https://gitlab.com/rishabhrawat570/url-shortener/-/blob/development/LICENSE) for more information.

## Used By

This project is used by the following companies:

- Smallcase Technologies Pvt Ltd
