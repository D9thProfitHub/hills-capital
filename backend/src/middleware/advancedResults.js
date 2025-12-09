import { Op } from 'sequelize';
import ErrorResponse from '../utils/errorResponse.js';

const advancedResults = (model, include) => async (req, res, next) => {
  const reqQuery = { ...req.query };

  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `[Op.${match}]`);

  const where = JSON.parse(queryStr, (key, value) => {
    if (typeof value === 'string' && value.startsWith('[Op.')) {
      const op = value.substring(4, value.length - 1);
      return Op[op];
    }
    return value;
  });

  const options = { where };

  if (req.query.select) {
    options.attributes = req.query.select.split(',');
  }

  if (req.query.sort) {
    options.order = req.query.sort.split(',').map((field) => field.split(':'));
  } else {
    options.order = [['createdAt', 'DESC']];
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  options.offset = (page - 1) * limit;
  options.limit = limit;

  if (include) {
    options.include = include;
  }

  try {
    const { count, rows } = await model.findAndCountAll(options);

    const pagination = {};
    if (options.offset + limit < count) {
      pagination.next = { page: page + 1, limit };
    }
    if (options.offset > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.advancedResults = {
      success: true,
      count: rows.length,
      total: count,
      pagination,
      data: rows,
    };

    next();
  } catch (err) {
    console.error('Error in advancedResults middleware:', err);
    next(new ErrorResponse('Error fetching data', 500));
  }
};

export default advancedResults;
