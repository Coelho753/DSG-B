const SiteContent = require("../models/SiteContent");

exports.list = async (_req, res) => {
  const sections = await SiteContent.find()
    .sort({ _id: 1 })
    .select("_id section_key title content updated_at")
    .lean();

  return res.json(
    sections.map((section) => ({
      id: section._id,
      section_key: section.section_key,
      title: section.title,
      content: section.content,
      updated_at: section.updated_at,
    }))
  );
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "title e content são obrigatórios" });
  }

  const updated = await SiteContent.findByIdAndUpdate(
    id,
    {
      title,
      content,
      updated_by: req.user._id,
    },
    { new: true, runValidators: true }
  ).select("_id section_key title content updated_at updated_by");

  if (!updated) {
    return res.status(404).json({ message: "Seção não encontrada" });
  }

  return res.json({
    id: updated._id,
    section_key: updated.section_key,
    title: updated.title,
    content: updated.content,
    updated_at: updated.updated_at,
    updated_by: updated.updated_by,
  });
};
