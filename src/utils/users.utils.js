 export const isValidData = (existingArticle, existingUser) => {
    if (!existingArticle) {
      throw new Error('Article not found');
    }

    if (!existingUser) {
      throw new Error('Owner not found');
    }
  }