export function welcomeEmail(name) {
  return `
    <div style="font-family:Arial,sans-serif;color:#3b3b3b;line-height:1.6;">
      <h1 style="color:#8b5cf6;">Welcome to Bridal Beauty Studio</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining our luxury bridal makeup experience. We are excited to help you feel stunning on your special day.</p>
      <p>Book your consultation, discover premium packages, and enjoy personalized beauty.</p>
      <p style="margin-top:24px;color:#a855f7;">With love,<br/>The Bridal Beauty Team</p>
    </div>
  `;
}

export function bookingConfirmationEmail(
  customerName,
  serviceName,
  date,
  timeSlot,
  amount,
  packageName,
  servicePrice,
  packagePrice
) {
  const hasPackage = Boolean(packageName && packagePrice);
  return `
    <div style="font-family:Arial,sans-serif;color:#3b3b3b;line-height:1.6;">
      <h1 style="color:#b91c1c;">Booking Confirmed</h1>
      <p>Hi ${customerName},</p>
      <p>Your premium makeup appointment has been confirmed.</p>
      <ul>
        <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${timeSlot}</li>
        <li><strong>Service:</strong> ${serviceName}</li>
        ${hasPackage ? `<li><strong>Package:</strong> ${packageName}</li>` : ''}
        ${hasPackage ? `<li><strong>Package fee:</strong> ₹${packagePrice}</li>` : ''}
        ${hasPackage ? `<li><strong>Service fee:</strong> ₹${servicePrice}</li>` : ''}
        <li><strong>Total amount paid:</strong> ₹${amount}</li>
      </ul>
      <p>We cannot wait to create a luxurious beauty look just for you.</p>
      <p style="margin-top:24px;color:#d97706;">With elegance,<br/>Bridal Beauty Studio</p>
    </div>
  `;
}

export function passwordResetEmail(name, resetUrl) {
  return `
    <div style="font-family:Arial,sans-serif;color:#3b3b3b;line-height:1.6;">
      <h1 style="color:#db2777;">Password Reset Request</h1>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to choose a new secure password.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:14px 24px;background:#c026d3;color:#ffffff;text-decoration:none;border-radius:8px;margin-top:16px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p style="margin-top:24px;color:#9333ea;">Bridal Beauty Studio</p>
    </div>
  `;
}
