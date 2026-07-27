import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/svelte";

import VerticalScrollBar from "./VerticalScrollBar.svelte";

function renderScrollbar(
    props: Partial<{
        viewportId: string;
        viewportSize: number;
        contentSize: number;
        position: number;
        onChange: (value: number) => void;
    }> = {},
) {
    return render(VerticalScrollBar, {
        viewportId: "sidebar",
        viewportSize: 400,
        contentSize: 1000,
        position: 0,
        onChange: vi.fn(),
        ...props,
    });
}

describe("VerticalScrollBar", () => {
    it("renders a scrollbar", () => {
        const { getByRole } = renderScrollbar();

        expect(getByRole("scrollbar")).toBeInTheDocument();
    });

    it("sets the correct ARIA attributes", () => {
        const { getByRole } = renderScrollbar({
            viewportSize: 400,
            contentSize: 1000,
            position: 120,
        });

        const scrollbar = getByRole("scrollbar");

        expect(scrollbar).toHaveAttribute(
            "aria-controls",
            "sidebar",
        );

        expect(scrollbar).toHaveAttribute(
            "aria-orientation",
            "vertical",
        );

        expect(scrollbar).toHaveAttribute(
            "aria-valuemin",
            "0",
        );

        expect(scrollbar).toHaveAttribute(
            "aria-valuemax",
            "600",
        );

        expect(scrollbar).toHaveAttribute(
            "aria-valuenow",
            "120",
        );
    });

    it("renders the thumb at 40% height", () => {
        const { getByRole } = renderScrollbar({
            viewportSize: 400,
            contentSize: 1000,
        });

        const thumb = getByRole("scrollbar")
            .firstElementChild as HTMLElement;

        expect(thumb.style.height).toBe("40%");
    });

    it("renders a full thumb when there is no overflow", () => {
        const { getByRole } = renderScrollbar({
            viewportSize: 400,
            contentSize: 300,
        });

        const thumb = getByRole("scrollbar")
            .firstElementChild as HTMLElement;

        expect(thumb.style.height).toBe("100%");
    });

    it("renders the thumb at the correct position", () => {
        const { getByRole } = renderScrollbar({
            viewportSize: 400,
            contentSize: 1000,
            position: 300,
        });

        const thumb = getByRole("scrollbar")
            .firstElementChild as HTMLElement;

        expect(thumb.style.top).toBe("30%");
    });
});