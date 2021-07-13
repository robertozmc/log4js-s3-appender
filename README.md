# Log4JS - S3 appender

This is an optional appender for [log4js-node](https://log4js-node.github.io/log4js-node/).

## Installation

```bash
npm i log4js-s3-appender
```

## Configuration

- `type` - `log4js-s3-appender`
- `region` - `string` - S3 region
- `bucket` - `string` - S3 bucket
- `key` - `string` - S3 key

## Example

```javascript
log4js.configure({
  appenders: {
    s3: {
      type: "log4js-s3-appender",
      region: "eu-west-1",
      bucket: "eu-west-1-logs",
      key: "log"
    }
  },
  categories: {
    default: {
      appenders: ["s3"],
      level: "info"
    }
  }
});
```

As a result a new text file will be uploaded to the S3 bucket with given key.
File is encrypted using `AES256`.
