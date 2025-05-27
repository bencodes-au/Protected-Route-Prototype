import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Login from "../pages/Login";

describe("Login component", () => {
  it("renders inputs and allows typing", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(usernameInput, { target: { value: "myuser" } });
    fireEvent.change(passwordInput, { target: { value: "mypassword" } });

    expect(usernameInput.value).toBe("myuser");
    expect(passwordInput.value).toBe("mypassword");
  });
});
