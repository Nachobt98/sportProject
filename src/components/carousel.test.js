import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Carousel } from "./carousel";

describe("Carousel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders the current slide and navigates both directions", () => {
    const { container } = render(<Carousel />);

    expect(screen.getByText("A SUDAR!")).toBeInTheDocument();

    fireEvent.click(container.querySelector(".right"));
    expect(screen.getByText("EMPIEZA TU VIDA SANA!")).toBeInTheDocument();

    fireEvent.click(container.querySelector(".left"));
    expect(screen.getByText("A SUDAR!")).toBeInTheDocument();

    fireEvent.click(container.querySelector(".left"));
    expect(screen.getByText("MENTE SANA, CUERPO SANO")).toBeInTheDocument();
  });

  test("advances automatically", () => {
    render(<Carousel />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText("EMPIEZA TU VIDA SANA!")).toBeInTheDocument();
  });
});
