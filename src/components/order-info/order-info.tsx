import { FC, useEffect, useMemo, useState } from 'react';
import { Preloader } from '@ui';
import { OrderInfoUI } from '@ui';
import { TIngredient, TOrder } from '@utils-types';
import { useSelector } from '../../services/store';
import { getIngredients } from '../../services/slices/ingredientsSlice';
import { useParams } from 'react-router-dom';
import { getOrderByNumberApi } from '@api';

export const OrderInfo: FC = () => {
  const [orderData, setOrderData] = useState<TOrder>({
    createdAt: '',
    ingredients: [],
    _id: '',
    status: '',
    name: '',
    updatedAt: 'string',
    number: 0
  });

  const orderNumber = Number(useParams().number);

  const ingredients: TIngredient[] = useSelector(getIngredients);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  useEffect(() => {
    getOrderByNumberApi(Number(orderNumber)).then((data) => {
      setOrderData(data.orders[0]);
    });
  }, []);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
