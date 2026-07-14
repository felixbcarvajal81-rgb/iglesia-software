const Content = require('../models/Content');

exports.getContent = async (req, res) => {
  try {
    const { type, published } = req.query;
    let query = {};

    if (type) query.type = type;
    if (published !== undefined) query.published = published === 'true';

    const content = await Content.find(query)
      .sort({ publishedAt: -1 })
      .populate('author', 'username');
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContentItem = async (req, res) => {
  try {
    const item = await Content.findById(req.params.id).populate('author', 'username');
    if (!item) {
      return res.status(404).json({ message: 'Contenido no encontrado' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createContent = async (req, res) => {
  try {
    req.body.author = req.user._id;
    const item = await Content.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const item = await Content.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) {
      return res.status(404).json({ message: 'Contenido no encontrado' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const item = await Content.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Contenido no encontrado' });
    }
    res.json({ message: 'Contenido eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
