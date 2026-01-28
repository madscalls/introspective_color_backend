const { celebrate, Joi, Segments } = require('celebrate');

const validateCreatePost = celebrate({
  [Segments.BODY]: Joi.object().keys({
    imageUrl: Joi.string().uri().required(),
    publicId: Joi.string().allow('').optional(),
    color: Joi.string()
      .valid('red', 'orange', 'yellow', 'green', 'blue', 'purple')
      .required(),
    hashtags: Joi.alternatives()
      .try(Joi.string().allow(''), Joi.array().items(Joi.string().allow('')))
      .optional(),
  }),
});

const validatePostId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    postId: Joi.string().hex().length(24).required(),
  }),
});

module.exports = {
  validateCreatePost,
  validatePostId,
};
