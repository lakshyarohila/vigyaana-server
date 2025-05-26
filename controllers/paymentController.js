const razorpay = require('../config/razorpay');
const prisma = require('../config/db');
const crypto = require('crypto');

exports.createOrder = async (req, res) => {
  const { courseId } = req.body;

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course || course.status !== 'PUBLISHED') {
      return res.status(404).json({ message: 'Course not found or unpublished' });
    }

    const options = {
      amount: Math.round(course.price * 100), // price in paise
      currency: 'INR',
      receipt: `receipt_${courseId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      course,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courseId,
  } = req.body;

  const userId = req.user.id;

  try {
    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Save payment
    const payment = await prisma.payment.create({
      data: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: parseFloat(req.body.amount) / 100,
        status: 'success',
        userId,
        courseId,
      },
    });

    // Enroll user
    await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    res.status(200).json({ message: 'Payment successful & enrolled' });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
