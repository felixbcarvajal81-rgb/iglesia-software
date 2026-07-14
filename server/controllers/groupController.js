const Group = require('../models/Group');

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({})
      .populate('leaderId', 'firstName lastName')
      .populate('members', 'firstName lastName');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('leaderId', 'firstName lastName email phone')
      .populate('members', 'firstName lastName email phone');
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }
    res.json({ message: 'Grupo eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMemberToGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }
    if (!group.members.includes(req.body.memberId)) {
      group.members.push(req.body.memberId);
      await group.save();
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeMemberFromGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }
    group.members = group.members.filter(
      (m) => m.toString() !== req.params.memberId
    );
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
