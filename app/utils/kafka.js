module.exports = (kafkaProducer) => {
  return {
    recordTrackingNotification(trackingMeta) {
      kafkaProducer.produce('shortUrlOpened', trackingMeta);
    },
  };
};
