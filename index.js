const { Readable } = require("stream");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const S3_ENCRYPTION = "AES256";

/**
 * Appender.
 *
 * @param {object} config - Appender configuration.
 * @param {Function} layout - Layout function.
 * @param {Readable} stream - Log stream.
 * @param {Promise} uploadPromise - S3 upload promise.
 * @returns {Function} - Log function.
 */
function appender(config, layout, stream, uploadPromise) {
  function log(loggingEvent) {
    stream.push(`${layout(loggingEvent, config.timezoneOffset)}\n`);
  }

  log.shutdown = async (done) => {
    stream.push(null);
    await uploadPromise;

    if (done) {
      done();
    }
  };

  return log;
}

/**
 * Configure.
 *
 * @param {object} config - Appender configuration.
 * @param {module} layouts - Layouts module.
 * @returns {Function} - Appender function.
 */
function configure(config, layouts) {
  let layout = layouts.colouredLayout;

  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }

  const stream = createStream();
  const uploadPromise = upload(
    config.region,
    config.bucket,
    config.key,
    stream
  );

  return appender(config, layout, stream, uploadPromise);
}

/**
 * Create stream.
 *
 * @returns {Readable} - Readable stream.
 */
function createStream() {
  const stream = new Readable();
  stream._read = () => {};

  return stream;
}

/**
 * Upload to S3.
 *
 * @param {string} region - S3 region.
 * @param {string} bucket - S3 bucket.
 * @param {string} key - S3 key.
 * @param {string} body - File data.
 * @returns {Promise} - Upload promise.
 */
function upload(region, bucket, key, body) {
  const upload = new Upload({
    client: new S3Client({ region }),
    params: {
      Bucket: bucket,
      Key: key,
      Body: body,
      ServerSideEncryption: S3_ENCRYPTION,
    },
  });

  return upload.done();
}

module.exports.configure = configure;
