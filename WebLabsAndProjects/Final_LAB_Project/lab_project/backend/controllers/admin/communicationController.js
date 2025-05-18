import asyncHandler from 'express-async-handler';
import User from '../../models/User.js'; // To get user details
import sendEmail from '../../utils/sendEmail.js';

// @desc    Admin sends a message (email) to a user
// @route   POST /api/admin/communication/send-message
// @access  Private (Admin only)
const sendMessageToUser = asyncHandler(async (req, res) => {
  const { userId, subject, messageBody } = req.body;

  if (!userId || !subject || !messageBody) {
    res.status(400);
    throw new Error('User ID, subject, and message body are required.');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  if (!user.email) {
    res.status(400);
    throw new Error('User does not have an email address on file.');
  }

  const emailOptions = {
    to: user.email,
    subject: `[AgriConnect Admin] ${subject}`, // Prepend to subject for clarity
    text: `Dear ${user.name},\n\n${messageBody}\n\nBest regards,\nThe AgriConnect Admin Team`,
    // Optionally, create a more sophisticated HTML template
    html: `<p>Dear ${user.name},</p><p>${messageBody.replace(/\n/g, '<br>')}</p><p>Best regards,<br/>The AgriConnect Admin Team</p>`,
  };

  try {
    await sendEmail(emailOptions);
    res.status(200).json({ success: true, message: `Email successfully sent to ${user.name} (${user.email}).` });
  } catch (error) {
    console.error('Failed to send email from controller:', error);
    // The sendEmail utility already throws an error, but we catch it here to potentially customize the response
    res.status(500); // Internal Server Error
    throw new Error(error.message || 'Failed to send email due to a server error.');
  }
});

export { sendMessageToUser };