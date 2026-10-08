const { Schema, model } = require('mongoose');

const UsuarioSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senhaHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'gestor', 'funcionario'], default: 'funcionario' },
   
  },
  { timestamps: true }
);

module.exports = model('Usuario', UsuarioSchema);