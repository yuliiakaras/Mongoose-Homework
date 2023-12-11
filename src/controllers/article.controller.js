import Article from '../models/article.model.js';
import User from '../models/user.model.js';
import { isValidData } from '../utils/users.utils.js';
export const getArticles = async (req, res, next) => {
  try {
    const { title, page = 1, limit = 10 } = req.query;

    const titleRegex = new RegExp(title, 'i');
    const query = { title: { $regex: titleRegex } };

    const articles = await Article.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate({
        path: 'owner',
        select: 'fullName email age',
      });

    res.json(articles);
  } catch (err) {
    next(err);
  }
}

export const getArticleById = async (req, res, next) => {
  try {
    const articleId = req.params.articleId;

    if (!isValidObjectId(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const article = await Article.findById(articleId).populate('owner', 'fullName email age');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (err) {
    next(err);
  }
}

export const createArticle = async (req, res, next) => {
  try {
    const { title, subtitle, description, owner, category } = req.body;
    const existingUser = await User.findById(owner);

    if (!existingUser) {
      return res.status(400).json({ error: 'Owner does not exist' });
    }

    const newArticle = new Article({
      title,
      subtitle,
      description,
      owner,
      category
    });

    await newArticle.save();

    existingUser.numberOfArticles += 1;
    await existingUser.save();

    res.status(201).json(newArticle);
  } catch (err) {
    next(err);
  }
}

export const updateArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {  owner } = req.body;

    const existingArticle = await Article.findById(id);
    const existingUser = await User.findById(owner);
    
    isValidData(existingArticle, existingUser);

    if (existingArticle.owner.toString() !== owner) {
      return res.status(403).json({ error: 'Unauthorized: Only the owner can update the article' });
    }

    const fieldsToUpdate = ['title', 'subtitle', 'description', 'category'];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field]) {
        existingArticle[field] = req.body[field];
      }
    });
    

    await existingArticle.save();

    res.json(existingArticle);
  } catch (err) {
    next(err);
  }
}

export const deleteArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingArticle = await Article.findById(id);
    const existingUser = await User.findById(req.query.user_id);

    isValidData(existingArticle, existingUser)

    if (existingArticle.owner.toString() !== req.query.user_id) {
      return res.status(403).json({ error: 'Unauthorized to delete this article' });
    }

    existingUser.numberOfArticles--;
    await existingUser.save();
    await Article.deleteOne({ _id: id });

    res.json({ message: 'Article deleted successfully' });

  } catch (err) {
    next(err);
  }
}
