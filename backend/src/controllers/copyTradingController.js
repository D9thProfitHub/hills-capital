import CopyTradingRequest from '../models/CopyTradingRequest';
import User from '../models/User';
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

// Get all copy trading requests (admin only)
export const getCopyTradingRequests = async (req, res) => {
  try {
    const { status, userId, traderId } = req.query;
    const whereClause = {};
    
    // Add status filter if provided
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Filter by user ID if provided
    if (userId) {
      whereClause.userId = userId;
    }

    // Filter by trader ID if provided
    if (traderId) {
      whereClause.assignedTraderId = traderId;
    }

    const requests = await CopyTradingRequest.findAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'name', 'email', 'phone', 'country', 'createdAt'] 
        },
        { 
          model: User, 
          as: 'trader', 
          attributes: ['id', 'name', 'email'] 
        }
      ],
      order: [['createdAt', 'DESC']],
      paranoid: false // Include soft-deleted records
    });
    
    // Format the response data
    const responseData = requests.map(request => {
      const requestData = request.get({ plain: true });
      
      // Remove sensitive data
      delete requestData.password;
      
      // Format dates
      if (requestData.createdAt) {
        requestData.requestDate = new Date(requestData.createdAt).toISOString().split('T')[0];
      }
      
      // Add user info
      if (requestData.user) {
        requestData.userName = requestData.user.name || 'Unknown User';
        requestData.userEmail = requestData.user.email || 'No email';
      }
      
      // Add trader info
      if (requestData.trader) {
        requestData.assignedTrader = requestData.trader.name || 'Unassigned';
      } else {
        requestData.assignedTrader = 'Unassigned';
      }
      
      // Add status badge
      requestData.statusBadge = getStatusBadge(requestData.status);
      
      return requestData;
    });

    res.status(200).json({
      success: true,
      count: responseData.length,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching copy trading requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching copy trading requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to get status badge
const getStatusBadge = (status) => {
  const statusMap = {
    pending: { label: 'Pending', color: 'warning' },
    approved: { label: 'Approved', color: 'info' },
    active: { label: 'Active', color: 'success' },
    rejected: { label: 'Rejected', color: 'error' },
    completed: { label: 'Completed', color: 'default' },
    cancelled: { label: 'Cancelled', color: 'default' }
  };
  
  return statusMap[status] || { label: status, color: 'default' };
};

// Create a new copy trading request
export const createCopyTradingRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { 
      name,
      accountType, 
      broker, 
      server, 
      login, 
      password, 
      riskLevel, 
      maxDrawdown 
    } = req.body;
    
    // Check if user already has a pending or active request
    const existingRequest = await CopyTradingRequest.findOne({
      where: {
        userId: req.user.id,
        status: {
          [Op.or]: ['pending', 'approved', 'processing']
        }
      }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You already have an active or pending copy trading request' 
      });
    }

    const request = await CopyTradingRequest.create({
      userId: req.user.id,
      name,
      accountType,
      broker,
      server,
      login,
      password, // Will be hashed by model hook
      riskLevel,
      maxDrawdown,
      status: 'pending',
      notes: 'New copy trading request submitted'
    });

    // Don't return password in response
    const response = request.get({ plain: true });
    delete response.password;

    res.status(201).json({
      success: true,
      message: 'Copy trading request submitted successfully',
      data: response
    });
  } catch (error) {
    console.error('Error creating copy trading request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating copy trading request',
      error: error.message 
    });
  }
};

// Update copy trading request status (admin only)
export const updateCopyTradingRequestStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { id } = req.params;

    const request = await CopyTradingRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Copy trading request not found' 
      });
    }

    // Update status and notes
    request.status = status;
    
    // Add status change to notes
    const statusChangeNote = `Status changed to ${status} by admin`;
    request.notes = request.notes 
      ? `${request.notes}\n${statusChangeNote}` 
      : statusChangeNote;
    
    // Add custom notes if provided
    if (notes) {
      request.notes = request.notes 
        ? `${request.notes}\nAdmin note: ${notes}`
        : `Admin note: ${notes}`;
    }

    await request.save();

    // Don't return password in response
    const response = request.get({ plain: true });
    delete response.password;

    res.json({
      success: true,
      message: 'Copy trading request updated successfully',
      data: response
    });
  } catch (error) {
    console.error('Error updating copy trading request status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating copy trading request status',
      error: error.message 
    });
  }
};

// Get copy trading request by ID
export const getCopyTradingRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await CopyTradingRequest.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'name', 'email', 'phone', 'country', 'createdAt'] 
        },
        { 
          model: User, 
          as: 'trader', 
          attributes: ['id', 'name', 'email', 'phone'] 
        }
      ],
      paranoid: false // Include soft-deleted records
    });
    
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Copy trading request not found' 
      });
    }
    
    // Format the response
    const response = request.get({ plain: true });
    
    // Remove sensitive data
    delete response.password;
    
    // Format dates
    if (response.createdAt) {
      response.requestDate = new Date(response.createdAt).toLocaleDateString();
      response.requestTime = new Date(response.createdAt).toLocaleTimeString();
    }
    
    if (response.updatedAt) {
      response.updatedDate = new Date(response.updatedAt).toLocaleDateString();
    }
    
    // Add status badge
    response.statusBadge = getStatusBadge(response.status);
    
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching copy trading request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching copy trading request',
      error: error.message 
    });
  }
};

// Get copy trading requests for current user
export const getMyCopyTradingRequests = async (req, res) => {
  try {
    const requests = await CopyTradingRequest.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'trader', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    // Don't return passwords in the response
    const sanitizedRequests = requests.map(request => {
      const requestData = request.get({ plain: true });
      delete requestData.password;
      return requestData;
    });

    res.json({
      success: true,
      data: sanitizedRequests
    });
  } catch (error) {
    console.error('Error fetching user copy trading requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching your copy trading requests',
      error: error.message 
    });
  }
};
