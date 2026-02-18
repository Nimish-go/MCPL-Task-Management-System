import { useState } from "react";
import emailjs from "@emailjs/browser";

const useEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sendEmail = async (templateParams) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await emailjs.send(
        "service_7pvvf5q",
        "template_8u3047w",
        templateParams,
        {
          publicKey: "OwPNSSva-FXe5igPJ",
        },
      );
      setSuccess(true);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendEmail, loading, error, success };
};

export default useEmail;
