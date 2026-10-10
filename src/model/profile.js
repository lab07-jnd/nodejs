const { Schema, model } = require('mongoose');

const PerfilContaSchema = new Schema(
  {
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
    nomeCompleto: { type: String, required: true, trim: true },
    cpf: { type: String, unique: true, sparse: true },
    matricula: { type: String, unique: true, sparse: true },
    cargo: { type: String, trim: true },
    departamento: { type: String, trim: true },
    telefone: { type: String },
    dataAdmissao: { type: Date },
    fotoUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = model('PerfilConta', PerfilContaSchema);