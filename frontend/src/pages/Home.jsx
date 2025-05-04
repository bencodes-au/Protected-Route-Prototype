import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>

      <nav>
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/dashboard">
          <button>Go to Dashboard</button>
        </Link>
        <Link to="/register">
          <button>Register</button>
        </Link>
      </nav>
    </div>
  );
}

export default Home;
