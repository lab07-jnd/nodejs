const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
  },
  { timestamps: true }
);

module.exports = model('User', UserSchema);