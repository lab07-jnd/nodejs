const { Schema, model } = require('mongoose');

const AccountProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    cpf: { type: String, unique: true, sparse: true },
    employeeId: { type: String, unique: true, sparse: true },
    position: { type: String, trim: true },
    department: { type: String, trim: true },
    phone: { type: String },
    hireDate: { type: Date },
    photoUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = model('AccountProfile', AccountProfileSchema);