import { getRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: RequestDTO): Promise<Category> {
    const categoryRepository = getRepository(Category);

    const checkCategoryExists = await categoryRepository.findOne({
      where: { title },
    });

    if (checkCategoryExists) {
      throw new AppError('Category already registered.');
    }

    const category = categoryRepository.create({ title });

    await categoryRepository.save(category);

    return category;
  }
}

export default CreateCategoryService;
