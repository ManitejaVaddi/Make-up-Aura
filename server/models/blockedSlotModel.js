import mongoose from 'mongoose';

const blockedSlotSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    reason: { type: String }
  },
  { timestamps: true }
);

const BlockedSlot = mongoose.model('BlockedSlot', blockedSlotSchema);
export default BlockedSlot;
