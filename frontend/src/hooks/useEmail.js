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

    const emailJsAPIKEY = import.meta.env.EMAILJS_API_KEY;

    try {
      const response = await emailjs.send(
        "service_7pvvf5q",
        "template_8u3047w",
        templateParams,
        {
          publicKey: emailJsAPIKEY,
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