const prisma = require('../config/prisma');

// Save a support message to DB
const saveMessage = async (req, res) => {
  try {
    const { senderId, senderName, senderRole, text, recipientId, isFromAdmin } = req.body;
    if (!senderId || !text) {
      return res.status(400).json({ error: 'senderId and text are required.' });
    }
    const msg = await prisma.supportMessage.create({
      data: {
        senderId,
        senderName: senderName || 'Unknown',
        senderRole: senderRole || 'CUSTOMER',
        text,
        recipientId: recipientId || null,
        isFromAdmin: isFromAdmin || false,
      },
    });
    res.status(201).json(msg);
  } catch (error) {
    console.error('Error saving support message:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get all support messages (Admin: all; Customer: their own)
const getMessages = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let where = {};
    if (role !== 'ADMIN') {
      // Customers/staff only see their own thread
      where = {
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      };
    }

    const messages = await prisma.supportMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching support messages:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { saveMessage, getMessages };
