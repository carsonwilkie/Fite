import { useState, useEffect } from 'react';
import { getPrice } from '../api';

export function usePrice() {
  const [price, setPrice] = useState('$3.00/month');

  useEffect(() => {
    getPrice().then(setPrice);
  }, []);

  return price;
}
