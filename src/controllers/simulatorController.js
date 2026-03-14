const rates = {
  socios: { parcelado: 0.23, dias30: 0.08 },
  terceiros: { parcelado: 0.33, dias30: 0.18 },
};

exports.calculate = (req, res) => {
  const { valor, parcelas, modalidade, tipo } = req.body;

  const amount = Number(valor);
  const installments = Number(parcelas);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "valor inválido" });
  }

  if (modalidade !== "parcelado" && modalidade !== "dias30") {
    return res.status(400).json({ message: "modalidade deve ser parcelado ou dias30" });
  }

  if (tipo !== "socios" && tipo !== "terceiros") {
    return res.status(400).json({ message: "tipo deve ser socios ou terceiros" });
  }

  if (modalidade === "parcelado" && (!Number.isInteger(installments) || installments < 1 || installments > 12)) {
    return res.status(400).json({ message: "parcelas deve ser entre 1 e 12" });
  }

  const feeRate = rates[tipo][modalidade];
  const feeAmount = amount * feeRate;
  const total = amount + feeAmount;
  const installmentValue = modalidade === "parcelado" ? total / installments : total;

  return res.json({
    valor: amount,
    parcelas: modalidade === "parcelado" ? installments : 1,
    modalidade,
    tipo,
    taxa_percentual: feeRate * 100,
    taxa_valor: Number(feeAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
    valor_parcela: Number(installmentValue.toFixed(2)),
  });
};
