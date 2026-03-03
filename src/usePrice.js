import { useState, useEffect } from "react";

export default function usePrice() {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    fetch("/api/price")
      .then((res) => res.json())
      .then((data) => setPrice(`$${data.amount}/${data.interval}`));
  }, []);

  return price;
}