import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { UserProvider, useUser } from "./userContext";

function Consumer() {
  const { users, addUser, setUsers, updateUserData, deleteUser, getUserData } = useUser();

  return (
    <div>
      <span data-testid="username">{users.userName || "none"}</span>
      <span data-testid="current">{getUserData().city || "no-city"}</span>
      <button onClick={() => setUsers({ userName: "set", city: "Madrid" })}>set</button>
      <button onClick={() => addUser({ userName: "added", city: "Valencia" })}>add</button>
      <button onClick={() => updateUserData({ city: "Bilbao" })}>update city</button>
      <button onClick={() => updateUserData({ userName: "renamed" })}>update username</button>
      <button onClick={deleteUser}>delete</button>
    </div>
  );
}

function renderUserProvider() {
  return render(
    <UserProvider>
      <Consumer />
    </UserProvider>
  );
}

describe("UserProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("loads stored users", () => {
    localStorage.setItem("user", JSON.stringify({ userName: "stored", city: "Madrid" }));

    renderUserProvider();

    expect(screen.getByTestId("username")).toHaveTextContent("stored");
    expect(screen.getByTestId("current")).toHaveTextContent("Madrid");
  });

  test("sets, adds, updates and deletes users", () => {
    renderUserProvider();

    fireEvent.click(screen.getByText("set"));
    expect(screen.getByTestId("username")).toHaveTextContent("set");
    expect(localStorage.getItem("user")).toContain("set");

    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("username")).toHaveTextContent("added");

    fireEvent.click(screen.getByText("update city"));
    expect(screen.getByTestId("current")).toHaveTextContent("Bilbao");

    fireEvent.click(screen.getByText("update username"));
    expect(screen.getByTestId("username")).toHaveTextContent("renamed");

    fireEvent.click(screen.getByText("delete"));
    expect(screen.getByTestId("username")).toHaveTextContent("none");
    expect(localStorage.getItem("user")).toBeNull();
  });
});
