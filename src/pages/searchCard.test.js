import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SearchCard } from "./searchCard";

test("redirects legacy search route to current search page", () => {
  render(
    <MemoryRouter initialEntries={["/searchCard"]}>
      <Routes>
        <Route path="/searchCard" element={<SearchCard />} />
        <Route path="/searchCard2" element={<div>Search current page</div>} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText("Search current page")).toBeInTheDocument();
});
