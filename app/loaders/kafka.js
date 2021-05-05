const { kafka, serviceName } = require('../../config');

module.exports = (kafkaNode, generate, logger) => {
  const kafkaClient = new kafkaNode.KafkaClient({ kafkaHost: kafka.host });
  const kafkaProducer = new kafkaNode.Producer(kafkaClient, kafka.producerOptions);

  kafkaProducer.on('ready', () => {
    logger.info({ message: 'Kafka Producer Connected' });
  });

  kafkaProducer.on('error', (error) => {
    logger.error({ message: 'Error: Connection to kafka failed', error });
  });

  return {
    /**
     * Produce a message to be sent to a single kafka topic
     * @param {string} topic topic to which you need to produce
     * @param {Object | Object[]} data payload you need to send to kafka
     * @param {String} [remarks] any remarks for the produced event
     */
    produce(topic, data, remarks) {
      const uniqueId = generate();
      const time = new Date().toJSON();
      const message = {
        id: uniqueId,
        origin: serviceName,
        time,
        topic,
        data,
      };

      if (remarks) message.remarks = remarks;

      const stringifiedData = JSON.stringify(message);
      const toSend = [
        {
          topic,
          messages: stringifiedData,
          attributes: 2, // 0 - no compression | 1 - gzip | 2 - snappy
        },
      ];

      return new Promise((resolve, reject) => {
        if (!kafkaProducer) {
          return reject(new Error('Kafka producer not available to produce events'));
        }
        kafkaProducer.send(toSend, (err, res) => {
          if (err) {
            logger.error({
              topic,
              id: uniqueId,
              remarks,
              status: 'Event producing failed',
              error: err,
              data: res,
            });
            return reject(err);
          }
          logger.info({
            topic,
            id: uniqueId,
            remarks,
            status: 'Event produced successfuly',
          });
          return resolve(res);
        });
      });
    },
  };
};
