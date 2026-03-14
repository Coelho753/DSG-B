const MembershipCode = require("../models/MembershipCode");

function randomBlock(size) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: size }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function generateUniqueCode() {
  for (let i = 0; i < 10; i += 1) {
    const code = `GFI-${randomBlock(5)}-${randomBlock(4)}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await MembershipCode.exists({ code });
    if (!exists) return code;
  }
  throw new Error("Falha ao gerar código único");
}

exports.list = async (_req, res) => {
  const codes = await MembershipCode.find()
    .sort({ created_at: -1 })
    .lean();

  return res.json(
    codes.map((item) => ({
      id: item._id,
      code: item.code,
      is_used: item.is_used,
      created_at: item.created_at,
      created_by: item.created_by,
      used_at: item.used_at,
      used_by_name: item.used_by_name,
    }))
  );
};

exports.create = async (req, res) => {
  const code = await generateUniqueCode();
  const created = await MembershipCode.create({
    code,
    created_by: req.user._id,
  });

  return res.status(201).json({
    id: created._id,
    code: created.code,
    is_used: created.is_used,
    created_at: created.created_at,
    created_by: created.created_by,
  });
};

exports.validate = async (req, res) => {
  const codeParam = String(req.params.code || "").toUpperCase();
  const found = await MembershipCode.findOne({ code: codeParam }).lean();
  return res.json({ valid: Boolean(found && !found.is_used) });
};
