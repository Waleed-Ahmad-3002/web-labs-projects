// controllers/reportController.js
const Session = require('../models/Session');
const Tutor = require('../models/Tutor');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to format date for queries
const getDateRange = (range) => {
  const now = new Date();
  let startDate;
  
  switch(range) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(0); // All time
  }
  
  return { startDate, endDate: new Date() };
};

// Get popular subjects
const getPopularSubjects = async (req, res) => {
  try {
    const { range } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    // Get subjects from completed sessions within date range
    const popularSubjects = await Session.aggregate([
      {
        $match: {
          status: 'completed',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: popularSubjects
    });
  } catch (error) {
    console.error('Error fetching popular subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular subjects',
      error: error.message
    });
  }
};

// Get session completion rates
const getCompletionRates = async (req, res) => {
  try {
    const { range } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    const sessionStats = await Session.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [
                { $in: ['$status', ['cancelled_by_student', 'cancelled_by_tutor']] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          total: 1,
          completed: 1,
          cancelled: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completed', '$total'] },
              100
            ]
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: sessionStats[0] || {
        total: 0,
        completed: 0,
        cancelled: 0,
        completionRate: 0
      }
    });
  } catch (error) {
    console.error('Error fetching completion rates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching completion rates',
      error: error.message
    });
  }
};

// Get platform usage by city
const getUsageByCity = async (req, res) => {
  try {
    const { range } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    const usageByCity = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          city: { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$city',
          userCount: { $sum: 1 },
          tutorCount: {
            $sum: {
              $cond: [{ $eq: ['$role', 'tutor'] }, 1, 0]
            }
          },
          studentCount: {
            $sum: {
              $cond: [{ $eq: ['$role', 'student'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { userCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: usageByCity
    });
  } catch (error) {
    console.error('Error fetching usage by city:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching usage by city',
      error: error.message
    });
  }
};

// Get user growth over time
const getUserGrowth = async (req, res) => {
  try {
    const { range } = req.query;
    const { startDate, endDate } = getDateRange(range);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          tutors: {
            $sum: {
              $cond: [{ $eq: ['$role', 'tutor'] }, 1, 0]
            }
          },
          students: {
            $sum: {
              $cond: [{ $eq: ['$role', 'student'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          count: 1,
          tutors: 1,
          students: 1,
          _id: 0
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: userGrowth
    });
  } catch (error) {
    console.error('Error fetching user growth:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user growth',
      error: error.message
    });
  }
};

// Get all reports data in one endpoint
const getAllReports = async (req, res) => {
  try {
    const { range } = req.query;
    
    const [subjects, completion, cities, growth] = await Promise.all([
      Session.aggregate([
        {
          $match: {
            status: 'completed',
            date: { 
              $gte: getDateRange(range).startDate, 
              $lte: getDateRange(range).endDate 
            }
          }
        },
        { $group: { _id: '$subject', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Session.aggregate([
        {
          $match: {
            date: { 
              $gte: getDateRange(range).startDate, 
              $lte: getDateRange(range).endDate 
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
          }
        },
        {
          $project: {
            total: 1,
            completed: 1,
            rate: { $multiply: [{ $divide: ['$completed', '$total'] }, 100] }
          }
        }
      ]),
      User.aggregate([
        {
          $match: {
            city: { $exists: true, $ne: '' },
            createdAt: { 
              $gte: getDateRange(range).startDate, 
              $lte: getDateRange(range).endDate 
            }
          }
        },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      User.aggregate([
        {
          $match: {
            createdAt: { 
              $gte: getDateRange(range).startDate, 
              $lte: getDateRange(range).endDate 
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        popularSubjects: subjects,
        completionRate: completion[0] || { total: 0, completed: 0, rate: 0 },
        usageByCity: cities,
        userGrowth: growth
      }
    });
  } catch (error) {
    console.error('Error fetching all reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

module.exports = {
  getPopularSubjects,
  getCompletionRates,
  getUsageByCity,
  getUserGrowth,
  getAllReports
};