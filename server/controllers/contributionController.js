const Contribution = require('../models/Contribution');

exports.getContributions = async (req, res) => {
  try {
    const { memberId, type, from, to } = req.query;
    let query = {};

    if (memberId) query.memberId = memberId;
    if (type) query.type = type;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const contributions = await Contribution.find(query)
      .sort({ date: -1 })
      .populate('memberId', 'firstName lastName')
      .populate('recordedBy', 'username');
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .populate('memberId', 'firstName lastName')
      .populate('recordedBy', 'username');
    if (!contribution) {
      return res.status(404).json({ message: 'Contribucion no encontrada' });
    }
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createContribution = async (req, res) => {
  try {
    req.body.recordedBy = req.user._id;
    const contribution = await Contribution.create(req.body);
    res.status(201).json(contribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!contribution) {
      return res.status(404).json({ message: 'Contribucion no encontrada' });
    }
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findByIdAndDelete(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribucion no encontrada' });
    }
    res.json({ message: 'Contribucion eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContributionStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    let matchQuery = {};

    if (from || to) {
      matchQuery.date = {};
      if (from) matchQuery.date.$gte = new Date(from);
      if (to) matchQuery.date.$lte = new Date(to);
    }

    const stats = await Contribution.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const grandTotal = await Contribution.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      byType: stats,
      grandTotal: grandTotal[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
