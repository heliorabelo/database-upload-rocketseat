import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;

  type: 'income' | 'outcome';

  value: number;

  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    let categoryID = '';

    const checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategoryExists) {
      const categoryCreate = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryCreate);
      categoryID = categoryCreate.id;
    }

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total - value < 0) {
      throw new AppError('The value exceeds the limit');
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: categoryID || checkCategoryExists?.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
