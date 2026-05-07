import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EventProvider, useEventContext } from "./eventContext";

function Consumer() {
  const { eventData, setEvent, clearEvent } = useEventContext();

  return (
    <div>
      <span data-testid="event-name">{eventData?.name || "none"}</span>
      <button onClick={() => setEvent({ name: "Padel" })}>set event</button>
      <button onClick={clearEvent}>clear event</button>
    </div>
  );
}

describe("EventProvider", () => {
  test("sets and clears selected events", () => {
    render(
      <EventProvider>
        <Consumer />
      </EventProvider>
    );

    expect(screen.getByTestId("event-name")).toHaveTextContent("none");
    fireEvent.click(screen.getByText("set event"));
    expect(screen.getByTestId("event-name")).toHaveTextContent("Padel");
    fireEvent.click(screen.getByText("clear event"));
    expect(screen.getByTestId("event-name")).toHaveTextContent("none");
  });
});
