# URL Shortener

A simple URL shortener built with nodejs, postgreSQL, redis and kafka.

<div>
<img src="/url-shortner.png" width="400px" height="200px">
</div>

## Key Points

Usage | PostgreSQL Table
--- | ---
Long URL <> Short URL mapping | `shortenedLinks`
Short Key <> Expiry date mapping | `shortUrlExpiry`

- It uses [nanoid](https://www.npmjs.com/package/nanoid) for short key generation which doesn't guarantee unique key generation in itself. So, retries are performed to land upon a unique short key that is not already utilized.
- There is no cleanup service as of now to purge expired mappings. Short keys can get simply reused if they are expired.
- URL mappings are cached in redis for faster retrieval.
- For tracking purposes, a kafka event is triggered on topic `shortUrlOpened` whenever a short URL is clicked/opened.

## Getting Started

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

## How To Use

### To get the short URL

```bash
$ curl -d '{"url": "<LONG-URL>"}' -H 'Content-Type: application/json' http://localhost:8201/shortenUrl
```

or, you can explicitly provide the TTL (time-to-live) for the short URL. By default, TTL is set to 2 years ahead.

```bash
$ curl -d '{"url": "<LONG-URL>", "ttl": "2020-12-25"}' -H 'Content-Type: application/json' http://localhost:8201/shortenUrl
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
$ curl -i -H 'Content-Type: application/json' http://localhost:8201/<SHORT-URL>
```

Response:
```
HTTP/1.1 302 OK
Date: Thu, 02 Jul 2020 10:31:09 GMT
Transfer-Encoding: chunked
Connection: keep-alive
Location: <LONG-URL>
```

## Contributions

This project is open for any type of contribution. Feel free to open an issue if you have any query or found a bug.

## License

Licensed under the MIT License, Copyright © 2021

See [LICENSE](https://gitlab.com/rishabhrawat570/url-shortener/-/blob/development/LICENSE) for more information.