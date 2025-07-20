const express = require('express');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');
const { validate, itemSchema } = require('../middleware/validation');

const router = express.Router();

router.use(authMiddleware); // Protect all item routes

router.post('/', validate(itemSchema), async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const item = new Item({ title, description, status, owner: req.user.id });
    await item.save();
    res.status(201).json({ message: 'Item created', item });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const total = await Item.countDocuments({ owner: req.user.id });
    const items = await Item.find({ owner: req.user.id }).skip(skip).limit(limit);
    const totalPages = Math.ceil(total / limit);

    res.json({
      items,
      metadata: {
        total,
        totalPages,
        currentPage: page,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, owner: req.user.id });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', validate(itemSchema), async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { title, description, status },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item updated', item });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;