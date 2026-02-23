import User from "../models/User.js"

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        name: req.body.name,
        email: req.body.email
      },
      { new: true }
    )

    return res.json({
      success: true,
      data: updated
    })
  } catch {
    return res.status(400).json({
      success: false,
      message: "Erro ao atualizar perfil"
    })
  }
}