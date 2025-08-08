// server/controllers/reportController.js
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const VolunteerHistory = require('../models/VolunteerHistory');
const UserProfile = require('../models/UserProfile');
const UserCredentials = require('../models/UserCredentials');
const EventDetails = require('../models/EventDetails');
const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const csv = require('csv-writer');
const path = require('path');
const fs = require('fs');

/**
 * @route GET /api/reports/volunteers
 * @description Get volunteer participation report with filtering options
 * @access Private (Admin only)
 */
const getVolunteerReport = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate, 
    eventType, 
    skillFilter,
    minHours,
    maxHours,
    format = 'json' 
  } = req.query;

  // Build query for filtering
  let matchQuery = {};
  
  // Date filtering
  if (startDate || endDate) {
    matchQuery['completedEvents.date'] = {};
    if (startDate) matchQuery['completedEvents.date'].$gte = new Date(startDate);
    if (endDate) matchQuery['completedEvents.date'].$lte = new Date(endDate);
  }

  // Hours filtering
  if (minHours || maxHours) {
    matchQuery.totalHours = {};
    if (minHours) matchQuery.totalHours.$gte = parseInt(minHours);
    if (maxHours) matchQuery.totalHours.$lte = parseInt(maxHours);
  }

  // Skills filtering
  if (skillFilter) {
    matchQuery.skills = { $in: skillFilter.split(',') };
  }

  // Get volunteers with populated event data
  const volunteers = await Volunteer.find(matchQuery)
    .populate({
      path: 'completedEvents.eventId',
      match: eventType ? { eventType } : {},
      select: 'title eventType startDate location duration organizer'
    })
    .select('name email skills totalHours averageRating completedEvents createdAt location')
    .sort({ totalHours: -1 });

  // Process the data to calculate participation statistics
  const reportData = volunteers.map(volunteer => {
    const filteredEvents = volunteer.completedEvents.filter(event => 
      event.eventId && (!eventType || event.eventId.eventType === eventType)
    );

    const eventsByType = {};
    let totalFilteredHours = 0;

    filteredEvents.forEach(event => {
      if (event.eventId) {
        const type = event.eventId.eventType;
        eventsByType[type] = (eventsByType[type] || 0) + 1;
        totalFilteredHours += event.hours || 0;
      }
    });

    return {
      id: volunteer._id,
      name: volunteer.name,
      email: volunteer.email,
      skills: volunteer.skills,
      location: volunteer.location,
      totalHours: volunteer.totalHours,
      filteredHours: totalFilteredHours,
      averageRating: volunteer.averageRating,
      totalEvents: volunteer.completedEvents.length,
      filteredEvents: filteredEvents.length,
      eventsByType,
      memberSince: volunteer.createdAt,
      recentEvents: filteredEvents.slice(0, 5).map(event => ({
        title: event.eventId?.title,
        date: event.date,
        hours: event.hours,
        rating: event.rating
      }))
    };
  });

  // Generate summary statistics
  const summary = {
    totalVolunteers: reportData.length,
    totalHours: reportData.reduce((sum, v) => sum + v.filteredHours, 0),
    totalEvents: reportData.reduce((sum, v) => sum + v.filteredEvents, 0),
    averageHoursPerVolunteer: reportData.length > 0 ? 
      (reportData.reduce((sum, v) => sum + v.filteredHours, 0) / reportData.length).toFixed(2) : 0,
    topVolunteers: reportData.slice(0, 10),
    skillsDistribution: {},
    locationDistribution: {}
  };

  // Calculate skills and location distribution
  reportData.forEach(volunteer => {
    volunteer.skills.forEach(skill => {
      summary.skillsDistribution[skill] = (summary.skillsDistribution[skill] || 0) + 1;
    });
    
    if (volunteer.location?.city) {
      const location = `${volunteer.location.city}, ${volunteer.location.state}`;
      summary.locationDistribution[location] = (summary.locationDistribution[location] || 0) + 1;
    }
  });

  if (format === 'json') {
    res.json({
      success: true,
      data: reportData,
      summary,
      filters: { startDate, endDate, eventType, skillFilter, minHours, maxHours }
    });
  } else if (format === 'csv') {
    await generateVolunteerCSV(reportData, res);
  } else if (format === 'pdf') {
    await generateVolunteerPDF(reportData, summary, res);
  } else {
    res.status(400).json({ success: false, message: 'Invalid format requested' });
  }
});

/**
 * @route GET /api/reports/events
 * @description Get event management report with volunteer assignments
 * @access Private (Admin only)
 */
const getEventReport = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    eventType,
    status,
    organizerFilter,
    format = 'json'
  } = req.query;

  // Build query for filtering
  let matchQuery = {};
  
  if (startDate || endDate) {
    matchQuery.startDate = {};
    if (startDate) matchQuery.startDate.$gte = new Date(startDate);
    if (endDate) matchQuery.startDate.$lte = new Date(endDate);
  }

  if (eventType) matchQuery.eventType = eventType;
  if (status) matchQuery.status = status;
  if (organizerFilter) matchQuery['organizer.name'] = new RegExp(organizerFilter, 'i');

  // Get events with volunteer assignment data
  const events = await Event.find(matchQuery)
    .select('title description eventType startDate endDate location maxVolunteers currentVolunteers status organizer duration averageRating createdAt')
    .sort({ startDate: -1 });

  // Get volunteer assignments for each event
  const reportData = await Promise.all(events.map(async (event) => {
    // Find volunteers who participated in this event
    const volunteers = await Volunteer.find({
      'completedEvents.eventId': event._id
    }).select('name email completedEvents');

    const assignedVolunteers = volunteers.map(volunteer => {
      const eventParticipation = volunteer.completedEvents.find(
        e => e.eventId.toString() === event._id.toString()
      );
      
      return {
        volunteerId: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        hoursWorked: eventParticipation?.hours || 0,
        rating: eventParticipation?.rating,
        participationDate: eventParticipation?.date
      };
    });

    const totalHoursWorked = assignedVolunteers.reduce((sum, v) => sum + v.hoursWorked, 0);
    const avgVolunteerRating = assignedVolunteers.filter(v => v.rating).length > 0 ?
      assignedVolunteers.filter(v => v.rating).reduce((sum, v) => sum + v.rating, 0) / 
      assignedVolunteers.filter(v => v.rating).length : 0;

    return {
      id: event._id,
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      duration: event.duration,
      maxVolunteers: event.maxVolunteers,
      currentVolunteers: event.currentVolunteers,
      actualVolunteers: assignedVolunteers.length,
      status: event.status,
      organizer: event.organizer,
      averageRating: event.averageRating,
      createdAt: event.createdAt,
      assignedVolunteers,
      totalHoursWorked,
      avgVolunteerRating: avgVolunteerRating.toFixed(2),
      capacityUtilization: ((assignedVolunteers.length / event.maxVolunteers) * 100).toFixed(1)
    };
  }));

  // Generate summary statistics
  const summary = {
    totalEvents: reportData.length,
    eventsByStatus: {},
    eventsByType: {},
    totalVolunteerHours: reportData.reduce((sum, e) => sum + e.totalHoursWorked, 0),
    totalVolunteerAssignments: reportData.reduce((sum, e) => sum + e.actualVolunteers, 0),
    avgCapacityUtilization: reportData.length > 0 ?
      (reportData.reduce((sum, e) => sum + parseFloat(e.capacityUtilization), 0) / reportData.length).toFixed(1) : 0,
    topPerformingEvents: reportData
      .filter(e => e.averageRating > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10)
  };

  // Calculate distributions
  reportData.forEach(event => {
    summary.eventsByStatus[event.status] = (summary.eventsByStatus[event.status] || 0) + 1;
    summary.eventsByType[event.eventType] = (summary.eventsByType[event.eventType] || 0) + 1;
  });

  if (format === 'json') {
    res.json({
      success: true,
      data: reportData,
      summary,
      filters: { startDate, endDate, eventType, status, organizerFilter }
    });
  } else if (format === 'csv') {
    await generateEventCSV(reportData, res);
  } else if (format === 'pdf') {
    await generateEventPDF(reportData, summary, res);
  } else {
    res.status(400).json({ success: false, message: 'Invalid format requested' });
  }
});

/**
 * @route GET /api/reports/summary
 * @description Get overall system summary report
 * @access Private (Admin only)
 */
const getSummaryReport = asyncHandler(async (req, res) => {
  const { format = 'json' } = req.query;

  // Get overall statistics
  const totalVolunteers = await Volunteer.countDocuments({ isActive: true });
  const totalEvents = await Event.countDocuments();
  const completedEvents = await Event.countDocuments({ status: 'completed' });
  const upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
  
  // Get volunteer statistics
  const volunteerStats = await Volunteer.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalHours: { $sum: '$totalHours' },
        avgRating: { $avg: '$averageRating' },
        avgHoursPerVolunteer: { $avg: '$totalHours' }
      }
    }
  ]);

  // Get event type distribution
  const eventTypeDistribution = await Event.aggregate([
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        avgRating: { $avg: '$averageRating' },
        totalCapacity: { $sum: '$maxVolunteers' },
        totalAssigned: { $sum: '$currentVolunteers' }
      }
    }
  ]);

  // Get monthly participation trends (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyTrends = await Volunteer.aggregate([
    { $unwind: '$completedEvents' },
    { $match: { 'completedEvents.date': { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$completedEvents.date' },
          month: { $month: '$completedEvents.date' }
        },
        totalHours: { $sum: '$completedEvents.hours' },
        totalEvents: { $sum: 1 },
        uniqueVolunteers: { $addToSet: '$_id' }
      }
    },
    {
      $project: {
        _id: 1,
        totalHours: 1,
        totalEvents: 1,
        uniqueVolunteers: { $size: '$uniqueVolunteers' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Get top performers
  const topVolunteers = await Volunteer.find({ isActive: true })
    .select('name email totalHours averageRating completedEvents')
    .sort({ totalHours: -1 })
    .limit(10);

  const topEvents = await Event.find({ status: 'completed' })
    .select('title eventType averageRating currentVolunteers startDate')
    .sort({ averageRating: -1, currentVolunteers: -1 })
    .limit(10);

  const summaryData = {
    overview: {
      totalVolunteers,
      totalEvents,
      completedEvents,
      upcomingEvents,
      totalVolunteerHours: volunteerStats[0]?.totalHours || 0,
      avgVolunteerRating: volunteerStats[0]?.avgRating || 0,
      avgHoursPerVolunteer: volunteerStats[0]?.avgHoursPerVolunteer || 0
    },
    distributions: {
      eventTypes: eventTypeDistribution,
      monthlyTrends
    },
    topPerformers: {
      volunteers: topVolunteers,
      events: topEvents
    },
    generatedAt: new Date()
  };

  if (format === 'json') {
    res.json({
      success: true,
      data: summaryData
    });
  } else if (format === 'pdf') {
    await generateSummaryPDF(summaryData, res);
  } else {
    res.status(400).json({ success: false, message: 'Invalid format requested' });
  }
});

// Helper function to generate CSV for volunteers
const generateVolunteerCSV = async (data, res) => {
  const filename = `volunteer_report_${Date.now()}.csv`;
  const filepath = path.join(__dirname, '../temp', filename);

  // Ensure temp directory exists
  const tempDir = path.dirname(filepath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const csvWriter = csv.createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'totalHours', title: 'Total Hours' },
      { id: 'averageRating', title: 'Average Rating' },
      { id: 'totalEvents', title: 'Total Events' },
      { id: 'skills', title: 'Skills' },
      { id: 'city', title: 'City' },
      { id: 'state', title: 'State' },
      { id: 'memberSince', title: 'Member Since' }
    ]
  });

  const csvData = data.map(volunteer => ({
    name: volunteer.name,
    email: volunteer.email,
    totalHours: volunteer.totalHours,
    averageRating: volunteer.averageRating,
    totalEvents: volunteer.totalEvents,
    skills: volunteer.skills.join(', '),
    city: volunteer.location?.city || '',
    state: volunteer.location?.state || '',
    memberSince: volunteer.memberSince?.toDateString() || ''
  }));

  try {
    await csvWriter.writeRecords(csvData);
    res.download(filepath, filename, (err) => {
      if (!err) {
        // Clean up the file after download
        fs.unlinkSync(filepath);
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating CSV', error: error.message });
  }
};

// Helper function to generate CSV for events
const generateEventCSV = async (data, res) => {
  const filename = `event_report_${Date.now()}.csv`;
  const filepath = path.join(__dirname, '../temp', filename);

  // Ensure temp directory exists
  const tempDir = path.dirname(filepath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const csvWriter = csv.createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'title', title: 'Event Title' },
      { id: 'eventType', title: 'Type' },
      { id: 'startDate', title: 'Date' },
      { id: 'status', title: 'Status' },
      { id: 'maxVolunteers', title: 'Max Volunteers' },
      { id: 'actualVolunteers', title: 'Actual Volunteers' },
      { id: 'totalHoursWorked', title: 'Total Hours' },
      { id: 'averageRating', title: 'Average Rating' },
      { id: 'organizerName', title: 'Organizer' },
      { id: 'location', title: 'Location' }
    ]
  });

  const csvData = data.map(event => ({
    title: event.title,
    eventType: event.eventType,
    startDate: event.startDate?.toDateString() || '',
    status: event.status,
    maxVolunteers: event.maxVolunteers,
    actualVolunteers: event.actualVolunteers,
    totalHoursWorked: event.totalHoursWorked,
    averageRating: event.averageRating,
    organizerName: event.organizer?.name || '',
    location: `${event.location?.city || ''}, ${event.location?.state || ''}`
  }));

  try {
    await csvWriter.writeRecords(csvData);
    res.download(filepath, filename, (err) => {
      if (!err) {
        fs.unlinkSync(filepath);
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating CSV', error: error.message });
  }
};

// Helper function to generate PDF for volunteers
const generateVolunteerPDF = async (data, summary, res) => {
  const doc = new PDFDocument();
  const filename = `volunteer_report_${Date.now()}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Title
  doc.fontSize(20).text('Volunteer Participation Report', 50, 50);
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);

  // Summary section
  doc.fontSize(16).text('Summary', 50, 120);
  doc.fontSize(12)
     .text(`Total Volunteers: ${summary.totalVolunteers}`, 50, 145)
     .text(`Total Hours: ${summary.totalHours}`, 50, 160)
     .text(`Total Events: ${summary.totalEvents}`, 50, 175)
     .text(`Average Hours per Volunteer: ${summary.averageHoursPerVolunteer}`, 50, 190);

  // Top volunteers
  let yPosition = 220;
  doc.fontSize(16).text('Top 10 Volunteers', 50, yPosition);
  yPosition += 25;

  summary.topVolunteers.slice(0, 10).forEach((volunteer, index) => {
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }
    doc.fontSize(10)
       .text(`${index + 1}. ${volunteer.name} - ${volunteer.totalHours} hours`, 50, yPosition);
    yPosition += 15;
  });

  doc.end();
};

// Helper function to generate PDF for events
const generateEventPDF = async (data, summary, res) => {
  const doc = new PDFDocument();
  const filename = `event_report_${Date.now()}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Title
  doc.fontSize(20).text('Event Management Report', 50, 50);
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);

  // Summary section
  doc.fontSize(16).text('Summary', 50, 120);
  doc.fontSize(12)
     .text(`Total Events: ${summary.totalEvents}`, 50, 145)
     .text(`Total Volunteer Hours: ${summary.totalVolunteerHours}`, 50, 160)
     .text(`Total Assignments: ${summary.totalVolunteerAssignments}`, 50, 175)
     .text(`Average Capacity Utilization: ${summary.avgCapacityUtilization}%`, 50, 190);

  // Events by status
  let yPosition = 220;
  doc.fontSize(14).text('Events by Status', 50, yPosition);
  yPosition += 20;

  Object.entries(summary.eventsByStatus).forEach(([status, count]) => {
    doc.fontSize(10).text(`${status}: ${count}`, 50, yPosition);
    yPosition += 15;
  });

  doc.end();
};

// Helper function to generate summary PDF
const generateSummaryPDF = async (data, res) => {
  const doc = new PDFDocument();
  const filename = `summary_report_${Date.now()}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Title
  doc.fontSize(20).text('VolunteerForest Summary Report', 50, 50);
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);

  // Overview section
  doc.fontSize(16).text('Overview', 50, 120);
  const overview = data.overview;
  doc.fontSize(12)
     .text(`Total Volunteers: ${overview.totalVolunteers}`, 50, 145)
     .text(`Total Events: ${overview.totalEvents}`, 50, 160)
     .text(`Completed Events: ${overview.completedEvents}`, 50, 175)
     .text(`Upcoming Events: ${overview.upcomingEvents}`, 50, 190)
     .text(`Total Volunteer Hours: ${overview.totalVolunteerHours}`, 50, 205)
     .text(`Average Volunteer Rating: ${overview.avgVolunteerRating.toFixed(2)}`, 50, 220);

  doc.end();
};

module.exports = {
  getVolunteerReport,
  getEventReport,
  getSummaryReport
};
