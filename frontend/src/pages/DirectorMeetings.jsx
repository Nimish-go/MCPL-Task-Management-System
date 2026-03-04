import React, { useEffect } from "react";
import AccessDenied from "../components/AccessDenied";
import { useNavigate } from "react-router-dom";

const DirectorMeetings = () => {
  const [accessDenied, setAccessDenied] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !sessionStorage.getItem("designation").toUpperCase().includes("DIRECTOR")
    ) {
      setAccessDenied(true);
    }
  }, []);

  return (
    <div>
      <AccessDenied
        open={accessDenied}
        onClose={() => setAccessDenied(false)}
        location={"Director Meetings Page"}
      />
    </div>
  );
};

export default DirectorMeetings;
