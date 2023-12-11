import User from '../models/user.model.js';
import Article from '../models/article.model.js';
export const getUsers = async (req, res, next) => {
  try {
    console.log('Fetching users...');
    const { sort } = req.query;
    const sortOrder = sort === 'desc' ? -1 : 1;

    const users = await User.find({})
      .select('_id fullName email age')
      .sort({ age: sortOrder });

    console.log('Fetched users:', users);
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export const getUserByIdWithArticles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const articles = await Article.find({ owner: id })
      .select('title subtitle createdAt');

    const userWithArticles = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      age: user.age,
      articles: articles,
    };

    res.json(userWithArticles);
  } catch (err) {
    next(err);
  }
}

export const createUser = async (req, res, next) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (err) {
    next(err);
  }
}

export const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.age = req.body.age || user.age;

    user.fullName = `${user.firstName} ${user.lastName}`;
    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
}

export const deleteUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await Article.deleteMany({ owner: id });
    await User.findByIdAndRemove(id);

    res.json({ message: 'User and associated articles deleted successfully' });

  } catch (err) {
    next(err);
  }
}

