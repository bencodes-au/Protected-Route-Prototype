import axios from "axios";
import { useEffect, useState } from "react";
import { getToken } from "../auth";

export default function Dashboard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/protected`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        setMessage("Access denied or error");
      });
  }, []);

  return <h1>🔐 Protected Dashboard: {message}</h1>;
}
